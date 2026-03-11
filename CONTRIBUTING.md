# Guía de Contribución — Lovelace Smart Economato

**Sistema de control de versiones:** Git Flow · **Commits:** Conventional Commits v1.0  
Todo el trabajo se realiza desde **forks personales**. Nadie hace push directamente a `main` ni a `develop`.

> ⚠️ El incumplimiento de estas normas resultará en el rechazo inmediato de la Pull Request.

---

## 1. Estrategia de Ramas (Git Flow)

```
main          ← Producción estable. Solo se actualiza desde develop via PR aprobada.
  │
develop       ← Integración continua. Base para todas las features.
  │
  ├─ feature/nombre-descriptivo   ← Nueva funcionalidad
  ├─ fix/descripcion-del-bug      ← Corrección de error
  ├─ refactor/descripcion         ← Refactorización sin cambio de comportamiento
  └─ docs/seccion-o-documento     ← Solo cambios en documentación
```

### Reglas de ramas

| Rama | Origen | Destino PR |
|---|---|---|
| `feature/*` | `develop` | `develop` |
| `fix/*` | `develop` | `develop` |
| `refactor/*` | `develop` | `develop` |
| `docs/*` | `develop` o `main` | misma base |
| `hotfix/*` | `main` | `main` + `develop` |

**Estándar de nombrado:**
```bash
feature/backend-jwt-auth
feature/frontend-orders-page
fix/login-token-expiry
refactor/products-service-normalization
docs/update-api-reference
```

---

## 2. Configuración del Entorno Local

```bash
# 1. Crear fork en GitHub y clonar TU fork (no el repo original)
git clone git@github.com:TU_USUARIO/proyecto-intermodular.git
cd proyecto-intermodular

# 2. Añadir el upstream (repo oficial) para sincronizarte
git remote add upstream git@github.com:proyecto-intermodular-lovelace/proyecto-intermodular.git

# 3. Verificar remotos
git remote -v
# origin   → tu fork  (lectura/escritura)
# upstream → repositorio oficial (solo lectura)
```

---

## 3. Flujo de Trabajo Estándar

```bash
# Antes de empezar cualquier tarea: sincronizar con upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# Crear rama para la tarea
git checkout -b feature/nombre-descriptivo

# ... desarrollar y hacer commits ...

# Subir rama a tu fork
git push origin feature/nombre-descriptivo

# Abrir Pull Request en GitHub:
# Base: proyecto-intermodular-lovelace/proyecto-intermodular → develop
# Compare: TU_USUARIO/proyecto-intermodular → feature/nombre-descriptivo
```

---

## 4. Conventional Commits

**Formato:**
```
<tipo>(<scope opcional>): <descripción en imperativo, inglés>

[cuerpo opcional — explicación del por qué]

[footer opcional — refs: #issue]
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad visible para el usuario |
| `fix` | Corrección de un error |
| `refactor` | Cambio de código sin cambio de comportamiento ni nueva feature |
| `docs` | Solo cambios en documentación (`.md`, comentarios) |
| `style` | Formato, espaciado, punto y coma (sin cambio de lógica) |
| `test` | Añadir o corregir tests |
| `chore` | Tareas de mantenimiento (deps, builds, CI config) |
| `perf` | Mejora de rendimiento |
| `ci` | Cambios en pipelines CI/CD |

### Scopes recomendados

`auth` · `products` · `inventory` · `orders` · `suppliers` · `ui` · `db` · `docker` · `docs`

### Ejemplos válidos

```bash
git commit -m "feat(auth): implement JWT refresh token endpoint"
git commit -m "fix(orders): prevent duplicate submission on double-tap"
git commit -m "refactor(ui): replace hover states with active states in Button"
git commit -m "docs(api): add missing endpoint descriptions to API_REFERENCE"
git commit -m "chore(deps): update tailwind-merge to 2.6.0"
```

### Ejemplos inválidos ❌

```bash
git commit -m "arreglado bug"          # Sin tipo, en español
git commit -m "WIP"                    # No descriptivo
git commit -m "feat: many things"      # Demasiado genérico, scope demasiado amplio
```

---

## 5. Pull Requests

### Requisitos mínimos para abrir una PR

- [ ] La rama parte de `develop` y está actualizada con `upstream/develop`
- [ ] Todos los commits siguen Conventional Commits
- [ ] El código compila sin errores (`npm run build`)
- [ ] El linter no reporta errores (`npm run lint`)
- [ ] No hay `console.log` ni código comentado sin justificación
- [ ] Los cambios de UI respetan la filosofía Kiosco (ver `docs/FRONTEND_ARCHITECTURE.md`)
- [ ] La PR incluye solo los cambios relacionados con la tarea

### Plantilla de descripción de PR

```markdown
## ¿Qué hace esta PR?
Descripción breve del cambio y su motivación.

## Tipo de cambio
- [ ] feat   — nueva funcionalidad
- [ ] fix    — corrección de error
- [ ] refactor
- [ ] docs

## Cómo probar
1. Paso 1
2. Paso 2

## Checklist
- [ ] Código probado localmente
- [ ] Linter sin errores
- [ ] Sin console.log
- [ ] Sin cambios fuera del scope de la tarea
```

### Proceso de revisión

| Estado | Significado |
|---|---|
| **Approved** | Se hace merge. No añadir más commits. |
| **Changes requested** | Corregir según los comentarios y volver a solicitar revisión. |
| **Closed (rejected)** | La PR no se ajusta a las normas o el scope. Abrir una nueva correctamente. |

> Solo el responsable del proyecto puede hacer merge a `main`. Nadie hace merge de su propia PR.

---

## 6. Normas de Código

### Backend (NestJS)

- Arquitectura por módulos estricta: `Module → Controller → Service → Repository`
- No mezclar lógica de negocio en el controlador
- DTOs obligatorios con `class-validator` en todos los endpoints
- No hardcodear valores sensibles. Usar `ConfigService` para variables de entorno
- El fichero `.env` **nunca** se sube al repositorio

### Frontend (React + Vite)

- Solo componentes funcionales con hooks
- No lógica compleja (llamadas a API, cálculos) directamente en el JSX
- Toda comunicación HTTP en `services/`
- Componentes UI en `components/ui/` solo con `clsx` + `tailwind-merge` (sin estilos inline)
- **Prohibido** `hover` como único mecanismo de interacción (ver `docs/FRONTEND_ARCHITECTURE.md`)
- Tamaño mínimo de target táctil: `min-h-[44px] min-w-[44px]`

### General

- No subir `node_modules/`, `dist/`, `.env`
- Respetar la configuración de `.prettierrc` y `.eslintrc`
- Los nombres de variables y funciones **en inglés**; los comentarios explicativos pueden estar en español

---

## 7. Sincronización con upstream

```bash
# Antes de empezar cada tarea nueva
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop   # Actualizar tu fork
```

Si hay conflictos, resolverlos localmente antes de abrir la PR. Nunca forzar un push a `develop` o `main`.

---

## 8. Antes de pedir ayuda

1. Leer este documento completo
2. Comprobar rama activa: `git branch`
3. Revisar estado: `git status`
4. Revisar log de commits: `git log --oneline -10`
5. Ejecutar linter: `npm run lint`
6. Intentar resolver el problema de forma independiente

Si ninguno de los pasos anteriores resuelve el problema → crear un issue en GitHub con contexto completo (rama, error, pasos para reproducir).
