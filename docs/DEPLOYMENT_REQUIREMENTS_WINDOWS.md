# Lista mínima de instalaciones para el servidor Windows

Fecha: 2026-03-15

Este documento contiene únicamente el listado de software que deben instalar los profesores en el servidor Windows del aula para poder levantar la aplicación (backend + frontend + base de datos).

Instalaciones mínimas (recomendadas, en orden de prioridad)

- Docker Desktop (Windows) — activar WSL2; incluye Docker Engine y `docker compose` (recomendado: versión reciente, p.ej. >= 20.10).
- Git (última versión estable).
- Visual Studio Build Tools (C++ build tools) — necesario si algún módulo nativo debe compilarse (p. ej. `serialport`).

Opcionales

- Nginx (opcional): No sabemos si nos dará tiempo a implementarlo y configurarlo.

Notas rápidas

- Si es posible, la opción más sencilla para clase es instalar Docker Desktop + Git y levantar el proyecto con `docker compose up -d` (usa los archivos `docker-compose.yml` y los `Dockerfile` del repo).
- Si no se permite Docker en la red de la facultad, pedir al administrador una VM Linux (Ubuntu 22.04) para despliegue, o instalar Node.js y PostgreSQL.

Archivos de referencia en el repo (para quien instale)
- `backend/package.json` — dependencias y versiones backend
- `frontend/package.json` — dependencias y versiones frontend
- `docker-compose.yml` — servicios definidos (Postgres, backend, frontend)