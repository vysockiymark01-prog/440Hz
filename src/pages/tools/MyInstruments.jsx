import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

function monthsSince(dateStr) {
  if (!dateStr) return null
  const then = new Date(dateStr)
  const now = new Date()
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth())
}

export default function MyInstruments() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [items, setItems] = useLocalStorage('pt_my_instruments_v1', [])
  const [brand, setBrand] = useState('')
  const [lastTuned, setLastTuned] = useState('')
  const [note, setNote] = useState('')
  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const monthsLabel = (n) => {
    if (n === null) return '—'
    if (n <= 0) return t('mi_this_month')
    return t('mi_months_ago', { n })
  }

  const addItem = () => {
    if (!brand.trim()) return
    const entry = {
      id: Date.now().toString(36),
      brand: brand.trim(),
      lastTuned,
      note: note.trim(),
      clientName: clientName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    }
    setItems((prev) => [...prev, entry])
    setBrand('')
    setLastTuned('')
    setNote('')
    setClientName('')
    setPhone('')
    setAddress('')
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const sorted = [...items].sort((a, b) => {
    if (!a.lastTuned) return -1
    if (!b.lastTuned) return 1
    return new Date(a.lastTuned) - new Date(b.lastTuned)
  })

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('mi_title')}</h1>
      <p className="screen-subtitle">{t('mi_subtitle')}</p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{t('mi_add_title')}</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {t('mi_label_brand')}
          </label>
          <input type="text" placeholder={t('mi_ph_brand')} value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {t('mi_label_last_tuned')}
          </label>
          <input type="date" value={lastTuned} onChange={(e) => setLastTuned(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {t('mi_label_client_name')}
          </label>
          <input type="text" placeholder={t('mi_ph_client_name')} value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {t('mi_label_phone')}
          </label>
          <input type="tel" placeholder={t('mi_ph_phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {t('mi_label_address')}
          </label>
          <input type="text" placeholder={t('mi_ph_address')} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {t('mi_label_note')}
          </label>
          <input type="text" placeholder={t('mi_ph_note')} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button className="btn btn-block btn-primary" onClick={addItem} disabled={!brand.trim()}>
          {t('mi_add_btn')}
        </button>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">{t('mi_empty')}</div>
      )}

      {sorted.map((it) => {
        const months = monthsSince(it.lastTuned)
        const overdue = months !== null && months >= 12
        return (
          <div key={it.id} className="card">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{it.brand}</div>
                {it.clientName && (
                  <div style={{ color: 'var(--text)', fontSize: 13, marginTop: 2 }}>{it.clientName}</div>
                )}
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {it.lastTuned ? monthsLabel(months) : t('mi_date_unset')}
                  {overdue && <span className="pill badge-accent" style={{ marginLeft: 8 }}>{t('mi_overdue')}</span>}
                </div>
                {it.phone && (
                  <div style={{ marginTop: 4, fontSize: 13 }}>
                    <a href={`tel:${it.phone.replace(/[^+\d]/g, '')}`}>{it.phone}</a>
                  </div>
                )}
                {it.address && (
                  <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 2 }}>{it.address}</div>
                )}
                {it.note && <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 4 }}>{it.note}</div>}
              </div>
              <button className="btn btn-sm" onClick={() => removeItem(it.id)}>{t('mi_delete')}</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
