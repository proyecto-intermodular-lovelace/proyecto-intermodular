import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, ChevronDown, ChevronUp, Send, X, Search, Trash2 } from 'lucide-react'
import { getOrders, createOrder, submitOrder, cancelOrder, getProducts } from '../../services/orders.service'
import { StatusBadge, getMonday, formatDate } from './orderUtils.jsx'

const TABS = [
  { key: 'DRAFT',     label: 'Borradores' },
  { key: 'SUBMITTED', label: 'Enviados' },
  { key: 'APPROVED',  label: 'Aprobados' },
  { key: 'CANCELLED', label: 'Cancelados' },
  { key: null,        label: 'Todos' },
]

export default function StudentOrdersView() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('DRAFT')
  const [expandedId, setExpandedId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null) // orderId or 'create'
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getOrders({ limit: 100 })
      .then(res => setOrders(res?.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = activeTab
    ? orders.filter(o => o.status === activeTab)
    : orders

  function badgeCount(tabKey) {
    return orders.filter(o => o.status === tabKey).length
  }

  async function handleSubmit(orderId) {
    setActionLoading(orderId)
    setError(null)
    try {
      await submitOrder(orderId)
      load()
    } catch (e) {
      setError(e.body?.message ?? 'Error al enviar el pedido')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancel(orderId) {
    if (!window.confirm('¿Cancelar este borrador?')) return
    setActionLoading(orderId)
    setError(null)
    try {
      await cancelOrder(orderId)
      load()
    } catch (e) {
      setError(e.body?.message ?? 'Error al cancelar')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Solicita materiales e ingredientes para tus prácticas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nueva solicitud
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <X size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.key ?? 'all'}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.key !== null && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {badgeCount(tab.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Cargando pedidos...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {activeTab === 'DRAFT'
            ? <span>No tienes borradores.{' '}
                <button className="text-blue-600 underline" onClick={() => setShowCreateModal(true)}>
                  Crear uno ahora
                </button>
              </span>
            : activeTab
            ? 'No hay pedidos en esta categoría'
            : 'No tienes pedidos todavía'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              onSubmit={() => handleSubmit(order.id)}
              onCancel={() => handleCancel(order.id)}
              actionLoading={actionLoading === order.id}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); load() }}
        />
      )}
    </div>
  )
}

function OrderCard({ order, expanded, onToggle, onSubmit, onCancel, actionLoading }) {
  const isDraft = order.status === 'DRAFT'
  const itemCount = order.items?.length ?? 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={order.status} />
            <span className="text-sm font-medium text-gray-900">
              Semana del {formatDate(order.weekStart)}
            </span>
            <span className="text-xs text-gray-500">{itemCount} producto{itemCount !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {isDraft && (
            <>
              <button
                onClick={onSubmit}
                disabled={actionLoading || itemCount === 0}
                title={itemCount === 0 ? 'Añade productos antes de enviar' : 'Enviar al profesor'}
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={13} />
                {actionLoading ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                onClick={onCancel}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={13} />
                Cancelar
              </button>
            </>
          )}
          {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
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
                  <th className="text-right pb-2 font-medium">Cant. aprobada</th>
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
                    <td className="py-2 text-right text-gray-700">{Number(item.qtyRequested).toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-700">
                      {item.qtyApproved != null ? Number(item.qtyApproved).toFixed(2) : '—'}
                    </td>
                    <td className="py-2 pl-4 text-gray-500 text-xs">{item.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin productos añadidos</p>
          )}
        </div>
      )}
    </div>
  )
}

function CreateOrderModal({ onClose, onCreated }) {
  const [weekStart, setWeekStart] = useState(getMonday())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([]) // { productId, productName, unitType, qtyRequested, notes }
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showProductSearch, setShowProductSearch] = useState(false)
  const allProductsRef = useRef(null)

  useEffect(() => {
    if (!showProductSearch) return
    if (allProductsRef.current) {
      // already loaded — just filter
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
      unitType: p.unitType ?? p.unit_type ?? '',
      qtyRequested: 1,
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
      await createOrder({
        weekStart,
        notes: notes || undefined,
        items: items.map(it => ({
          productId: it.productId,
          qtyRequested: Number(it.qtyRequested),
          notes: it.notes || undefined,
        })),
      })
      onCreated()
    } catch (e) {
      setSaveError(e.body?.message ?? 'Error al crear el pedido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nueva solicitud de pedido</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {saveError}
            </div>
          )}

          {/* Week selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semana del pedido <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={weekStart}
              onChange={e => setWeekStart(getMonday(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">La fecha se ajusta automáticamente al lunes de esa semana</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas del pedido</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej: Para la práctica del martes de repostería..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Product search & items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Productos</label>
              <button
                onClick={() => setShowProductSearch(v => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
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
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(products.length > 0 || searching) && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searching ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Buscando...</div>
                    ) : (
                      products.map(p => (
                        <button
                          key={p.id}
                          onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-800">{p.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{p.unitType ?? p.unit_type} · {p.productType === 'INGREDIENT' ? 'Ingrediente' : 'Material'}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 text-center text-sm text-gray-400">
                Añade los productos que necesitas para esta práctica
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.productId} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.unitType}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={item.qtyRequested}
                        onChange={e => updateItem(idx, 'qtyRequested', e.target.value)}
                        className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={item.notes}
                        onChange={e => updateItem(idx, 'notes', e.target.value)}
                        placeholder="Notas..."
                        className="w-32 border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
        </div>
      </div>
    </div>
  )
}
