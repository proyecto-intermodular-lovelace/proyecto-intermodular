import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Save, ArrowLeft, AlertTriangle, Edit, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'
import { getProductById } from '../../services/products.service'
import apiFetch from '../../services/api'

const EMPTY_INGREDIENT = {
    nombre: '',
    descripcion: '',
    unidad: 'kg',
    precio: 0,
    stock: 0,
    rendimiento: 80,
    categoryId: '',
    supplierId: ''
}

const UNITS = ['kg', 'unidad', 'L']

export default function IngredientDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()

    const isCreate = !id || id === 'new'
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

    const [form, setForm] = useState(EMPTY_INGREDIENT)
    const [loading, setLoading] = useState(!isCreate)
    const [notFound, setNotFound] = useState(false)
    const [saving, setSaving] = useState(false)
    const [isEditMode, setIsEditMode] = useState(isCreate)

    const [categories, setCategories] = useState([])
    const [suppliers, setSuppliers] = useState([])

    useEffect(() => {
        apiFetch('/categories?type=INGREDIENT').then(res => setCategories(Array.isArray(res) ? res : []))
        apiFetch('/suppliers?limit=500').then(res => {
            const items = res?.data ?? res
            setSuppliers(Array.isArray(items) ? items : [])
        })
    }, [])

    useEffect(() => {
        if (isCreate) {
            const scanned = location?.state?.scannedCode
            setForm(prev => ({ ...EMPTY_INGREDIENT, sku: scanned || '' }))
            setLoading(false)
            return
        }

        setLoading(true)
        getProductById(id)
            .then(data => {
                if (data) {
                    setForm({
                        nombre: data.nombre ?? '',
                        descripcion: data.descripcion ?? '',
                        unidad: data.unidad ?? 'kg',
                        precio: data.precio || 0,
                        stock: data.stock || 0,
                        rendimiento: data.rendimiento || 80,
                        categoryId: data.categoryId ?? '',
                        supplierId: data.supplierId ?? ''
                    })
                } else {
                    setNotFound(true)
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [id, isCreate])

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isAdmin) return
        setSaving(true)
        try {
            const payload = {
                name: form.nombre,
                code: form.sku || form.nombre.substring(0, 20).toUpperCase().replace(/\s+/g, '-'),
                productType: 'INGREDIENT',
                unitType: form.unidad,
                unitPrice: form.precio,
                    description: form.descripcion,
                    stock: form.stock,
                yieldPercent: form.rendimiento,
                relation: form.rendimiento / 100,
                categoryId: form.categoryId,
                supplierId: form.supplierId || null,
            }
            if (isCreate) {
                await apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) })
                navigate('/products')
            } else {
                await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
                setIsEditMode(false)
            }
        } catch (err) {
            alert(err?.body?.message || err.message || 'Error al guardar.')
        } finally {
            setSaving(false)
        }
    }

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 text-sm animate-pulse">Cargando ingrediente…</div>
            </div>
        )
    }

    // ── Not found ─────────────────────────────────────────────────────────────
    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <p className="text-gray-700 font-medium">Ingrediente no encontrado.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver
                </button>
            </div>
        )
    }

    return (
        <div className="h-full w-full max-w-4xl mx-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-1 md:mb-2">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-cifp-blue hover:text-cifp-blue-dark transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Volver atrás</span>
                </button>

                <h1 className="text-lg md:text-xl font-bold text-gray-800 uppercase truncate">
                    {isCreate ? 'Nuevo Ingrediente' : form.nombre || 'Detalle Ingrediente'}
                </h1>

                <div className="flex items-center gap-2">
                    {!isCreate && !isEditMode && isAdmin && (
                        <button
                            type="button"
                            onClick={() => setIsEditMode(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-cifp-blue text-white rounded-lg text-xs font-semibold hover:bg-cifp-blue-dark transition-colors"
                        >
                            <Edit className="w-3 h-3" /> Editar
                        </button>
                    )}
                    {isEditMode && !isCreate && (
                        <button
                            type="button"
                            onClick={() => setIsEditMode(false)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors"
                        >
                            <X className="w-3 h-3" /> Cancelar
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/50 backdrop-blur-sm p-2 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 md:gap-4 flex-grow overflow-hidden h-full">

                {/* Compact Grid Layout for Kiosk - Reduced gaps */}
                <div className="grid grid-cols-12 gap-x-2 gap-y-1 md:gap-x-4 md:gap-y-4 overflow-y-auto pr-1">

                    {/* Nombre - Full Width */}
                    <div className="col-span-12 sm:col-span-8">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Nombre del producto</label>
                        <input
                            type="text"
                            value={form.nombre}
                            onChange={e => handleChange('nombre', e.target.value)}
                            disabled={!isEditMode || !isAdmin}
                            className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium text-gray-800"
                            placeholder="Ej: Zanahoria"
                        />
                    </div>

                    {/* Type/Unit */}
                    <div className="col-span-6 sm:col-span-4">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Tipo Unidad</label>
                        <select
                            value={form.unidad}
                            onChange={e => handleChange('unidad', e.target.value)}
                            disabled={!isEditMode || !isAdmin}
                            className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-green-50 border-green-100 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-75 font-medium text-gray-800"
                        >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="col-span-12">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Descripción</label>
                        <textarea
                            value={form.descripcion}
                            onChange={e => handleChange('descripcion', e.target.value)}
                            disabled={!isEditMode || !isAdmin}
                            rows={2}
                            className="w-full px-2 py-1 text-xs md:text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:opacity-75 disabled:cursor-not-allowed text-gray-700 leading-tight"
                            placeholder="Descripción del ingrediente..."
                        />
                    </div>

                    {/* Precio */}
                    <div className="col-span-6 sm:col-span-3">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Precio/Unidad</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                value={form.precio}
                                onChange={e => handleChange('precio', parseFloat(e.target.value) || 0)}
                                disabled={!isEditMode || !isAdmin}
                                className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-green-50 border-green-100 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-75 font-medium text-gray-800"
                            />
                            <span className="absolute right-2 top-1 md:top-2.5 text-[10px] md:text-xs text-gray-400">€</span>
                        </div>
                    </div>

                    {/* Stock */}
                    <div className="col-span-6 sm:col-span-3">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Stock</label>
                        <input
                            type="number"
                            value={form.stock}
                            onChange={e => handleChange('stock', parseInt(e.target.value, 10) || 0)}
                            disabled={!isEditMode || !isAdmin}
                            className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-gray-50 border-gray-200 focus:ring-2 focus:ring-gray-500 outline-none disabled:opacity-75 font-medium text-gray-800"
                        />
                    </div>

                    {/* Rendimiento */}
                    <div className="col-span-6 sm:col-span-3">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">% Rendimiento</label>
                        <input
                            type="number"
                            value={form.rendimiento}
                            onChange={e => handleChange('rendimiento', parseFloat(e.target.value) || 0)}
                            disabled={!isEditMode || !isAdmin}
                            className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-gray-500 outline-none disabled:opacity-75 font-medium text-gray-800"
                        />
                    </div>

                    {/* Relación (calculado) */}
                    <div className="col-span-6 sm:col-span-3">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Relación</label>
                        <input
                            type="number"
                            value={(form.rendimiento / 100).toFixed(2)}
                            disabled
                            className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed font-medium"
                        />
                    </div>

                    {/* Categoría */}
                    <div className="col-span-12 sm:col-span-6">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-white bg-green-600 px-2 rounded-t w-max mb-0">Categoría</label>
                        <select
                            value={form.categoryId}
                            onChange={e => handleChange('categoryId', e.target.value)}
                            disabled={!isEditMode || !isAdmin}
                            className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-b-lg rounded-tr-lg border-green-600 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-75 bg-white font-medium text-gray-800"
                        >
                            <option value="">Selecciona</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Proveedor */}
                    <div className="col-span-12 sm:col-span-6">
                        <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-900 bg-purple-200 px-2 rounded-t w-max mb-0">Proveedor</label>
                        <select
                            value={form.supplierId}
                            onChange={e => handleChange('supplierId', e.target.value)}
                            disabled={!isEditMode || !isAdmin}
                            className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-b-lg rounded-tr-lg border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-75 bg-white font-medium text-gray-800"
                        >
                            <option value="">Selecciona</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>
                </div>

                {/* Footer Actions */}
                {(isEditMode && isAdmin) && (
                    <div className="flex gap-4 mt-auto pt-1 md:pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-black text-white h-8 md:h-10 rounded-xl font-bold text-[10px] md:text-xs tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 uppercase shadow-sm disabled:opacity-60"
                        >
                            <Save className="w-3 h-3 md:w-4 md:h-4" /> {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                )}

            </form>
        </div>
    )
}
