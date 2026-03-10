import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search, ArrowUpDown, ArrowUp, ArrowDown, X, Plus,
    Edit, Trash2, Download, Truck, CheckCircle, XCircle, ArrowLeft, Eye,
} from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import apiFetch from '../../services/api'

const EMPTY_SUPPLIER = {
    nombre: '',
    email: '',
    telefono: '',
    notas: '',
    activo: true,
}

export default function SuppliersFullPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortColumn, setSortColumn] = useState(null)
    const [sortDirection, setSortDirection] = useState('asc')
    const [selectedIds, setSelectedIds] = useState([])

    const [detailMode, setDetailMode] = useState(null) // null | 'view' | 'edit'
    const [detailForm, setDetailForm] = useState(null)
    const [detailSaving, setDetailSaving] = useState(false)
    const [formError, setFormError] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const isAdmin = user?.role !== 'USER'

    // Load suppliers from API
    useEffect(() => {
        let mounted = true
        setLoading(true)
        apiFetch('/suppliers?limit=500')
            .then(res => {
                const items = res?.data || res
                if (mounted && Array.isArray(items)) setSuppliers(items)
            })
            .catch(() => setSuppliers([]))
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [])

    // Filter & sort
    const filtered = useMemo(() => {
        let result = suppliers

        if (search) {
            const q = search.toLowerCase()
            result = result.filter(s =>
                [s.nombre, s.email, s.telefono, s.notas].some(v => String(v || '').toLowerCase().includes(q))
            )
        }
        if (statusFilter === 'active') result = result.filter(s => s.activo)
        if (statusFilter === 'inactive') result = result.filter(s => !s.activo)

        if (sortColumn) {
            result = [...result].sort((a, b) => {
                let aVal = String(a[sortColumn] ?? '').toLowerCase()
                let bVal = String(b[sortColumn] ?? '').toLowerCase()
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
            })
        }

        return result
    }, [suppliers, search, statusFilter, sortColumn, sortDirection])

    const handleSort = (col) => {
        if (sortColumn === col) setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortColumn(col); setSortDirection('asc') }
    }

    const handleResetFilters = () => {
        setSearch('')
        setStatusFilter('all')
        setSortColumn(null)
        setSortDirection('asc')
    }

    const handleSelectAll = (e) => setSelectedIds(e.target.checked ? filtered.map(s => s.id) : [])
    const handleSelectOne = (id) =>
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

    const openView = (s) => { setDetailForm({ ...s }); setDetailMode('view'); setFormError(null) }
    const openEdit = (s) => { setDetailForm({ ...s }); setDetailMode('edit'); setFormError(null) }
    const openCreate = () => { setDetailForm({ ...EMPTY_SUPPLIER }); setDetailMode('edit'); setFormError(null) }
    const closeDetail = () => { setDetailForm(null); setDetailMode(null); setFormError(null) }
    const handleDetailChange = (field, value) => setDetailForm(prev => ({ ...prev, [field]: value }))

    const handleDetailSave = async () => {
        if (!detailForm) return
        setFormError(null)
        setDetailSaving(true)
        try {
            const isExisting = !!detailForm.id
            if (isExisting) {
                const res = await apiFetch(`/suppliers/${detailForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(detailForm),
                })
                setSuppliers(prev => prev.map(s => s.id === res.id ? res : s))
            } else {
                const res = await apiFetch('/suppliers', {
                    method: 'POST',
                    body: JSON.stringify(detailForm),
                })
                setSuppliers(prev => [res, ...prev])
            }
            closeDetail()
        } catch (err) {
            setFormError(err?.body?.message || err.message || 'Error al guardar.')
        } finally {
            setDetailSaving(false)
        }
    }

    const handleDelete = (id) => { if (!isAdmin) return; setDeleteTarget(id); setShowDeleteModal(true) }
    const confirmDelete = async () => {
        if (!deleteTarget) return
        try {
            // Try hard delete first (requires SUPERADMIN). If forbidden, fallback to soft-delete.
            try {
                await apiFetch(`/suppliers/${deleteTarget}/hard`, { method: 'DELETE' })
                setSuppliers(prev => prev.filter(s => s.id !== deleteTarget))
            } catch (innerErr) {
                const status = innerErr?.status || innerErr?.body?.status || null
                if (status === 403 || status === 401) {
                    // fallback to soft delete
                    await apiFetch(`/suppliers/${deleteTarget}`, { method: 'DELETE' })
                    setSuppliers(prev => prev.map(s => s.id === deleteTarget ? { ...s, activo: false } : s))
                    setSelectedIds(prev => prev.filter(x => x !== deleteTarget))
                } else {
                    throw innerErr
                }
            }
            setSelectedIds(prev => prev.filter(x => x !== deleteTarget))
        } catch (err) {
            alert(`Error: ${err?.body?.message || err.message}`)
        } finally {
            setShowDeleteModal(false)
            setDeleteTarget(null)
        }
    }

    const handleToggleActive = async (id) => {
        if (!isAdmin) return
        try {
            const current = suppliers.find(s => s.id === id) || {}
            const updated = await apiFetch(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify({ ...current, activo: !current.activo }) })
            const u = updated?.data || updated || {}
            setSuppliers(prev => prev.map(p => p.id === id ? u : p))
        } catch (err) {
            alert(`Error: ${err?.body?.message || err.message}`)
        }
    }

    const handleExportCSV = () => {
        const data = selectedIds.length > 0
            ? filtered.filter(s => selectedIds.includes(s.id))
            : filtered
        if (!data.length) return
        const keys = ['nombre', 'email', 'telefono', 'notas', 'activo']
        const csv = [keys.join(','), ...data.map(s =>
            keys.map(k => `"${String(s[k] ?? '').replace(/"/g, '""')}"`).join(',')
        )].join('\n')
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        const a = document.createElement('a'); a.href = url
        a.download = `proveedores_${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); URL.revokeObjectURL(url)
    }

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4 opacity-50" />
        return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4 pb-4">

            {/* ── View / Edit / Create Modal ── */}
            {detailMode && detailForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDetail}>
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <button type="button" onClick={closeDetail} className="flex items-center gap-2 text-cifp-blue hover:text-cifp-blue-dark text-sm font-medium">
                                <X className="w-4 h-4" />
                                {detailMode === 'edit' ? 'Cancelar' : 'Cerrar'}
                            </button>
                            <h2 className="text-base font-bold text-gray-800 uppercase truncate max-w-xs">
                                {detailForm.id ? detailForm.nombre || 'Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                            <div className="flex items-center gap-2">
                                {detailMode === 'view' && isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setDetailMode('edit')}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-cifp-blue text-white rounded-lg text-xs font-semibold hover:bg-cifp-blue-dark transition-colors"
                                    >
                                        <Edit className="w-3 h-3" /> Editar
                                    </button>
                                )}
                                {detailMode === 'edit' && (
                                    <button
                                        type="button"
                                        onClick={handleDetailSave}
                                        disabled={detailSaving}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-cifp-blue text-white rounded-lg text-xs font-semibold hover:bg-cifp-blue-dark transition-colors disabled:opacity-60"
                                    >
                                        {detailSaving ? 'Guardando...' : detailForm.id ? 'Guardar Cambios' : 'Crear Proveedor'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto px-6 py-4 flex-1">
                            <div className="grid grid-cols-12 gap-x-3 gap-y-3">

                                {/* Nombre */}
                                <div className="col-span-12">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Nombre del Proveedor</label>
                                    <input
                                        type="text"
                                        value={detailForm.nombre || ''}
                                        onChange={e => handleDetailChange('nombre', e.target.value)}
                                        disabled={detailMode === 'view'}
                                        className="w-full px-3 h-9 text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium text-gray-800"
                                        placeholder="Ej: Distribuciones García S.L."
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-span-12 sm:col-span-7">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Email de Contacto</label>
                                    <input
                                        type="email"
                                        value={detailForm.email || ''}
                                        onChange={e => handleDetailChange('email', e.target.value)}
                                        disabled={detailMode === 'view'}
                                        className="w-full px-3 h-9 text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium text-gray-800"
                                        placeholder="contacto@empresa.es"
                                    />
                                </div>

                                {/* Teléfono */}
                                <div className="col-span-12 sm:col-span-5">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={detailForm.telefono || ''}
                                        onChange={e => handleDetailChange('telefono', e.target.value)}
                                        disabled={detailMode === 'view'}
                                        className="w-full px-3 h-9 text-sm border rounded-lg bg-green-50 border-green-100 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-75 font-medium text-gray-800"
                                        placeholder="+34 900 000 000"
                                    />
                                </div>

                                {/* Notas */}
                                <div className="col-span-12 sm:col-span-11">
                                    <label className="block text-[10px] uppercase font-bold text-gray-900 bg-purple-200 px-2 rounded-t w-max">Notas internas</label>
                                    <textarea
                                        value={detailForm.notas || ''}
                                        onChange={e => handleDetailChange('notas', e.target.value)}
                                        disabled={detailMode === 'view'}
                                        rows={3}
                                        placeholder="Condiciones de entrega, contacto, observaciones..."
                                        className="w-full px-3 py-2 text-sm border rounded-b-lg rounded-tr-lg border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none resize-none disabled:opacity-75 disabled:cursor-not-allowed bg-white text-gray-700 leading-snug"
                                    />
                                </div>

                                {/* Activo */}
                                <div className="col-span-12 sm:col-span-1 flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={detailForm.activo !== false}
                                            onChange={e => handleDetailChange('activo', e.target.checked)}
                                            disabled={detailMode === 'view'}
                                            className="w-4 h-4 text-cifp-blue focus:ring-cifp-blue border-gray-300 rounded"
                                        />
                                        <span className="text-[10px] font-medium text-gray-700 whitespace-nowrap">Activo</span>
                                    </label>
                                </div>
                            </div>
                            {formError && (
                                <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{formError}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
                        <p className="text-sm text-cifp-neutral-700 mb-4">
                            ¿Eliminar este proveedor? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null) }}>Cancelar</Button>
                            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between flex-shrink-0 short:py-0">
                <button
                    onClick={() => navigate('/providers')}
                    className="flex items-center gap-2 text-cifp-blue hover:text-cifp-blue-dark transition-colors short:text-sm"
                >
                    <ArrowLeft className="w-5 h-5 short:w-4 short:h-4" />
                    <span className="font-medium">Volver a Proveedores</span>
                </button>

                <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-xl font-bold text-cifp-neutral-900 short:text-base">Gestión de Proveedores</h1>
                </div>

                <span className="text-sm text-gray-500">{suppliers.length} en total</span>
            </div>

            {/* ── Toolbar ── */}
            <Card className="p-4 flex-shrink-0">
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                            placeholder="Buscar nombre, email, notas..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            icon={Search}
                            className="sm:col-span-2"
                        />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cifp-blue/20"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {isAdmin && (
                            <Button className="gap-2" onClick={openCreate}>
                                <Plus className="w-4 h-4" /> Nuevo Proveedor
                            </Button>
                        )}
                        {isAdmin && selectedIds.length === 1 && (
                            <Button className="gap-2" onClick={() => openEdit(suppliers.find(s => s.id === selectedIds[0]))}>
                                <Edit className="w-4 h-4" /> Editar Seleccionado
                            </Button>
                        )}
                        <Button variant="secondary" className="gap-2" onClick={handleResetFilters}>
                            <X className="w-4 h-4" /> Resetear Filtros
                        </Button>
                        <Button variant="secondary" className="gap-2 ml-auto" onClick={handleExportCSV}>
                            <Download className="w-4 h-4" /> Exportar CSV
                        </Button>
                    </div>
                </div>
            </Card>

            {/* ── Data Grid ── */}
            <Card className="flex-grow flex flex-col overflow-hidden min-h-0">
                <div className="flex-grow overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-gray-400">Cargando proveedores...</div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
                            <Truck className="w-8 h-8" />
                            <p className="text-sm">No se encontraron proveedores</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-cifp-neutral-100 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 text-left bg-cifp-neutral-100 w-8">
                                        <input
                                            type="checkbox"
                                            checked={filtered.length > 0 && selectedIds.length === filtered.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded text-cifp-blue"
                                        />
                                    </th>
                                    {[
                                        { key: 'nombre', label: 'Nombre' },
                                        { key: 'email', label: 'Email' },
                                        { key: 'telefono', label: 'Teléfono' },
                                        { key: 'activo', label: 'Estado' },
                                    ].map(col => (
                                        <th
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            className="px-4 py-3 text-left text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-cifp-neutral-200 transition-colors bg-cifp-neutral-100"
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                <SortIcon column={col.key} />
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider bg-cifp-neutral-100">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-cifp-neutral-200">
                                {filtered.map(s => {
                                    const isSelected = selectedIds.includes(s.id)
                                    return (
                                        <tr
                                            key={s.id}
                                            onDoubleClick={() => navigate(`/providers/${s.id}`)}
                                            className={`transition-colors cursor-pointer ${!s.activo
                                                ? 'opacity-50 bg-gray-50 hover:bg-gray-100'
                                                : isSelected ? 'bg-cifp-blue/5 hover:bg-cifp-blue/10' : 'hover:bg-cifp-neutral-50'
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOne(s.id)}
                                                    className="w-4 h-4 rounded text-cifp-blue"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-cifp-neutral-900 whitespace-nowrap">
                                                {s.nombre}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-cifp-neutral-700 whitespace-nowrap">
                                                {s.email ? (
                                                    <a href={`mailto:${s.email}`} className="text-cifp-blue hover:underline" onClick={e => e.stopPropagation()}>{s.email}</a>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-cifp-neutral-700 whitespace-nowrap">
                                                {s.telefono || '—'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                {s.activo
                                                    ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                                    : <XCircle className="w-5 h-5 text-gray-400 mx-auto" />}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => navigate(`/providers/${s.id}`)}
                                                        className="p-2 text-cifp-neutral-500 hover:text-cifp-blue hover:bg-cifp-blue/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                        title="Ver Detalle"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => openEdit(s)}
                                                            className="p-2 text-cifp-blue hover:bg-cifp-blue/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleToggleActive(s.id)}
                                                            className="p-2 hover:bg-cifp-blue/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                            title={s.activo ? 'Desactivar' : 'Activar'}
                                                        >
                                                            {s.activo ? <XCircle className="w-4 h-4 text-gray-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(s.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                {/* Footer */}
                <div className="px-6 py-3 bg-cifp-neutral-50 flex-shrink-0 flex items-center justify-between gap-4 border-t border-cifp-neutral-200">
                    <p className="text-sm text-cifp-neutral-600">
                        <span className="font-semibold">{filtered.length}</span> proveedor{filtered.length !== 1 ? 'es' : ''}
                        {selectedIds.length > 0 && (
                            <> | <span className="font-semibold text-cifp-blue">{selectedIds.length}</span> seleccionado{selectedIds.length !== 1 ? 's' : ''}</>
                        )}
                    </p>
                </div>
            </Card>
        </div>
    )
}
