import { useState, useEffect } from 'react'
import articleImages from '../data/articleImages.js'
import ZoomableImage from './ZoomableImage.jsx'

export default function ArticleImages({ articleId }) {
  const images = articleImages[articleId]
  const [lightbox, setLightbox] = useState(null)

  // Пока открыто фото на весь экран, страница под ним не должна скроллиться —
  // иначе жест по картинке листает текст статьи позади.
  useEffect(() => {
    if (!lightbox) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [lightbox])

  if (!images || images.length === 0) return null

  return (
    <div style={{ margin: '16px 0' }}>
      {images.map((img, i) => (
        <figure key={i} style={{ margin: '0 0 16px' }}>
          <img
            src={`./images/${img.src}`}
            alt={img.caption}
            loading="lazy"
            onClick={() => setLightbox(img)}
            style={{
              width: '100%',
              display: 'block',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              cursor: 'zoom-in',
            }}
          />
          <figcaption style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.4 }}>
            {img.caption}
          </figcaption>
        </figure>
      ))}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 20,
            touchAction: 'none', overscrollBehavior: 'contain',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null) }}
            aria-label="Закрыть"
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 201,
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              fontSize: 20, lineHeight: 1, cursor: 'pointer',
            }}
          >
            ✕
          </button>
          <ZoomableImage src={`./images/${lightbox.src}`} alt={lightbox.caption} />
        </div>
      )}
    </div>
  )
}
