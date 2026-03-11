import { useEffect, useMemo, useState } from 'react'
import { Archive, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthProvider'
import apiFetch from '../../services/api'
import { getAllProducts, getIngredients, getMaterials, getCategories } from '../../services/products.service'

export default function ReturnsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  useEffect(() => {
    console.debug('[ReturnsPage] mount user=', user)
  }, [])

  const [mode, setMode] = useState('merma') // 'merma' | 'devolucion'
  const [typeFilter, setTypeFilter] = useState('ALL') // ALL | INGREDIENT | MATERIAL
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch products based on typeFilter
  useEffect(() => {
    let mounted = true
    setLoading(true)
    const fetcher = async () => {
      try {
        let items = []
        if (typeFilter === 'INGREDIENT') items = await getIngredients()
        else if (typeFilter === 'MATERIAL') items = await getMaterials()
        else items = await getAllProducts()

        if (mounted) setProducts(items)
      } catch (err) {
        console.error(err)
        alert(err?.body?.message || err.message || 'Error al obtener productos')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetcher()
    return () => { mounted = false }
  }, [typeFilter])

  const categories = useMemo(() => getCategories(products), [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (category && p.categoria !== category) return false
      if (!query) return true
      const q = query.toLowerCase()
      return (p.nombre || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
    })
  }, [products, category, query])

  const handleApply = async (product) => {
    if (!isAdmin) return alert('Acción restringida: requiere permisos de administrador')

    const cantidadRaw = window.prompt('Cantidad a aplicar (número):', '1')
    if (!cantidadRaw) return
    const cantidad = parseFloat(cantidadRaw)
    if (isNaN(cantidad) || cantidad <= 0) return alert('Cantidad inválida')

    const motivo = window.prompt('Motivo (opcional):', mode === 'merma' ? 'Merma / Baja' : 'Devolución') || ''

    try {
      const endpoint = mode === 'merma' ? '/inventory/salida' : '/inventory/entrada'
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ productoId: product.id, cantidad, motivo })
      })
      alert('Operación registrada correctamente')
      // refresh products if needed
      // re-fetch by toggling typeFilter (simple approach)
      setTypeFilter(prev => prev)
    } catch (err) {
      console.error(err)
      alert(err?.body?.message || err.message || 'Error al registrar movimiento')
    }
  }

  return (
    <div className="h-full w-full max-w-4xl mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cifp-blue hover:text-cifp-blue-dark transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-medium">Volver atrás</span>
        </button>

        <h1 className="text-lg md:text-xl font-bold text-gray-800 uppercase truncate">Bajas y Devoluciones</h1>

        <div className="w-24" />
      </div>

      <div className="bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4 flex-grow overflow-auto">
        <div className="flex items-center gap-4 justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold">
            <Archive className="w-5 h-5" />
            BAJAS Y DEVOLUCIONES
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setMode('merma')} className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${mode === 'merma' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'}`}>Merma / Baja</button>
          <button onClick={() => setMode('devolucion')} className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${mode === 'devolucion' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>Devolución</button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Tipo</label>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCategory('') }} className="w-full px-2 py-1.5 rounded-lg border text-sm">
              <option value="ALL">Todos</option>
              <option value="INGREDIENT">Ingredientes</option>
              <option value="MATERIAL">Materiales</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border text-sm">
              <option value="">Todas</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Buscar</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre o SKU" className="w-full px-3 py-1.5 rounded-lg border text-sm" />
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">Selecciona un producto y aplica la acción seleccionada.</div>

        <div className="mt-2">
          {loading ? (
            <div className="text-gray-500 text-sm animate-pulse">Cargando productos…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(p => (
                <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border rounded-lg bg-white">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{p.nombre || p.sku}</div>
                    <div className="text-xs text-gray-500 truncate">{p.sku} — {p.categoria}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <span className="text-sm text-gray-700 whitespace-nowrap">Stock: {p.stock ?? '-'}</span>
                    <button onClick={() => handleApply(p)} className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold whitespace-nowrap ml-auto">
                      {mode === 'merma' ? 'Merma' : 'Devolución'}
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-center text-gray-500">No se han encontrado productos.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
