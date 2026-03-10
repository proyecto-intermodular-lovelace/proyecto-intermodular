export const STATUS_LABELS = {
  DRAFT:     'Borrador',
  SUBMITTED: 'Enviado',
  APPROVED:  'Aprobado',
  MERGED:    'Consolidado',
  ORDERED:   'Pedido',
  RECEIVED:  'Recibido',
  CANCELLED: 'Cancelado',
}

export const STATUS_COLORS = {
  DRAFT:     'bg-yellow-100 text-yellow-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPROVED:  'bg-green-100 text-green-800',
  MERGED:    'bg-purple-100 text-purple-800',
  ORDERED:   'bg-indigo-100 text-indigo-800',
  RECEIVED:  'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

/** Returns Monday of the week containing the given date.
 * Accepts a Date object or a YYYY-MM-DD string safely. */
export function getMonday(date = new Date()) {
  // Add noon time when given a bare date string to avoid UTC-offset day shifting
  const d = typeof date === 'string' && date.length === 10
    ? new Date(date + 'T12:00:00')
    : new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
