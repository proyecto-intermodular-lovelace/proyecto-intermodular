import { useState, useEffect, useMemo } from 'react'
import { Repeat, Plus, Trash2, ChevronDown, ChevronRight, Search, Package, X } from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import apiFetch from '../../services/api'

const fmt = d => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const fmtTime = d => d ? new Date(d).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default function DeliveryNotesPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin

  const [notes, setNotes] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    loadNotes()
    apiFetch('/suppliers?limit=500').then(r => setSuppliers(Array.isArray(r) ? r : r?.data || [])).catch(() => {})
    apiFetch('/products?limit=1000').then(r => setProducts(Array.isArray(r) ? r : r?.data || [])).catch(() => {})
  }, [])

  async function loadNotes() {
    setLoading(true)
    try {
      const res = await apiFetch('/delivery-notes?limit=200')
      setNotes(Array.isArray(res) ? res : res?.data || [])
    } catch { setNotes([]) }
    finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    if (!search) return notes
    const q = search.toLowerCase()
    return notes.filter(n =>
      [n.code, n.supplier?.nombre, n.id].some(v => (v || '').toLowerCase().includes(q))
    )
  }, [notes, search])

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este albarán? Se borrarán también sus líneas.')) return
    try {
      await apiFetch(`/delivery-notes/${id}`, { method: 'DELETE' })
      setNotes(prev => prev.filter(n => n.id !== id))
      if (expanded === id) setExpanded(null)
    } catch (err) {
      alert(err.message || 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6 short:space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Repeat className="h-8 w-8 text-red-600 short:h-6 short:w-6" />
          <h1 className="text-3xl font-bold text-cifp-neutral-900 short:text-xl">Albaranes</h1>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nuevo albarán</span>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 short:gap-2">
        <Card className="p-4 short:p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-cifp-neutral-900 short:text-2xl">{notes.length}</p>
          <p className="text-xs text-gray-400">albaranes registrados</p>
        </Card>
        <Card className="p-4 short:p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Proveedores</p>
          <p className="text-3xl font-bold text-indigo-600 short:text-2xl">
            {new Set(notes.map(n => n.supplierId)).size}
          </p>
          <p className="text-xs text-gray-400">distintos</p>
        </Card>
        <Card className="p-4 short:p-3 hidden sm:block">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Líneas</p>
          <p className="text-3xl font-bold text-green-600 short:text-2xl">
            {notes.reduce((s, n) => s + (n.items?.length || 0), 0)}
          </p>
          <p className="text-xs text-gray-400">productos recibidos</p>
        </Card>
      </div>

      {/* Search + list */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-cifp-neutral-200 flex items-center gap-3">
          <Input placeholder="Buscar por código o proveedor…" value={search} onChange={e => setSearch(e.target.value)} icon={Search} className="flex-1" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
            <Repeat className="w-8 h-8" />
            <p className="text-sm">{search ? 'Sin resultados' : 'No hay albaranes registrados'}</p>
          </div>
        ) : (
          <div className="divide-y divide-cifp-neutral-100">
            {filtered.map(note => {
              const open = expanded === note.id
              return (
                <div key={note.id}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(open ? null : note.id)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-cifp-neutral-50 cursor-pointer transition-colors short:py-2 short:px-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center short:w-8 short:h-8">
                      {open ? <ChevronDown className="w-5 h-5 text-red-600" /> : <ChevronRight className="w-5 h-5 text-red-600" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cifp-neutral-900 truncate">
                        {note.code || <span className="text-gray-400 italic">Sin código</span>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {note.supplier?.nombre || note.supplierId?.slice(0, 8)}
                      </p>
                    </div>

                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-gray-500">{fmtTime(note.receivedAt)}</p>
                      <p className="text-xs text-gray-400">{note.items?.length || 0} líneas</p>
                    </div>

                    {isSuperAdmin && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(note.id) }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {open && (
                    <div className="bg-gray-50 px-5 py-4 border-t border-cifp-neutral-100 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-gray-500 text-xs block">Código</span>{note.code || '—'}</div>
                        <div><span className="text-gray-500 text-xs block">Proveedor</span>{note.supplier?.nombre || '—'}</div>
                        <div><span className="text-gray-500 text-xs block">Recibido</span>{fmtTime(note.receivedAt)}</div>
                        <div><span className="text-gray-500 text-xs block">Registrado</span>{fmt(note.createdAt)}</div>
                      </div>

                      {note.items?.length > 0 && (
                        <div className="border rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                              <tr>
                                <th className="px-4 py-2 text-left">Producto</th>
                                <th className="px-4 py-2 text-right">Cantidad</th>
                                <th className="px-4 py-2 text-right">Precio ud.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {note.items.map(item => (
                                <tr key={item.id}>
                                  <td className="px-4 py-2">{item.productId?.slice(0, 8)}…</td>
                                  <td className="px-4 py-2 text-right font-mono">{Number(item.qtyReceived)}</td>
                                  <td className="px-4 py-2 text-right font-mono">{item.unitPrice != null ? `${Number(item.unitPrice).toFixed(2)} €` : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="px-5 py-3 bg-cifp-neutral-50 border-t border-cifp-neutral-200">
          <p className="text-xs text-gray-500">Mostrando {filtered.length} de {notes.length}</p>
        </div>
      </Card>

      {/* Create modal */}
      {showCreate && (
        <CreateModal
          suppliers={suppliers}
          products={products}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadNotes() }}
        />
      )}
    </div>
  )
}

/* ─── Create Modal ──────────────────────────────────────────────── */

function CreateModal({ suppliers, products, onClose, onCreated }) {
  const [code, setCode] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 16))
  const [items, setItems] = useState([{ productId: '', qtyReceived: '', unitPrice: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [productSearch, setProductSearch] = useState({})

  function addLine() { setItems(prev => [...prev, { productId: '', qtyReceived: '', unitPrice: '' }]) }
  function removeLine(i) { setItems(prev => prev.filter((_, idx) => idx !== i)) }
  function updateLine(i, key, val) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item))
  }

  function filteredProducts(idx) {
    const q = (productSearch[idx] || '').toLowerCase()
    if (!q) return products.slice(0, 30)
    return products.filter(p => (p.name || p.nombre || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q)).slice(0, 30)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supplierId) { setError('Selecciona un proveedor'); return }
    const validItems = items.filter(i => i.productId && Number(i.qtyReceived) > 0)
    setSaving(true); setError(null)
    try {
      await apiFetch('/delivery-notes', {
        method: 'POST',
        body: JSON.stringify({
          code: code || undefined,
          supplierId,
          receivedAt: new Date(receivedAt).toISOString(),
          items: validItems.length ? validItems.map(i => ({
            productId: i.productId,
            qtyReceived: Number(i.qtyReceived),
            unitPrice: i.unitPrice ? Number(i.unitPrice) : undefined,
          })) : undefined,
        }),
      })
      onCreated()
    } catch (err) {
      setError(err.body?.message || err.message || 'Error al crear')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Nuevo albarán</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Código (opcional)</label>
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="ALB-2026-001"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-cifp-blue focus:ring-blue-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fecha recepción</label>
              <input type="datetime-local" value={receivedAt} onChange={e => setReceivedAt(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-cifp-blue focus:ring-blue-100" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Proveedor *</label>
            <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-cifp-blue focus:ring-blue-100">
              <option value="">Seleccionar proveedor…</option>
              {suppliers.filter(s => s.activo !== false).map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Líneas del albarán</label>
              <button type="button" onClick={addLine} className="text-xs text-cifp-blue hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir línea</button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <select value={item.productId} onChange={e => updateLine(idx, 'productId', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-cifp-blue focus:ring-blue-100">
                      <option value="">Producto…</option>
                      {filteredProducts(idx).map(p => (
                        <option key={p.id} value={p.id}>{p.code ? `${p.code} — ` : ''}{p.name || p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <input value={item.qtyReceived} onChange={e => updateLine(idx, 'qtyReceived', e.target.value)}
                    placeholder="Cant." type="number" step="0.001" min="0.001"
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:border-cifp-blue focus:ring-blue-100" />
                  <input value={item.unitPrice} onChange={e => updateLine(idx, 'unitPrice', e.target.value)}
                    placeholder="Precio" type="number" step="0.01" min="0"
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:border-cifp-blue focus:ring-blue-100" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeLine(idx)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-cifp-blue text-white text-sm font-semibold hover:bg-cifp-blue-dark disabled:opacity-50 transition-colors">
              {saving ? 'Creando…' : 'Crear albarán'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
