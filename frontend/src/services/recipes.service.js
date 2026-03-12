/**
 * recipes.service.js
 * Capa de servicio que conecta el frontend con el backend de recetas.
 * Normaliza y proporciona funciones de alto nivel para acceder a recetas.
 */

import apiFetch from './api'

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * Obtiene recetas paginadas del backend.
 * @param {number} limit  - máx registros (default 2000 para cargar todo)
 * @param {number} page   - página (default 1)
 * @returns {Promise<Array>} Array de recetas
 */
export async function getRecipes(limit = 2000, page = 1) {
    try {
        const res = await apiFetch(`/recipes?limit=${limit}&page=${page}`)
        const items = res?.data ?? res
        return Array.isArray(items) ? items : []
    } catch (err) {
        console.error('Error fetching recipes:', err)
        return []
    }
}

/**
 * Obtiene una receta por ID con todos sus detalles e ingredientes.
 * @param {string} id - UUID de la receta
 * @returns {Promise<Object|null>} Objeto receta o null si no existe
 */
export async function getRecipeById(id) {
    try {
        const recipe = await apiFetch(`/recipes/${id}`)
        return recipe ?? null
    } catch (err) {
        console.error(`Error fetching recipe ${id}:`, err)
        return null
    }
}

/**
 * Crea una nueva receta.
 * @param {Object} payload - Datos de la receta { name, description, difficulty, yieldQuantity, yieldUnit, prepTime, cookTime }
 * @returns {Promise<Object>} Receta creada con ID
 */
export async function createRecipe(payload) {
    return apiFetch('/recipes', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Actualiza una receta existente.
 * @param {string} id - UUID de la receta
 * @param {Object} payload - Campos a actualizar
 * @returns {Promise<Object>} Receta actualizada
 */
export async function updateRecipe(id, payload) {
    return apiFetch(`/recipes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

/**
 * Elimina una receta.
 * @param {string} id - UUID de la receta
 * @returns {Promise<void>}
 */
export async function deleteRecipe(id) {
    return apiFetch(`/recipes/${id}`, { method: 'DELETE' })
}

/**
 * Agrega un ingrediente a una receta.
 * @param {string} recipeId - UUID de la receta
 * @param {Object} payload - { productId, quantity }
 * @returns {Promise<Object>} Receta actualizada
 */
export async function addRecipeItem(recipeId, payload) {
    return apiFetch(`/recipes/${recipeId}/items`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Elimina un ingrediente de una receta.
 * @param {string} recipeId - UUID de la receta
 * @param {string} itemId - UUID del item/ingrediente
 * @returns {Promise<Object>} Receta actualizada
 */
export async function deleteRecipeItem(recipeId, itemId) {
    return apiFetch(`/recipes/${recipeId}/items/${itemId}`, { method: 'DELETE' })
}
