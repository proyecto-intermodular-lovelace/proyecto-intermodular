import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search, ArrowUpDown, ArrowUp, ArrowDown, X, Plus,
    Edit, Trash2, ArrowLeft, Download, AlertTriangle, ClipboardList, Eye
} from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import { mockProducts, FOOD_CATEGORIES } from '../../services/products.mock'
import { getMaterials } from '../../services/products.service'
import apiFetch from '../../services/api'

// Helper: returns true for non-food (material) products
const isMaterial = (p) => !FOOD_CATEGORIES.includes(p.categoria)

export default function MaterialsFullPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    // State management
    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [providerFilter, setProviderFilter] = useState('all')
    const [sortColumn, setSortColumn] = useState(null)
    const [sortDirection, setSortDirection] = useState('asc')
    const [selectedIds, setSelectedIds] = useState([])
    const [showOnlyLowStock, setShowOnlyLowStock] = useState(false)
    const [detailProduct, setDetailProduct] = useState(null)
    const [detailMode, setDetailMode] = useState(null) // null | 'view' | 'edit'
    const [detailForm, setDetailForm] = useState(null)
    const [detailSaving, setDetailSaving] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Derived filter options
    const categories = useMemo(() => [...new Set(products.map(p => p.categoria || ''))].filter(Boolean).sort(), [products])
    const suppliers = useMemo(() => [...new Set(products.map(p => p.proveedor || ''))].filter(Boolean).sort(), [products])

    // Load real materials from backend (fallback to mock on error)
    useEffect(() => {
        getMaterials(2000)
            .then(data => setProducts(data))
            .catch(() => setProducts(mockProducts.filter(isMaterial)))
    }, [])

    // Filter and sort
    const filteredProducts = useMemo(() => {
        let filtered = products

        if (search) {
            const q = search.toLowerCase()
            filtered = filtered.filter(p =>
                Object.values(p).some(val => String(val).toLowerCase().includes(q))
            )
        }

        if (categoryFilter !== 'all') filtered = filtered.filter(p => p.categoria === categoryFilter)
        if (providerFilter !== 'all') filtered = filtered.filter(p => p.proveedor === providerFilter)
        if (showOnlyLowStock) filtered = filtered.filter(p => p.stock < p.stockMinimo)

        if (sortColumn) {
            filtered = [...filtered].sort((a, b) => {
                let aVal = a[sortColumn]
                let bVal = b[sortColumn]
                if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase() }
                return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
            })
        }

        return filtered
    }, [products, search, categoryFilter, providerFilter, showOnlyLowStock, sortColumn, sortDirection])

    // Handlers
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const handleResetFilters = () => {
        setSearch('')
        setCategoryFilter('all')
        setProviderFilter('all')
        setShowOnlyLowStock(false)
        setSortColumn(null)
        setSortDirection('asc')
    }

    const handleSelectAll = (e) => {
        setSelectedIds(e.target.checked ? filteredProducts.map(p => p.id) : [])
    }

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        )
    }

    const handleExportCSV = () => {
        const dataToExport = selectedIds.length > 0
            ? filteredProducts.filter(p => selectedIds.includes(p.id))
            : filteredProducts

        if (dataToExport.length === 0) return

        const keys = ['id', 'sku', 'nombre', 'categoria', 'proveedor', 'stock', 'unidad', 'precio', 'rendimiento', 'activo']
        const header = keys.join(',')
        const rows = dataToExport.map(p =>
            keys.map(k => {
                const v = p[k]
                if (typeof v === 'string') return `"${String(v).replace(/"/g, '""')}"`
                return String(v)
            }).join(',')
        )

        const csvContent = [header, ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `materiales_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const MATERIAL_CATEGORIES = ['Utensilios', 'Packaging', 'Limpieza', 'Seguridad', 'Mobiliario', 'Maquinaria', 'Papelería', 'Otros']
    const UNITS = ['unidad', 'kg', 'L', 'caja', 'm', 'm²']

    const openDetailView = (product) => {
        setDetailProduct(product)
        setDetailForm({ ...product })
        setDetailMode('view')
    }

    const openDetailEdit = (product) => {
        setDetailProduct(product)
        setDetailForm({ ...product })
        setDetailMode('edit')
    }

    const openDetailCreate = () => {
        const empty = { nombre: '', sku: '', categoria: 'Utensilios', proveedor: '', stock: 0, stockMinimo: 0, precio: 0, unidad: 'unidad', rendimiento: 1.0, descripcion: '', activo: true }
        setDetailProduct(empty)
        setDetailForm(empty)
        setDetailMode('edit')
    }

    const closeDetail = () => {
        setDetailProduct(null)
        setDetailForm(null)
        setDetailMode(null)
    }

    const handleDetailChange = (field, value) => {
        setDetailForm(prev => ({ ...prev, [field]: value }))
    }

    const handleDetailSave = async () => {
        if (!detailForm) return
        setDetailSaving(true)
        try {
            const isExisting = detailForm.id && products.some(p => p.id === detailForm.id)
            if (isExisting) {
                const res = await apiFetch(`/products/${detailForm.id}`, { method: 'PUT', body: JSON.stringify(detailForm) })
                setProducts(products.map(p => p.id === res.id ? res : p))
            } else {
                const res = await apiFetch('/products', { method: 'POST', body: JSON.stringify(detailForm) })
                setProducts([res, ...products])
            }
            closeDetail()
        } catch (err) {
            alert(`Error: ${err?.body?.message || err.message}`)
        } finally {
            setDetailSaving(false)
        }
    }

    const handleDelete = (id) => {
        if (isRegularUser) return
        setDeleteTarget(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        try {
            await apiFetch(`/products/${deleteTarget}`, { method: 'DELETE' })
            setProducts(products.filter(p => p.id !== deleteTarget))
            setSelectedIds(selectedIds.filter(sid => sid !== deleteTarget))
            setShowDeleteModal(false)
            setDeleteTarget(null)
        } catch (err) {
            alert(`Error: ${err?.body?.message || err.message}`)
        }
    }

    const isRegularUser = user?.role === 'USER'
    const lowStockCount = products.filter(p => p.stock < p.stockMinimo).length

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4 opacity-50" />
        return sortDirection === 'asc'
            ? <ArrowUp className="w-4 h-4" />
            : <ArrowDown className="w-4 h-4" />
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] short:h-[calc(100vh-8rem)] space-y-4 pb-4 short:space-y-2 short:pb-2">

            {/* Detail / Edit Modal */}
            {detailMode && detailForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDetail}>
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <button type="button" onClick={closeDetail} className="flex items-center gap-2 text-cifp-blue hover:text-cifp-blue-dark text-sm font-medium">
                                <X className="w-4 h-4" />
                                {detailMode === 'edit' ? 'Cancelar edición' : 'Cerrar'}
                            </button>
                            <h2 className="text-base font-bold text-gray-800 uppercase truncate max-w-xs">
                                {detailForm.id ? detailForm.nombre || 'Material' : 'Nuevo Material'}
                            </h2>
                            <div className="flex items-center gap-2">
                                {detailMode === 'view' && !isRegularUser && (
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
                                        {detailSaving ? 'Guardando...' : detailForm.id ? 'Guardar Cambios' : 'Crear Material'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Modal form body */}
                        <div className="overflow-y-auto px-6 py-4 flex-1">
                            <div className="grid grid-cols-12 gap-x-3 gap-y-2">

                                {/* Nombre */}
                                <div className="col-span-12 sm:col-span-8">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Nombre del Material</label>
                                    <input type="text" value={detailForm.nombre} onChange={e => handleDetailChange('nombre', e.target.value)} disabled={detailMode === 'view'}
                                        className="w-full px-2 h-9 text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium text-gray-800"
                                        placeholder="Ej: Cuchillo Chef 20cm" />
                                </div>

                                {/* Unidad */}
                                <div className="col-span-6 sm:col-span-4">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Unidad de Medida</label>
                                    <select value={detailForm.unidad} onChange={e => handleDetailChange('unidad', e.target.value)} disabled={detailMode === 'view'}
                                        className="w-full px-2 h-9 text-sm border rounded-lg bg-green-50 border-green-100 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-75 font-medium text-gray-800">
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>

                                {/* SKU */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">SKU</label>
                                    <input type="text" value={detailForm.sku} onChange={e => handleDetailChange('sku', e.target.value)} disabled={detailMode === 'view'}
                                        className="w-full px-2 h-9 text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-mono text-gray-800"
                                        placeholder="MAT-0001" />
                                </div>

                                {/* Descripción */}
                                <div className="col-span-12">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Descripción</label>
                                    <textarea value={detailForm.descripcion} onChange={e => handleDetailChange('descripcion', e.target.value)} disabled={detailMode === 'view'}
                                        rows={2} placeholder="Descripción del material..."
                                        className="w-full px-2 py-1 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:opacity-75 disabled:cursor-not-allowed text-gray-700 leading-tight" />
                                </div>

                                {/* Precio */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Precio/Unidad</label>
                                    <div className="relative">
                                        <input type="number" step="0.01" value={detailForm.precio} onChange={e => handleDetailChange('precio', parseFloat(e.target.value) || 0)} disabled={detailMode === 'view'}
                                            className="w-full px-2 h-9 text-sm border rounded-lg bg-green-50 border-green-100 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-75 font-medium text-gray-800" />
                                        <span className="absolute right-2 top-2 text-[10px] text-gray-400">€</span>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className={`block text-[10px] uppercase font-bold mb-1 ${detailForm.stock < detailForm.stockMinimo ? 'text-red-600' : 'text-gray-800'}`}>Stock</label>
                                    <input type="number" value={detailForm.stock} onChange={e => handleDetailChange('stock', parseInt(e.target.value, 10) || 0)} disabled={detailMode === 'view'}
                                        className={`w-full px-2 h-9 text-sm border rounded-lg focus:ring-2 outline-none disabled:opacity-75 font-medium text-gray-800 ${detailForm.stock < detailForm.stockMinimo ? 'bg-red-50 border-red-200 focus:ring-red-500' : 'bg-gray-50 border-gray-200 focus:ring-gray-500'}`} />
                                </div>

                                {/* Stock Mínimo */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Stock Mínimo</label>
                                    <input type="number" value={detailForm.stockMinimo} onChange={e => handleDetailChange('stockMinimo', parseInt(e.target.value, 10) || 0)} disabled={detailMode === 'view'}
                                        className="w-full px-2 h-9 text-sm border rounded-lg bg-gray-50 border-gray-200 focus:ring-2 focus:ring-gray-500 outline-none disabled:opacity-75 font-medium text-gray-800" />
                                </div>

                                {/* Rendimiento */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Rendimiento</label>
                                    <input type="number" step="0.001" value={detailForm.rendimiento} onChange={e => handleDetailChange('rendimiento', parseFloat(e.target.value) || 0)} disabled={detailMode === 'view'}
                                        className="w-full px-2 h-9 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-gray-500 outline-none disabled:opacity-75 font-medium text-gray-800" />
                                </div>

                                {/* Categoría */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-[10px] uppercase font-bold text-white bg-green-600 px-2 rounded-t w-max">Categoría</label>
                                    <select value={detailForm.categoria} onChange={e => handleDetailChange('categoria', e.target.value)} disabled={detailMode === 'view'}
                                        className="w-full px-2 h-9 text-sm border rounded-b-lg rounded-tr-lg border-green-600 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-75 bg-white font-medium text-gray-800">
                                        <option value="">Selecciona</option>
                                        {MATERIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Proveedor */}
                                <div className="col-span-12 sm:col-span-5">
                                    <label className="block text-[10px] uppercase font-bold text-gray-900 bg-purple-200 px-2 rounded-t w-max">Proveedor</label>
                                    <input type="text" value={detailForm.proveedor} onChange={e => handleDetailChange('proveedor', e.target.value)} disabled={detailMode === 'view'}
                                        className="w-full px-2 h-9 text-sm border rounded-b-lg rounded-tr-lg border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-75 bg-white font-medium text-gray-800"
                                        placeholder="Nombre del proveedor" />
                                </div>

                                {/* Activo */}
                                <div className="col-span-12 sm:col-span-1 flex items-end pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" checked={detailForm.activo} onChange={e => handleDetailChange('activo', e.target.checked)} disabled={detailMode === 'view'}
                                            className="w-4 h-4 text-cifp-blue focus:ring-cifp-blue border-gray-300 rounded" />
                                        <span className="text-[10px] font-medium text-gray-700 whitespace-nowrap">Activo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
                        <p className="text-sm text-cifp-neutral-700 mb-4">¿Eliminar este material? Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null) }}>Cancelar</Button>
                            <Button onClick={confirmDelete} variant="corporate">Eliminar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between flex-shrink-0 short:py-0">
                <button
                    onClick={() => navigate('/inventory')}
                    className="flex items-center gap-2 text-cifp-blue hover:text-cifp-blue-dark transition-colors short:text-sm"
                >
                    <ArrowLeft className="w-5 h-5 short:w-4 short:h-4" />
                    <span className="font-medium">Volver a Resumen</span>
                </button>

                {lowStockCount > 0 && (
                    <div className="flex items-center gap-2 bg-cifp-red-light/10 text-cifp-red px-4 py-2 rounded-lg short:px-2 short:py-1">
                        <AlertTriangle className="w-5 h-5 short:w-4 short:h-4" />
                        <span className="text-sm font-semibold short:text-xs">{lowStockCount} materiales con stock crítico</span>
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <Card className="p-6 flex-shrink-0 short:p-3">
                <div className="space-y-4 short:space-y-2">
                    {/* Search + Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 short:gap-2">
                        <Input
                            placeholder="Buscar por SKU o Nombre..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            icon={Search}
                            className="w-full short:h-8 short:text-xs"
                        />

                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cifp-blue/20 focus:border-cifp-blue short:h-8 short:px-2 short:py-1 short:text-xs"
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={providerFilter}
                            onChange={e => setProviderFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cifp-blue/20 focus:border-cifp-blue short:h-8 short:px-2 short:py-1 short:text-xs"
                        >
                            <option value="all">Todos los proveedores</option>
                            {suppliers.map(sup => (
                                <option key={sup} value={sup}>{sup}</option>
                            ))}
                        </select>

                        <Button onClick={handleResetFilters} variant="secondary" className="gap-2 short:h-8 short:text-xs short:px-2">
                            <X className="w-4 h-4 short:w-3 short:h-3" />
                            Resetear Filtros
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 short:gap-2">
                        {!isRegularUser && (
                            <Button
                                variant="primary"
                                className="gap-2 short:h-8 short:text-xs short:px-2"
                                onClick={openDetailCreate}
                            >
                                <Plus className="w-4 h-4 short:hidden" />
                                Crear Material
                            </Button>
                        )}

                        {!isRegularUser && (
                            <Button
                                variant="primary"
                                disabled={selectedIds.length === 0}
                                className="gap-2 short:h-8 short:text-xs short:px-2"
                                title={selectedIds.length === 0 ? 'Selecciona al menos un material' : ''}
                                onClick={() => {
                                    const p = products.find(x => x.id === selectedIds[0])
                                    if (p) openDetailEdit(p)
                                }}
                            >
                                <Edit className="w-4 h-4 short:hidden" />
                                Modificar Seleccionado
                            </Button>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showOnlyLowStock}
                                    onChange={e => setShowOnlyLowStock(e.target.checked)}
                                    className="w-4 h-4 text-cifp-red focus:ring-cifp-red border-gray-300 rounded short:w-3 short:h-3"
                                />
                                <span className="text-sm font-medium text-cifp-neutral-700 short:text-xs">Solo stock crítico</span>
                            </label>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Data Grid */}
            <Card className="flex-grow flex flex-col overflow-hidden min-h-0">
                <div className="flex-grow overflow-y-auto border-b border-cifp-neutral-200">
                    <table className="w-full">
                        <thead className="bg-cifp-neutral-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-left bg-cifp-neutral-100 short:px-2 short:py-1">
                                    <input
                                        type="checkbox"
                                        checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-cifp-blue focus:ring-cifp-blue border-gray-300 rounded short:w-3 short:h-3"
                                    />
                                </th>
                                {[
                                    { key: 'sku', label: 'ID (SKU)', align: 'left' },
                                    { key: 'nombre', label: 'Nombre', align: 'left' },
                                    { key: 'categoria', label: 'Categoría', align: 'left' },
                                    { key: 'stock', label: 'Stock', align: 'right' },
                                    { key: 'precio', label: 'Precio (€)', align: 'right' },
                                ].map(col => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className={`px-4 py-3 text-${col.align} text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-cifp-neutral-200 transition-colors bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]`}
                                    >
                                        <div className={`flex items-center ${col.align === 'right' ? 'justify-end' : ''} gap-2`}>
                                            {col.label}
                                            <SortIcon column={col.key} />
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-cifp-neutral-200">
                            {filteredProducts.map((material) => {
                                const isLowStock = material.stock < material.stockMinimo
                                const isSelected = selectedIds.includes(material.id)

                                return (
                                    <tr
                                        key={material.id}
                                        onDoubleClick={() => navigate(`/inventory/${material.id}`)}
                                        className={`transition-colors cursor-pointer ${isLowStock
                                            ? 'bg-cifp-red-light/10 hover:bg-cifp-red-light/20'
                                            : isSelected
                                                ? 'bg-cifp-blue/5 hover:bg-cifp-blue/10'
                                                : 'hover:bg-cifp-neutral-50'
                                            } short:text-xs`}
                                    >
                                        <td className="px-4 py-3 short:px-2 short:py-1">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectOne(material.id)}
                                                className="w-4 h-4 text-cifp-blue focus:ring-cifp-blue border-gray-300 rounded short:w-3 short:h-3"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-cifp-neutral-600 short:px-2 short:py-1 short:text-[10px]">
                                            {material.sku}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-cifp-neutral-900 short:px-2 short:py-1 short:text-[10px]">
                                            {material.nombre}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-cifp-neutral-600 short:px-2 short:py-1 short:text-[10px]">
                                            <span className="inline-flex items-center gap-1.5">
                                                <ClipboardList className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                {material.categoria}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right short:px-2 short:py-1">
                                            <span className={`font-semibold short:text-[10px] ${isLowStock ? 'text-cifp-red' : 'text-cifp-neutral-700'}`}>
                                                {material.stock} {material.unidad}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cifp-neutral-700 short:px-2 short:py-1 short:text-[10px]">
                                            €{Number(material.precio).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center short:px-2 short:py-1">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/inventory/${material.id}`)}
                                                    className="p-2 text-cifp-neutral-500 hover:text-cifp-blue hover:bg-cifp-blue/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                    title="Ver Detalle"
                                                >
                                                    <Eye className="w-4 h-4 short:w-3 short:h-3" />
                                                </button>
                                                <button
                                                    onClick={() => isRegularUser ? openDetailView(material) : openDetailEdit(material)}
                                                    className="p-2 text-cifp-blue hover:bg-cifp-blue/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                    title={isRegularUser ? 'Ver detalle' : 'Editar'}
                                                >
                                                    <Edit className="w-4 h-4 short:w-3 short:h-3" />
                                                </button>
                                                <button
                                                    className="p-2 text-cifp-red hover:bg-cifp-red/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                    disabled={isRegularUser}
                                                    title={isRegularUser ? 'Solo administradores pueden eliminar' : 'Eliminar'}
                                                    onClick={() => handleDelete(material.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 short:w-3 short:h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-cifp-neutral-50 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 short:px-3 short:py-2 short:gap-2">
                    <div className="text-sm text-cifp-neutral-600 short:text-xs">
                        <span className="font-semibold">{filteredProducts.length}</span> materiales
                        {selectedIds.length > 0 && (
                            <> | <span className="font-semibold text-cifp-blue">{selectedIds.length}</span> seleccionados</>
                        )}
                    </div>

                    <div className="flex items-center gap-3 short:gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleExportCSV}
                            className="gap-2 short:h-8 short:text-xs short:px-2"
                        >
                            <Download className="w-4 h-4 short:w-3 short:h-3" />
                            Exportar CSV
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
