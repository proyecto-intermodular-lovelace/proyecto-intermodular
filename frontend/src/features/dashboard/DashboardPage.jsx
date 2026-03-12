import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthProvider'
import {
  Box, ClipboardList, Truck, Heart, Repeat, ChefHat, Archive, Tags,
} from 'lucide-react'

// ─── Nav items with tooltip descriptions ─────────────────────────────────────
const NAV_ITEMS = [
  {
    to: '/products',       label: 'Ingredientes',  icon: Box,
    bg: 'bg-yellow-50',   color: 'text-yellow-600', border: 'border-yellow-200',
    desc: 'Catálogo de ingredientes: altas, bajas, precios y rendimientos por unidad de medida.',
  },
  {
    to: '/inventory',      label: 'Materiales',    icon: ClipboardList,
    bg: 'bg-green-50',    color: 'text-green-600',  border: 'border-green-200',
    desc: 'Gestión de materiales y equipamiento: stock actual, entradas y salidas de almacén.',
  },
  {
    to: '/categories',     label: 'Categorías',    icon: Tags,
    bg: 'bg-teal-50',     color: 'text-teal-600',   border: 'border-teal-200',
    desc: 'Gestión de categorías de ingredientes y materiales para clasificar productos.',
  },
  {
    to: '/recipes',        label: 'Recetas',       icon: ChefHat,
    bg: 'bg-orange-50',   color: 'text-orange-600', border: 'border-orange-200',
    desc: 'Fichas técnicas de recetas del centro: escandallo, costes y tabla de alérgenos.',
  },
  {
    to: '/returns',        label: 'Bajas / Dev.',  icon: Archive,
    bg: 'bg-pink-50',     color: 'text-pink-600',   border: 'border-pink-200',
    desc: 'Registro de bajas por caducidad o rotura y devoluciones a proveedores.',
  },
  {
    to: '/orders',         label: 'Pedidos',       icon: Truck,
    bg: 'bg-blue-50',     color: 'text-blue-600',   border: 'border-blue-200',
    desc: 'Solicitudes de pedido por clase, revisión docente y consolidado semanal del economato.',
  },
  {
    to: '/delivery-notes', label: 'Albaranes',     icon: Repeat,
    bg: 'bg-red-50',      color: 'text-red-600',    border: 'border-red-200',
    desc: 'Registro y validación de albaranes de entrega recibidos de los proveedores.',
  },
  {
    to: '/providers',      label: 'Proveedores',   icon: Heart,
    bg: 'bg-indigo-50',   color: 'text-indigo-600', border: 'border-indigo-200',
    desc: 'Directorio de proveedores: contacto, condiciones comerciales y catálogo asociado.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function roleLabel(role) {
  if (role === 'SUPERADMIN') return 'Economato'
  if (role === 'ADMIN')      return 'Docente'
  return 'Alumno / a'
}

function roleBadgeColor(role) {
  if (role === 'SUPERADMIN') return 'bg-red-50 text-cifp-red border border-red-200'
  if (role === 'ADMIN')      return 'bg-blue-50 text-blue-700 border border-blue-200'
  return 'bg-green-50 text-green-700 border border-green-200'
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const [now, setNow] = useState(new Date())

  // Live clock — updates every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const fullName = user
    ? `${user.nombre ?? ''} ${user.apellido1 ?? ''}`.trim() || user.email
    : ''

  const dayStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-8 pb-4 max-w-screen-xl">

      {/* ── Greeting ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400 capitalize tracking-wide">{dayStr}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            {getGreeting()},{' '}
            <span className="text-cifp-blue">{fullName || 'Usuario'}</span>
            {' '}<span aria-hidden>👋</span>
          </h1>
        </div>
        <span className={`inline-flex items-center self-start sm:mt-1 px-3 py-1 rounded-full text-sm font-semibold ${roleBadgeColor(user?.role)}`}>
          {roleLabel(user?.role)}
        </span>
      </div>

      {/* ── Quick access ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, bg, color, border, desc }) => (
            <Link
              key={to}
              to={to}
              className={`group relative flex flex-col items-center gap-3 bg-white border ${border} rounded-2xl px-4 py-5 shadow-sm hover:shadow-md active:scale-95 transition-all duration-150`}
            >
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
              <span className="text-sm font-semibold text-gray-700 text-center leading-tight select-none">
                {label}
              </span>

              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-56 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="bg-gray-900 text-white text-xs rounded-xl px-3.5 py-3 leading-relaxed shadow-2xl">
                  <p className={`font-bold mb-1 ${color}`}>{label}</p>
                  <p className="text-gray-300">{desc}</p>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-gray-900" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
