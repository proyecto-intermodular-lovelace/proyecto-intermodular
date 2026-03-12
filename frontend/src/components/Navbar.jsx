import { useState } from 'react'
import { Box, ClipboardList, Tags, Truck, Heart, Repeat, ChefHat, Archive, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const ITEMS = [
  { to: '/products',       label: 'Ingredientes',  icon: Box,           bg: 'bg-yellow-50', color: 'text-yellow-600', ring: 'ring-yellow-200', desc: 'Catálogo de ingredientes: altas, bajas, precios y rendimientos por unidad de medida.' },
  { to: '/products/import',label: 'Importar',      icon: FileText,     bg: 'bg-amber-50', color: 'text-amber-600', ring: 'ring-amber-200', desc: 'Importar productos desde CSV' },
  { to: '/inventory',      label: 'Materiales',    icon: ClipboardList, bg: 'bg-green-50',  color: 'text-green-600',  ring: 'ring-green-200',  desc: 'Gestión de materiales y equipamiento: stock actual, entradas y salidas de almacén.' },
  { to: '/categories',     label: 'Categorías',    icon: Tags,          bg: 'bg-teal-50',   color: 'text-teal-600',   ring: 'ring-teal-200',   desc: 'Gestión de categorías de ingredientes y materiales para clasificar productos.' },
  { to: '/recipes',        label: 'Recetas',       icon: ChefHat,       bg: 'bg-orange-50', color: 'text-orange-600', ring: 'ring-orange-200', desc: 'Fichas técnicas de recetas del centro: escandallo, costes y tabla de alérgenos.' },
  { to: '/returns',        label: 'Bajas / Dev.',  icon: Archive,       bg: 'bg-pink-50',   color: 'text-pink-600',   ring: 'ring-pink-200',   desc: 'Registro de bajas por caducidad o rotura y devoluciones a proveedores.' },
  { to: '/orders',         label: 'Pedidos',       icon: Truck,         bg: 'bg-blue-50',   color: 'text-blue-600',   ring: 'ring-blue-200',   desc: 'Solicitudes de pedido por clase, revisión docente y consolidado semanal del economato.' },
  { to: '/delivery-notes', label: 'Albaranes',     icon: Repeat,        bg: 'bg-red-50',    color: 'text-red-600',    ring: 'ring-red-200',    desc: 'Registro y validación de albaranes de entrega recibidos de los proveedores.' },
  { to: '/providers',      label: 'Proveedores',   icon: Heart,         bg: 'bg-indigo-50', color: 'text-indigo-600', ring: 'ring-indigo-200', desc: 'Directorio de proveedores: contacto, condiciones comerciales y catálogo asociado.' },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [tip, setTip] = useState(null) // { x, y, label, desc, color }

  const canGoBack     = location.key !== 'default'
  const isOnDashboard = location.pathname === '/dashboard'
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  function show(e, label, desc, color) {
    const r = e.currentTarget.getBoundingClientRect()
    setTip({ x: r.left + r.width / 2, y: r.top, label, desc, color })
  }
  const hide = () => setTip(null)

  return (
    <>
      <nav className="w-full px-2 sm:px-4 py-3">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/70 rounded-2xl shadow-md px-2 py-1.5 flex items-center gap-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">

          {/* Dashboard button — always visible */}
          <Link
            to="/dashboard"
            onMouseEnter={e => show(e, 'Inicio', 'Ir al panel principal', 'text-gray-200')}
            onMouseLeave={hide}
            aria-label="Inicio"
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[64px] transition-all duration-150 shrink-0 active:scale-95 ${
              isOnDashboard
                ? 'bg-gray-100 text-cifp-neutral-800 ring-1 ring-gray-200 shadow-sm font-semibold'
                : 'text-cifp-neutral-500 hover:bg-cifp-neutral-100 hover:text-cifp-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-tight">Inicio</span>
          </Link>

          {/* Back button — only when there's history */}
          {canGoBack && !isOnDashboard && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              onMouseEnter={e => show(e, 'Volver', 'Volver a la página anterior', 'text-gray-200')}
              onMouseLeave={hide}
              aria-label="Volver atrás"
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[64px] transition-all duration-150 shrink-0 text-cifp-neutral-500 hover:bg-cifp-neutral-100 hover:text-cifp-neutral-800 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-tight">Volver</span>
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-7 bg-gray-200 mx-1 shrink-0" />

          {/* Navigation items */}
          {ITEMS.map(({ to, label, icon: Icon, bg, color, ring, desc }) => {
            const active = isActive(to)
            return (
              <Link
                key={to}
                to={to}
                onMouseEnter={e => show(e, label, desc, color)}
                onMouseLeave={hide}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[72px] transition-all duration-150 shrink-0 active:scale-95 ${
                  active
                    ? `${bg} ${color} ring-1 ${ring} shadow-sm font-semibold`
                    : 'text-cifp-neutral-500 hover:bg-cifp-neutral-100 hover:text-cifp-neutral-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Fixed tooltip — outside any overflow/stacking context so it's never clipped */}
      {tip && (
        <div
          className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-full"
          style={{ left: tip.x, top: tip.y - 10 }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-xl px-3.5 py-3 leading-relaxed shadow-2xl w-52">
            <p className={`font-bold mb-1 ${tip.color}`}>{tip.label}</p>
            <p className="text-gray-300">{tip.desc}</p>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-gray-900" />
        </div>
      )}
    </>
  )
}
