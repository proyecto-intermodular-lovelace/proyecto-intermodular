# Guía de Uso de API y Pruebas Manuales

Esta documentación describe cómo interactuar con la API del backend de forma manual para facilitar el desarrollo, las pruebas y las revisiones de código.

## Configuración Base

- **URL Base:** `http://localhost:3000/api`
- **Formato de datos:** JSON
- **Herramienta recomendada:** `curl` o Postman.

---

## 1. Chequeo de Salud (Healthcheck)

Permite verificar rápidamente si el servidor está encendido y si tiene conexión con la base de datos PostgreSQL.

### Verificar conexión a BBDD

**Endpoint:** `GET /health/db`

**Comando:**

```bash
curl -i -X GET http://localhost:3000/api/health/db
```

**Respuesta Esperada (200 OK):**

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

---

## 2. Autenticación (Auth)

Utiliza las credenciales cargadas mediante el script `002_seed.sql`.

### Iniciar Sesión (Login)

**Endpoint:** `POST /auth/login`

**Cuerpo (JSON):**
| Campo | Valor de ejemplo (Seed) |
| :--- | :--- |
| `email` | `admin@lovelace.edu` |
| `password` | `SuperAdmin2026!` |

**Ejemplo Bash (Git Bash):**

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"admin@lovelace.edu\", \"password\": \"SuperAdmin2026!\"}"
```

**Ejemplo PowerShell (Recomendado):**

```powershell
# Usar Invoke-RestMethod evita problemas de comillas
$body = @{
    email = "admin@lovelace.edu"
    password = "SuperAdmin2026!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

**Ejemplo PowerShell (usando curl.exe):**

```powershell
# En PowerShell, si usas curl.exe, el escape debe ser con triple comilla o comilla simple + backslash
curl.exe -i -X POST http://localhost:3000/api/auth/login `
     -H "Content-Type: application/json" `
     -d '{\"\"email\"\": \"\"admin@lovelace.edu\"\", \"\"password\"\": \"\"SuperAdmin2026!\"\"}'
```

**Respuesta Esperada (201 Created):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "admin@lovelace.edu",
    "role": "SUPERADMIN"
  }
}
```

---

## 3. Usuarios (Users)

Endpoints para gestionar la información de los usuarios. Requieren autenticación mediante un token JWT.

### Obtener lista de usuarios

**Endpoint:** `GET /users`

**Comando:**

```bash
curl -i -X GET http://localhost:3000/api/users \
     -H "Authorization: Bearer <TU_TOKEN_JWT>"
```

### Obtener usuario por ID

**Endpoint:** `GET /users/:id`

**Ejemplo con ID del SuperAdmin:**

```bash
curl -i -X GET http://localhost:3000/api/users/11111111-1111-1111-1111-111111111111\
     -H "Authorization: Bearer <TU_TOKEN_JWT>"
```

---

## Respuestas y Errores Comunes

| Código                 | Significado       | Causa Común                                                             |
| :--------------------- | :---------------- | :---------------------------------------------------------------------- |
| **200/201**            | Éxito             | La operación se realizó correctamente.                                  |
| **400 Bad Request**    | Datos Inválidos   | El JSON enviado no tiene el formato correcto o faltan campos.           |
| **401 Unauthorized**   | Error de Auth     | El token JWT no existe, ha caducado o las credenciales son incorrectas. |
| **404 Not Found**      | No Encontrado     | El endpoint o el ID del recurso no existe.                              |
| **500 Internal Error** | Error de Servidor | Problema interno del código o la base de datos está caída.              |

---

## Consideraciones Técnicas (Importante)

- **Módulos Activos:** Actualmente, solo el módulo de `Health` está activado en la aplicación principal. Los módulos de `Users` y `Auth` devolverán `404 Not Found` hasta que sean importados en el `AppModule`.
- **Persistencia:** Si realizas un `reset-db.bat`, recuerda que deberás volver a iniciar sesión para obtener un nuevo token.
- **Formato de Comandos:** Los ejemplos anteriores están diseñados para terminales Bash (Git Bash). Si usas **PowerShell**, recuerda usar `curl.exe` y ajustar el escape de comillas si es necesario.
