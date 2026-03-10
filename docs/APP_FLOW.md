# Flujo de la Aplicación — Lovelace Smart Economato

## 1. Arquitectura General

Lovelace sigue una arquitectura cliente-servidor clásica con separación estricta de responsabilidades:

```
┌──────────────────────────────────────────────────────┐
│                   NAVEGADOR / TABLETA                │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Frontend SPA (React + Tailwind)         │ │
│  │         Puerto: 5173                            │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼────────────────────────────┘
                          │ HTTPS / REST (JSON)
                          │ Authorization: Bearer <JWT>
┌─────────────────────────▼────────────────────────────┐
│          Backend API REST (NestJS)                   │
│          Puerto: 3000 · Prefijo global: /api         │
└──────────────────────────┬───────────────────────────┘
                           │ TypeORM
┌──────────────────────────▼───────────────────────────┐
│          Base de Datos (PostgreSQL 16)               │
│          Puerto: 5432 · Base de datos: lovelace      │
└──────────────────────────────────────────────────────┘
```

---

## 2. Flujo del Frontend

### 2.1 Filosofía de diseño: Kiosco / Tableta Táctil

El frontend está diseñado con la premisa de ser usado en **tabletas o pantallas táctiles en modo kiosco**. Esto implica:

- Botones y elementos interactivos grandes, aptos para uso sin ratón ni teclado físico.
- Navegación simplificada: un menú principal con las secciones esenciales.
- Optimización de pantallas de resumen con datos concisos y tablas legibles en pantallas medianas.
- Diseño responsive (Tailwind CSS) que se adapta a las resoluciones de tableta.

### 2.2 Sistema de Rutas (React Router)

El router principal (`frontend/src/app/router.jsx`) organiza las rutas en dos bloques:

#### Rutas Públicas (sin autenticación)

| Ruta | Componente | Descripción |
|---|---|---|
| `/login` | `LoginPage` | Formulario de inicio de sesión |
| `/register` | `RegisterPage` | Registro de nuevos usuarios |
| `/recover` | `RecoverPage` | Recuperación de contraseña |

#### Rutas Protegidas (requieren autenticación — `RequireAuth`)

Todas las rutas protegidas están envueltas por el componente `RequireAuth`, que valida la presencia de un token JWT válido en el contexto de autenticación. Si el token no existe o ha expirado, redirige automáticamente a `/login`.

Las rutas protegidas se renderizan dentro de `MainLayout` (cabecera con logo, menú de navegación lateral o superior).

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `DashboardPage` | Panel principal de resumen |
| `/products` | `IngredientsSummaryPage` | Vista resumen de ingredientes |
| `/products/full` | `IngredientsFullPage` | Gestión avanzada de ingredientes |
| `/products/new` | `IngredientDetailPage` | Crear nuevo ingrediente |
| `/products/:id` | `IngredientDetailPage` | Editar ingrediente existente |
| `/inventory` | `MaterialsSummaryPage` | Vista resumen de materiales |
| `/inventory/full` | `MaterialsFullPage` | Gestión avanzada de materiales |
| `/inventory/new` | `MaterialDetailPage` | Crear nuevo material |
| `/inventory/:id` | `MaterialDetailPage` | Editar material existente |
| `/providers` | `SuppliersSummaryPage` | Vista resumen de proveedores |
| `/providers/full` | `SuppliersFullPage` | Gestión avanzada de proveedores |
| `/providers/new` | `SupplierDetailPage` | Crear nuevo proveedor |
| `/providers/:id` | `SupplierDetailPage` | Editar proveedor existente |
| `/orders` | `OrdersPage` | Gestión de pedidos |
| `/returns` | `ReturnsPage` | Bajas y devoluciones |
| `/profile` | `ProfilePage` | Perfil del usuario autenticado |

> Cualquier ruta no reconocida (`*`) redirige a `/login`.

### 2.3 Gestión del Estado de Autenticación

- El token JWT se almacena en el contexto React (directorio `frontend/src/contexts/`).
- El servicio de API (`frontend/src/services/api.js`) construye la URL base dinámicamente usando `window.location.protocol` y `window.location.hostname` con el puerto 3000, lo que permite usar la aplicación desde dispositivos móviles en la misma red local.
- Todas las peticiones autenticadas incluyen la cabecera `Authorization: Bearer <token>`.

---

## 3. Flujo del Backend

### 3.1 Módulos de NestJS

El backend se organiza en módulos independientes, siguiendo la arquitectura modular de NestJS:

| Módulo | Ruta base | Responsabilidad |
|---|---|---|
| `AuthModule` | `/api/auth` | Autenticación, emisión y validación de JWT |
| `UsersModule` | `/api/users` | Gestión de usuarios y perfiles |
| `ProductsModule` | `/api/products` | CRUD de productos (ingredientes y materiales) |
| `InventoryModule` | `/api/inventory` | Movimientos de stock e inventario actual |
| `OrdersModule` | `/api/orders` | Creación y ciclo de vida de pedidos |
| `SuppliersModule` | `/api/suppliers` | Gestión de proveedores |
| `DeliveryNotesModule` | `/api/delivery-notes` | Albaranes de recepción de mercancía |
| `IncidentsModule` | `/api/incidents` | Registro y revisión de incidencias |
| `ScaleModule` | `/api/scale` | Integración con báscula de pesaje |
| `HealthModule` | `/api/health` | Estado de salud del servicio |

### 3.2 Flujo de Autenticación (JWT)

```
Cliente                          Backend (NestJS)
  │                                    │
  │  POST /api/auth/login              │
  │  { email, password }               │
  ├───────────────────────────────────►│
  │                                    │  Valida credenciales en BD
  │                                    │  Genera JWT firmado con JWT_SECRET
  │◄───────────────────────────────────┤
  │  { access_token: "eyJ..." }        │
  │                                    │
  │  GET /api/products                 │
  │  Authorization: Bearer eyJ...      │
  ├───────────────────────────────────►│
  │                                    │  JwtAuthGuard valida el token
  │                                    │  Inyecta req.user con el payload
  │◄───────────────────────────────────┤
  │  [ ...lista de productos ]         │
```

**Parámetros del token:**
- Algoritmo: HS256
- Expiración: configurable vía `JWT_EXPIRES_IN` (por defecto `3600s`)
- El payload incluye el `id`, `email` y `role` del usuario.

### 3.3 Roles de Usuario

El sistema define tres roles mediante el enum `user_role`:

| Rol | Permisos |
|---|---|
| `SUPERADMIN` | Acceso total al sistema |
| `ADMIN` | Gestión de inventario, pedidos y proveedores |
| `USER` | Consulta y creación de pedidos propios |

### 3.4 Pipeline de Peticiones

Cada petición entrante al backend pasa por el siguiente pipeline:

1. **`HttpLoggingMiddleware`** — Registra la petición (método, ruta, IP).
2. **Guards** — `JwtAuthGuard` valida el token; `RolesGuard` comprueba el rol.
3. **`ValidationPipe`** — Valida y transforma el body según el DTO correspondiente.
4. **Controller / Service** — Lógica de negocio y acceso a base de datos via TypeORM.
5. **`ClassSerializerInterceptor`** — Serializa la respuesta (elimina campos anotados con `@Exclude()`).
6. **`AllExceptionsFilter`** — Captura cualquier excepción y devuelve una respuesta JSON estructurada.
