# Manual de Administrador IT
## Sistema Lovelace · Smarteconomato

> **Versión:** 1.0 · **Fecha:** Marzo 2026  
> **Para:** Administrador de Sistemas / Responsable de IT del centro

---

## Introducción

Este manual está dirigido al **Administrador de IT** del centro, responsable de mantener la infraestructura técnica que soporta el sistema **Lovelace Smarteconomato**. Cubre cuatro áreas de responsabilidad críticas:

1. **Gestión de usuarios y roles** — creación de cuentas, asignación de permisos, reseteo de contraseñas.
2. **Configuración del modo quiosco** — bloqueo del dispositivo táctil para uso exclusivo de la aplicación.
3. **Salud del sistema** — monitorización del backend NestJS y la base de datos PostgreSQL.
4. **Copias de seguridad** — procedimientos de backup manual y recuperación ante fallos.

> [!IMPORTANT]
> Este manual asume conocimientos técnicos básicos de administración de sistemas Linux/Windows, línea de comandos, y conceptos de redes locales. No está destinado a profesores ni alumnos.

---

## Módulo 1 — Gestión de Usuarios

### 1.1 Arquitectura de roles del sistema

El sistema define **4 roles** con permisos progresivos:

| Rol | Identificador en sistema | Permisos clave |
|---|---|---|
| **Administrador IT** | `admin` | Acceso total: gestión de usuarios, configuración, backups. |
| **Jefe de Economato** | `chief` | Recepción, distribución, bajas, inventario, aprobación de pedidos. |
| **Profesor** | `teacher` | Crear pedidos y escandallos, consultar inventario. |
| **Alumno** | `student` | Solo lectura: consultar inventario y ver pedidos de su clase. |

---

### 1.2 Crear una cuenta de usuario

#### Desde el Panel de Administración (interfaz web)

1. Accede al Panel de Administración en `http://[IP-DEL-SERVIDOR]:3000/admin` (o la URL configurada en tu centro).
2. Inicia sesión con tus credenciales de `admin`.
3. En el menú lateral, navega a **"Usuarios"** → **"+ Nuevo Usuario"**.
4. Rellena el formulario:

| Campo | Descripción |
|---|---|
| **Nombre completo** | Nombre y apellidos del usuario. |
| **Nombre de usuario** | Identificador único de login (sin espacios, ej: `jlopez`). |
| **Correo electrónico** | Opcional. Necesario si el sistema envía notificaciones por email. |
| **Rol** | Selecciona: `admin`, `chief`, `teacher`, o `student`. |
| **Contraseña inicial** | Genera una contraseña temporal segura. Comunícasela al usuario de forma segura y pídele que la cambie en el primer acceso. |
| **Clase/Grupo** | Solo para alumnos. Asigna el grupo al que pertenece. |

5. Pulsa **"Crear Usuario"**.

`[Insertar Captura de Pantalla — Formulario de creación de usuario en el Panel Admin]`

#### Desde la línea de comandos (CLI de NestJS)

```bash
# Conectarse al servidor
ssh admin@[IP-DEL-SERVIDOR]

# Acceder al directorio del backend
cd /opt/lovelace/backend

# Ejecutar el script de creación de usuario
npm run cli -- create-user \
  --username "jlopez" \
  --name "Juan López" \
  --role "teacher" \
  --password "TempP@ss2026"
```

> [!NOTE]
> El script `create-user` hace un hash seguro (bcrypt) de la contraseña antes de almacenarla en la base de datos. Nunca introduzcas contraseñas en texto plano directamente en PostgreSQL.

---

### 1.3 Asignar o cambiar el rol de un usuario

1. En el Panel de Administración → **"Usuarios"**, localiza al usuario por nombre o búsqueda.
2. Pulsa el icono de **editar** (✏️).
3. Cambia el campo **"Rol"** y pulsa **"Guardar Cambios"**.

> [!WARNING]
> Cambiar el rol de un usuario tiene efecto inmediato. Si el usuario tiene una sesión activa en ese momento, sus permisos cambian en la siguiente acción que realice. Considera hacer el cambio fuera del horario lectivo.

---

### 1.4 Resetear la contraseña de un usuario

#### Desde el Panel de Administración

1. Ve a **"Usuarios"** y localiza la cuenta.
2. Pulsa **"Resetear Contraseña"**.
3. Introduce y confirma una nueva contraseña temporal.
4. Activa la opción **"Obligar cambio en el próximo inicio de sesión"** si está disponible.
5. Pulsa **"Guardar"**. Comunica la contraseña temporal al usuario por un canal seguro.

#### Desde la base de datos (emergencia)

```sql
-- Conectarse a PostgreSQL
psql -U lovelace_user -d lovelace_db

-- Generar el hash bcrypt primero desde Node.js:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('NuevaContraseña!', 10).then(h => console.log(h));"
-- Luego actualizar el campo:
UPDATE users
SET password_hash = '$2b$10$xxx...hash_generado...xxx'
WHERE username = 'jlopez';
```

---

### 1.5 Deshabilitar o eliminar una cuenta

- **Deshabilitar** (recomendado para bajas temporales): En el Panel → Usuario → pulsa el toggle **"Cuenta activa"** para desactivarla. El usuario no podrá iniciar sesión pero sus datos se conservan.
- **Eliminar** (baja definitiva): Pulsa **"Eliminar Usuario"** y confirma. Los registros de pedidos y operaciones realizados por ese usuario se conservan por trazabilidad, pero la cuenta queda eliminada.

---

## Módulo 2 — Configuración del Modo Quiosco

El quiosco debe estar configurado para que los usuarios solo puedan acceder a la aplicación Lovelace, sin posibilidad de navegar por el sistema operativo o abrir otras aplicaciones.

### 2.1 Configuración en Android (tablet)

#### Modo quiosco nativo (Android 6+)
```
Ajustes → Seguridad → Anclar pantalla (Screen Pinning)
1. Abrir la app Lovelace en el navegador Chrome a pantalla completa.
2. Abrir el menú de apps recientes (botón cuadrado).
3. Mantener pulsado el icono de la app → "Anclar".
```

#### Modo quiosco gestionado (MDM recomendado para despliegues de varios dispositivos)
- Usa una solución MDM como **Android Enterprise** o **Scalefusion** para:
  - Bloquear el dispositivo en modo "Single App".
  - Deshabilitar la barra de notificaciones y el botón de inicio.
  - Forzar el reinicio de la app si se cierra inesperadamente.

`[Insertar Captura de Pantalla — Configuración de "App fijada" en Android]`

---

### 2.2 Configuración en un PC o pantalla táctil con Windows

#### Opción A: Modo Kiosco de Windows 10/11
```
Ajustes → Cuentas → Familia y usuarios → Configurar un quiosco
1. Crear una cuenta de usuario dedicada para el quiosco (ej: "LovelaceKiosk").
2. Seleccionar la app a ejecutar: Microsoft Edge.
3. Configurar la URL de inicio: http://[IP-DEL-SERVIDOR]:3000
4. Activar las siguientes restricciones de Edge en modo quiosco:
   - Ocultar barra de direcciones: Sí
   - Deshabilitar F11 / salida de pantalla completa: Sí
   - Reiniciar tras inactividad: 5 minutos
```

#### Opción B: Política de grupo (GPO)
```
gpedit.msc → Configuración de usuario → Plantillas administrativas → 
→ Componentes de Windows → Microsoft Edge
  - Habilitar modo de pantalla completa
  - Deshabilitar acceso a la configuración del navegador
  - Forzar URL de página de inicio: http://[IP-DEL-SERVIDOR]:3000
```

---

### 2.3 Buenas prácticas generales de quiosco

- **Deshabilitar los gestos del navegador** (deslizar para atrás/adelante en Chrome/Edge) para evitar que los usuarios salgan accidentalmente de la app.
- **Configurar cierre de sesión automático**: Verifica que el parámetro `SESSION_TIMEOUT_MINUTES` en el `.env` del backend esté ajustado (recomendado: `15` minutos de inactividad).
- **Pantalla siempre encendida**: En la configuración de energía del dispositivo, deshabilita el apagado de pantalla por inactividad o configurarlo en "Nunca" para un quiosco de uso continuo.
- **Acceso físico al dispositivo**: Instala una carcasa antivandálica con cerradura de seguridad para la tablet o PC del quiosco. Solo el personal de IT debe poder acceder al hardware.
- **Red Wi-Fi dedicada**: Si es posible, conecta el quiosco a una VLAN o red Wi-Fi separada del resto de usuarios para aislar el tráfico.

---

## Módulo 3 — Salud del Sistema

### 3.1 Arquitectura del backend

El sistema Lovelace Smarteconomato se compone de:

| Componente | Tecnología | Puerto por defecto |
|---|---|---|
| **API Backend** | NestJS (Node.js) | `3000` |
| **Base de datos** | PostgreSQL | `5432` |
| **Orquestación** | Docker Compose | — |

---

### 3.2 Verificar el estado de los servicios

```bash
# Conectarse al servidor
ssh admin@[IP-DEL-SERVIDOR]

# Ver el estado de todos los contenedores Docker
cd /opt/lovelace
docker compose ps

# Salida esperada (todos deben tener estado "Up"):
# NAME                STATUS          PORTS
# lovelace_backend    Up 3 hours      0.0.0.0:3000->3000/tcp
# lovelace_db         Up 3 hours      5432/tcp
```

#### Verificar que la API responde correctamente

```bash
# Health check del backend
curl http://localhost:3000/api/health

# Respuesta esperada:
# {"status":"ok","database":"connected"}
```

`[Insertar Captura de Pantalla — Terminal con docker compose ps mostrando contenedores "Up"]`

---

### 3.3 Consultar los logs del backend

```bash
# Ver los últimos 100 logs del backend en tiempo real
docker compose logs --tail=100 -f backend

# Ver logs solo de errores
docker compose logs backend 2>&1 | grep -i "error"

# Ver logs de la base de datos
docker compose logs --tail=50 db
```

---

### 3.4 Reiniciar servicios

```bash
# Reiniciar solo el backend (sin afectar la BD)
docker compose restart backend

# Reiniciar todos los servicios (usar solo si es necesario)
docker compose down && docker compose up -d

# Verificar que todo levantó correctamente
docker compose ps
curl http://localhost:3000/api/health
```

> [!WARNING]
> `docker compose down` interrumpe el servicio para todos los usuarios. Hazlo siempre **fuera del horario lectivo** y avisa al personal del centro con antelación.

---

## Módulo 4 — Copias de Seguridad (Backup)

### 4.1 Backup manual de la base de datos PostgreSQL

```bash
# Conectarse al servidor
ssh admin@[IP-DEL-SERVIDOR]

# Crear el directorio de backups si no existe
mkdir -p /opt/lovelace/backups

# Generar un dump completo de la base de datos con fecha
docker compose exec db pg_dump \
  -U lovelace_user \
  -d lovelace_db \
  --format=custom \
  --file=/tmp/backup_$(date +%Y%m%d_%H%M%S).dump

# Copiar el dump desde el contenedor al host
docker cp lovelace_db:/tmp/backup_*.dump /opt/lovelace/backups/

# Verificar que el archivo se ha creado correctamente
ls -lh /opt/lovelace/backups/
```

> [!IMPORTANT]
> **Frecuencia recomendada de backups:**
> - **Diario** (automatizado): backup incremental durante la noche (ej: 02:00h).
> - **Semanal** (manual): backup completo verificado cada viernes al cerrar.
> - **Antes de cualquier actualización del sistema**: backup completo obligatorio.

---

### 4.2 Automatizar el backup con cron

```bash
# Editar el crontab del servidor
crontab -e

# Añadir esta línea para un backup diario a las 02:00h
0 2 * * * /opt/lovelace/scripts/backup.sh >> /var/log/lovelace_backup.log 2>&1
```

**Contenido del script `/opt/lovelace/scripts/backup.sh`:**

```bash
#!/bin/bash
BACKUP_DIR="/opt/lovelace/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="lovelace_backup_${TIMESTAMP}.dump"

docker compose -f /opt/lovelace/docker-compose.yml exec -T db \
  pg_dump -U lovelace_user -d lovelace_db --format=custom \
  > "${BACKUP_DIR}/${FILENAME}"

# Eliminar backups con más de 30 días
find "${BACKUP_DIR}" -name "*.dump" -mtime +30 -delete

echo "[$(date)] Backup completado: ${FILENAME}"
```

---

### 4.3 Restaurar un backup

```bash
# Detener el backend para evitar escrituras durante la restauración
docker compose stop backend

# Restaurar el dump en la base de datos
docker compose exec -T db pg_restore \
  -U lovelace_user \
  -d lovelace_db \
  --clean \
  --if-exists \
  < /opt/lovelace/backups/lovelace_backup_20260310_020000.dump

# Reiniciar el backend
docker compose start backend

# Verificar que el sistema responde
curl http://localhost:3000/api/health
```

> [!CAUTION]
> `--clean` eliminará todas las tablas actuales antes de restaurar. Asegúrate de usar el archivo de backup correcto y de haber notificado a los usuarios del corte de servicio.

---

## Resolución de Problemas (Troubleshooting)

### El backend no responde (error 502 o pantalla en blanco en los quioscos)

1. `docker compose ps` → Comprueba si los contenedores están en estado `Up` o `Exited`.
2. Si alguno está en `Exited`: `docker compose logs backend` para ver el error.
3. Intenta reiniciar: `docker compose restart backend`.
4. Si persiste, comprueba el archivo `.env` en `/opt/lovelace/` para validar que las variables de entorno (BD, puertos) son correctas.

### Un usuario dice que no puede iniciar sesión pero las credenciales son correctas

1. Verifica en el Panel Admin que la cuenta está **activa** (no deshabilitada).
2. Comprueba en los logs si hay errores de autenticación: `docker compose logs backend | grep "auth"`.
3. Resetea la contraseña desde el Panel Admin como medida cautelar.

### La base de datos ocupa demasiado espacio en disco

```bash
# Verificar espacio en disco
df -h /opt/lovelace

# Ver tamaño de la base de datos desde psql
docker compose exec db psql -U lovelace_user -d lovelace_db \
  -c "SELECT pg_size_pretty(pg_database_size('lovelace_db'));"

# Ejecutar VACUUM para liberar espacio de registros borrados
docker compose exec db psql -U lovelace_user -d lovelace_db \
  -c "VACUUM ANALYZE;"
```

---

*Manual generado para el Proyecto Lovelace · Smarteconomato — IES Domingo Perez Minik*
