# Arquitectura del Frontend — Lovelace Smart Economato

**Stack:** React 18 · Vite 6 · Tailwind CSS 3 · React Router v7  
**Filosofía de diseño:** Kiosco / Tableta Táctil (Touch-First, WCAG 2.1 AA)

---

## 1. Estructura de Carpetas

```
frontend/src/
├── app/
│   ├── App.jsx              # Raíz de la aplicación (RouterProvider)
│   └── router.jsx           # Declaración centralizada de todas las rutas
│
├── components/
│   ├── ui/                  # Primitivos de UI reutilizables (design system)
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── index.js         # Re-exportaciones centralizadas
│   ├── BarcodeListener.jsx  # Captura de eventos del lector de código de barras
│   ├── Header.jsx
│   ├── MobileMenu.jsx
│   ├── Navbar.jsx
│   ├── NavigationGrid.jsx   # Grid de navegación táctil principal
│   └── RequireAuth.jsx      # Guard de rutas protegidas
│
├── contexts/
│   └── AuthProvider.jsx     # Contexto global de autenticación + token JWT
│
├── features/                # Módulos de dominio (un directorio por feature)
│   ├── auth/                # Login, Register, Recover
│   ├── dashboard/
│   ├── ingredients/         # Summary, Full, Detail pages
│   ├── materials/           # Summary, Full, Detail pages
│   ├── orders/
│   ├── profile/
│   ├── returns/             # ReturnsPage: bajas (EXIT) y devoluciones (ENTRY)
│   └── suppliers/           # Summary, Full, Detail pages
│
├── layouts/
│   └── MainLayout.jsx       # Shell principal: Header + Navbar + <Outlet />
│
├── services/
│   ├── api.js               # Instancia base de fetch (URL dinámica por hostname)
│   ├── orders.service.js
│   └── products.service.js  # Normalización de datos desde la API
│
└── assets/                  # Imágenes, SVGs e íconos estáticos
```

### Reglas de organización

| Regla | Descripción |
|---|---|
| **Un directorio por dominio** | Cada feature en `features/` es autocontenida: páginas, hooks locales y helpers propios. |
| **`components/ui/` solo primitivos** | Sin lógica de negocio. Solo estilo y comportamiento genérico. |
| **`services/` solo comunicación HTTP** | No hay lógica de UI en los servicios. Devuelven datos normalizados. |
| **`contexts/` solo estado global** | Mínimo número de contextos. Estado local siempre en el componente. |

---

## 2. Filosofía de Diseño Kiosco / Tableta Táctil

Este frontend está concebido para ejecutarse en **tabletas en modo kiosco** (pantalla fija, sin ratón, uso táctil exclusivo). Todos los componentes deben respetar los siguientes principios:

### 2.1 Reglas obligatorias

| # | Regla | Justificación |
|---|---|---|
| 1 | **Tamaño mínimo de target táctil: 44×44 px** | WCAG 2.1 — Success Criterion 2.5.5 |
| 2 | **❌ PROHIBIDO depender de `hover` para funcionalidad core** | El hover no existe en pantallas táctiles. |
| 3 | **Focus visible en todos los elementos interactivos** | Navegación por teclado alternativa y accesibilidad. |
| 4 | **Texto mínimo 16px en contenido; 14px en etiquetas secundarias** | Legibilidad a distancia de tableta. |
| 5 | **Espaciado generoso entre elementos (`gap-4` mínimo en listas táctiles)** | Evitar pulsaciones accidentales. |
| 6 | **Estados `active` / `focus` en lugar de `hover` para feedback visual** | Compatibilidad táctil. |
| 7 | **Sin tooltips que requieran hover** | Reemplazar por etiquetas visibles o modales. |

### 2.2 Estados permitidos y prohibidos

```jsx
// ✅ CORRECTO — feedback a través de active y focus
className="bg-blue-600 active:bg-blue-800 focus:ring-2 focus:ring-blue-400"

// ❌ INCORRECTO — funcionalidad crítica oculta tras hover
className="opacity-0 hover:opacity-100"  // Un usuario táctil nunca lo verá
```

---

## 3. Sistema de Componentes UI

Los primitivos en `components/ui/` se construyen siempre con:

- **`clsx`** — composición condicional de clases
- **`tailwind-merge` (`twMerge`)** — fusión segura que evita conflictos de clases Tailwind
- **`class-variance-authority` (`cva`)** — para variantes tipadas y escalables

### 3.1 Patrón base para crear un primitivo

```jsx
// components/ui/TouchButton.jsx
import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cva } from 'class-variance-authority'

// Define variantes con cva
const buttonVariants = cva(
  // Base: min 44×44px táctil (min-h-11 = 44px), focus visible, sin hover como elemento core
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold min-h-[44px] min-w-[44px] px-5 py-3 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:   'bg-cifp-blue text-white active:bg-cifp-blue-dark focus:ring-cifp-blue',
        secondary: 'border-2 border-cifp-blue text-cifp-blue bg-transparent active:bg-cifp-blue/10 focus:ring-cifp-blue',
        danger:    'bg-red-600 text-white active:bg-red-800 focus:ring-red-500',
        ghost:     'text-gray-700 bg-transparent active:bg-gray-100 focus:ring-gray-400',
      },
      size: {
        sm: 'text-sm min-h-[44px] px-4',
        md: 'text-base min-h-[52px] px-5',
        lg: 'text-lg min-h-[60px] px-6',   // Recomendado para kiosco
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

const TouchButton = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button
    ref={ref}
    className={twMerge(clsx(buttonVariants({ variant, size }), className))}
    {...props}
  />
))

TouchButton.displayName = 'TouchButton'
export default TouchButton
```

### 3.2 Patrón para Input táctil

```jsx
// components/ui/TouchInput.jsx
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

const TouchInput = forwardRef(({ className, error, label, id, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      id={id}
      ref={ref}
      // min-h-[52px] garantiza target táctil generoso, text-base evita zoom en iOS
      className={twMerge(clsx(
        'w-full min-h-[52px] rounded-xl border px-4 text-base',
        'focus:outline-none focus:ring-2 focus:ring-cifp-blue focus:border-transparent',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white',
        className
      ))}
      {...props}
    />
    {error && (
      <span role="alert" className="text-sm text-red-600">{error}</span>
    )}
  </div>
))

TouchInput.displayName = 'TouchInput'
export default TouchInput
```

### 3.3 Card contenedor de sección

```jsx
// components/ui/Card.jsx
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

function Card({ className, children, ...props }) {
  return (
    <div
      className={twMerge(clsx(
        'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm',
        className
      ))}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
```

---

## 4. Dependencias del Design System

| Paquete | Versión | Uso |
|---|---|---|
| `clsx` | ^2.1.1 | Composición condicional de clases |
| `tailwind-merge` | ^2.6.0 | Fusión sin conflictos de clases Tailwind |
| `class-variance-authority` | ^0.7.1 | Variantes tipadas y escalables |
| `lucide-react` | ^0.469.0 | Librería de iconos (SVG semántico) |
| `tailwindcss-animate` | ^1.0.7 | Animaciones declarativas |

---

## 5. Gestión de Estado y Comunicación con la API

### Contexto de autenticación

```
AuthProvider (contexts/AuthProvider.jsx)
  └── Expone: { user, token, login(), logout(), isLoading }
      └── Consumido por: RequireAuth, Header, todas las pages protegidas
```

### Capa de servicios

```
services/api.js
  └── Construye la URL base dinámicamente:
      `${window.location.protocol}//${window.location.hostname}:3000`
      ✅ Permite acceso desde móviles en la misma red local.

services/products.service.js
  └── getIngredients()   → GET /api/products?type=INGREDIENT
  └── getMaterials()     → GET /api/products?type=MATERIAL
  └── getAllProducts()   → GET /api/products
  └── getProductById()  → GET /api/products/:id
  └── Normaliza campos antes de exponer datos a la UI
      (API: code→sku, name→nombre, unitType→unidad, unitPrice→precio, etc.)

services/orders.service.js
  └── getOrders(), createOrder(), updateOrderStatus()
```

#### Pantalla de Bajas y Devoluciones (`features/returns/ReturnsPage.jsx`)

- Llama a `GET /api/inventory?limit=20&page=1` para cargar el historial de movimientos.
- La respuesta es paginada (`{ data: [], meta: {} }`); el componente consume `res.data`.
- El nombre del producto en el historial se obtiene de `m.producto?.name` (objeto relacionado cargado por el backend). Si no está disponible, muestra `m.productoId` como fallback.
- Los tipos de movimiento se traducen en la UI: `ENTRY` → "Entrada", `EXIT` → "Salida", `ADJUSTMENT` → "Ajuste", cualquier otro → "Pérdida".
- Merma/Baja → `POST /api/inventory/salida` (tipo `EXIT`).
- Devolución → `POST /api/inventory/entrada` (tipo `ENTRY`).

---

## 6. Convenciones de Nombrado

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `LoginPage.jsx`, `TouchButton.jsx` |
| Hooks | camelCase con prefijo `use` | `useAuth.js`, `useProducts.js` |
| Servicios | camelCase con sufijo `.service.js` | `products.service.js` |
| Contextos | PascalCase con sufijo `Provider` | `AuthProvider.jsx` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE`, `MAX_RETRY` |

---

## 7. Checklist de Accesibilidad (WCAG 2.1 AA)

Antes de hacer PR de un componente nuevo, verificar:

- [ ] Target táctil ≥ 44×44 px
- [ ] Contraste de color ≥ 4.5:1 (texto normal) / 3:1 (texto grande)
- [ ] `aria-label` o texto visible en todos los botones con solo icono
- [ ] Todos los inputs tienen `<label>` asociado via `htmlFor`
- [ ] Navegable con teclado (Tab / Enter / Space)
- [ ] `role="alert"` en mensajes de error dinámicos
- [ ] Sin funcionalidad oculta exclusivamente tras `hover`
