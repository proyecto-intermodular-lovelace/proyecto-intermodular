# Manual de Base de Datos — Lovelace Smart Economato

## 1. Tecnología y Configuración

- **Motor:** PostgreSQL 16
- **Nombre de la base de datos:** `lovelace`
- **Usuario por defecto:** `lovelace`
- **Extensiones requeridas:** `uuid-ossp` (generación de UUIDs), `pgcrypto` (funciones criptográficas)
- **ORM:** TypeORM (configured con `synchronize: false`; el esquema se gestiona exclusivamente mediante los scripts SQL)

---

## 2. Tipos Enumerados (ENUMs)

| Enum | Valores | Uso |
|---|---|---|
| `user_role` | `SUPERADMIN`, `ADMIN`, `USER` | Roles de acceso al sistema |
| `product_type` | `INGREDIENT`, `MATERIAL` | Distingue ingredientes alimentarios de material inventariable |
| `order_status` | `DRAFT`, `SUBMITTED`, `APPROVED`, `MERGED`, `ORDERED`, `RECEIVED`, `CANCELLED` | Ciclo de vida de un pedido |
| `movement_type` | `IN`, `OUT`, `RETURN`, `WASTE`, `ADJUSTMENT` | Tipo de movimiento en la tabla `stock_movements` (esquema legacy) |
| `inventory_movement_type` | `ENTRY`, `EXIT`, `ADJUSTMENT`, `LOSS` | Tipo de movimiento en la tabla `inventory_movements` (usada por el backend) |
| `incident_section` | `INGREDIENTES`, `MATERIALES`, `USUARIOS`, `PEDIDOS`, `ALBARANES`, `PROVEEDORES`, `OTRO` | Sección sobre la que se reporta una incidencia |

---

## 3. Entidades Principales y Relaciones

### 3.1 Usuarios y Roles (`users`)

Tabla central del sistema de autenticación y autorización.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Identificador único |
| `email` | `varchar(255)` UNIQUE | Correo electrónico (login) |
| `password_hash` | `text` | Contraseña cifrada con bcrypt |
| `role` | `user_role` | Rol del usuario |
| `nombre` | `varchar(120)` | Nombre |
| `apellido1` | `varchar(120)` | Primer apellido |
| `apellido2` | `varchar(120)` | Segundo apellido (opcional) |
| `is_active` | `boolean` | Permite deshabilitar usuarios sin borrarlos |
| `created_at` / `updated_at` | `timestamptz` | Auditoría de fechas |

**Tablas relacionadas:**
- `student_profile`: vincula un usuario a una clase (para alumnos).
- `teacher_class`: vincula un profesor a una o varias clases (relación N:M).

### 3.2 Productos (`products`)

Tabla unificada para ingredientes y materiales, distinguidos por `product_type`.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Identificador único |
| `code` | `varchar(30)` UNIQUE | Código interno del producto |
| `name` | `varchar(200)` | Nombre descriptivo |
| `product_type` | `product_type` | `INGREDIENT` o `MATERIAL` |
| `unit_type` | `varchar(30)` | Unidad de medida (kg, litros, ud., etc.) |
| `unit_price` | `numeric(12,2)` | Precio unitario (≥ 0) |
| `supplier_id` | `uuid` FK → `suppliers` | Proveedor habitual (nullable) |
| `category_id` | `uuid` FK → `categories` | Categoría del producto |
| `yield_percent` | `numeric(5,2)` | Rendimiento (para ingredientes) |
| `expires_at` | `date` | Fecha de caducidad (opcional) |
| `created_by` | `uuid` FK → `users` | Usuario que creó el registro |
| `is_active` | `boolean` | Baja lógica del producto |

### 3.3 Inventario y Movimientos de Stock

#### `inventory`

Tabla que mantiene el **stock actual** de cada producto (1:1 con `products`).

| Columna | Tipo | Descripción |
|---|---|---|
| `product_id` | `uuid` PK FK → `products` | Identificador del producto |
| `current_qty` | `numeric(12,3)` | Cantidad actual en stock |
| `updated_at` | `timestamptz` | Última actualización |

#### `stock_movements`

Tabla de histórico de cambios de stock del esquema inicial (`001_init.sql`). Utiliza el enum `movement_type` con valores `IN`, `OUT`, `RETURN`, `WASTE`, `ADJUSTMENT`.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Identificador del movimiento |
| `product_id` | `uuid` FK → `products` | Producto afectado |
| `movement_type` | `movement_type` | Tipo: IN, OUT, RETURN, WASTE o ADJUSTMENT |
| `qty` | `numeric(12,3)` | Cantidad (siempre positiva) |
| `reason` | `text` | Motivo o descripción libre |
| `created_by` | `uuid` FK → `users` | Usuario que registró el movimiento |
| `created_at` | `timestamptz` | Fecha y hora del movimiento |

#### `inventory_movements`

Tabla de movimientos de inventario añadida en `010_inventory_movements.sql`. Es la tabla que utiliza el backend (entidad `InventoryMovement` de TypeORM). Las columnas siguen la convención de nombres en español.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Identificador del movimiento |
| `producto_id` | `uuid` FK → `products` | Producto afectado |
| `tipo` | `inventory_movement_type` | Tipo: `ENTRY`, `EXIT`, `ADJUSTMENT` o `LOSS` |
| `cantidad` | `int` | Cantidad del movimiento |
| `motivo` | `text` | Motivo o descripción libre (opcional) |
| `usuario_id` | `uuid` FK → `users` | Usuario que registró el movimiento (opcional) |
| `observaciones` | `text` | Observaciones adicionales (opcional) |
| `created_at` | `timestamptz` | Fecha y hora del movimiento |
| `updated_at` | `timestamptz` | Última actualización del registro |

> Los tipos de movimiento registrados por el frontend en la pantalla de Bajas y Devoluciones son `EXIT` (merma/baja, vía `POST /api/inventory/salida`) y `ENTRY` (devolución, vía `POST /api/inventory/entrada`).

### 3.4 Pedidos (`orders` y `order_items`)

#### `orders`

Cabecera del pedido. Soporta la **fusión de pedidos** (`merged_into_order_id`), permitiendo consolidar varios pedidos en uno solo antes de enviarlo al proveedor.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Identificador del pedido |
| `created_by` | `uuid` FK → `users` | Usuario que creó el pedido |
| `class_id` | `uuid` FK → `classes` | Clase solicitante (opcional) |
| `supplier_id` | `uuid` FK → `suppliers` | Proveedor destino (opcional) |
| `status` | `order_status` | Estado actual del pedido |
| `week_start` | `date` | Semana de referencia del pedido |
| `merged_into_order_id` | `uuid` FK → `orders` (self) | Pedido padre tras una fusión |

#### `order_items`

Líneas del pedido. Una línea por producto.

| Columna | Tipo | Descripción |
|---|---|---|
| `order_id` | `uuid` FK → `orders` | Pedido al que pertenece |
| `product_id` | `uuid` FK → `products` | Producto solicitado |
| `qty_requested` | `numeric(12,3)` | Cantidad solicitada |
| `qty_approved` | `numeric(12,3)` | Cantidad aprobada (puede diferir) |
| `notes` | `text` | Notas adicionales sobre la línea |

### 3.5 Albaranes (`delivery_notes` y `delivery_note_items`)

Registro de la recepción física de mercancía. Vinculado opcionalmente a un pedido.

### 3.6 Proveedores (`suppliers`)

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Identificador único |
| `name` | `varchar(200)` UNIQUE | Nombre del proveedor |
| `contact_email` | `varchar(255)` | Correo de contacto |
| `phone` | `varchar(50)` | Teléfono |
| `notes` | `text` | Observaciones |
| `is_active` | `boolean` | Estado activo/inactivo |

### 3.7 Categorías, Ciclos de Estudio y Clases

- **`categories`:** Clasifica productos por tipo (`INGREDIENT` / `MATERIAL`) y nombre.
- **`studies`:** Ciclos formativos (p. ej., "Cocina y Gastronomía").
- **`classes`:** Grupos dentro de un ciclo (nivel + código de grupo + estudio).

### 3.8 Trabajos de Importación (`import_jobs`)

Tabla añadida en `007_create_import_jobs.sql`. Almacena el estado de los procesos de importación masiva de productos desde ficheros CSV, gestionados por el worker de importación en background.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Identificador único del job |
| `filename` | `varchar(255)` | Nombre del fichero importado |
| `content` | `text` | Contenido CSV del fichero |
| `status` | `varchar(32)` | Estado del proceso (p. ej., `PENDING`, `PROCESSING`, `DONE`, `ERROR`) |
| `total_rows` | `integer` | Total de filas del CSV |
| `processed` | `integer` | Filas procesadas hasta el momento |
| `created_count` | `integer` | Productos creados |
| `updated_count` | `integer` | Productos actualizados |
| `errors` | `jsonb` | Array de errores por fila (opcional) |
| `result_path` | `varchar(500)` | Ruta al fichero de resultado (opcional) |
| `created_by` | `uuid` | Usuario que lanzó la importación |
| `default_product_type` | `varchar(20)` | Tipo de producto por defecto (`INGREDIENT` / `MATERIAL`) |
| `created_at` | `timestamptz` | Fecha de creación del job |

### 3.9 Incidencias (`incidents`)

Permite a cualquier usuario registrar una incidencia en cualquier sección del sistema. Un administrador puede marcarla como revisada (`is_reviewed`, `reviewed_by`, `reviewed_at`).

---

## 4. Diagrama de Relaciones (Simplificado)

```
users ──────────────────────────────────────────────────┐
  │ 1                                                    │
  ├──< student_profile >── classes <── teacher_class ──< │
  │                           │
  │                           │ (class_id)
  │                           ▼
  ├──────────────────────── orders ──── order_items ──< products
  │                           │                           │
  │                           │ (merged_into_order_id)    ├─── inventory
  │                           │ (auto-referencia)         ├─── stock_movements
  │                           │                           └─── inventory_movements
  │
  ├──────────────────── delivery_notes ── delivery_note_items
  │
  ├──────────────────── incidents
  │
  └──────────────────── products (created_by)

suppliers ──< products
suppliers ──< orders
suppliers ──< delivery_notes

categories ──< products
```

---

## 5. Proceso de Inicialización y Seeding

### Orden de ejecución de los scripts

Al levantar el stack Docker por primera vez, PostgreSQL ejecuta automáticamente los ficheros de `scripts/db/` en orden numérico:

1. **`001_init.sql`** — Crea el esquema completo desde cero (idempotente con `IF NOT EXISTS`).
2. **`002_seed.sql`** — Inserta los datos de prueba: productos, ingredientes, materiales y registros de inventario.
3. **`003_suppliers.sql`** — Añade la estructura y datos iniciales de proveedores.
4. **`004_fix_suppliers_inventory.sql`** — Correcciones de integridad sobre el inventario de proveedores.
5. **`005_make_supplier_nullable.sql`** — Permite que `supplier_id` en `products` sea nulo.
6. **`006_seed_suppliers.sql`** — Inserta datos de prueba de proveedores adicionales.
7. **`007_create_import_jobs.sql`** — Crea la tabla `import_jobs` para el worker de importación CSV.
8. **`008_recipes.sql`** — Crea las tablas `recipes`, `recipe_items`, `allergens` y `recipe_allergens`.
9. **`009_fix_supplier_encoding.sql`** — Correcciones de codificación UTF-8 en nombres de proveedores existentes.
10. **`010_inventory_movements.sql`** — Crea el enum `inventory_movement_type` y la tabla `inventory_movements` usada por el backend.

### Contraseñas en los datos de prueba

Las contraseñas de los usuarios de prueba están almacenadas como hashes bcrypt. Para regenerarlas, usar los scripts `gen-hashes.js` / `gen-hashes.ps1` (ver `docs/TECHNICAL_ADMIN_MANUAL.md`).

---

## 6. CLI Tooling — Scripts de Base de Datos

> **Requisito previo:** Docker Desktop debe estar en ejecución. Todos los scripts operan sobre el contenedor `lovelace_db`.

Los scripts se encuentran en `scripts/db/` y se ejecutan desde esa misma carpeta.

### `apply-schema.bat`

Inyecta el esquema de estructura (`001_init.sql`) en la base de datos activa:

```bash
# Equivalente interno:
docker exec -i lovelace_db psql -U lovelace -d lovelace < 001_init.sql
```

### `apply-seed.bat`

Inyecta los datos iniciales (`002_seed.sql`) en la base de datos activa:

```bash
# Equivalente interno:
docker exec -i lovelace_db psql -U lovelace -d lovelace < 002_seed.sql
```

### `apply-suppliers.bat`

Inyecta el esquema y datos de proveedores (`003_suppliers.sql` + `006_seed_suppliers.sql`).

### `reset-db.bat`

> ⚠️ **DESTRUCTIVO.** Elimina todos los volúmenes Docker y recrea la base de datos desde cero.

```bash
# Secuencia interna:
docker compose down -v
docker compose up -d
# (espera 5s)
apply-schema.bat
apply-seed.bat
```

### `psql.bat`

Abre una terminal interactiva `psql` para ejecutar consultas SQL manualmente:

```bash
# Equivalente interno:
docker exec -it lovelace_db psql -U lovelace -d lovelace
```

### Generadores de hashes bcrypt

Para regenerar los hashes de contraseñas de los usuarios de prueba:

```bash
node scripts/db/gen-hashes.js        # Node.js (rutas relativas)
node scripts/db/gen-hashes-abs.js    # Node.js (rutas absolutas)
.\scripts\db\gen-hashes.ps1          # PowerShell
```

