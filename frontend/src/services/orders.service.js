import { apiFetch } from './api'

/** Retrieve paginated orders. Role-filtered on backend. */
export async function getOrders({ page = 1, limit = 20, status } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  return apiFetch(`/orders?${params}`)
}

/** Get a single order by id */
export async function getOrder(id) {
  return apiFetch(`/orders/${id}`)
}

/** Create a new order (with optional items array) */
export async function createOrder({ weekStart, classId, notes, items = [] }) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({ weekStart, classId, notes, items }),
  })
}

/** Student submits their draft to the teacher */
export async function submitOrder(id) {
  return apiFetch(`/orders/${id}/submit`, { method: 'PATCH' })
}

/** Teacher approves a submitted order */
export async function approveOrder(id) {
  return apiFetch(`/orders/${id}/approve`, { method: 'PATCH' })
}

/** Teacher rejects a submitted order */
export async function rejectOrder(id) {
  return apiFetch(`/orders/${id}/reject`, { method: 'PATCH' })
}

/** Student cancels their draft */
export async function cancelOrder(id) {
  return apiFetch(`/orders/${id}/cancel`, { method: 'PATCH' })
}

/** Superadmin consolidates approved orders into one combined purchase order */
export async function consolidateOrders({ orderIds, weekStart, supplierId }) {
  return apiFetch('/orders/consolidate', {
    method: 'POST',
    body: JSON.stringify({ orderIds, weekStart, supplierId }),
  })
}

/**
 * Superadmin edits any order: status, weekStart, items list, etc.
 * body: { status?, weekStart?, supplierId?, notes?, items?: [{productId, qtyRequested, qtyApproved?, notes?}] }
 */
export async function updateOrder(id, body) {
  return apiFetch(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/** Superadmin deletes an order */
export async function deleteOrder(id) {
  return apiFetch(`/orders/${id}`, { method: 'DELETE' })
}

/** Fetch product list (used in order item form) */
export async function getProducts({ page = 1, limit = 100, search, type } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (search) params.set('search', search)
  if (type) params.set('productType', type)
  return apiFetch(`/products?${params}`)
}
