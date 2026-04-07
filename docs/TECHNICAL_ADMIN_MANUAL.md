# Manual Técnico de Administración — Lovelace Smart Economato

**Audiencia:** Administradores de sistemas, técnicos informáticos y profesores de TIC responsables del despliegue y mantenimiento del sistema.

---

## 1. Requisitos Previos

Antes de instalar o administrar el sistema, asegúrese de tener instaladas las siguientes herramientas:

| Herramienta | Versión mínima | Propósito |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24.x | Orquestación de contenedores |
| [Node.js](https://nodejs.org/) | 18 LTS | Desarrollo local sin Docker |
| [Git](https://git-scm.com/) | 2.x | Control de versiones |
| [psql](https://www.postgresql.org/download/) | 16 (opcional) | Acceso directo a la BD |

---

## 2. Variables de Entorno

El sistema se configura mediante un fichero `.env` ubicado en la **raíz del proyecto**. Existe una plantilla en `backend/.env.example`.

```bash
# Copiar la plantilla
cp backend/.env.example .env
```

### Variables disponibles

```dotenv
# ── Base de datos ──────────────────────────────────────────────
DB_HOST=localhost          # En Docker Compose se sobreescribe a 'db'
DB_PORT=5432
DB_USER=lovelace
DB_PASSWORD=lovelace       # ⚠️ Cambiar en producción
DB_NAME=lovelace

# ── JWT (autenticación) ────────────────────────────────────────
JWT_SECRET=changeme        # ⚠️ OBLIGATORIO cambiar en producción
JWT_EXPIRES_IN=3600s       # Tiempo de expiración del token (1 hora)

# ── SMTP (envío de correos) ────────────────────────────────────
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MAIL_FROM="Lovelace <no-reply@lovelace.edu>"

# ── CORS ──────────────────────────────────────────────────────
# CORS_ORIGIN=http://smarteconomato.com  # Opcional; por defecto permite localhost:3001 y localhost:5173

# ── Servidor ──────────────────────────────────────────────────
APP_PORT=3000
```

> **Nota sobre Docker Compose:** el fichero `docker-compose.yml` inyecta automáticamente `DB_HOST=db` para que el backend pueda resolver el contenedor de PostgreSQL por nombre de servicio. No es necesario modificar este valor manualmente.

---

## 3. Servicios Docker Compose

El fichero `docker-compose.yml` define tres servicios:

| Servicio | Contenedor | Puerto expuesto | Imagen / Build |
|---|---|---|---|
| `db` | `lovelace_db` | `5432` | `postgres:16` |
| `backend` | `lovelace_back` | `3000` | `./backend` (Dockerfile local) |
| `frontend` | `lovelace_front` | `5173` | `./frontend` (Dockerfile local) |

### Comandos esenciales de administración

```bash
# Arrancar todos los servicios en segundo plano
docker compose up -d

# Ver el estado de los contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Detener todos los servicios (sin borrar datos)
docker compose down

# Detener y eliminar volúmenes (⚠️ BORRA LA BASE DE DATOS)
docker compose down -v

# Reconstruir imágenes tras cambios en el código
docker compose up -d --build
```

---

## 4. Operaciones de Base de Datos

Los scripts de base de datos se encuentran en `scripts/db/` y se ejecutan **dentro del contenedor `lovelace_db`**.

### Scripts SQL disponibles

| Fichero | Descripción |
|---|---|
| `001_init.sql` | Crea el esquema completo (tablas, enums, índices) |
| `002_seed.sql` | Datos de prueba: productos, ingredientes y materiales |
| `003_suppliers.sql` | Estructura de proveedores |
| `004_fix_suppliers_inventory.sql` | Correcciones sobre inventario de proveedores |
| `005_make_supplier_nullable.sql` | Permite proveedor nulo en productos |
| `006_seed_suppliers.sql` | Datos de prueba de proveedores |
| `007_create_import_jobs.sql` | Tabla `import_jobs` para el worker de importación CSV |
| `008_recipes.sql` | Tablas de recetas, ingredientes de recetas y alérgenos |
| `009_fix_supplier_encoding.sql` | Correcciones de codificación UTF-8 en nombres de proveedores |
| `010_inventory_movements.sql` | Enum `inventory_movement_type` y tabla `inventory_movements` |

### Inicialización automática

Al crear el contenedor `db` por primera vez, Docker Compose monta el directorio `scripts/db/` en `/docker-entrypoint-initdb.d/`. PostgreSQL ejecuta automáticamente los ficheros `.sql` en orden alfabético.

### Aplicar scripts manualmente (desde `scripts/db/`)

```bash
# Aplicar el esquema inicial
apply-schema.bat

# Aplicar los datos de prueba (seed)
apply-seed.bat

# Aplicar la carga de proveedores
apply-suppliers.bat
```

Detrás de cada `.bat` se ejecuta un comando de la forma:

```bash
docker exec -i lovelace_db psql -U lovelace -d lovelace < <fichero>.sql
```

### Resetear la base de datos completamente

> ⚠️ **DESTRUCTIVO:** Este comando elimina todos los datos y vuelve a crear la base de datos desde cero.

```bash
# Desde scripts/db/
reset-db.bat
```

Este script realiza: `docker compose down -v` → `docker compose up -d` → `apply-schema.bat` → `apply-seed.bat`.

### Acceso directo a psql

```bash
# Abrir consola psql dentro del contenedor
docker exec -it lovelace_db psql -U lovelace -d lovelace

# O usar el atajo
scripts/db/psql.bat
```

---

## 5. Generación de Hashes de Contraseñas

Para generar hashes bcrypt para los datos de prueba, se proporcionan tres utilidades:

```bash
# Con Node.js (requiere bcrypt instalado)
node scripts/db/gen-hashes.js

# Con Node.js (rutas absolutas)
node scripts/db/gen-hashes-abs.js

# Con PowerShell
.\scripts\db\gen-hashes.ps1
```

---

## 6. Consideraciones de Despliegue en Producción

### Seguridad

- Cambiar `JWT_SECRET` por un valor aleatorio seguro (mínimo 32 caracteres).
- Cambiar las contraseñas de la base de datos (`DB_PASSWORD`, `POSTGRES_PASSWORD`).
- Restringir `CORS_ORIGIN` al dominio de producción del frontend.
- No exponer el puerto `5432` de PostgreSQL al exterior.

### Nginx (proxy inverso recomendado)

En un entorno de producción se recomienda situar un proxy inverso Nginx frente a los servicios:

```nginx
server {
    listen 80;
    server_name smarteconomato.com;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Persistencia de datos

Los datos de PostgreSQL se almacenan en el volumen Docker `lovelace_db_data`. Para realizar copias de seguridad:

```bash
# Crear un dump de la base de datos
docker exec lovelace_db pg_dump -U lovelace lovelace > backup_$(date +%Y%m%d).sql

# Restaurar desde un dump
docker exec -i lovelace_db psql -U lovelace -d lovelace < backup_20241201.sql
```
