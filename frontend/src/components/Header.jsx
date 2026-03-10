import { useState, useRef, useEffect } from 'react'
import { User, Sun, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import logoImg from '../assets/logo_cifp.png'

export default function Header({ showMenuButton = false, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const isDark = root.classList.toggle('dark')
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    } catch (e) { }
  }

  return (
    <header className="bg-cifp-red dark:bg-cifp-red-dark text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button (Focus Mode only) */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="focus:outline-none"
            aria-label="Ir al dashboard"
          >
            <img src={logoImg} alt="CIFP" className="h-14 w-14.5 object-contain rounded-sm cursor-pointer" />
          </button>
          <div>
            <div className="text-sm text-white/90">Gobierno de Canarias</div>
            <div className="text-lg font-semibold text-white">SmartEconomato</div>
          </div>
        </div>

        <div className="flex items-center gap-4 relative" ref={ref}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-white/10"
            aria-haspopup="true"
            aria-expanded={open}
          >
            <User className="w-5 h-5 text-white" />
            <span className="text-sm text-white">
              {user?.nombre
                ? `${user.nombre} ${user.apellido1 || ''}`.trim()
                : (user?.email || 'Usuario')}
            </span>
          </button>

          {open && (
            <div className="absolute right-4 top-full mt-2 w-52 bg-white text-cifp-neutral-900 rounded-md shadow-lg z-50 overflow-hidden transform translate-y-1">
              <button
                className="w-full text-left px-4 py-2 hover:bg-cifp-neutral-50 flex items-center gap-2"
                onClick={() => { setOpen(false); navigate('/profile') }}
              >
                Perfil
              </button>

              <button
                className="w-full text-left px-4 py-2 hover:bg-cifp-neutral-50 flex items-center gap-2"
                onClick={() => { toggleTheme(); setOpen(false) }}
              >
                <Sun className="w-4 h-4 mr-2" /> Modo claro/oscuro
              </button>

              <button
                className="w-full text-left px-4 py-2 hover:bg-cifp-neutral-50 flex items-center gap-2"
                onClick={() => { logout(); setOpen(false) }}
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
