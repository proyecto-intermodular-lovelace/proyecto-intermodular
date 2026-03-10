# Lovelace — Smart Economato

> **Proyecto educativo y social** para la digitalización del economato escolar, aplicando principios de economía circular y gestión eficiente de recursos en centros educativos.

Lovelace es una plataforma web completa que permite a los alumnos y profesores gestionar el inventario, los pedidos a proveedores y los movimientos de stock del economato del centro. Su interfaz está optimizada para uso táctil en modo kiosco (tableta), facilitando su adopción en el aula.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | [NestJS](https://nestjs.com/) (Node.js) · TypeORM · JWT |
| **Base de datos** | PostgreSQL 16 |
| **Frontend** | React 18 · React Router · Tailwind CSS |
| **Infraestructura** | Docker · Docker Compose |
| **Documentación API** | Swagger (OpenAPI 3) |

---

## ⚡ Inicio Rápido

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- [Node.js](https://nodejs.org/) v18 o superior (solo para desarrollo local sin Docker)
- [Git](https://git-scm.com/)

### Opción A — Docker Compose (recomendado)

Levanta los tres servicios (base de datos, backend y frontend) con un solo comando:

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd proyecto-intermodular

# 2. Copiar y configurar las variables de entorno
cp backend/.env.example .env
# Editar .env con los valores adecuados (ver docs/TECHNICAL_ADMIN_MANUAL.md)

# 3. Arrancar todo el stack
docker compose up -d

# 4. Verificar que los servicios están activos
docker compose ps
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Swagger UI | http://localhost:3000/api/docs |

### Opción B — Desarrollo local (sin Docker)

```bash
# --- Backend ---
cd backend
npm install
cp .env.example .env   # Configurar credenciales de BD local
npm run start:dev

# --- Frontend (en otra terminal) ---
cd frontend
npm install
npm run dev
```

> **Nota:** Esta opción requiere una instancia de PostgreSQL 16 corriendo localmente.

---

## 🗂️ Estructura del Proyecto

```
proyecto-intermodular/
├── backend/          # API REST con NestJS
├── frontend/         # SPA con React + Tailwind
├── scripts/db/       # Scripts SQL y utilidades de base de datos
├── docs/             # Documentación técnica detallada
├── docker-compose.yml
└── .env              # Variables de entorno globales
```

---

## 📚 Documentación

Consulta la carpeta [`docs/`](./docs/) para la documentación técnica completa:

| Documento | Descripción |
|---|---|
| [`docs/TECHNICAL_ADMIN_MANUAL.md`](./docs/TECHNICAL_ADMIN_MANUAL.md) | Manual de administración del sistema (Docker, variables de entorno, scripts de BD) |
| [`docs/APP_FLOW.md`](./docs/APP_FLOW.md) | Arquitectura de la aplicación y flujos principales |
| [`docs/DATABASE_MANUAL.md`](./docs/DATABASE_MANUAL.md) | Esquema de base de datos, entidades y relaciones |
| [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) | Referencia de la API REST y acceso a Swagger |

---

## 🤝 Contribución

Lee [`CONTRIBUTING.md`](./CONTRIBUTING.md) antes de realizar cualquier aportación al proyecto.

---

## 📄 Licencia

Proyecto educativo — IES Domingo Pérez Minik - Lovelace.
