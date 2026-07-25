import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clientPhrases, { CATEGORIES } from '../../data/clientPhrases.js'

export default function ClientPhrases() {
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState(null)

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500)
    } catch {
      setCopiedId(null)
    }
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Фразы для клиента</h1>
      <p className="screen-subtitle">Готовые объяснения — скопируйте и отправьте в переписке или зачитайте вслух</p>

      {CATEGORIES.map((cat) => {
        const items = clientPhrases.filter((p) => p.category === cat.id)
        if (items.length === 0) return null
        return (
          <div key={cat.id}>
            <div className="section-label">{cat.label}</div>
            {items.map((p) => (
              <div key={p.id} className="card">
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{p.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 10 }}>{p.text}</p>
                <button className="btn btn-sm" onClick={() => copy(p.id, p.text)}>
                  {copiedId === p.id ? '✓ Скопировано' : 'Скопировать'}
                </button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
