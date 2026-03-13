import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, AlertTriangle, Edit, X, Check, Trash2, Plus, Package, Image as ImageIcon, Box } from 'lucide-react'
import { Card } from '../../components/ui'
import { useAuth } from '../../contexts/AuthProvider'
import {
  getRecipeById,
  createRecipe,
  updateRecipe,
  addRecipeItem,
  deleteRecipeItem,
  getAllergens,
  addRecipeAllergen,
  deleteRecipeAllergen,
} from '../../services/recipes.service'
import apiFetch from '../../services/api'

const EMPTY_RECIPE = {
  name: '',
  restaurantName: '',
  categoryName: '',
  preparedAt: '',
  portionSize: '',
  servingsCount: 1,
  publicSalePrice: 0,
  taxPercent: 10,
  netSalePrice: 0,
  serviceTemperature: '',
  description: '',
  dishImageUrl: '',
  difficulty: 'FACIL',
  yieldQuantity: 1,
  yieldUnit: 'porciones',
  prepTime: 0,
  cookTime: 0,
  elaboration: '',
  presentation: '',
  requiredEquipment: '',
}

const ALLERGEN_MATRIX = [
  ['Gluten', 'Mostaza'],
  ['Crustaceos', 'Sulfitos'],
  ['Huevo', 'Sesamo'],
  ['Pescado', 'Moluscos'],
  ['Cacahuetes', 'Soja'],
  ['Lacteos', 'Frutos secos'],
  ['Apio', 'Altramuz'],
]

const DIFFICULTY_COLORS = {
  FACIL:   { bg: 'bg-green-600',  bgLight: 'bg-green-50',  text: 'text-green-700' },
  MEDIA:   { bg: 'bg-amber-500',  bgLight: 'bg-amber-50',  text: 'text-amber-700' },
  DIFICIL: { bg: 'bg-red-600',    bgLight: 'bg-red-50',    text: 'text-red-700' },
}

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const formatMoney = (value) => Number(value || 0).toFixed(2)

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Confirmar' }) {
  if (!open || typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
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
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [loading, setLoading] = useState(!isCreate)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(isCreate)

  const [showAddItem, setShowAddItem] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState('')

  const [showCreateProduct, setShowCreateProduct] = useState(false)
  const [createProductType, setCreateProductType] = useState('INGREDIENT')
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    unitType: 'KG',
    unitPrice: '',
    supplierId: '',
    categoryId: '',
  })

  const [availableAllergens, setAvailableAllergens] = useState([])

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    confirmText: 'Confirmar',
  })

  const [materialProducts, setMaterialProducts] = useState([])
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState('')
  const [selectedMaterialQuantity, setSelectedMaterialQuantity] = useState('')

  useEffect(() => {
    apiFetch('/recipes/ingredients')
      .then((res) => {
        const rows = res?.data ?? res
        setProducts(Array.isArray(rows) ? rows : [])
      })
      .catch(() => setProducts([]))

    apiFetch('/categories')
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setCategories(rows)
      })
      .catch(() => setCategories([]))

    apiFetch('/suppliers')
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setSuppliers(rows)
      })
      .catch(() => setSuppliers([]))

    getAllergens(100)
      .then((rows) => setAvailableAllergens(Array.isArray(rows) ? rows : []))
      .catch(() => setAvailableAllergens([]))

    apiFetch('/recipes/materials')
      .then((res) => {
        const rows = res?.data ?? res
        setMaterialProducts(Array.isArray(rows) ? rows : [])
      })
      .catch(() => setMaterialProducts([]))
  }, [])

  useEffect(() => {
    if (isCreate) {
      setRecipe(EMPTY_RECIPE)
      setItems([])
      setAllergens([])
      setLoading(false)
      setNotFound(false)
      return
    }

    setLoading(true)
    setNotFound(false)
    getRecipeById(id)
      .then((data) => {
        if (!data) {
          setNotFound(true)
          return
        }

        const merged = { ...EMPTY_RECIPE, ...data }
        const sale = Number(merged.publicSalePrice || 0)
        const tax = Number(merged.taxPercent || 0)
        if (!merged.netSalePrice && sale > 0) {
          merged.netSalePrice = Number((sale * (1 - tax / 100)).toFixed(2))
        }

        setRecipe(merged)
        setItems(Array.isArray(data.items) ? data.items : [])
        setAllergens(Array.isArray(data.allergens) ? data.allergens : [])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, isCreate])

  const refreshRecipeDetail = async () => {
    if (isCreate || !id) return
    const data = await getRecipeById(id)
    if (!data) return
    setRecipe((prev) => ({ ...prev, ...EMPTY_RECIPE, ...data }))
    setItems(Array.isArray(data.items) ? data.items : [])
    setAllergens(Array.isArray(data.allergens) ? data.allergens : [])
  }

  const askConfirm = ({ title, message, action, confirmText }) => {
    setConfirmState({
      open: true,
      title,
      message,
      action,
      confirmText: confirmText || 'Confirmar',
    })
  }

  const closeConfirm = () => {
    setConfirmState({ open: false, title: '', message: '', action: null, confirmText: 'Confirmar' })
  }

  const executeConfirm = async () => {
    const action = confirmState.action
    closeConfirm()
    if (typeof action === 'function') {
      await action()
    }
  }

  const handleChange = (field, value) => {
    setRecipe((prev) => ({ ...prev, [field]: value }))
  }

  const updateFinancialFields = (field, value) => {
    const numeric = Number(value || 0)
    if (field === 'publicSalePrice') {
      const tax = Number(recipe.taxPercent || 0)
      const net = numeric * (1 - tax / 100)
      setRecipe((prev) => ({ ...prev, publicSalePrice: numeric, netSalePrice: Number(net.toFixed(2)) }))
      return
    }

    if (field === 'taxPercent') {
      const sale = Number(recipe.publicSalePrice || 0)
      const net = sale * (1 - numeric / 100)
      setRecipe((prev) => ({ ...prev, taxPercent: numeric, netSalePrice: Number(net.toFixed(2)) }))
      return
    }

    setRecipe((prev) => ({ ...prev, [field]: numeric }))
  }

  const handleImageUpload = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen valido')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) return
      if (result.length > 550000) {
        alert('La imagen es demasiado grande. Usa una imagen de menor tamano.')
        return
      }
      handleChange('dishImageUrl', result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return

    setSaving(true)
    try {
      const payload = {
        name: recipe.name,
        restaurantName: recipe.restaurantName || null,
        categoryName: recipe.categoryName || null,
        preparedAt: recipe.preparedAt || null,
        portionSize: recipe.portionSize || null,
        servingsCount: Number(recipe.servingsCount) || 0,
        publicSalePrice: Number(recipe.publicSalePrice) || 0,
        taxPercent: Number(recipe.taxPercent) || 0,
        netSalePrice: Number(recipe.netSalePrice) || 0,
        serviceTemperature: recipe.serviceTemperature || null,
        description: recipe.description || null,
        dishImageUrl: recipe.dishImageUrl || null,
        difficulty: recipe.difficulty,
        yieldQuantity: Number(recipe.yieldQuantity) || 1,
        yieldUnit: recipe.yieldUnit || 'porciones',
        prepTime: Number(recipe.prepTime) || 0,
        cookTime: Number(recipe.cookTime) || 0,
        elaboration: recipe.elaboration || null,
        presentation: recipe.presentation || null,
        requiredEquipment: recipe.requiredEquipment || null,
      }

      if (isCreate) {
        const created = await createRecipe(payload)
        const createdId = created?.id || created?.data?.id
        if (createdId) {
          navigate(`/recipes/${createdId}`)
        } else {
          navigate('/recipes/full')
        }
      } else {
        await updateRecipe(id, payload)
        await refreshRecipeDetail()
        setIsEditMode(false)
      }
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al guardar la receta')
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
      await refreshRecipeDetail()
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al agregar ingrediente')
    } finally {
      setSaving(false)
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    if (!selectedMaterialId || !selectedMaterialQuantity) return

    setSaving(true)
    try {
      await addRecipeItem(id, {
        productId: selectedMaterialId,
        quantity: Number(selectedMaterialQuantity),
      })
      setShowAddMaterial(false)
      setSelectedMaterialId('')
      setSelectedMaterialQuantity('')
      await refreshRecipeDetail()
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al agregar material')
    } finally {
      setSaving(false)
    }
  }

  const askDeleteItem = (itemId) => {
    askConfirm({
      title: 'Eliminar ingrediente',
      message: 'Esta accion eliminara el ingrediente del escandallo de la receta.',
      confirmText: 'Eliminar',
      action: async () => {
        try {
          await deleteRecipeItem(id, itemId)
          await refreshRecipeDetail()
        } catch (err) {
          alert(err?.body?.message || err.message || 'Error al eliminar ingrediente')
        }
      },
    })
  }

  const findAllergenByName = (name) => {
    const normalized = normalizeText(name)
    return availableAllergens.find((allergen) => normalizeText(allergen.name) === normalized)
  }

  const isAllergenChecked = (name) => {
    const normalized = normalizeText(name)
    return allergens.some((row) => normalizeText(row.name || row.allergenName) === normalized)
  }

  const toggleAllergen = async (name) => {
    if (isCreate) return
    const normalized = normalizeText(name)
    const current = allergens.find((row) => normalizeText(row.name || row.allergenName) === normalized)

    if (current) {
      askConfirm({
        title: 'Quitar alergeno',
        message: `Se quitara ${name} de la matriz de alergenos de la receta.`,
        confirmText: 'Quitar',
        action: async () => {
          try {
            await deleteRecipeAllergen(id, current.id)
            await refreshRecipeDetail()
          } catch (err) {
            alert(err?.body?.message || err.message || 'Error al quitar alergeno')
          }
        },
      })
      return
    }

    const allergen = findAllergenByName(name)
    if (!allergen) {
      alert(`No existe el alergeno ${name} en catalogo. Crealo primero en administracion.`)
      return
    }

    try {
      await addRecipeAllergen(id, allergen.id)
      await refreshRecipeDetail()
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al agregar alergeno')
    }
  }

  const selectAllAllergens = async () => {
    if (isCreate) return

    const matrixNames = ALLERGEN_MATRIX.flat()
    const missing = matrixNames
      .filter((name) => !isAllergenChecked(name))
      .map((name) => ({ name, allergen: findAllergenByName(name) }))

    const notFound = missing.filter((row) => !row.allergen).map((row) => row.name)
    if (notFound.length > 0) {
      alert(`No existen en catalogo: ${notFound.join(', ')}`)
      return
    }

    try {
      await Promise.all(missing.map((row) => addRecipeAllergen(id, row.allergen.id)))
      await refreshRecipeDetail()
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al seleccionar todos los alergenos')
    }
  }

  const deselectAllAllergens = async () => {
    if (isCreate) return

    const matrixSet = new Set(ALLERGEN_MATRIX.flat().map((name) => normalizeText(name)))
    const present = allergens.filter((row) => matrixSet.has(normalizeText(row.name || row.allergenName)))

    try {
      await Promise.all(present.map((row) => deleteRecipeAllergen(id, row.id)))
      await refreshRecipeDetail()
    } catch (err) {
      alert(err?.body?.message || err.message || 'Error al deseleccionar todos los alergenos')
    }
  }

  const createIngredientProduct = async () => {
    const normalizedType = normalizeText(createProductType)
    const isMaterialType = normalizedType === 'material'
    const payload = {
      code: productForm.code.trim(),
      name: productForm.name.trim(),
      productType: isMaterialType ? 'MATERIAL' : 'INGREDIENT',
      unitType: productForm.unitType.trim(),
      unitPrice: Number(productForm.unitPrice),
      supplierId: productForm.supplierId,
      categoryId: productForm.categoryId,
    }

    if (!payload.code || !payload.name || !payload.unitType || !payload.supplierId || !payload.categoryId) {
      alert('Completa todos los campos del producto')
      return
    }

    if (Number.isNaN(payload.unitPrice) || payload.unitPrice < 0) {
      alert('El precio debe ser un numero valido')
      return
    }

    setSaving(true)
    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (isMaterialType) {
        const mats = await apiFetch('/recipes/materials')
        const rows = Array.isArray(mats?.data) ? mats.data : Array.isArray(mats) ? mats : []
        setMaterialProducts(rows)
        const created = rows.find((row) => normalizeText(row.code) === normalizeText(payload.code))
        if (created) {
          setSelectedMaterialId(created.id)
        }
      } else {
        const prods = await apiFetch('/recipes/ingredients')
        const rows = Array.isArray(prods?.data) ? prods.data : Array.isArray(prods) ? prods : []
        setProducts(rows)
        const created = rows.find((row) => normalizeText(row.code) === normalizeText(payload.code))
        if (created) {
          setSelectedProductId(created.id)
        }
      }

      setShowCreateProduct(false)
      setProductForm({
        code: '',
        name: '',
        unitType: 'KG',
        unitPrice: '',
        supplierId: '',
        categoryId: '',
      })
    } catch (err) {
      alert(err?.body?.message || err.message || `Error al crear ${isMaterialType ? 'material' : 'ingrediente'}`)
    } finally {
      setSaving(false)
    }
  }

  const lineItems = useMemo(() => {
    return items.map((item) => {
      const quantity = Number(item.quantity || 0)
      const unitPrice = Number(item.unitPrice || 0)
      const lineCost = quantity * unitPrice
      return { ...item, quantity, unitPrice, lineCost }
    })
  }, [items])

  const ingredientLineItems = useMemo(
    () => lineItems.filter((item) => (item.product?.productType ?? 'INGREDIENT') !== 'MATERIAL'),
    [lineItems],
  )
  const materialLineItems = useMemo(
    () => lineItems.filter((item) => item.product?.productType === 'MATERIAL'),
    [lineItems],
  )

  const ingredientSubtotal = useMemo(
    () => ingredientLineItems.reduce((sum, item) => sum + item.lineCost, 0),
    [ingredientLineItems],
  )
  const materialSubtotal = useMemo(
    () => materialLineItems.reduce((sum, item) => sum + item.lineCost, 0),
    [materialLineItems],
  )
  const totalCost = useMemo(() => ingredientSubtotal + materialSubtotal, [ingredientSubtotal, materialSubtotal])

  const costPerPerson = useMemo(() => {
    const servings = Number(recipe.servingsCount || 1)
    return servings > 0 ? totalCost / servings : totalCost
  }, [totalCost, recipe.servingsCount])

  const recipeCostPercent = useMemo(() => {
    const net = Number(recipe.netSalePrice || 0)
    if (!net) return 0
    return (totalCost / net) * 100
  }, [recipe.netSalePrice, totalCost])

  const marginPercent = useMemo(() => {
    const net = Number(recipe.netSalePrice || 0)
    if (!net) return 0
    return ((net - totalCost) / net) * 100
  }, [recipe.netSalePrice, totalCost])

  const selectedProduct = useMemo(() => products.find((product) => product.id === selectedProductId), [products, selectedProductId])
  const selectedMaterial = useMemo(() => materialProducts.find((m) => m.id === selectedMaterialId), [materialProducts, selectedMaterialId])
  const createProductCategories = useMemo(() => {
    const targetType = normalizeText(createProductType)
    return categories.filter((category) => {
      const categoryType = normalizeText(category.productType)
      if (!categoryType) return true
      return categoryType === targetType
    })
  }, [categories, createProductType])
  const diffColor = DIFFICULTY_COLORS[recipe.difficulty] || DIFFICULTY_COLORS.FACIL
  const labelCls = `${diffColor.bgLight} ${diffColor.text} px-2 py-1 text-xs font-bold uppercase`

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-sm text-gray-500">Cargando receta...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="font-medium text-gray-700">Receta no encontrada.</p>
        <button
          onClick={() => navigate('/recipes/full')}
          className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
        >
          Volver
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-4 pb-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/recipes/full')}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <h1 className="truncate text-center text-xl font-extrabold uppercase tracking-wide text-gray-900 md:text-2xl">
            {isCreate ? 'Nueva receta' : recipe.name || 'Ficha tecnica'}
          </h1>

          {isAdmin && !isCreate ? (
            <button
              type="button"
              onClick={() => setIsEditMode((prev) => !prev)}
              className="flex items-center gap-1 rounded-lg bg-cifp-blue px-3 py-2 text-xs font-semibold text-white hover:bg-cifp-blue-dark"
            >
              <Edit className="h-3 w-3" />
              {isEditMode ? 'Bloquear' : 'Editar'}
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="overflow-hidden border border-gray-300">
            <div className={`${diffColor.bg} px-4 py-2 text-center text-2xl font-black uppercase text-white`}>
              Ficha tecnica de receta
            </div>

            <div className="grid grid-cols-1 gap-3 bg-white p-3 md:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-gray-300 p-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className={labelCls}>Restaurante</label>
                  <input
                    value={recipe.restaurantName || ''}
                    onChange={(e) => handleChange('restaurantName', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Fecha</label>
                  <input
                    type="date"
                    value={recipe.preparedAt || ''}
                    onChange={(e) => handleChange('preparedAt', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Tamano racion</label>
                  <input
                    value={recipe.portionSize || ''}
                    onChange={(e) => handleChange('portionSize', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Numero raciones</label>
                  <input
                    type="number"
                    min="0"
                    value={recipe.servingsCount || 0}
                    onChange={(e) => updateFinancialFields('servingsCount', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Tiempo preparacion</label>
                  <input
                    type="number"
                    min="0"
                    value={recipe.prepTime || 0}
                    onChange={(e) => handleChange('prepTime', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Tiempo coccion</label>
                  <input
                    type="number"
                    min="0"
                    value={recipe.cookTime || 0}
                    onChange={(e) => handleChange('cookTime', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Temperatura servicio</label>
                  <input
                    value={recipe.serviceTemperature || ''}
                    onChange={(e) => handleChange('serviceTemperature', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-gray-300 p-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className={labelCls}>Categoria</label>
                  <input
                    value={recipe.categoryName || ''}
                    onChange={(e) => handleChange('categoryName', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Precio venta publico</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={recipe.publicSalePrice || 0}
                    onChange={(e) => updateFinancialFields('publicSalePrice', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Impuestos %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={recipe.taxPercent || 0}
                    onChange={(e) => updateFinancialFields('taxPercent', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Precio venta neto</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={recipe.netSalePrice || 0}
                    onChange={(e) => updateFinancialFields('netSalePrice', e.target.value)}
                    disabled={!isEditMode || !isAdmin}
                    className="border px-2 py-1 text-sm"
                  />

                  <label className={labelCls}>Costo total receta</label>
                  <div className="border px-2 py-1 text-sm font-bold">{formatMoney(totalCost)}</div>

                  <label className={labelCls}>% Costo receta</label>
                  <div className="border px-2 py-1 text-sm font-bold">{recipeCostPercent.toFixed(2)}%</div>

                  <label className={labelCls}>Margen beneficio neto</label>
                  <div className="border px-2 py-1 text-sm font-bold">{marginPercent.toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-300 p-0">
            <div className={`flex items-center justify-between ${diffColor.bg} px-3 py-2`}>
              <h2 className="text-sm font-black uppercase text-white">Ingredientes</h2>
              {!isCreate && isAdmin && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateProductType('INGREDIENT')
                      setShowCreateProduct(true)
                    }}
                    className="rounded bg-white/20 px-2 py-1 text-xs font-bold text-white hover:bg-white/30"
                  >
                    Crear producto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddItem(true)}
                    className="rounded bg-white/20 px-2 py-1 text-xs font-bold text-white hover:bg-white/30"
                  >
                    Agregar ingrediente
                  </button>
                </div>
              )}
            </div>

            {ingredientLineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-[960px] w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-2 text-left uppercase">Ingrediente usado</th>
                      <th className="border px-2 py-2 text-left uppercase">Unidad</th>
                      <th className="border px-2 py-2 text-right uppercase">Cantidad</th>
                      <th className="border px-2 py-2 text-right uppercase">Coste unidad</th>
                      <th className="border px-2 py-2 text-right uppercase">Porcentaje coste</th>
                      <th className="border px-2 py-2 text-right uppercase">Coste total</th>
                      <th className="border px-2 py-2 text-right uppercase">Coste real</th>
                      {isAdmin && <th className="border px-2 py-2 text-center uppercase">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientLineItems.map((item) => {
                      const percentage = ingredientSubtotal > 0 ? (item.lineCost / ingredientSubtotal) * 100 : 0
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border px-2 py-2 font-semibold">{item.product?.name || '-'}</td>
                          <td className="border px-2 py-2">{item.product?.unitType || '-'}</td>
                          <td className="border px-2 py-2 text-right font-mono">{item.quantity.toFixed(3)}</td>
                          <td className="border px-2 py-2 text-right font-mono">{formatMoney(item.unitPrice)}</td>
                          <td className="border px-2 py-2 text-right font-mono">{percentage.toFixed(2)}%</td>
                          <td className="border px-2 py-2 text-right font-mono">{formatMoney(item.lineCost)}</td>
                          <td className="border px-2 py-2 text-right font-mono">{formatMoney(item.lineCost)}</td>
                          {isAdmin && (
                            <td className="border px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => askDeleteItem(item.id)}
                                className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={5} className="border px-2 py-2 text-right text-xs uppercase">Subtotal ingredientes</td>
                      <td className="border px-2 py-2 text-right font-mono">{formatMoney(ingredientSubtotal)}</td>
                      <td className="border px-2 py-2 text-right font-mono">{formatMoney(ingredientSubtotal)}</td>
                      {isAdmin && <td className="border px-2 py-2" />}
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">No hay ingredientes en el escandallo.</div>
            )}
          </Card>

          <Card className="border border-gray-300 p-0">
            <div className={`flex items-center justify-between ${diffColor.bg} px-3 py-2`}>
              <h2 className="text-sm font-black uppercase text-white">Materiales</h2>
              {!isCreate && isAdmin && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateProductType('MATERIAL')
                      setShowCreateProduct(true)
                    }}
                    className="rounded bg-white/20 px-2 py-1 text-xs font-bold text-white hover:bg-white/30"
                  >
                    Crear material
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMaterial(true)}
                    className="rounded bg-white/20 px-2 py-1 text-xs font-bold text-white hover:bg-white/30"
                  >
                    Agregar material
                  </button>
                </div>
              )}
            </div>

            {materialLineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-[960px] w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-2 text-left uppercase">Material usado</th>
                      <th className="border px-2 py-2 text-left uppercase">Unidad</th>
                      <th className="border px-2 py-2 text-right uppercase">Cantidad</th>
                      <th className="border px-2 py-2 text-right uppercase">Coste unidad</th>
                      <th className="border px-2 py-2 text-right uppercase">Porcentaje coste</th>
                      <th className="border px-2 py-2 text-right uppercase">Coste total</th>
                      <th className="border px-2 py-2 text-right uppercase">Coste real</th>
                      {isAdmin && <th className="border px-2 py-2 text-center uppercase">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {materialLineItems.map((item) => {
                      const percentage = materialSubtotal > 0 ? (item.lineCost / materialSubtotal) * 100 : 0
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border px-2 py-2 font-semibold">{item.product?.name || '-'}</td>
                          <td className="border px-2 py-2">{item.product?.unitType || '-'}</td>
                          <td className="border px-2 py-2 text-right font-mono">{item.quantity.toFixed(3)}</td>
                          <td className="border px-2 py-2 text-right font-mono">{formatMoney(item.unitPrice)}</td>
                          <td className="border px-2 py-2 text-right font-mono">{percentage.toFixed(2)}%</td>
                          <td className="border px-2 py-2 text-right font-mono">{formatMoney(item.lineCost)}</td>
                          <td className="border px-2 py-2 text-right font-mono">{formatMoney(item.lineCost)}</td>
                          {isAdmin && (
                            <td className="border px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => askDeleteItem(item.id)}
                                className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={5} className="border px-2 py-2 text-right text-xs uppercase">Subtotal materiales</td>
                      <td className="border px-2 py-2 text-right font-mono">{formatMoney(materialSubtotal)}</td>
                      <td className="border px-2 py-2 text-right font-mono">{formatMoney(materialSubtotal)}</td>
                      {isAdmin && <td className="border px-2 py-2" />}
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">No hay materiales en el escandallo.</div>
            )}
          </Card>

          <Card className="border border-gray-300 p-0">
            <div className={`${diffColor.bg} px-3 py-2 text-sm font-black uppercase text-white`}>
              Resumen de costos
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="p-4 text-center">
                <div className={`mb-1 text-xs font-bold uppercase ${diffColor.text}`}>Costo por persona</div>
                <div className="text-2xl font-mono font-bold text-gray-800">{formatMoney(costPerPerson)} €</div>
                <div className="mt-1 text-xs text-gray-500">{recipe.servingsCount || 1} ración/es</div>
              </div>
              <div className="p-4 text-center">
                <div className={`mb-1 text-xs font-bold uppercase ${diffColor.text}`}>Costo total receta</div>
                <div className="text-2xl font-mono font-bold text-gray-800">{formatMoney(totalCost)} €</div>
                <div className="mt-1 text-xs text-gray-500">{formatMoney(ingredientSubtotal)} ing. + {formatMoney(materialSubtotal)} mat.</div>
              </div>
              <div className="p-4 text-center">
                <div className={`mb-1 text-xs font-bold uppercase ${diffColor.text}`}>Costo total real</div>
                <div className="text-2xl font-mono font-bold text-gray-800">{formatMoney(totalCost)} €</div>
                <div className="mt-1 text-xs text-gray-500">basado en unidades reales</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="space-y-3 border border-gray-300 p-0">
              <div className={`${diffColor.bg} px-3 py-2 text-xs font-black uppercase text-white`}>Elaboracion</div>
              <textarea
                value={recipe.elaboration || ''}
                onChange={(e) => handleChange('elaboration', e.target.value)}
                disabled={!isEditMode || !isAdmin}
                rows="7"
                className="mx-3 mb-3 mt-0 w-[calc(100%-1.5rem)] border px-3 py-2 text-sm"
              />

              <div className={`${diffColor.bg} px-3 py-2 text-xs font-black uppercase text-white`}>Presentacion</div>
              <textarea
                value={recipe.presentation || ''}
                onChange={(e) => handleChange('presentation', e.target.value)}
                disabled={!isEditMode || !isAdmin}
                rows="4"
                className="mx-3 mb-3 mt-0 w-[calc(100%-1.5rem)] border px-3 py-2 text-sm"
              />

              <div className={`${diffColor.bg} px-3 py-2 text-xs font-black uppercase text-white`}>Equipo necesario</div>
              <textarea
                value={recipe.requiredEquipment || ''}
                onChange={(e) => handleChange('requiredEquipment', e.target.value)}
                disabled={!isEditMode || !isAdmin}
                rows="3"
                className="mx-3 mb-3 mt-0 w-[calc(100%-1.5rem)] border px-3 py-2 text-sm"
              />
            </Card>

            <Card className="space-y-3 border border-gray-300 p-0">
              <div className={`${diffColor.bg} px-3 py-2 text-xs font-black uppercase text-white`}>Imagen del plato</div>
              <div className="px-3">
                {recipe.dishImageUrl ? (
                  <img src={recipe.dishImageUrl} alt="Plato" className="h-64 w-full rounded border object-cover" />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center rounded border border-dashed text-sm text-gray-400">
                    <ImageIcon className="mr-2 h-4 w-4" /> Sin imagen
                  </div>
                )}

                {isEditMode && isAdmin && (
                  <div className="mb-3 mt-2 flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} className="text-xs" />
                    {recipe.dishImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          askConfirm({
                            title: 'Quitar imagen',
                            message: 'Se eliminara la imagen del plato para esta receta.',
                            confirmText: 'Quitar',
                            action: () => handleChange('dishImageUrl', ''),
                          })
                        }
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-between ${diffColor.bg} px-3 py-2`}>
                <div className="text-xs font-black uppercase text-white">Alergenos</div>
                {!isCreate && isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllAllergens}
                      className="rounded bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-white/30"
                    >
                      Seleccionar todos
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllAllergens}
                      className="rounded bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-white/30"
                    >
                      Deseleccionar todos
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-0 border-t border-l border-gray-300">
                {ALLERGEN_MATRIX.flat().map((allergenName) => {
                  const checked = isAllergenChecked(allergenName)
                  return (
                    <label
                      key={allergenName}
                      className="flex items-center gap-2 border-r border-b border-gray-300 bg-white px-2 py-2 text-xs font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAllergen(allergenName)}
                        disabled={isCreate || !isAdmin}
                        className="h-4 w-4"
                      />
                      <span>{allergenName}</span>
                    </label>
                  )
                })}
              </div>
            </Card>
          </div>

          {isAdmin && isEditMode && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-cifp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-cifp-blue-dark disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar ficha'}
              </button>
            </div>
          )}
        </form>
      </div>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        onConfirm={executeConfirm}
        onCancel={closeConfirm}
      />

      {typeof document !== 'undefined' && showAddItem && !isCreate && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddItem(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-gray-800">Agregar ingrediente</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="rounded border bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  Unidad: {selectedProduct.unitType || '-'} | Coste unidad: {formatMoney(selectedProduct.unitPrice)}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedProductId || !selectedQuantity}
                  className="rounded-lg bg-cifp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-cifp-blue-dark disabled:opacity-60"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}

      {typeof document !== 'undefined' && showAddMaterial && !isCreate && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddMaterial(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-gray-800">Agregar material</h2>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Material</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {materialProducts.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMaterial && (
                <div className="rounded border bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  Unidad: {selectedMaterial.unitType || '-'} | Coste unidad: {formatMoney(selectedMaterial.unitPrice)}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={selectedMaterialQuantity}
                  onChange={(e) => setSelectedMaterialQuantity(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddMaterial(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedMaterialId || !selectedMaterialQuantity}
                  className="rounded-lg bg-cifp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-cifp-blue-dark disabled:opacity-60"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}

      {typeof document !== 'undefined' && showCreateProduct && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowCreateProduct(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <Box className="h-5 w-5" /> Crear producto {normalizeText(createProductType) === 'material' ? 'material' : 'ingrediente'}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Codigo</label>
                <input
                  value={productForm.code}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Unidad</label>
                <input
                  value={productForm.unitType}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, unitType: e.target.value }))}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Nombre</label>
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Precio unidad</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.unitPrice}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, unitPrice: e.target.value }))}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Categoria</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {createProductCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase text-gray-700">Proveedor</label>
                <select
                  value={productForm.supplierId}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, supplierId: e.target.value }))}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateProduct(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={createIngredientProduct}
                disabled={saving}
                className="rounded-lg bg-cifp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-cifp-blue-dark disabled:opacity-60"
              >
                {saving ? 'Creando...' : `Crear ${normalizeText(createProductType) === 'material' ? 'material' : 'ingrediente'}`}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

