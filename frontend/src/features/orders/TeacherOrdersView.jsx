import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, ChevronDown, ChevronUp, CheckCircle, XCircle, Pencil, Send, Trash2, X } from 'lucide-react'
import { getOrders, createOrder, submitOrder, cancelOrder, approveOrder, rejectOrder, updateOrder, getProducts } from '../../services/orders.service'
import { StatusBadge, STATUS_LABELS, getMonday, formatDate } from './orderUtils.jsx'
import { useAuth } from '../../contexts/AuthProvider'

const TABS = [
  { key: 'mine',      label: 'Mis pedidos',   title: 'Pedidos que tú has creado como profesor' },
  { key: 'SUBMITTED', label: 'Para revisar',  title: 'Pedidos enviados por alumnos pendientes de tu aprobación' },
  { key: 'APPROVED',  label: 'Aprobados',     title: 'Pedidos que ya has aprobado, pendientes de consolidar' },
  { key: null,        label: 'Todos',         title: 'Todos los pedidos del sistema, sin filtro de estado' },
]

export default function TeacherOrdersView() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('SUBMITTED')
  const [expandedId, setExpandedId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getOrders({ limit: 200 })
      .then(res => setOrders(res?.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = activeTab === 'mine'
    ? orders.filter(o => o.createdBy === user?.id)
    : activeTab
    ? orders.filter(o => o.status === activeTab)
    : orders

  function badgeCount(tabKey) {
    if (tabKey === 'mine') return orders.filter(o => o.createdBy === user?.id).length
    return orders.filter(o => o.status === tabKey).length
  }

  async function handleApprove(orderId) {
    setActionLoading(orderId)
    setError(null)
    try {
      await approveOrder(orderId)
      setSuccessMsg('Pedido aprobado correctamente')
      load()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (e) {
      setError(e.body?.message ?? 'Error al aprobar el pedido')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(orderId) {
    if (!window.confirm('¿Rechazar este pedido? Se marcará como cancelado.')) return
    setActionLoading(orderId)
    setError(null)
    try {
      await rejectOrder(orderId)
      setSuccessMsg('Pedido rechazado')
      load()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (e) {
      setError(e.body?.message ?? 'Error al rechazar el pedido')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSubmitOwn(orderId) {
    setActionLoading(orderId)
    setError(null)
    try {
      await submitOrder(orderId)
      setSuccessMsg('Solicitud enviada correctamente')
      load()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (e) {
      setError(e.body?.message ?? 'Error al enviar la solicitud')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancelOwn(orderId) {
    if (!window.confirm('¿Cancelar este pedido?')) return
    setActionLoading(orderId)
    try {
      await cancelOrder(orderId)
      setSuccessMsg('Pedido cancelado')
      load()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (e) {
      setError(e.body?.message ?? 'Error al cancelar')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Revisa solicitudes de alumnos y crea tus propios pedidos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nueva solicitud
        </button>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <X size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.key ?? 'all'}
            onClick={() => setActiveTab(tab.key)}
            title={tab.title}
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
          {activeTab === 'mine'
            ? <span>No has creado ningún pedido aún.{' '}
                <button className="text-blue-600 underline" onClick={() => setShowCreateModal(true)}>
                  Crear uno ahora
                </button>
              </span>
            : activeTab === 'SUBMITTED'
            ? 'No hay pedidos pendientes de revisión'
            : 'No hay pedidos en esta categoría'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <TeacherOrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              onApprove={() => handleApprove(order.id)}
              onReject={() => handleReject(order.id)}
              onSubmit={() => handleSubmitOwn(order.id)}
              onCancel={() => handleCancelOwn(order.id)}
              onEdit={() => setEditingOrder(order)}
              actionLoading={actionLoading === order.id}
              isOwn={order.createdBy === user?.id}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            setSuccessMsg('Solicitud guardada como borrador')
            setTimeout(() => setSuccessMsg(null), 3000)
            setActiveTab('mine')
            load()
          }}
        />
      )}

      {editingOrder && (
        <TeacherEditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={() => {
            setEditingOrder(null)
            setSuccessMsg('Pedido actualizado correctamente')
            setTimeout(() => setSuccessMsg(null), 3000)
            load()
          }}
          onApproved={() => {
            setEditingOrder(null)
            setSuccessMsg('Pedido actualizado y aprobado')
            setTimeout(() => setSuccessMsg(null), 3000)
            load()
          }}
        />
      )}
    </div>
  )
}

function TeacherOrderCard({ order, expanded, onToggle, onApprove, onReject, onSubmit, onCancel, onEdit, actionLoading, isOwn }) {
  const isPending = order.status === 'SUBMITTED'
  const isDraft = order.status === 'DRAFT'
  const itemCount = order.items?.length ?? 0
  const creator = order.creator
  const creatorName = creator ? `${creator.nombre} ${creator.apellido1}` : 'Desconocido'

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 min-w-0 cursor-pointer select-none" onClick={onToggle}>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={order.status} />
            <span className="text-sm font-semibold text-gray-900">{creatorName}</span>
            {isOwn && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium" title="Este pedido lo creaste tú">Mío</span>
            )}
            <span className="text-sm text-gray-500">· Semana {formatDate(order.weekStart)}</span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-gray-400">{itemCount} producto{itemCount !== 1 ? 's' : ''}</span>
            <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {(isPending || isDraft) && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <Pencil size={13} />
              Editar
            </button>
          )}
          {isDraft && isOwn && (
            <button
              onClick={onSubmit}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={13} />
              {actionLoading ? '...' : 'Enviar'}
            </button>
          )}
          {isPending && (
            <>
              <button
                onClick={onApprove}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle size={13} />
                {actionLoading ? '...' : 'Aprobar'}
              </button>
              <button
                onClick={onReject}
                disabled={actionLoading}
                title="Rechaza el pedido y lo marca como cancelado. Esta acción es irreversible."
                className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircle size={13} />
                Rechazar
              </button>
            </>
          )}
          {isDraft && isOwn && (
            <button
              onClick={onCancel}
              disabled={actionLoading}
              title="Cancelar pedido"
              className="inline-flex items-center bg-white border border-gray-200 text-gray-400 p-1.5 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <X size={14} />
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
                  <th className="text-right pb-2 font-medium" title="Cantidad que pidió el alumno">Cant. solicitada</th>
                  <th className="text-right pb-2 font-medium" title="Cantidad aprobada por el profesor; puede ser menor a la solicitada">Cant. aprobada</th>
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
            <p className="text-sm text-gray-400 italic">Sin productos</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Create Order Modal ────────────────────────────────────────────────────────

function CreateOrderModal({ onClose, onCreated }) {
  const [weekStart, setWeekStart] = useState(getMonday())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([])
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
    setItems(prev => [...prev, { productId: p.id, productName: p.name, unitType: p.unitType ?? '', stock: p.stock ?? 0, stockMinimo: p.stockMinimo ?? 0, qtyRequested: 1, notes: '' }])
    setProductSearch('')
    setProducts([])
    setShowProductSearch(false)
  }

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it))
  }

  async function handleSave() {
    if (!weekStart) { setSaveError('Selecciona la semana del pedido'); return }
    setSaving(true)
    setSaveError(null)
    try {
      await createOrder({
        weekStart,
        notes: notes || undefined,
        items: items.map(it => ({ productId: it.productId, qtyRequested: Number(it.qtyRequested), notes: it.notes || undefined })),
      })
      onCreated()
    } catch (e) {
      setSaveError(e.body?.message ?? e.message ?? 'Error al crear el pedido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nueva solicitud de pedido</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {saveError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{saveError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semana <span className="text-red-500">*</span></label>
            <input
              type="date" value={weekStart}
              onChange={e => setWeekStart(getMonday(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Se ajusta automáticamente al lunes de esa semana</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Observaciones del pedido..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Productos</label>
              <button onClick={() => setShowProductSearch(v => !v)} className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                <Plus size={14} /> Añadir producto
              </button>
            </div>
            {showProductSearch && (
              <div className="mb-3 relative">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input autoFocus type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    placeholder="Buscar ingrediente o material..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(products.length > 0 || searching) && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searching ? <div className="px-4 py-3 text-sm text-gray-400">Cargando...</div>
                      : products.map(p => (
                        <button key={p.id} onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between">
                          <span className="font-medium text-gray-800">{p.name}</span>
                          <span className="text-xs text-gray-400 ml-2 flex items-center gap-2">
                            {p.unitType} · {p.productType === 'INGREDIENT' ? 'Ingrediente' : 'Material'}
                            <span className={`font-semibold ${(p.stock ?? 0) <= (p.stockMinimo ?? 0) ? 'text-red-500' : 'text-emerald-600'}`}>Stock: {p.stock ?? 0}</span>
                          </span>
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
            {items.length === 0
              ? <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 text-center text-sm text-gray-400">Añade los productos que necesitas</div>
              : <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.productId} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.unitType} · <span className={item.stock <= item.stockMinimo ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'}>Stock: {item.stock}</span></p>
                      </div>
                      <input type="number" min="0.001" step="0.001" value={item.qtyRequested}
                        onChange={e => updateItem(idx, 'qtyRequested', e.target.value)}
                        className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input type="text" value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)}
                        placeholder="Notas" className="w-32 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            title="Guarda el pedido como borrador; podrás enviarlo después"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Teacher Edit / Review Modal ───────────────────────────────────────────────

function TeacherEditModal({ order, onClose, onSaved, onApproved }) {
  const isSubmitted = order.status === 'SUBMITTED'
  const [weekStart, setWeekStart] = useState(order.weekStart)
  const [items, setItems] = useState(
    (order.items ?? []).map(it => ({
      productId: it.productId,
      productName: it.product?.name ?? it.productId,
      unitType: it.product?.unitType ?? '',
      stock: it.product?.stock ?? 0,
      stockMinimo: it.product?.stockMinimo ?? 0,
      qtyRequested: Number(it.qtyRequested),
      qtyApproved: it.qtyApproved != null ? Number(it.qtyApproved) : Number(it.qtyRequested),
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
    setItems(prev => [...prev, { productId: p.id, productName: p.name, unitType: p.unitType ?? '', stock: p.stock ?? 0, stockMinimo: p.stockMinimo ?? 0, qtyRequested: 1, qtyApproved: 1, notes: '' }])
    setProductSearch('')
    setProducts([])
    setShowProductSearch(false)
  }

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it))
  }

  async function handleSave(andApprove = false) {
    if (!weekStart) { setSaveError('Selecciona la semana'); return }
    setSaving(true)
    setSaveError(null)
    try {
      await updateOrder(order.id, {
        weekStart,
        items: items.map(it => ({
          productId: it.productId,
          qtyRequested: Number(it.qtyRequested),
          ...(it.qtyApproved !== '' && it.qtyApproved != null ? { qtyApproved: Number(it.qtyApproved) } : {}),
          ...(it.notes ? { notes: it.notes } : {}),
        })),
      })
      if (andApprove) {
        await approveOrder(order.id)
        onApproved()
      } else {
        onSaved()
      }
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
            <h2 className="text-lg font-semibold text-gray-900">
              {isSubmitted ? 'Revisar y ajustar pedido' : 'Editar pedido'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">por {creatorName} · {formatDate(order.weekStart)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {saveError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{saveError}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semana del pedido</label>
            <input type="date" value={weekStart} onChange={e => setWeekStart(getMonday(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Productos ({items.length})</label>
              <button onClick={() => setShowProductSearch(v => !v)} className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                <Plus size={14} /> Añadir
              </button>
            </div>

            {showProductSearch && (
              <div className="mb-3 relative">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input autoFocus type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(products.length > 0 || searching) && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searching ? <div className="px-4 py-3 text-sm text-gray-400">Cargando...</div>
                      : products.map(p => (
                        <button key={p.id} onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between">
                          <span className="font-medium text-gray-800">{p.name}</span>
                          <span className="text-xs text-gray-400 ml-2 flex items-center gap-2">
                            {p.unitType}
                            <span className={`font-semibold ${(p.stock ?? 0) <= (p.stockMinimo ?? 0) ? 'text-red-500' : 'text-emerald-600'}`}>Stock: {p.stock ?? 0}</span>
                          </span>
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            )}

            {isSubmitted && items.length > 0 && (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-2">
                Ajusta las <strong>cantidades aprobadas</strong> antes de aprobar el pedido (por defecto iguales a las solicitadas).
              </p>
            )}

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.productId} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.unitType} · <span className={item.stock <= item.stockMinimo ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'}>Stock: {item.stock ?? '—'}</span></p>
                    </div>
                    <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className={`grid gap-2 ${isSubmitted ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Solicitada</label>
                      <input type="number" min="0.001" step="0.001" value={item.qtyRequested}
                        onChange={e => updateItem(idx, 'qtyRequested', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    {isSubmitted && (
                      <div>
                        <label className="block text-xs text-blue-600 mb-1 font-medium" title="Puedes reducir la cantidad si el stock es limitado">Aprobada ✓</label>
                        <input type="number" min="0" step="0.001" value={item.qtyApproved}
                          onChange={e => updateItem(idx, 'qtyApproved', e.target.value)}
                          className="w-full border border-blue-300 bg-blue-50 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Notas</label>
                      <input type="text" value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)}
                        placeholder="Opcional"
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
          <button onClick={() => handleSave(false)} disabled={saving}
            title="Guarda los cambios sin cambiar el estado del pedido"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {saving ? '...' : 'Solo guardar'}
          </button>
          {isSubmitted && (
            <button onClick={() => handleSave(true)} disabled={saving}
              title="Guarda los ajustes y aprueba el pedido en un solo paso"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              <CheckCircle size={16} />
              {saving ? 'Guardando...' : 'Guardar y aprobar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
