import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bassStringFields, bassStringExtra } from '../../data/checklists.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const allFields = [...bassStringFields, ...bassStringExtra]

// Текст заказа всегда собираем по-русски (label.ru) — он уходит поставщику струн,
// который работает на русском, независимо от того, на каком языке сейчас интерфейс.
function buildOrderText(values) {
  const lines = ['Заказ басовой струны:']
  allFields.forEach((f, i) => {
    const v = values[f.id]?.trim()
    if (v) lines.push(`${i + 1}. ${f.label.ru}: ${v}`)
  })
  return lines.join('\n')
}

export default function StringOrderForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState({})
  const [copied, setCopied] = useState(false)
  const { t, tr } = useLanguage()

  const setField = (id, v) => {
    setValues((prev) => ({ ...prev, [id]: v }))
    setCopied(false)
  }

  const text = buildOrderText(values)
  const filledCount = allFields.filter((f) => values[f.id]?.trim()).length

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('sof_title')}</h1>
      <p className="screen-subtitle">{t('sof_subtitle')}</p>

      {bassStringFields.map((f) => (
        <div key={f.id} style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {tr(f.label)}
          </label>
          <input
            type="text"
            placeholder={tr(f.placeholder)}
            value={values[f.id] || ''}
            onChange={(e) => setField(f.id, e.target.value)}
          />
        </div>
      ))}

      <div className="section-label">{t('sof_extra_label')}</div>
      {bassStringExtra.map((f) => (
        <div key={f.id} style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {tr(f.label)}
          </label>
          <input
            type="text"
            placeholder={tr(f.placeholder)}
            value={values[f.id] || ''}
            onChange={(e) => setField(f.id, e.target.value)}
          />
        </div>
      ))}

      <div className="card" style={{ whiteSpace: 'pre-wrap', fontSize: 14, marginTop: 16 }}>
        {filledCount === 0 ? (
          <span style={{ color: 'var(--text-faint)' }}>{t('sof_empty')}</span>
        ) : text}
      </div>

      <button className="btn btn-block btn-primary" onClick={copy} disabled={filledCount === 0}>
        {copied ? t('sof_copied') : t('sof_copy')}
      </button>
    </div>
  )
}
