import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, X, Plus, Edit, Trash2, ArrowLeft, Download, AlertTriangle, Eye } from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import { mockProducts } from '../../services/products.mock'
import { getIngredients } from '../../services/products.service'
import apiFetch from '../../services/api'

export default function IngredientsFullPage() {
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
    const [isEditing, setIsEditing] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [detailSaving, setDetailSaving] = useState(false)

    // Get unique categories and providers from loaded products
    const categories = useMemo(() => [...new Set(products.map(p => p.categoria || ''))].filter(Boolean).sort(), [products])
    const suppliers = useMemo(() => [...new Set(products.map(p => p.proveedor || ''))].filter(Boolean).sort(), [products])

    // Load real ingredients from backend (fallback to mock on error)
    useEffect(() => {
        getIngredients(2000)
            .then(data => setProducts(data))
            .catch(() => setProducts(mockProducts))
    }, [])

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = products

        // Apply search filter (match any field)
        if (search) {
            const searchLower = search.toLowerCase()
            filtered = filtered.filter(p =>
                Object.values(p).some(val => String(val).toLowerCase().includes(searchLower))
            )
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.categoria === categoryFilter)
        }

        // Apply provider filter
        if (providerFilter !== 'all') {
            filtered = filtered.filter(p => p.proveedor === providerFilter)
        }

        // Apply low stock filter
        if (showOnlyLowStock) {
            filtered = filtered.filter(p => p.stock < p.stockMinimo)
        }

        // Apply sorting
        if (sortColumn) {
            filtered = [...filtered].sort((a, b) => {
                let aVal = a[sortColumn]
                let bVal = b[sortColumn]

                // Handle string comparison
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase()
                    bVal = bVal.toLowerCase()
                }

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1
                } else {
                    return aVal < bVal ? 1 : -1
                }
            })
        }

        return filtered
    }, [products, search, categoryFilter, providerFilter, showOnlyLowStock, sortColumn, sortDirection])

    // Handlers
    const handleSort = (column) => {
        if (sortColumn === column) {
            // Toggle direction
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
        if (e.target.checked) {
            setSelectedIds(filteredProducts.map(p => p.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleExportCSV = () => {
        const dataToExport = selectedIds.length > 0
            ? filteredProducts.filter(p => selectedIds.includes(p.id))
            : filteredProducts

        if (dataToExport.length === 0) return

        // Build CSV
        const keys = ['id', 'sku', 'nombre', 'categoria', 'proveedor', 'stock', 'unidad', 'precio', 'rendimiento', 'activo']
        const header = keys.join(',')
        const rows = dataToExport.map(p => keys.map(k => {
            const v = p[k]
            if (typeof v === 'string') return `"${String(v).replace(/"/g, '""')}"`
            return String(v)
        }).join(','))

        const csvContent = [header, ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `productos_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handleOpenEdit = (product) => {
        setEditProduct({ descripcion: '', activo: true, ...product })
        setIsEditing(true)
    }

    const handleCloseEdit = () => {
        setEditProduct(null)
        setIsEditing(false)
    }

    const [deleteTarget, setDeleteTarget] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleSaveEdit = async (updated) => {
        if (!updated) return
        setDetailSaving(true)
        try {
            // Determine create vs update by presence of id and whether it looks like a client-only id
            const isExisting = updated.id && products.some(p => p.id === updated.id && !String(p.id).startsWith('id_'))
            if (isExisting) {
                const res = await apiFetch(`/products/${updated.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(updated),
                })
                setProducts(products.map(p => p.id === res.id ? res : p))
            } else {
                const res = await apiFetch('/products', {
                    method: 'POST',
                    body: JSON.stringify(updated),
                })
                setProducts([res, ...products])
            }
            handleCloseEdit()
        } catch (err) {
            alert(`Error: ${err?.body?.message || err.message}`)
        } finally {
            setDetailSaving(false)
        }
    }

    const handleDelete = async (id) => {
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

    // Check if user is regular USER (not ADMIN)
    const isRegularUser = user?.role === 'USER'

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4 opacity-50" />
        return sortDirection === 'asc'
            ? <ArrowUp className="w-4 h-4" />
            : <ArrowDown className="w-4 h-4" />
    }

    const lowStockCount = products.filter(p => p.stock < p.stockMinimo).length

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] short:h-[calc(100vh-8rem)] space-y-4 pb-4 short:space-y-2 short:pb-2">
            {/* Edit/Create Modal */}
            {isEditing && editProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleCloseEdit}>
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <button type="button" onClick={handleCloseEdit} className="flex items-center gap-2 text-cifp-blue hover:text-cifp-blue-dark text-sm font-medium">
                                <X className="w-4 h-4" />
                                Cancelar
                            </button>
                            <h2 className="text-base font-bold text-gray-800 uppercase truncate max-w-xs">
                                {editProduct.id ? editProduct.nombre || 'Ingrediente' : 'Nuevo Ingrediente'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => handleSaveEdit(editProduct)}
                                disabled={detailSaving}
                                className="flex items-center gap-1 px-3 py-1.5 bg-cifp-blue text-white rounded-lg text-xs font-semibold hover:bg-cifp-blue-dark transition-colors disabled:opacity-60"
                            >
                                {detailSaving ? 'Guardando...' : editProduct.id ? 'Guardar Cambios' : 'Crear Ingrediente'}
                            </button>
                        </div>

                        {/* Modal form body */}
                        <div className="overflow-y-auto px-6 py-4 flex-1">
                            <div className="grid grid-cols-12 gap-x-3 gap-y-3">

                                {/* Nombre */}
                                <div className="col-span-12 sm:col-span-8">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Nombre del Ingrediente</label>
                                    <input
                                        type="text"
                                        value={editProduct.nombre || ''}
                                        onChange={e => setEditProduct({ ...editProduct, nombre: e.target.value })}
                                        className="w-full px-3 h-9 text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800"
                                        placeholder="Ej: Harina de trigo"
                                    />
                                </div>

                                {/* Unidad */}
                                <div className="col-span-6 sm:col-span-4">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Unidad de Medida</label>
                                    <select
                                        value={editProduct.unidad || 'kg'}
                                        onChange={e => setEditProduct({ ...editProduct, unidad: e.target.value })}
                                        className="w-full px-3 h-9 text-sm border rounded-lg bg-green-50 border-green-100 focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-800"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="L">L</option>
                                        <option value="mL">mL</option>
                                        <option value="unidad">unidad</option>
                                    </select>
                                </div>

                                {/* SKU */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        value={editProduct.sku || ''}
                                        onChange={e => setEditProduct({ ...editProduct, sku: e.target.value })}
                                        className="w-full px-3 h-9 text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-gray-800"
                                        placeholder="ING-0001"
                                    />
                                </div>

                                {/* Descripción */}
                                <div className="col-span-12">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Descripción</label>
                                    <textarea
                                        value={editProduct.descripcion || ''}
                                        onChange={e => setEditProduct({ ...editProduct, descripcion: e.target.value })}
                                        rows={2}
                                        placeholder="Descripción del ingrediente..."
                                        className="w-full px-3 py-2 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700 leading-tight"
                                    />
                                </div>

                                {/* Precio */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Precio / Unidad</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editProduct.precio ?? 0}
                                            onChange={e => setEditProduct({ ...editProduct, precio: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 h-9 text-sm border rounded-lg bg-green-50 border-green-100 focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-800"
                                        />
                                        <span className="absolute right-2 top-2.5 text-[10px] text-gray-400">€</span>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className={`block text-[10px] uppercase font-bold mb-1 ${(editProduct.stock ?? 0) < (editProduct.stockMinimo ?? 0) ? 'text-red-600' : 'text-gray-800'}`}>Stock</label>
                                    <input
                                        type="number"
                                        value={editProduct.stock ?? 0}
                                        onChange={e => setEditProduct({ ...editProduct, stock: parseInt(e.target.value, 10) || 0 })}
                                        className={`w-full px-3 h-9 text-sm border rounded-lg focus:ring-2 outline-none font-medium text-gray-800 ${(editProduct.stock ?? 0) < (editProduct.stockMinimo ?? 0) ? 'bg-red-50 border-red-200 focus:ring-red-500' : 'bg-gray-50 border-gray-200 focus:ring-gray-500'}`}
                                    />
                                </div>

                                {/* Stock Mínimo */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        value={editProduct.stockMinimo ?? 0}
                                        onChange={e => setEditProduct({ ...editProduct, stockMinimo: parseInt(e.target.value, 10) || 0 })}
                                        className="w-full px-3 h-9 text-sm border rounded-lg bg-gray-50 border-gray-200 focus:ring-2 focus:ring-gray-500 outline-none font-medium text-gray-800"
                                    />
                                </div>

                                {/* Rendimiento */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-[10px] uppercase font-bold text-gray-800 mb-1">Rendimiento (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editProduct.rendimiento ?? 80}
                                        onChange={e => setEditProduct({ ...editProduct, rendimiento: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 h-9 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-gray-500 outline-none font-medium text-gray-800"
                                    />
                                </div>

                                {/* Categoría */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-[10px] uppercase font-bold text-white bg-green-600 px-2 rounded-t w-max">Categoría</label>
                                    <input
                                        type="text"
                                        value={editProduct.categoria || ''}
                                        onChange={e => setEditProduct({ ...editProduct, categoria: e.target.value })}
                                        className="w-full px-3 h-9 text-sm border rounded-b-lg rounded-tr-lg border-green-600 focus:ring-2 focus:ring-green-500 outline-none bg-white font-medium text-gray-800"
                                        placeholder="Ej: Lácteos, Carnes, Verduras..."
                                    />
                                </div>

                                {/* Proveedor */}
                                <div className="col-span-12 sm:col-span-5">
                                    <label className="block text-[10px] uppercase font-bold text-gray-900 bg-purple-200 px-2 rounded-t w-max">Proveedor</label>
                                    <input
                                        type="text"
                                        value={editProduct.proveedor || ''}
                                        onChange={e => setEditProduct({ ...editProduct, proveedor: e.target.value })}
                                        className="w-full px-3 h-9 text-sm border rounded-b-lg rounded-tr-lg border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-800"
                                        placeholder="Nombre del proveedor"
                                    />
                                </div>

                                {/* Activo */}
                                <div className="col-span-12 sm:col-span-1 flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={editProduct.activo !== false}
                                            onChange={e => setEditProduct({ ...editProduct, activo: e.target.checked })}
                                            className="w-4 h-4 text-cifp-blue focus:ring-cifp-blue border-gray-300 rounded"
                                        />
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
                        <p className="text-sm text-cifp-neutral-700 mb-4">¿Eliminar este producto? Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null) }}>Cancelar</Button>
                            <Button onClick={confirmDelete} variant="corporate">Eliminar</Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Page Header with Back Button - FIXED */}
            <div className="flex items-center justify-between flex-shrink-0 short:py-0">
                <button
                    onClick={() => navigate('/products')}
                    className="flex items-center gap-2 text-cifp-blue hover:text-cifp-blue-dark transition-colors short:text-sm"
                >
                    <ArrowLeft className="w-5 h-5 short:w-4 short:h-4" />
                    <span className="font-medium">Volver a Resumen</span>
                </button>

                {lowStockCount > 0 && (
                    <div className="flex items-center gap-2 bg-cifp-red-light/10 text-cifp-red px-4 py-2 rounded-lg short:px-2 short:py-1">
                        <AlertTriangle className="w-5 h-5 short:w-4 short:h-4" />
                        <span className="text-sm font-semibold short:text-xs">{lowStockCount} productos con stock crítico</span>
                    </div>
                )}
            </div>

            {/* Toolbar - Ultra-Compact Mode for Kiosk */}
            <Card className="p-6 flex-shrink-0 short:p-2">
                <div className="space-y-4 short:space-y-1.5">
                    {/* Search and Filters Row - Horizontal on Kiosk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 short:grid-cols-4 short:gap-1.5">
                        <Input
                            placeholder="Buscar por ID o Nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={Search}
                            className="w-full short:h-8 short:text-xs short:placeholder:text-[10px]"
                        />

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cifp-blue/20 focus:border-cifp-blue short:h-8 short:px-1.5 short:py-0 short:text-xs"
                        >
                            <option value="all">Categorías</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={providerFilter}
                            onChange={(e) => setProviderFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cifp-blue/20 focus:border-cifp-blue short:h-8 short:px-1.5 short:py-0 short:text-xs"
                        >
                            <option value="all">Proveedores</option>
                            {suppliers.map(sup => (
                                <option key={sup} value={sup}>{sup}</option>
                            ))}
                        </select>

                        <Button onClick={handleResetFilters} variant="secondary" className="gap-2 short:h-8 short:text-xs short:px-1.5 short:gap-1">
                            <X className="w-4 h-4 short:w-3 short:h-3" />
                            <span className="short:hidden">Resetear</span>
                        </Button>
                    </div>

                    {/* Action Buttons Row - Flexible Wrap on Kiosk */}
                    <div className="flex flex-wrap items-center gap-2 short:gap-2">
                        <Button
                            variant="secondary"
                            disabled={selectedIds.length !== 1}
                            className="gap-2 short:h-8 short:text-[10px] short:px-2 short:gap-1 flex-shrink-0"
                            title={selectedIds.length !== 1 ? 'Selecciona un único producto para ver detalle' : 'Ver Detalle'}
                            onClick={() => {
                                if (selectedIds.length === 1) {
                                    navigate(`/products/${selectedIds[0]}`)
                                }
                            }}
                        >
                            <Eye className="w-4 h-4 short:w-3 short:h-3" />
                            <span className="short:hidden sm:short:inline">Ver Detalle</span>
                        </Button>

                        <Button
                            variant="primary"
                            disabled={isRegularUser}
                            className="gap-2 short:h-8 short:text-[10px] short:px-2 short:gap-1 flex-shrink-0"
                            title={isRegularUser ? 'Solo administradores pueden crear productos' : ''}
                            onClick={() => navigate('/products/new')}
                        >
                            <Plus className="w-4 h-4 short:w-3 short:h-3" />
                            <span className="short:hidden sm:short:inline">Crear</span>
                        </Button>

                        <Button
                            variant="primary"
                            disabled={isRegularUser || selectedIds.length === 0}
                            className="gap-2 short:h-8 short:text-[10px] short:px-2 short:gap-1 flex-shrink-0"
                            title={isRegularUser ? 'Solo administradores pueden modificar productos' : 'Selecciona al menos un producto'}
                            onClick={() => {
                                const toEdit = products.find(p => p.id === selectedIds[0])
                                if (toEdit) handleOpenEdit(toEdit)
                            }}
                        >
                            <Edit className="w-4 h-4 short:w-3 short:h-3" />
                            <span className="short:hidden sm:short:inline">Modificar</span>
                        </Button>

                        <div className="ml-auto flex items-center gap-2 short:gap-1 flex-shrink-0">
                            <label className="flex items-center gap-2 cursor-pointer select-none short:gap-1">
                                <input
                                    type="checkbox"
                                    checked={showOnlyLowStock}
                                    onChange={(e) => setShowOnlyLowStock(e.target.checked)}
                                    className="w-4 h-4 text-cifp-red focus:ring-cifp-red border-gray-300 rounded short:w-3 short:h-3"
                                />
                                <span className="text-sm font-medium text-cifp-neutral-700 short:text-[10px] whitespace-nowrap">Stock crítico</span>
                            </label>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Data Grid with Internal Scroll - FLEXIBLE */}
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
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-cifp-neutral-200 transition-colors bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]"
                                    onClick={() => handleSort('sku')}
                                >
                                    <div className="flex items-center gap-2">
                                        ID (SKU)
                                        <SortIcon column="sku" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-cifp-neutral-200 transition-colors bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]"
                                    onClick={() => handleSort('nombre')}
                                >
                                    <div className="flex items-center gap-2">
                                        Nombre
                                        <SortIcon column="nombre" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-cifp-neutral-200 transition-colors bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]"
                                    onClick={() => handleSort('categoria')}
                                >
                                    <div className="flex items-center gap-2">
                                        Categoría
                                        <SortIcon column="categoria" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-cifp-neutral-200 transition-colors bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]"
                                    onClick={() => handleSort('stock')}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        Stock
                                        <SortIcon column="stock" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-cifp-neutral-200 transition-colors bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]"
                                    onClick={() => handleSort('precio')}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        Precio (€)
                                        <SortIcon column="precio" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-cifp-neutral-200 transition-colors bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]"
                                    onClick={() => handleSort('rendimiento')}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        Rendimiento
                                        <SortIcon column="rendimiento" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-cifp-neutral-700 uppercase tracking-wider bg-cifp-neutral-100 short:px-2 short:py-1 short:text-[10px]">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-cifp-neutral-200">
                            {filteredProducts.map((product) => {
                                const isLowStock = product.stock < product.stockMinimo
                                const isSelected = selectedIds.includes(product.id)

                                return (
                                    <tr
                                        key={product.id}
                                        onDoubleClick={() => navigate(`/products/${product.id}`)}
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
                                                onChange={() => handleSelectOne(product.id)}
                                                className="w-4 h-4 text-cifp-blue focus:ring-cifp-blue border-gray-300 rounded short:w-3 short:h-3"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-cifp-neutral-600 short:px-2 short:py-1 short:text-[10px]">
                                            {product.sku}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-cifp-neutral-900 short:px-2 short:py-1 short:text-[10px]">
                                            {product.nombre}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-cifp-neutral-600 short:px-2 short:py-1 short:text-[10px]">
                                            {product.categoria}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right short:px-2 short:py-1">
                                            <span className={`font-semibold short:text-[10px] ${isLowStock ? 'text-cifp-red' : 'text-cifp-neutral-700'}`}>
                                                {product.stock} {product.unidad}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cifp-neutral-700 short:px-2 short:py-1 short:text-[10px]">
                                            €{(product.precio ?? 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cifp-neutral-600 short:px-2 short:py-1 short:text-[10px]">
                                            {(product.rendimiento ?? 0).toFixed(3)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center short:px-2 short:py-1">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                    className="p-2 text-cifp-neutral-500 hover:text-cifp-blue hover:bg-cifp-blue/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                    title="Ver Detalle"
                                                >
                                                    <Eye className="w-4 h-4 short:w-3 short:h-3" />
                                                </button>
                                                <button onClick={() => handleOpenEdit(product)} className="p-2 text-cifp-blue hover:bg-cifp-blue/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center" title="Editar">
                                                    <Edit className="w-4 h-4 short:w-3 short:h-3" />
                                                </button>
                                                <button
                                                    className="p-2 text-cifp-red hover:bg-cifp-red/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                    disabled={isRegularUser}
                                                    title={isRegularUser ? 'Solo administradores pueden eliminar' : 'Eliminar'}
                                                    onClick={() => handleDelete(product.id)}
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

                {/* Footer - FIXED at bottom of card */}
                <div className="px-6 py-4 bg-cifp-neutral-50 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 short:px-3 short:py-2 short:gap-2">
                    <div className="text-sm text-cifp-neutral-600 short:text-xs">
                        <span className="font-semibold">{filteredProducts.length}</span> productos
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
