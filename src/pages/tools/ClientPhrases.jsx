import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clientPhrases, { CATEGORIES } from '../../data/clientPhrases.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function ClientPhrases() {
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState(null)
  const { t, tr } = useLanguage()

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
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('cp_title')}</h1>
      <p className="screen-subtitle">{t('cp_subtitle')}</p>

      {CATEGORIES.map((cat) => {
        const items = clientPhrases.filter((p) => p.category === cat.id)
        if (items.length === 0) return null
        return (
          <div key={cat.id}>
            <div className="section-label">{tr(cat.label)}</div>
            {items.map((p) => (
              <div key={p.id} className="card">
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{tr(p.title)}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 10 }}>{tr(p.text)}</p>
                <button className="btn btn-sm" onClick={() => copy(p.id, tr(p.text))}>
                  {copiedId === p.id ? t('cp_copied') : t('cp_copy')}
                </button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
