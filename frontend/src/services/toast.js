// Minimal toast utility that appends a transient message to document.body
export default function showToast(message, type = 'success', duration = 3000) {
  if (typeof document === 'undefined') return
  const id = `toast-${Date.now()}`
  const el = document.createElement('div')
  el.id = id
  el.className = `fixed bottom-6 right-6 z-[9999] max-w-sm px-4 py-2 rounded-lg shadow-lg text-sm ${type === 'error' ? 'bg-red-600 text-white' : 'bg-cifp-blue text-white'}`
  el.style.transition = 'opacity 200ms ease'
  el.style.opacity = '0'
  el.innerText = message
  document.body.appendChild(el)
  // trigger fade in
  requestAnimationFrame(() => { el.style.opacity = '1' })
  setTimeout(() => {
    el.style.opacity = '0'
    setTimeout(() => { try { document.body.removeChild(el) } catch (e) {} }, 220)
  }, duration)
}
