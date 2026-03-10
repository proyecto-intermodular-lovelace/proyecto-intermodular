# Referencia de la API — Lovelace Smart Economato

## 1. Documentación Interactiva (Swagger UI)

La API REST está completamente documentada mediante **Swagger / OpenAPI 3**. Para explorarla de forma interactiva, accede a la siguiente URL con el stack en ejecución:

```
http://localhost:3000/api/docs
```

Desde la interfaz de Swagger podrás:

- Consultar todos los endpoints disponibles agrupados por dominio.
- Ver los esquemas de petición y respuesta de cada operación.
- Probar llamadas directamente desde el navegador, incluyendo operaciones autenticadas.

---

## 2. Información General de la API

| Parámetro | Valor |
|---|---|
| **URL base** | `http://localhost:3000/api` |
| **Versión** | `1.0.0` |
| **Formato de datos** | `application/json` |
| **Autenticación** | Bearer JWT (cabecera `Authorization`) |

---

## 3. Autenticación

La mayoría de los endpoints requieren un token JWT válido. El flujo es el siguiente:

### Paso 1 — Obtener el token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@lovelace.edu",
  "password": "tu_contraseña"
}
```

**Respuesta exitosa (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Paso 2 — Incluir el token en las peticiones

```http
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token tiene una duración configurable mediante `JWT_EXPIRES_IN` (por defecto **3600 segundos / 1 hora**). Una vez expirado, debe solicitarse uno nuevo repitiendo el proceso de login.

---

## 4. Dominios Principales

### 4.1 Auth — `/api/auth`

Gestión de sesiones y contraseñas.

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión y obtener JWT | No |
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/api/auth/recover` | Solicitar recuperación de contraseña | No |

### 4.2 Users — `/api/users`

Gestión de usuarios del sistema.

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/users` | Listar todos los usuarios | Sí (ADMIN) |
| `GET` | `/api/users/:id` | Obtener un usuario por ID | Sí |
| `PATCH` | `/api/users/:id` | Actualizar datos de usuario | Sí |
| `DELETE` | `/api/users/:id` | Desactivar un usuario | Sí (ADMIN) |

### 4.3 Products — `/api/products`

Gestión unificada de ingredientes (`INGREDIENT`) y materiales (`MATERIAL`).

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/products` | Listar productos (filtrable por tipo) | Sí |
| `POST` | `/api/products` | Crear un nuevo producto | Sí (ADMIN) |
| `GET` | `/api/products/:id` | Obtener producto por ID | Sí |
| `PATCH` | `/api/products/:id` | Actualizar un producto | Sí (ADMIN) |
| `DELETE` | `/api/products/:id` | Dar de baja un producto | Sí (ADMIN) |

### 4.4 Inventory — `/api/inventory`

Consulta de stock actual y registro de movimientos.

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/inventory` | Obtener stock actual de todos los productos | Sí |
| `GET` | `/api/inventory/:productId` | Obtener stock de un producto | Sí |
| `POST` | `/api/inventory/movement` | Registrar un movimiento de stock | Sí |

### 4.5 Orders — `/api/orders`

Ciclo de vida completo de pedidos.

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/orders` | Listar pedidos | Sí |
| `POST` | `/api/orders` | Crear un pedido nuevo (estado: DRAFT) | Sí |
| `GET` | `/api/orders/:id` | Obtener detalle de un pedido | Sí |
| `PATCH` | `/api/orders/:id` | Actualizar estado o campos del pedido | Sí (ADMIN) |
| `DELETE` | `/api/orders/:id` | Cancelar un pedido | Sí (ADMIN) |

### 4.6 Suppliers — `/api/suppliers`

Gestión de proveedores.

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/suppliers` | Listar proveedores activos | Sí |
| `POST` | `/api/suppliers` | Crear un proveedor | Sí (ADMIN) |
| `GET` | `/api/suppliers/:id` | Obtener proveedor por ID | Sí |
| `PATCH` | `/api/suppliers/:id` | Actualizar datos del proveedor | Sí (ADMIN) |

### 4.7 Delivery Notes — `/api/delivery-notes`

Registro de albaranes de entrada de mercancía.

### 4.8 Incidents — `/api/incidents`

Registro y gestión de incidencias internas.

### 4.9 Scale — `/api/scale`

Integración con báscula de pesaje para registro de cantidades directamente desde hardware.

### 4.10 Health — `/api/health`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Verificar que el servicio está activo | No |

---

## 5. Códigos de Respuesta Estándar

| Código | Significado |
|---|---|
| `200 OK` | Petición correcta |
| `201 Created` | Recurso creado correctamente |
| `400 Bad Request` | Error de validación en el body |
| `401 Unauthorized` | Token ausente o inválido |
| `403 Forbidden` | Token válido pero sin permisos suficientes |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Conflicto de unicidad (e.g., email duplicado) |
| `500 Internal Server Error` | Error interno del servidor |

---

## 6. Formato de Error Estándar

Todos los errores siguen la estructura devuelta por el filtro global `AllExceptionsFilter`:

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request",
  "timestamp": "2026-03-10T19:49:12.000Z",
  "path": "/api/products"
}
```

---

> **Consulta la documentación interactiva completa en:** `http://localhost:3000/api/docs`
