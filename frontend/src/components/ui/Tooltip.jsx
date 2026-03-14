import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle } from 'lucide-react'

/**
 * Tooltip — lightweight tooltip that can wrap any element or render as an inline help icon.
 *
 * Usage:
 *   <Tooltip text="Explanation here">
 *     <button>Action</button>
 *   </Tooltip>
 *
 *   <Tooltip text="Explanation here" asIcon />        ← renders a small (?) icon
 *   <Tooltip text="..." position="bottom" asIcon />   ← position: top | bottom | left | right
 */
export default function Tooltip({ children, text, position = 'top', asIcon = false, iconClassName = '' }) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    if (!visible || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const tooltip = tooltipRef.current
    const tw = tooltip?.offsetWidth ?? 0
    const th = tooltip?.offsetHeight ?? 0
    const gap = 8

    let top, left
    switch (position) {
      case 'bottom':
        top = rect.bottom + gap
        left = rect.left + rect.width / 2 - tw / 2
        break
      case 'left':
        top = rect.top + rect.height / 2 - th / 2
        left = rect.left - tw - gap
        break
      case 'right':
        top = rect.top + rect.height / 2 - th / 2
        left = rect.right + gap
        break
      default: // top
        top = rect.top - th - gap
        left = rect.left + rect.width / 2 - tw / 2
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8))
    top = Math.max(8, Math.min(top, window.innerHeight - th - 8))

    setCoords({ top, left })
  }, [visible, position])

  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  const trigger = asIcon ? (
    <span
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      className={`inline-flex items-center cursor-help text-gray-400 hover:text-gray-600 transition-colors ${iconClassName}`}
      aria-label={text}
    >
      <HelpCircle className="w-3.5 h-3.5" />
    </span>
  ) : (
    <span
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="inline-flex"
    >
      {children}
    </span>
  )

  return (
    <>
      {trigger}
      {visible && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{ position: 'fixed', top: coords.top, left: coords.left, zIndex: 9999 }}
          className="pointer-events-none max-w-xs px-3 py-2 text-xs leading-relaxed text-white bg-gray-900 rounded-lg shadow-lg"
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  )
}
