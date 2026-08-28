import { useRef, useState } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 4

// Простой pinch-to-zoom + панорамирование на Pointer Events — без библиотек.
// Два пальца — масштаб (по изменению расстояния между ними), один палец
// при увеличенном масштабе — перетаскивание. touchAction: 'none' на
// контейнере не даёт браузеру перехватить жест как скролл страницы.
export default function ZoomableImage({ src, alt }) {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [smooth, setSmooth] = useState(false)
  const pointersRef = useRef(new Map())
  const pinchRef = useRef(null)
  const panRef = useRef(null)

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

  const onPointerDown = (e) => {
    e.stopPropagation()
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {
      /* браузер может не считать указатель активным — жест всё равно продолжаем ловить вручную */
    }
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    setSmooth(false)

    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()]
      pinchRef.current = {
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
        startScale: transform.scale,
      }
      panRef.current = null
    } else if (pointersRef.current.size === 1 && transform.scale > 1) {
      const [p] = [...pointersRef.current.values()]
      panRef.current = { startX: p.x, startY: p.y, originX: transform.x, originY: transform.y }
    }
  }

  const onPointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size === 2 && pinchRef.current) {
      e.preventDefault()
      const [a, b] = [...pointersRef.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const nextScale = clamp(pinchRef.current.startScale * (dist / pinchRef.current.startDist), MIN_SCALE, MAX_SCALE)
      setTransform((t) => ({ ...t, scale: nextScale }))
    } else if (pointersRef.current.size === 1 && panRef.current && transform.scale > 1) {
      e.preventDefault()
      const dx = e.clientX - panRef.current.startX
      const dy = e.clientY - panRef.current.startY
      setTransform((t) => ({ ...t, x: panRef.current.originX + dx, y: panRef.current.originY + dy }))
    }
  }

  const endPointer = (e) => {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) pinchRef.current = null
    if (pointersRef.current.size === 0) {
      panRef.current = null
      if (transform.scale <= 1.02) {
        setSmooth(true)
        setTransform({ scale: 1, x: 0, y: 0 })
      }
    } else if (pointersRef.current.size === 1) {
      const [p] = [...pointersRef.current.values()]
      panRef.current = { startX: p.x, startY: p.y, originX: transform.x, originY: transform.y }
    }
  }

  const onDoubleClick = (e) => {
    e.stopPropagation()
    setSmooth(true)
    setTransform((t) => (t.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.5, x: 0, y: 0 }))
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={onDoubleClick}
      onClick={(e) => e.stopPropagation()}
      style={{
        touchAction: 'none',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: 8,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: smooth ? 'transform 0.2s ease-out' : 'none',
          touchAction: 'none',
        }}
      />
    </div>
  )
}
