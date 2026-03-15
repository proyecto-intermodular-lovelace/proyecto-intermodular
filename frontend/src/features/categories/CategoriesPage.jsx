import { useState, useEffect, useMemo } from 'react'
import { Tags, Plus, Trash2, Edit, X, Check, Search } from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import apiFetch from '../../services/api'
import showToast from '../../services/toast'

export default function CategoriesPage() {
    const { user } = useAuth()
    const isAdmin = user?.role !== 'USER'

    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')

    // Create / Edit state
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formName, setFormName] = useState('')
    const [formType, setFormType] = useState('INGREDIENT')
    const [saving, setSaving] = useState(false)

    const fetchCategories = () => {
        setLoading(true)
        apiFetch('/categories')
            .then(res => setCategories(Array.isArray(res) ? res : []))
            .catch(() => setCategories([]))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchCategories() }, [])

    const filtered = useMemo(() => {
        let list = categories
        if (typeFilter !== 'all') list = list.filter(c => c.productType === typeFilter)
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(c => c.name.toLowerCase().includes(q))
        }
        return list
    }, [categories, typeFilter, search])

    const ingredientCount = useMemo(() => categories.filter(c => c.productType === 'INGREDIENT').length, [categories])
    const materialCount = useMemo(() => categories.filter(c => c.productType === 'MATERIAL').length, [categories])

    const openCreate = () => {
        setEditingId(null)
        setFormName('')
        setFormType(typeFilter !== 'all' ? typeFilter : 'INGREDIENT')
        setShowForm(true)
    }

    const openEdit = (cat) => {
        setEditingId(cat.id)
        setFormName(cat.name)
        setFormType(cat.productType)
        setShowForm(true)
    }

    const closeForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormName('')
    }

    const handleSave = async () => {
        if (!formName.trim()) return
        setSaving(true)
        try {
            const payload = { name: formName.trim(), productType: formType }
            if (editingId) {
                await apiFetch(`/categories/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
            } else {
                await apiFetch('/categories', { method: 'POST', body: JSON.stringify(payload) })
            }
            closeForm()
            fetchCategories()
        } catch (err) {
            showToast(err?.body?.message || err.message || 'Error al guardar categoría', 'error')
        } finally {
            setSaving(false)
        }
    }

    const [showConfirm, setShowConfirm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const handleDelete = (id) => {
        setDeleteTarget(id)
        setShowConfirm(true)
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return setShowConfirm(false)
        try {
            await apiFetch(`/categories/${deleteTarget}`, { method: 'DELETE' })
            setShowConfirm(false)
            setDeleteTarget(null)
            showToast('Categoría eliminada', 'success')
            fetchCategories()
        } catch (err) {
            setShowConfirm(false)
            setDeleteTarget(null)
            showToast(err?.body?.message || err.message || 'No se puede eliminar (hay productos asociados)', 'error')
        }
    }

    const typeLabel = (t) => t === 'INGREDIENT' ? 'Ingrediente' : 'Material'
    const typeBadge = (t) => t === 'INGREDIENT'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-blue-100 text-blue-800'

    return (
        <div className="space-y-6 short:space-y-3 max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Tags className="h-8 w-8 text-green-600 short:h-6 short:w-6" />
                    <h1 className="text-3xl font-bold text-cifp-neutral-900 short:text-xl">Categorías</h1>
                </div>
                {isAdmin && (
                    <Button onClick={openCreate} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Nueva Categoría</span>
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 short:gap-2">
                <Card className="p-4 short:p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                    <p className="text-3xl font-bold text-cifp-neutral-900 short:text-2xl">{categories.length}</p>
                    <p className="text-xs text-gray-400">categorías</p>
                </Card>
                <Card className="p-4 short:p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Ingredientes</p>
                    <p className="text-3xl font-bold text-amber-600 short:text-2xl">{ingredientCount}</p>
                    <p className="text-xs text-gray-400">categorías</p>
                </Card>
                <Card className="p-4 short:p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Materiales</p>
                    <p className="text-3xl font-bold text-blue-600 short:text-2xl">{materialCount}</p>
                    <p className="text-xs text-gray-400">categorías</p>
                </Card>
            </div>

            {/* Filters + List */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-cifp-neutral-200 flex items-center gap-3">
                    <Input
                        placeholder="Buscar categoría..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        icon={Search}
                        className="flex-1"
                    />
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cifp-blue/20"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="INGREDIENT">Ingredientes</option>
                        <option value="MATERIAL">Materiales</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Cargando...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
                        <Tags className="w-8 h-8" />
                        <p className="text-sm">No se encontraron categorías</p>
                    </div>
                ) : (
                    <div className="divide-y divide-cifp-neutral-100">
                        {filtered.map(cat => (
                            <div
                                key={cat.id}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-cifp-neutral-50 transition-colors short:py-2 short:px-3"
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center short:w-8 short:h-8">
                                    <span className="text-green-700 font-semibold text-sm">
                                        {cat.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-cifp-neutral-900 truncate">{cat.name}</p>
                                </div>

                                {/* Type badge */}
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeBadge(cat.productType)}`}>
                                    {typeLabel(cat.productType)}
                                </span>

                                {/* Actions */}
                                {isAdmin && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEdit(cat)}
                                            className="p-2 text-cifp-blue hover:bg-cifp-blue/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeForm}>
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                                    placeholder="Ej: Lácteos, Utensilios..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Tipo de producto</label>
                                <select
                                    value={formType}
                                    onChange={e => setFormType(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                                >
                                    <option value="INGREDIENT">Ingrediente</option>
                                    <option value="MATERIAL">Material</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeForm}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4" /> Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formName.trim()}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-cifp-blue rounded-lg hover:bg-cifp-blue-dark transition-colors disabled:opacity-60"
                            >
                                <Check className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfirm(false)}>
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
                        <p className="text-sm text-gray-600 mb-4">¿Eliminar esta categoría? Solo es posible si ningún producto la usa.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowConfirm(false); setDeleteTarget(null) }} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancelar</button>
                            <button onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
