import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, AlertTriangle, Edit, X, Check, Trash2, Plus, Package } from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'
import { Card } from '../../components/ui'
import { getRecipeById, createRecipe, updateRecipe, addRecipeItem, deleteRecipeItem, getAllergens, addRecipeAllergen, deleteRecipeAllergen } from '../../services/recipes.service'
import apiFetch from '../../services/api'

const EMPTY_RECIPE = {
  name: '',
  description: '',
  difficulty: 'FACIL',
  yieldQuantity: 1,
  yieldUnit: 'porciones',
  prepTime: 0,
  cookTime: 0,
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const isCreate = !id || id === 'new'
  const isAdmin = user?.role !== 'USER'

  const [recipe, setRecipe] = useState(EMPTY_RECIPE)
  const [items, setItems] = useState([])
  const [allergens, setAllergens] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(!isCreate)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(isCreate)

  // Add item modal
  const [showAddItem, setShowAddItem] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState('')

   // Add allergen modal
   const [showAddAllergen, setShowAddAllergen] = useState(false)
   const [availableAllergens, setAvailableAllergens] = useState([])

   useEffect(() => {
     // Usar endpoint específico para ingredientes de recetas
     apiFetch('/recipes/ingredients')
       .then(res => {
         const prods = res?.data ?? res
         setProducts(Array.isArray(prods) ? prods : [])
       })
       .catch(() => setProducts([]))
     
     getAllergens(100)
       .then(data => {
         setAvailableAllergens(data)
       })
       .catch(() => setAvailableAllergens([]))
   }, [])

  useEffect(() => {
    if (isCreate) {
      setRecipe(EMPTY_RECIPE)
      setItems([])
      setAllergens([])
      setLoading(false)
      return
    }

    setLoading(true)
    getRecipeById(id)
      .then(data => {
        if (data) {
          setRecipe(data)
          setItems(data.items || [])
          setAllergens(data.allergens || [])
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, isCreate])

  const handleChange = (field, value) => {
    setRecipe(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setSaving(true)
    try {
      const payload = {
        name: recipe.name,
        description: recipe.description,
        difficulty: recipe.difficulty,
        yieldQuantity: Number(recipe.yieldQuantity) || 1,
        yieldUnit: recipe.yieldUnit,
        prepTime: Number(recipe.prepTime) || 0,
        cookTime: Number(recipe.cookTime) || 0,
      }
      if (isCreate) {
        await createRecipe(payload)
        navigate('/recipes')
      } else {
        await updateRecipe(id, payload)
        setIsEditMode(false)
      }
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!selectedProductId || !selectedQuantity) return
    setSaving(true)
    try {
      await addRecipeItem(id, {
        productId: selectedProductId,
        quantity: Number(selectedQuantity),
      })
      setShowAddItem(false)
      setSelectedProductId('')
      setSelectedQuantity('')
      // Recargar receta
      const data = await getRecipeById(id)
      if (data) setItems(data.items || [])
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al agregar ingrediente')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('¿Eliminar este ingrediente?')) return
    try {
      await deleteRecipeItem(id, itemId)
      const data = await getRecipeById(id)
      if (data) setItems(data.items || [])
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al eliminar')
    }
  }

  const handleAddAllergen = async (allergenId) => {
    if (!allergenId) return
    setSaving(true)
    try {
      console.log('Agregando alérgeno:', allergenId)
      const result = await addRecipeAllergen(id, allergenId)
      console.log('Resultado de agregar alérgeno:', result)
      const data = await getRecipeById(id)
      console.log('Datos de la receta después de agregar:', data)
      if (data) setAllergens(data.allergens || [])
      setShowAddAllergen(false)
    } catch (err) {
      console.error('Error al agregar alérgeno:', err)
      alert(err?.body?.message || err.message || 'Error al agregar alérgeno')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAllergen = async (allergenId) => {
    if (!confirm('¿Eliminar este alérgeno?')) return
    setSaving(true)
    try {
      await deleteRecipeAllergen(id, allergenId)
      const data = await getRecipeById(id)
      if (data) setAllergens(data.allergens || [])
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al eliminar alérgeno')
    } finally {
      setSaving(false)
    }
  }

  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0)
  }, [items])

  const costPerRation = recipe.yieldQuantity ? totalCost / Number(recipe.yieldQuantity) : 0

  // Agrupar alérgenos por categoría
  const allergensByCategory = useMemo(() => {
    const grouped = {}
    availableAllergens.forEach(allergen => {
      const category = allergen.category || 'Otros'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(allergen)
    })
    return grouped
  }, [availableAllergens])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm animate-pulse">Cargando receta…</div>
      </div>
    )
  }

  // Not found state
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-gray-700 font-medium">Receta no encontrada.</p>
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
    <>
    <div className="h-full w-full max-w-4xl mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 md:mb-2">
        <button
          type="button"
          onClick={() => navigate('/recipes')}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Recetas</span>
        </button>

        <h1 className="text-lg md:text-xl font-bold text-gray-800 uppercase truncate">
          {isCreate ? 'Nueva Receta' : recipe.name || 'Detalle Receta'}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white/50 backdrop-blur-sm p-2 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 md:gap-4 flex-grow overflow-hidden h-full">

        <div className="grid grid-cols-12 gap-x-2 gap-y-1 md:gap-x-4 md:gap-y-4 overflow-y-auto pr-1">

          {/* Nombre */}
          <div className="col-span-12 sm:col-span-8">
            <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Nombre</label>
            <input
              type="text"
              value={recipe.name}
              onChange={e => handleChange('name', e.target.value)}
              disabled={!isEditMode || !isAdmin}
              className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium text-gray-800"
              placeholder="Ej: Pasta Carbonara"
            />
          </div>

          {/* Dificultad */}
          <div className="col-span-6 sm:col-span-4">
            <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Dificultad</label>
            <select
              value={recipe.difficulty}
              onChange={e => handleChange('difficulty', e.target.value)}
              disabled={!isEditMode || !isAdmin}
              className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium"
            >
              <option value="FACIL">Fácil</option>
              <option value="MEDIA">Media</option>
              <option value="DIFICIL">Difícil</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="col-span-12">
            <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Descripción</label>
            <textarea
              value={recipe.description}
              onChange={e => handleChange('description', e.target.value)}
              disabled={!isEditMode || !isAdmin}
              className="w-full px-2 py-1 md:py-2 text-xs md:text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium text-gray-800"
              placeholder="Instrucciones y detalles..."
              rows="2"
            />
          </div>

          {/* Rendimiento */}
          <div className="col-span-6 sm:col-span-3">
            <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Cantidad</label>
            <input
              type="number"
              step="0.1"
              value={recipe.yieldQuantity}
              onChange={e => handleChange('yieldQuantity', e.target.value)}
              disabled={!isEditMode || !isAdmin}
              className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium"
            />
          </div>

          {/* Unidad */}
          <div className="col-span-6 sm:col-span-3">
            <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Unidad</label>
            <select
              value={recipe.yieldUnit}
              onChange={e => handleChange('yieldUnit', e.target.value)}
              disabled={!isEditMode || !isAdmin}
              className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium"
            >
              <option value="porciones">Porciones</option>
              <option value="platos">Platos</option>
              <option value="kg">kg</option>
              <option value="L">L</option>
            </select>
          </div>

          {/* Prep Time */}
          <div className="col-span-6 sm:col-span-3">
            <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Prep (min)</label>
            <input
              type="number"
              min="0"
              value={recipe.prepTime}
              onChange={e => handleChange('prepTime', e.target.value)}
              disabled={!isEditMode || !isAdmin}
              className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium"
            />
          </div>

          {/* Cook Time */}
          <div className="col-span-6 sm:col-span-3">
            <label className="block text-[10px] md:text-xs uppercase font-bold text-gray-800 mb-0 md:mb-1">Cocción (min)</label>
            <input
              type="number"
              min="0"
              value={recipe.cookTime}
              onChange={e => handleChange('cookTime', e.target.value)}
              disabled={!isEditMode || !isAdmin}
              className="w-full px-2 py-0 h-8 md:h-10 md:py-2 text-xs md:text-sm border rounded-lg bg-blue-50/50 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed font-medium"
            />
          </div>
        </div>

        {/* Form buttons */}
        {isEditMode && (
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" /> Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-cifp-blue rounded-lg hover:bg-cifp-blue-dark transition-colors disabled:opacity-60"
            >
              <Save className="w-3 h-3" /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </form>

       {/* Escandallo - Tabla de ingredientes */}
       <>
           <div className="mt-4 md:mt-6 flex items-center justify-between">
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               <Package className="w-5 h-5" /> Escandallo
             </h2>
             {!isCreate && isAdmin && (
               <button
                 type="button"
                 onClick={() => setShowAddItem(true)}
                 className="text-xs text-cifp-blue hover:underline flex items-center gap-1"
               >
                 <Plus className="w-3 h-3" /> Agregar ingrediente
               </button>
             )}
           </div>

           {isCreate ? (
             <div className="mt-2 p-4 text-center text-gray-400 text-sm border rounded-lg bg-blue-50">
               Guarda la receta primero para agregar ingredientes
             </div>
           ) : items.length > 0 ? (
             <div className="mt-2 border rounded-xl overflow-hidden bg-white">
               <table className="w-full text-sm">
                 <thead className="bg-cifp-neutral-100 sticky top-0 z-10 shadow-sm">
                   <tr>
                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Producto</th>
                     <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Cantidad</th>
                     <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Precio ud.</th>
                     <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Coste</th>
                     <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Acciones</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-cifp-neutral-200">
                   {items.map(item => (
                     <tr key={item.id} className="hover:bg-cifp-neutral-50 transition-colors">
                       <td className="px-4 py-3 text-sm font-medium text-cifp-neutral-900">{item.product?.name}</td>
                       <td className="px-4 py-3 text-right font-mono text-sm">{Number(item.quantity).toFixed(2)}</td>
                       <td className="px-4 py-3 text-right font-mono text-sm">{Number(item.unitPrice).toFixed(2)} €</td>
                       <td className="px-4 py-3 text-right font-mono font-bold text-sm">{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)} €</td>
                       <td className="px-4 py-3 text-center">
                         {isAdmin && (
                           <button
                             type="button"
                             onClick={() => handleDeleteItem(item.id)}
                             className="text-red-500 hover:text-red-700 transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="mt-2 p-4 text-center text-gray-400 text-sm border rounded-lg bg-gray-50">
               No hay ingredientes agregados
             </div>
           )}

           {/* Costes Card */}
           <Card className="mt-4 md:mt-6 p-4 short:p-3">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Coste Total</p>
                 <p className="text-2xl font-bold text-cifp-neutral-900">{totalCost.toFixed(2)} €</p>
               </div>
               <div>
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Por Ración</p>
                 <p className="text-2xl font-bold text-green-600">{costPerRation.toFixed(2)} €</p>
               </div>
             </div>
           </Card>

            {/* Alérgenos */}
            <div className="mt-4 md:mt-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Alérgenos
              </h2>
              {!isCreate && isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddAllergen(true)}
                  className="text-xs text-cifp-blue hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Agregar alérgeno
                </button>
              )}
            </div>

            {isCreate ? (
              <div className="mt-2 p-4 text-center text-gray-400 text-sm border rounded-lg bg-blue-50">
                Guarda la receta primero para agregar alérgenos
              </div>
            ) : allergens.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {allergens.map(a => (
                  <div key={a.id} className="bg-red-50 border border-red-200 rounded-lg px-3 py-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-red-800">{a.name}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAllergen(a.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 p-4 text-center text-gray-400 text-sm border rounded-lg bg-gray-50">
                Sin alérgenos registrados
              </div>
            )}

            {/* Add Item Modal */}
            {typeof document !== 'undefined' && showAddItem && !isCreate && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddItem(false)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Agregar Ingrediente</h2>

                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Producto *</label>
                      <select
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                      >
                        <option value="">Seleccionar...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-gray-800 mb-1">Cantidad *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedQuantity}
                        onChange={e => setSelectedQuantity(e.target.value)}
                        placeholder="Ej: 500"
                        className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAddItem(false)}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4" /> Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving || !selectedProductId || !selectedQuantity}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-cifp-blue rounded-lg hover:bg-cifp-blue-dark transition-colors disabled:opacity-60"
                      >
                        <Check className="w-4 h-4" /> {saving ? 'Agregando...' : 'Agregar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}


           </>
       </div>

       {typeof document !== 'undefined' && showAddAllergen && !isCreate && createPortal(
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddAllergen(false)}>
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
             <h2 className="text-lg font-bold text-gray-800 mb-4">Agregar Alérgeno</h2>

             <div className="space-y-4">
               <select
                 value=""
                 onChange={e => {
                   if (e.target.value) {
                     handleAddAllergen(e.target.value)
                     e.target.value = ""
                   }
                 }}
                 className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:ring-2 focus:ring-cifp-blue/30 outline-none"
               >
                 <option value="">Seleccionar alérgeno...</option>
                 {Object.entries(allergensByCategory).map(([category, categoryAllergens]) => (
                   <optgroup key={category} label={category}>
                     {categoryAllergens
                       .filter(a => !allergens.some(al => al.allergenName === a.name))
                       .map(a => (
                         <option key={a.id} value={a.id}>{a.name}</option>
                       ))}
                   </optgroup>
                 ))}
               </select>
             </div>

             <div className="flex justify-end gap-3 mt-6">
               <button
                 type="button"
                 onClick={() => setShowAddAllergen(false)}
                 className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
               >
                 <X className="w-4 h-4" /> Cancelar
               </button>
             </div>
           </div>
         </div>,
         document.body
       )}
       </>
    )
  }
