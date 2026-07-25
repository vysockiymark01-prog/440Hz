import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

function monthsSince(dateStr) {
  if (!dateStr) return null
  const then = new Date(dateStr)
  const now = new Date()
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth())
}

function monthsLabel(n) {
  if (n === null) return '—'
  if (n <= 0) return 'в этом месяце'
  const mod10 = n % 10
  const mod100 = n % 100
  let word = 'месяцев'
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'месяц'
    else if (mod10 >= 2 && mod10 <= 4) word = 'месяца'
  }
  return `${n} ${word} назад`
}

export default function MyInstruments() {
  const navigate = useNavigate()
  const [items, setItems] = useLocalStorage('pt_my_instruments_v1', [])
  const [brand, setBrand] = useState('')
  const [lastTuned, setLastTuned] = useState('')
  const [note, setNote] = useState('')
  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

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
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Мои инструменты</h1>
      <p className="screen-subtitle">
        Личная база инструментов и клиентов — чтобы не забыть, кому пора звонить с напоминанием
        и как с ним связаться. Хранится только на этом устройстве.
      </p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Добавить инструмент</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Марка / модель
          </label>
          <input type="text" placeholder="например, Petrof P118" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Дата последней настройки
          </label>
          <input type="date" value={lastTuned} onChange={(e) => setLastTuned(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Имя клиента
          </label>
          <input type="text" placeholder="например, Ирина" value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Телефон
          </label>
          <input type="tel" placeholder="например, +7 900 123-45-67" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Адрес
          </label>
          <input type="text" placeholder="например, ул. Ленина, 10, кв. 5" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Заметка
          </label>
          <input type="text" placeholder="например, особенности инструмента" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button className="btn btn-block btn-primary" onClick={addItem} disabled={!brand.trim()}>
          Добавить
        </button>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">Список пуст — добавьте первый инструмент выше.</div>
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
                  {it.lastTuned ? monthsLabel(months) : 'дата настройки не указана'}
                  {overdue && <span className="pill badge-accent" style={{ marginLeft: 8 }}>пора настраивать</span>}
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
              <button className="btn btn-sm" onClick={() => removeItem(it.id)}>Удалить</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
