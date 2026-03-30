import { useEffect, useMemo, useState } from 'react'
import { Archive, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthProvider'
import apiFetch from '../../services/api'
import showToast from '../../services/toast'
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
  const [reloadKey, setReloadKey] = useState(0)

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
        showToast(err?.body?.message || err.message || 'Error al obtener productos', 'error')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetcher()
    return () => { mounted = false }
  }, [typeFilter, reloadKey])

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
    if (!isAdmin) return showToast('Acción restringida: requiere permisos de administrador', 'error')

    // Open confirmation modal with selected product
    setSelectedForApply({ product, cantidad: '1', motivo: mode === 'merma' ? 'Merma / Baja' : 'Devolución' })
    setShowApplyModal(true)
  }

  // Modal state for apply action
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedForApply, setSelectedForApply] = useState(null)

  const confirmApply = async () => {
    if (!selectedForApply) return
    const { product, cantidad: cantidadRaw, motivo } = selectedForApply
    const cantidad = parseFloat(cantidadRaw)
    if (isNaN(cantidad) || cantidad <= 0) return showToast('Cantidad inválida', 'error')

    try {
      const endpoint = mode === 'merma' ? '/inventory/salida' : '/inventory/entrada'
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ productoId: product.id, cantidad, motivo })
      })
      showToast('Operación registrada correctamente', 'success')
      setShowApplyModal(false)
      setSelectedForApply(null)
      // trigger refresh of products and movements
      setReloadKey(k => k + 1)
    } catch (err) {
      console.error(err)
      showToast(err?.body?.message || err.message || 'Error al registrar movimiento', 'error')
    }
  }

  // Movements list
  const [movements, setMovements] = useState([])
  const [loadingMovements, setLoadingMovements] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchMovements = async () => {
      try {
        setLoadingMovements(true)
        const res = await apiFetch('/inventory?limit=20&page=1')
        if (mounted) setMovements(res.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoadingMovements(false)
      }
    }
    fetchMovements()
    return () => { mounted = false }
  }, [reloadKey])

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
      <div className="mt-4 w-full max-w-4xl mx-auto">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Últimas operaciones</h3>
          {loadingMovements ? (
            <div className="text-xs text-gray-500">Cargando movimientos…</div>
          ) : movements && movements.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
              {movements.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{m.producto?.name || m.productoId}</div>
                    <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()} — {m.motivo || ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{m.tipo === 'ENTRY' ? 'Entrada' : m.tipo === 'EXIT' ? 'Salida' : m.tipo === 'ADJUSTMENT' ? 'Ajuste' : 'Pérdida'}</div>
                    <div className="text-xs text-gray-600">{m.cantidad}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No hay movimientos recientes.</div>
          )}
        </div>
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
      {typeof document !== 'undefined' && showApplyModal && selectedForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowApplyModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 text-lg font-bold text-gray-800">{mode === 'merma' ? 'Merma / Baja' : 'Devolución'}</h2>
            <div className="text-sm text-gray-600 mb-4">Producto: <span className="font-semibold">{selectedForApply.product.nombre || selectedForApply.product.sku}</span></div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Cantidad</label>
                <input type="number" step="0.01" min="0.01" value={selectedForApply.cantidad} onChange={(e) => setSelectedForApply(prev => ({ ...prev, cantidad: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Motivo (opcional)</label>
                <input value={selectedForApply.motivo} onChange={(e) => setSelectedForApply(prev => ({ ...prev, motivo: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowApplyModal(false); setSelectedForApply(null) }} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancelar</button>
              <button type="button" onClick={confirmApply} className="rounded-lg bg-cifp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-cifp-blue-dark">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
