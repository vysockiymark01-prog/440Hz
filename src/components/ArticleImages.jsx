import { useState } from 'react'
import articleImages from '../data/articleImages.js'

export default function ArticleImages({ articleId }) {
  const images = articleImages[articleId]
  const [lightbox, setLightbox] = useState(null)

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
          }}
        >
          <img
            src={`./images/${lightbox.src}`}
            alt={lightbox.caption}
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  )
}
