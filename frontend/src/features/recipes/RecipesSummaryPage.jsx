import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { ChefHat, ArrowRight, Search, Plus } from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import { getRecipes } from '../../services/recipes.service'
import { mockRecipes } from '../../services/recipes.mock'

export default function RecipesSummaryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role !== 'USER'

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let mounted = true
    getRecipes(500)
      .then(data => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setRecipes(data)
        } else if (mounted) {
          setRecipes(mockRecipes)
        }
      })
      .catch(() => {
        if (mounted) setRecipes(mockRecipes)
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    if (!search) return recipes.slice(0, 8)
    const q = search.toLowerCase()
    return recipes
      .filter(r => [r.name, r.code].some(v => String(v || '').toLowerCase().includes(q)))
      .slice(0, 8)
  }, [recipes, search])

  const easyCount = useMemo(() => recipes.filter(r => r.difficulty === 'FACIL').length, [recipes])
  const hardCount = useMemo(() => recipes.filter(r => r.difficulty === 'DIFICIL').length, [recipes])

  return (
    <div className="space-y-6 short:space-y-3">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-orange-600 short:h-6 short:w-6" />
          <h1 className="text-3xl font-bold text-cifp-neutral-900 short:text-xl">Recetas</h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button onClick={() => navigate('/recipes/new')} className="hidden sm:flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Nueva</span>
            </Button>
          )}
          <Button onClick={() => navigate('/recipes/full')} className="hidden sm:flex items-center gap-2">
            <span>Gestión Avanzada</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 short:gap-2">
        <Card className="p-4 short:p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-cifp-neutral-900 short:text-2xl">{recipes.length}</p>
          <p className="text-xs text-gray-400">recetas</p>
        </Card>
        <Card className="p-4 short:p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Fáciles</p>
          <p className="text-3xl font-bold text-green-600 short:text-2xl">{easyCount}</p>
          <p className="text-xs text-gray-400">nivel básico</p>
        </Card>
        <Card className="p-4 short:p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avanzadas</p>
          <p className="text-3xl font-bold text-red-600 short:text-2xl">{hardCount}</p>
          <p className="text-xs text-gray-400">nivel alto</p>
        </Card>
      </div>

      {/* ── Search + List ── */}
      <Card className="overflow-hidden short:max-h-[calc(100vh-8rem)]">
        <div className="p-4 border-b border-cifp-neutral-200 flex items-center gap-3">
          <Input
            placeholder="Buscar receta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={Search}
            className="flex-1"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
            <ChefHat className="w-8 h-8" />
            <p className="text-sm">{search ? 'Sin resultados' : 'No hay recetas registradas'}</p>
          </div>
        ) : (
          <div className="divide-y divide-cifp-neutral-100">
            {filtered.map(r => (
              <div
                key={r.id}
                onClick={() => navigate(`/recipes/${r.id}`)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-cifp-neutral-50 cursor-pointer transition-colors short:py-2 short:px-3"
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center short:w-8 short:h-8">
                  <span className="text-orange-700 font-semibold text-sm">
                    {((r.name && String(r.name).charAt(0)) || '?').toString().toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cifp-neutral-900 truncate">{r.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {r.code} • {r.yieldQuantity} {r.yieldUnit}
                  </p>
                </div>

                {/* Notes preview (hidden on mobile) */}
                <div className="hidden sm:block max-w-[200px]">
                  {r.description && (
                    <span className="text-xs text-gray-400 truncate block">{r.description.slice(0, 40)}{r.description.length > 40 ? '...' : ''}</span>
                  )}
                </div>

                {/* Difficulty Badge */}
                <div className="flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    r.difficulty === 'FACIL' ? 'bg-green-100 text-green-800' :
                    r.difficulty === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {r.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-cifp-neutral-50 border-t border-cifp-neutral-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">Mostrando {filtered.length} de {recipes.length}</p>
        </div>
      </Card>
    </div>
  )
}
