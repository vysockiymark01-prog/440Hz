import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bassStringFields, bassStringExtra } from '../../data/checklists.js'

const allFields = [...bassStringFields, ...bassStringExtra]

function buildOrderText(values) {
  const lines = ['Заказ басовой струны:']
  allFields.forEach((f, i) => {
    const v = values[f.id]?.trim()
    if (v) lines.push(`${i + 1}. ${f.label}: ${v}`)
  })
  return lines.join('\n')
}

export default function StringOrderForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState({})
  const [copied, setCopied] = useState(false)

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
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Заказ басовой струны</h1>
      <p className="screen-subtitle">Заполните параметры (первые 4 — основные) и скопируйте текст заказа мастеру</p>

      {bassStringFields.map((f) => (
        <div key={f.id} style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {f.label}
          </label>
          <input
            type="text"
            placeholder={f.placeholder}
            value={values[f.id] || ''}
            onChange={(e) => setField(f.id, e.target.value)}
          />
        </div>
      ))}

      <div className="section-label">Дополнительно (для точности)</div>
      {bassStringExtra.map((f) => (
        <div key={f.id} style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {f.label}
          </label>
          <input
            type="text"
            placeholder={f.placeholder}
            value={values[f.id] || ''}
            onChange={(e) => setField(f.id, e.target.value)}
          />
        </div>
      ))}

      <div className="card" style={{ whiteSpace: 'pre-wrap', fontSize: 14, marginTop: 16 }}>
        {filledCount === 0 ? (
          <span style={{ color: 'var(--text-faint)' }}>Заполните поля выше — здесь появится текст заказа</span>
        ) : text}
      </div>

      <button className="btn btn-block btn-primary" onClick={copy} disabled={filledCount === 0}>
        {copied ? '✓ Скопировано' : 'Скопировать текст заказа'}
      </button>
    </div>
  )
}
