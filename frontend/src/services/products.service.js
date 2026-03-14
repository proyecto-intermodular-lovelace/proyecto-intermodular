/**
 * products.service.js
 * Capa de servicio que conecta el frontend con el backend real.
 * Normaliza los campos del schema real de la BD a los nombres que
 * usan las páginas (nombre, sku, precio, unidad, etc.).
 */

import apiFetch from './api'

// ── Normalización ──────────────────────────────────────────────────────────

/**
 * Convierte un producto de la API (schema real) al formato que usan las páginas.
 * Schema real:  { code, name, productType, unitType, unitPrice, isActive, yieldPercent, relation }
 * Formato UI:   { sku, nombre, categoria, unidad, precio, activo, rendimiento, relation, ... }
 */
function normalize(p) {
    return {
        id: p.id,
        sku: p.code ?? '',
        nombre: p.name ?? '',
        categoria: p.category?.name ?? '',
        categoryId: p.categoryId ?? p.category?.id ?? '',
        productType: p.productType ?? '',
        unidad: p.unitType ?? '',
        precio: parseFloat(p.unitPrice) || 0,
        rendimiento: parseFloat(p.yieldPercent) || 0,
        relation: parseFloat(p.relation) || 0,
        activo: p.isActive ?? true,
        stock: parseInt(p.stock) || 0,
        stockMinimo: parseInt(p.stockMinimo) || 0,
        proveedor: p.supplier?.nombre ?? '',
        supplierId: p.supplierId ?? p.supplier?.id ?? '',
        descripcion: p.description ?? '',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
    }
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * Obtiene ingredientes paginados del backend.
 * @param {number} limit  - máx registros (default 2000 para cargar todo)
 * @param {number} page   - página (default 1)
 */
export async function getIngredients(limit = 2000, page = 1) {
    const res = await apiFetch(`/products?type=INGREDIENT&limit=${limit}&page=${page}`)
    const items = res?.data ?? res
    return Array.isArray(items) ? items.map(normalize) : []
}

/**
 * Obtiene materiales paginados del backend.
 */
export async function getMaterials(limit = 2000, page = 1) {
    const res = await apiFetch(`/products?type=MATERIAL&limit=${limit}&page=${page}`)
    const items = res?.data ?? res
    return Array.isArray(items) ? items.map(normalize) : []
}

/**
 * Obtiene todos los productos (ingredientes + materiales).
 */
export async function getAllProducts(limit = 2000, page = 1) {
    const res = await apiFetch(`/products?limit=${limit}&page=${page}`)
    const items = res?.data ?? res
    return Array.isArray(items) ? items.map(normalize) : []
}

/**
 * Obtiene un producto por ID.
 * @param {string} id - UUID del producto
 */
export async function getProductById(id) {
    const p = await apiFetch(`/products/${id}`)
    return p ? normalize(p) : null
}

/**
 * Obtiene un producto por su SKU/Código (usa el endpoint backend /products/sku/:sku)
 * Devuelve null si no existe.
 */
export async function getProductBySku(sku) {
    try {
        const p = await apiFetch(`/products/sku/${encodeURIComponent(sku)}`)
        return p ? normalize(p) : null
    } catch (err) {
        // Not found or other error
        return null
    }
}

/**
 * Devuelve categorías únicas de una lista de productos normalizados.
 * Compatibilidad con uso anterior de getCategories() del mock.
 */
export function getCategories(products = []) {
    return [...new Set(products.map(p => p.categoria))].filter(Boolean).sort()
}

/**
 * Devuelve proveedores únicos (actualmente supplierId, mejora futura con join).
 */
export function getSuppliers(products = []) {
    return [...new Set(products.map(p => p.proveedor))].filter(Boolean).sort()
}
