import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronDown, ChevronUp, FileDown, Layers, Pencil, Plus, Search, Trash2, X, CheckSquare, Square } from 'lucide-react'
import { getOrders, consolidateOrders, updateOrder, getProducts } from '../../services/orders.service'
import { StatusBadge, STATUS_LABELS, formatDate, getMonday } from './orderUtils.jsx'

const TABS = [
  { key: 'SUBMITTED', label: 'Pendientes' },
  { key: 'APPROVED', label: 'Por consolidar' },
  { key: 'ORDERED',  label: 'Consolidados' },
  { key: null,       label: 'Todos' },
]

// Statuses that belong under the "Consolidados" tab
const CONSOLIDATED_STATUSES = new Set(['ORDERED', 'MERGED', 'RECEIVED'])

export default function EconomatoView() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('APPROVED')
  const [expandedId, setExpandedId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [showConsolidateModal, setShowConsolidateModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getOrders({ limit: 300 })
      .then(res => setOrders(res?.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = activeTab === 'ORDERED'
    ? orders.filter(o => CONSOLIDATED_STATUSES.has(o.status))
    : activeTab
    ? orders.filter(o => o.status === activeTab)
    : orders
  const approvedOrders = orders.filter(o => o.status === 'APPROVED')

  function toggleSelect(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    const approvedFiltered = filtered.filter(o => o.status === 'APPROVED')
    const allSelected = approvedFiltered.every(o => selectedIds.includes(o.id))
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !approvedFiltered.some(o => o.id === id)))
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...approvedFiltered.map(o => o.id)])])
    }
  }

  function handlePrintConsolidated(order) {
    printConsolidatedOrder(order)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jefatura de Economato</h1>
          <p className="text-sm text-gray-500 mt-1">Consolida pedidos aprobados y genera órdenes de compra</p>
        </div>
        {activeTab === 'APPROVED' && selectedIds.length > 0 && (
          <button
            onClick={() => setShowConsolidateModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Layers size={16} />
            Consolidar {selectedIds.length} pedido{selectedIds.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <X size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key ?? 'all'}
            onClick={() => { setActiveTab(tab.key); setSelectedIds([]) }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.key && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.key === 'ORDERED'
                  ? orders.filter(o => CONSOLIDATED_STATUSES.has(o.status)).length
                  : orders.filter(o => o.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Select all (only relevant in APPROVED tab) */}
      {activeTab === 'APPROVED' && filtered.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {filtered.every(o => selectedIds.includes(o.id))
              ? <CheckSquare size={16} className="text-indigo-600" />
              : <Square size={16} className="text-gray-400" />
            }
            Seleccionar todos
          </button>
          {selectedIds.length > 0 && (
            <span className="text-xs text-indigo-600 font-medium">
              {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Cargando pedidos...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {activeTab === 'SUBMITTED'
            ? 'No hay pedidos pendientes de revisión'
            : activeTab === 'APPROVED'
            ? 'No hay pedidos aprobados pendientes de consolidar'
            : activeTab === 'ORDERED'
            ? 'No hay pedidos consolidados todavía'
            : 'No hay pedidos'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <EconomatoOrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              selectable={order.status === 'APPROVED'}
              selected={selectedIds.includes(order.id)}
              onSelect={() => toggleSelect(order.id)}
              onPrint={() => handlePrintConsolidated(order)}
              onEdit={() => setEditingOrder(order)}
            />
          ))}
        </div>
      )}

      {showConsolidateModal && (
        <ConsolidateModal
          selectedOrders={orders.filter(o => selectedIds.includes(o.id))}
          onClose={() => setShowConsolidateModal(false)}
          onConsolidated={(consolidated) => {
            setShowConsolidateModal(false)
            setSelectedIds([])
            setSuccessMsg('Pedido consolidado creado correctamente')
            setTimeout(() => setSuccessMsg(null), 4000)
            load()
            // Immediately offer PDF download
            printConsolidatedOrder(consolidated)
          }}
        />
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={(updated) => {
            setEditingOrder(null)
            setSuccessMsg('Pedido actualizado correctamente')
            setTimeout(() => setSuccessMsg(null), 4000)
            load()
          }}
        />
      )}
    </div>
  )
}

function EconomatoOrderCard({ order, expanded, onToggle, selectable, selected, onSelect, onPrint, onEdit }) {
  const itemCount = order.items?.length ?? 0
  const isConsolidated = order.status === 'ORDERED'
  const creator = order.creator
  const creatorName = creator ? `${creator.nombre} ${creator.apellido1}` : '—'

  return (
    <div className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow ${
      selected ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'
    }`}>
      <div className="flex items-center gap-3 px-5 py-4">
        {selectable && (
          <button onClick={onSelect} className="shrink-0">
            {selected
              ? <CheckSquare size={18} className="text-indigo-600" />
              : <Square size={18} className="text-gray-400 hover:text-gray-600" />
            }
          </button>
        )}

        <div
          className="flex-1 min-w-0 cursor-pointer select-none"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={order.status} />
            {isConsolidated && (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Pedido consolidado
              </span>
            )}
            <span className="text-sm font-medium text-gray-900">
              Semana {formatDate(order.weekStart)}
            </span>
            {!isConsolidated && (
              <span className="text-xs text-gray-500">por {creatorName}</span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-gray-400">{itemCount} producto{itemCount !== 1 ? 's' : ''}</span>
            <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            title="Editar pedido"
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            <Pencil size={13} />
            Editar
          </button>
          {isConsolidated && (
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <FileDown size={13} />
              PDF
            </button>
          )}
          <button onClick={onToggle}>
            {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 rounded-b-xl">
          {order.items && order.items.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-200">
                  <th className="text-left pb-2 font-medium">Producto</th>
                  <th className="text-right pb-2 font-medium">Cant. solicitada</th>
                  {order.status !== 'APPROVED' && (
                    <th className="text-right pb-2 font-medium">Cant. aprobada</th>
                  )}
                  <th className="text-left pb-2 font-medium pl-4">Notas</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 font-medium text-gray-800">
                      {item.product?.name ?? item.productId}
                      <span className="ml-2 text-xs text-gray-400">{item.product?.unitType}</span>
                    </td>
                    <td className="py-2 text-right text-gray-700">{Number(item.qtyRequested).toFixed(3)}</td>
                    {order.status !== 'APPROVED' && (
                      <td className="py-2 text-right text-gray-700">
                        {item.qtyApproved != null ? Number(item.qtyApproved).toFixed(3) : '—'}
                      </td>
                    )}
                    <td className="py-2 pl-4 text-gray-500 text-xs">{item.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin productos</p>
          )}
        </div>
      )}
    </div>
  )
}

function ConsolidateModal({ selectedOrders, onClose, onConsolidated }) {
  const [weekStart, setWeekStart] = useState(getMonday())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Aggregate items preview
  const aggregated = aggregateItems(selectedOrders)

  async function handleConsolidate() {
    if (!weekStart) { setSaveError('Selecciona la semana'); return }
    setSaving(true)
    setSaveError(null)
    try {
      const result = await consolidateOrders({
        orderIds: selectedOrders.map(o => o.id),
        weekStart,
      })
      onConsolidated(result)
    } catch (e) {
      setSaveError(e.body?.message ?? 'Error al consolidar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Consolidar pedidos</h2>
            <p className="text-sm text-gray-500">{selectedOrders.length} pedido{selectedOrders.length !== 1 ? 's' : ''} seleccionado{selectedOrders.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {saveError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semana del pedido consolidado <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={weekStart}
              onChange={e => setWeekStart(getMonday(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Resumen consolidado ({aggregated.length} productos únicos)
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-600">Producto</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-600">Total solicitado</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-600">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregated.map((item, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-2.5 text-right text-indigo-700 font-semibold">{item.qty.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{item.unitType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
            <strong>Nota:</strong> Los {selectedOrders.length} pedidos seleccionados pasarán a estado "Consolidado"
            y se creará un nuevo pedido unificado listo para enviar al proveedor.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConsolidate}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Layers size={16} />
            {saving ? 'Consolidando...' : 'Confirmar y consolidar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditOrderModal({ order, onClose, onSaved }) {
  const [status, setStatus] = useState(order.status)
  const [weekStart, setWeekStart] = useState(order.weekStart)
  const [items, setItems] = useState(
    (order.items ?? []).map(it => ({
      productId: it.productId,
      productName: it.product?.name ?? it.productId,
      unitType: it.product?.unitType ?? '',
      qtyRequested: Number(it.qtyRequested),
      qtyApproved: it.qtyApproved != null ? Number(it.qtyApproved) : '',
      notes: it.notes ?? '',
    }))
  )
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState([])
  const [searching, setSearching] = useState(false)
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const allProductsRef = useRef(null)

  useEffect(() => {
    if (!showProductSearch) return
    if (allProductsRef.current) {
      const q = productSearch.toLowerCase()
      setProducts(q ? allProductsRef.current.filter(p => p.name.toLowerCase().includes(q)) : allProductsRef.current.slice(0, 30))
      return
    }
    setSearching(true)
    getProducts({ limit: 500 })
      .then(res => {
        const all = res?.data ?? []
        allProductsRef.current = all
        const q = productSearch.toLowerCase()
        setProducts(q ? all.filter(p => p.name.toLowerCase().includes(q)) : all.slice(0, 30))
      })
      .catch(() => setProducts([]))
      .finally(() => setSearching(false))
  }, [productSearch, showProductSearch])

  function addProduct(p) {
    if (items.some(i => i.productId === p.id)) return
    setItems(prev => [...prev, {
      productId: p.id,
      productName: p.name,
      unitType: p.unitType ?? '',
      qtyRequested: 1,
      qtyApproved: '',
      notes: '',
    }])
    setProductSearch('')
    setProducts([])
    setShowProductSearch(false)
  }

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it))
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    if (!weekStart) { setSaveError('Selecciona la semana del pedido'); return }
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateOrder(order.id, {
        status,
        weekStart,
        items: items.map(it => ({
          productId: it.productId,
          qtyRequested: Number(it.qtyRequested),
          ...(it.qtyApproved !== '' && it.qtyApproved != null ? { qtyApproved: Number(it.qtyApproved) } : {}),
          ...(it.notes ? { notes: it.notes } : {}),
        })),
      })
      onSaved(updated)
    } catch (e) {
      setSaveError(e.body?.message ?? e.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const creatorName = order.creator ? `${order.creator.nombre} ${order.creator.apellido1}` : '—'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Editar pedido</h2>
            <p className="text-xs text-gray-400 mt-0.5">por {creatorName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['DRAFT','SUBMITTED','APPROVED','MERGED','ORDERED','RECEIVED','CANCELLED'].map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semana del pedido</label>
              <input
                type="date"
                value={weekStart}
                onChange={e => setWeekStart(getMonday(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Productos ({items.length})</label>
              <button
                onClick={() => setShowProductSearch(v => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Plus size={14} />
                Añadir producto
              </button>
            </div>

            {showProductSearch && (
              <div className="mb-3 relative">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Buscar ingrediente o material..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {(products.length > 0 || searching) && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searching ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Cargando productos...</div>
                    ) : (
                      products.map(p => (
                        <button
                          key={p.id}
                          onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-800">{p.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{p.unitType} · {p.productType === 'INGREDIENT' ? 'Ingrediente' : 'Material'}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-center text-sm text-gray-400">
                Sin productos — usa el botón de arriba para añadir
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.productId} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.unitType}</p>
                      </div>
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Cant. solicitada</label>
                        <input
                          type="number" min="0.001" step="0.001"
                          value={item.qtyRequested}
                          onChange={e => updateItem(idx, 'qtyRequested', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Cant. aprobada</label>
                        <input
                          type="number" min="0" step="0.001"
                          value={item.qtyApproved}
                          onChange={e => updateItem(idx, 'qtyApproved', e.target.value)}
                          placeholder="—"
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Notas</label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={e => updateItem(idx, 'notes', e.target.value)}
                          placeholder="Opcional"
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function aggregateItems(orders) {
  const map = new Map()
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const id = item.productId
      const existing = map.get(id)
      if (existing) {
        existing.qty += Number(item.qtyRequested)
      } else {
        map.set(id, {
          name: item.product?.name ?? id,
          unitType: item.product?.unitType ?? '',
          qty: Number(item.qtyRequested),
        })
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function printConsolidatedOrder(order) {
  const items = (order.items ?? []).sort((a, b) =>
    (a.product?.name ?? '').localeCompare(b.product?.name ?? '')
  )

  const rows = items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:500">${item.product?.name ?? item.productId}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${item.product?.unitType ?? '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#4f46e5">${Number(item.qtyRequested).toFixed(3)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280">${item.notes ?? ''}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Pedido Consolidado – Semana ${order.weekStart}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
    h1 { font-size: 20px; color: #1e293b; margin-bottom: 4px; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #e2e8f0; }
    thead th:last-child { text-align: left; }
    tfoot td { padding: 10px 12px; font-weight: bold; background: #f8fafc; border-top: 2px solid #e2e8f0; font-size: 12px; color: #475569; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Pedido de Compra – I.E. Lovelace</h1>
  <p class="meta">
    Semana: <strong>${formatDate(order.weekStart)}</strong> &nbsp;|&nbsp;
    Generado: <strong>${new Date().toLocaleDateString('es-ES')}</strong> &nbsp;|&nbsp;
    Productos: <strong>${items.length}</strong>
  </p>
  <table>
    <thead>
      <tr>
        <th style="width:40%">Producto</th>
        <th style="width:10%;text-align:center">Unidad</th>
        <th style="width:15%;text-align:right">Cantidad</th>
        <th style="width:35%">Observaciones</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="2">Total de líneas</td>
        <td style="text-align:right">${items.length}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=800,height=700')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
