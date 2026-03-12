import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Plus, Trash2, Edit, X, Check, Search, ArrowUpDown, ArrowUp, ArrowDown, Download, ArrowLeft } from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import { getRecipes } from '../../services/recipes.service'
import { mockRecipes } from '../../services/recipes.mock'
import apiFetch from '../../services/api'

export default function RecipesFullPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role !== 'USER'

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedIds, setSelectedIds] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Create / Edit state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDifficulty, setFormDifficulty] = useState('FACIL')
  const [formYieldQuantity, setFormYieldQuantity] = useState(1)
  const [formYieldUnit, setFormYieldUnit] = useState('porciones')
  const [formPrepTime, setFormPrepTime] = useState(0)
  const [formCookTime, setFormCookTime] = useState(0)
  const [saving, setSaving] = useState(false)

  const fetchRecipes = () => {
    setLoading(true)
    getRecipes(2000)
      .then(data => setRecipes(data))
      .catch(() => setRecipes(mockRecipes))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRecipes() }, [])

  const filtered = useMemo(() => {
    let list = recipes

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      list = list.filter(r => r.difficulty === difficultyFilter)
    }

    // Apply search filter
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r => 
        (r.name || '').toLowerCase().includes(q) || 
        (r.code || '').toLowerCase().includes(q)
      )
    }

    // Apply sorting
    if (sortColumn) {
      list = [...list].sort((a, b) => {
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

    return list
  }, [recipes, difficultyFilter, search, sortColumn, sortDirection])

  const facilCount = useMemo(() => recipes.filter(r => r.difficulty === 'FACIL').length, [recipes])
  const mediaCount = useMemo(() => recipes.filter(r => r.difficulty === 'MEDIA').length, [recipes])
  const dificilCount = useMemo(() => recipes.filter(r => r.difficulty === 'DIFICIL').length, [recipes])

  const openCreate = () => {
    setEditingId(null)
    setFormName('')
    setFormDescription('')
    setFormDifficulty(difficultyFilter !== 'all' ? difficultyFilter : 'FACIL')
    setFormYieldQuantity(1)
    setFormYieldUnit('porciones')
    setFormPrepTime(0)
    setFormCookTime(0)
    setShowForm(true)
  }

  const openEdit = (recipe) => {
    setEditingId(recipe.id)
    setFormName(recipe.name)
    setFormDescription(recipe.description || '')
    setFormDifficulty(recipe.difficulty)
    setFormYieldQuantity(recipe.yieldQuantity)
    setFormYieldUnit(recipe.yieldUnit)
    setFormPrepTime(recipe.prepTime)
    setFormCookTime(recipe.cookTime)
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
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        difficulty: formDifficulty,
        yieldQuantity: Number(formYieldQuantity),
        yieldUnit: formYieldUnit,
        prepTime: Number(formPrepTime),
        cookTime: Number(formCookTime),
      }
      if (editingId) {
        await apiFetch(`/recipes/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiFetch('/recipes', { method: 'POST', body: JSON.stringify(payload) })
      }
      closeForm()
      fetchRecipes()
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al guardar receta')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id) => {
    setDeleteTarget(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await apiFetch(`/recipes/${deleteTarget}`, { method: 'DELETE' })
      fetchRecipes()
      setSelectedIds(selectedIds.filter(sid => sid !== deleteTarget))
      setShowDeleteModal(false)
      setDeleteTarget(null)
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al eliminar')
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setDifficultyFilter('all')
    setSortColumn(null)
    setSortDirection('asc')
    setSelectedIds([])
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(r => r.id))
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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleExportCSV = () => {
    const dataToExport = selectedIds.length > 0
      ? filtered.filter(r => selectedIds.includes(r.id))
      : filtered

    const keys = ['id', 'code', 'name', 'difficulty', 'yieldQuantity', 'yieldUnit', 'prepTime', 'cookTime']
    const header = keys.join(',')
    const rows = dataToExport.map(r => keys.map(k => {
      const v = r[k]
      return typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : String(v)
    }).join(','))

    const csvContent = [header, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `recetas_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ column }) => (
    sortColumn !== column 
      ? <ArrowUpDown className="w-4 h-4 opacity-50" />
      : sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />
  )

  const difficultyLabel = (d) => d === 'FACIL' ? 'Fácil' : d === 'MEDIA' ? 'Media' : 'Difícil'
  const difficultyBadge = (d) => d === 'FACIL'
    ? 'bg-green-100 text-green-800'
    : d === 'MEDIA'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800'

  return (
    <div className="space-y-6 short:space-y-3 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recipes')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          <ChefHat className="h-8 w-8 text-orange-600 short:h-6 short:w-6" />
          <h1 className="text-3xl font-bold text-cifp-neutral-900 short:text-xl">Recetas</h1>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/recipes/new')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Nueva Receta</span>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 short:gap-2">
        <Card className="p-4 short:p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-cifp-neutral-900 short:text-2xl">{recipes.length}</p>
          <p className="text-xs text-gray-400">recetas</p>
        </Card>
        <Card className="p-4 short:p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Fáciles</p>
          <p className="text-3xl font-bold text-green-600 short:text-2xl">{facilCount}</p>
          <p className="text-xs text-gray-400">nivel básico</p>
        </Card>
        <Card className="p-4 short:p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avanzadas</p>
          <p className="text-3xl font-bold text-red-600 short:text-2xl">{dificilCount}</p>
          <p className="text-xs text-gray-400">nivel alto</p>
        </Card>
      </div>

      {/* Filters + List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-cifp-neutral-200 space-y-3">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Buscar receta..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={Search}
              className="flex-1"
            />
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cifp-blue/20"
            >
              <option value="all">Todas</option>
              <option value="FACIL">Fáciles</option>
              <option value="MEDIA">Medias</option>
              <option value="DIFICIL">Difíciles</option>
            </select>
            {(search || difficultyFilter !== 'all' || sortColumn) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-2 transition-colors"
                title="Limpiar filtros"
              >
                ↺ Reset
              </button>
            )}
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
              <p className="text-sm font-medium text-blue-700">{selectedIds.length} seleccionados</p>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Download className="w-4 h-4" /> Exportar
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
            <ChefHat className="w-8 h-8" />
            <p className="text-sm">No se encontraron recetas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cifp-neutral-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-cifp-neutral-200 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Nombre <SortIcon column="name" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-cifp-neutral-200 transition-colors"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center gap-2">
                      Código <SortIcon column="code" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-cifp-neutral-200 transition-colors"
                    onClick={() => handleSort('yieldQuantity')}
                  >
                    <div className="flex items-center gap-2">
                      Rendimiento <SortIcon column="yieldQuantity" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-cifp-neutral-200 transition-colors"
                    onClick={() => handleSort('difficulty')}
                  >
                    <div className="flex items-center gap-2">
                      Dificultad <SortIcon column="difficulty" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Tiempos</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Alérgenos</th>
                  {isAdmin && <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-cifp-neutral-200">
                {filtered.map(recipe => (
                  <tr
                    key={recipe.id}
                    className={`hover:bg-cifp-neutral-50 transition-colors ${
                      selectedIds.includes(recipe.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(recipe.id)}
                        onChange={() => handleSelectOne(recipe.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-cifp-neutral-900">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-700 font-semibold text-xs">
                            {recipe.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{recipe.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{recipe.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {recipe.yieldQuantity} {recipe.yieldUnit}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyBadge(recipe.difficulty)}`}>
                        {difficultyLabel(recipe.difficulty)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {recipe.prepTime}m + {recipe.cookTime}m
                    </td>
                    <td className="px-4 py-3 text-center">
                      {recipe.allergens && recipe.allergens.length > 0 ? (
                        <span 
                          title={recipe.allergens.map(a => a.name).join(', ')}
                          className="text-red-500 text-lg hover:bg-red-50 rounded px-2 py-1 cursor-help"
                        >
                          ⚠️
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(recipe)}
                            className="p-2 text-cifp-blue hover:bg-cifp-blue/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(recipe.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-cifp-neutral-700 mb-4">
              ¿Eliminar esta receta? Se borrarán también sus ingredientes y alérgenos. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null) }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeForm}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? 'Editar Receta' : 'Nueva Receta'}
            </h2>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                  placeholder="Ej: Pasta Carbonara..."
                  autoFocus
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Descripción</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                  placeholder="Detalles de la receta..."
                  rows="2"
                />
              </div>

              {/* Dificultad */}
              <div>
                <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Dificultad</label>
                <select
                  value={formDifficulty}
                  onChange={e => setFormDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                >
                  <option value="FACIL">Fácil</option>
                  <option value="MEDIA">Media</option>
                  <option value="DIFICIL">Difícil</option>
                </select>
              </div>

              {/* Rendimiento */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Cantidad</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formYieldQuantity}
                    onChange={e => setFormYieldQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Unidad</label>
                  <select
                    value={formYieldUnit}
                    onChange={e => setFormYieldUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                  >
                    <option value="porciones">Porciones</option>
                    <option value="platos">Platos</option>
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>

              {/* Tiempos */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Prep (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={formPrepTime}
                    onChange={e => setFormPrepTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Cocción (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={formCookTime}
                    onChange={e => setFormCookTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                  />
                </div>
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
    </div>
  )
}
