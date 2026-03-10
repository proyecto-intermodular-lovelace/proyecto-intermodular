import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, ArrowRight, CheckCircle, XCircle, Search, Plus } from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import apiFetch from '../../services/api'


export default function SuppliersSummaryPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const isAdmin = user?.role !== 'USER'

    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        let mounted = true
        apiFetch('/suppliers?limit=500')
            .then(res => {
                const items = res?.data || res
                if (mounted && Array.isArray(items)) setSuppliers(items)
            })
            .catch(() => setSuppliers([]))
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [])

    const activeSuppliers = useMemo(() => suppliers.filter(s => s.activo), [suppliers])
    const inactiveSuppliers = useMemo(() => suppliers.filter(s => !s.activo), [suppliers])

    const filtered = useMemo(() => {
        if (!search) return activeSuppliers.slice(0, 8)
        const q = search.toLowerCase()
        return suppliers
            .filter(s => [s.nombre, s.email, s.telefono].some(v => String(v || '').toLowerCase().includes(q)))
            .slice(0, 8)
    }, [suppliers, activeSuppliers, search])

    return (
        <div className="space-y-6 short:space-y-3">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Truck className="h-8 w-8 text-indigo-600 short:h-6 short:w-6" />
                    <h1 className="text-3xl font-bold text-cifp-neutral-900 short:text-xl">Proveedores</h1>
                </div>
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <Button onClick={() => navigate('/providers/new')} className="hidden sm:flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span>Nuevo</span>
                        </Button>
                    )}
                    <Button onClick={() => navigate('/providers/full')} className="hidden sm:flex items-center gap-2">
                        <span>Gestión Avanzada</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 short:gap-2">
                <Card className="p-4 short:p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                    <p className="text-3xl font-bold text-cifp-neutral-900 short:text-2xl">{suppliers.length}</p>
                    <p className="text-xs text-gray-400">proveedores</p>
                </Card>
                <Card className="p-4 short:p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Activos</p>
                    <p className="text-3xl font-bold text-green-600 short:text-2xl">{activeSuppliers.length}</p>
                    <p className="text-xs text-gray-400">habilitados</p>
                </Card>
                <Card className="p-4 short:p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Inactivos</p>
                    <p className="text-3xl font-bold text-gray-400 short:text-2xl">{inactiveSuppliers.length}</p>
                    <p className="text-xs text-gray-400">deshabilitados</p>
                </Card>
                <Card className="p-4 short:p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Con notas</p>
                    <p className="text-3xl font-bold text-indigo-600 short:text-2xl">{activeSuppliers.filter(s => s.notas).length}</p>
                    <p className="text-xs text-gray-400">con observaciones</p>
                </Card>
            </div>

            {/* ── Search + List ── */}
            <Card className="overflow-hidden short:max-h-[calc(100vh-8rem)]">
                <div className="p-4 border-b border-cifp-neutral-200 flex items-center gap-3">
                    <Input
                        placeholder="Buscar proveedor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        icon={Search}
                        className="flex-1"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Cargando...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
                        <Truck className="w-8 h-8" />
                        <p className="text-sm">No se encontraron resultados</p>
                    </div>
                ) : (
                    <div className="divide-y divide-cifp-neutral-100">
                        {filtered.map(s => (
                            <div
                                key={s.id}
                                onClick={() => navigate(`/providers/${s.id}`)}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-cifp-neutral-50 cursor-pointer transition-colors short:py-2 short:px-3"
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center short:w-8 short:h-8">
                                    <span className="text-indigo-700 font-semibold text-sm">
                                        {((s.nombre && String(s.nombre).charAt(0)) || '?').toString().toUpperCase()}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-cifp-neutral-900 truncate">{s.nombre}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {s.email || s.telefono || ''}
                                    </p>
                                </div>

                                {/* Notes preview */}
                                <div className="hidden sm:block max-w-[200px]">
                                    {s.notas && (
                                        <span className="text-xs text-gray-400 truncate block">{s.notas.slice(0, 40)}{s.notas.length > 40 ? '...' : ''}</span>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="flex-shrink-0">
                                    {s.activo
                                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                                        : <XCircle className="w-4 h-4 text-gray-300" />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="px-5 py-3 bg-cifp-neutral-50 border-t border-cifp-neutral-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Mostrando {filtered.length} de {suppliers.length}
                    </p>
                    <button
                        onClick={() => navigate('/providers/full')}
                        className="text-xs text-cifp-blue hover:underline flex items-center gap-1"
                    >
                        Ver todos <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </Card>

            {/* ── Mobile Actions ── */}
            <div className="flex sm:hidden gap-3">
                {isAdmin && (
                    <Button onClick={() => navigate('/providers/new')} className="flex-1 gap-2">
                        <Plus className="w-4 h-4" /> Nuevo Proveedor
                    </Button>
                )}
                <Button onClick={() => navigate('/providers/full')} variant="secondary" className="flex-1 gap-2">
                    Ver todos <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
