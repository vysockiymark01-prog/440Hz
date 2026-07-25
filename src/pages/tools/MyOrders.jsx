import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { workOrderSteps } from '../../data/checklists.js'

function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatIcsDate(d) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
}

function buildIcs(order) {
  if (!order.date) return null
  const start = new Date(`${order.date}T${order.time || '10:00'}`)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

  const descriptionParts = []
  if (order.brand) descriptionParts.push(`Инструмент: ${order.brand}`)
  if (order.phone) descriptionParts.push(`Телефон: ${order.phone}`)
  const todo = workOrderSteps.filter((s) => !order.checklist?.[s.id]).map((s) => s.title)
  if (todo.length) descriptionParts.push(`Сделать: ${todo.join(', ')}`)
  if (order.note) descriptionParts.push(`Заметка: ${order.note}`)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nastroyshchik Fortepiano//RU',
    'BEGIN:VEVENT',
    `UID:${order.id}@nastroyshchik-fortepiano`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcs(`Настройка: ${order.clientName || order.brand}`)}`,
  ]
  if (order.address) lines.push(`LOCATION:${escapeIcs(order.address)}`)
  if (descriptionParts.length) lines.push(`DESCRIPTION:${escapeIcs(descriptionParts.join('\n'))}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

function downloadIcs(order) {
  const ics = buildIcs(order)
  if (!ics) return
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `zakaz-${order.date}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function dateTimeLabel(dateStr, timeStr) {
  if (!dateStr) return { text: 'дата не указана', past: false }
  const dt = new Date(`${dateStr}T${timeStr || '00:00'}`)
  const now = new Date()
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfDay(dt) - startOfDay(now)) / 86400000)

  let relative
  if (diffDays === 0) relative = 'сегодня'
  else if (diffDays === 1) relative = 'завтра'
  else if (diffDays === -1) relative = 'вчера'
  else if (diffDays > 1) relative = `через ${diffDays} дн.`
  else relative = `${Math.abs(diffDays)} дн. назад`

  const datePart = dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  const timePart = timeStr ? `, ${timeStr}` : ''
  return { text: `${datePart}${timePart} · ${relative}`, past: diffDays < 0 }
}

export default function MyOrders() {
  const navigate = useNavigate()
  const [items, setItems] = useLocalStorage('pt_my_orders_v1', [])
  const [brand, setBrand] = useState('')
  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [expanded, setExpanded] = useState(null)

  const addItem = () => {
    if (!brand.trim() && !clientName.trim()) return
    const entry = {
      id: Date.now().toString(36),
      brand: brand.trim(),
      clientName: clientName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      date,
      time,
      note: note.trim(),
      checklist: {},
    }
    setItems((prev) => [...prev, entry])
    setBrand('')
    setClientName('')
    setPhone('')
    setAddress('')
    setDate('')
    setTime('')
    setNote('')
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const toggleChecklistItem = (orderId, stepId) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === orderId ? { ...it, checklist: { ...it.checklist, [stepId]: !it.checklist?.[stepId] } } : it
      )
    )
  }

  const sorted = [...items].sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`)
  })

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Мои заказы</h1>
      <p className="screen-subtitle">
        Клиенты, даты и чек-лист по каждому заказу. Дату и время можно экспортировать в календарь
        телефона или планшета. Хранится только на этом устройстве.
      </p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Добавить заказ</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Инструмент (марка / модель)
          </label>
          <input type="text" placeholder="например, Petrof P118" value={brand} onChange={(e) => setBrand(e.target.value)} />
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
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
              Дата визита
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
              Время
            </label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Заметка
          </label>
          <input type="text" placeholder="например, особенности инструмента" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button className="btn btn-block btn-primary" onClick={addItem} disabled={!brand.trim() && !clientName.trim()}>
          Добавить
        </button>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">Список пуст — добавьте первый заказ выше.</div>
      )}

      {sorted.map((it) => {
        const label = dateTimeLabel(it.date, it.time)
        const doneCount = workOrderSteps.filter((s) => it.checklist?.[s.id]).length
        const isOpen = expanded === it.id
        return (
          <div key={it.id} className="card">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                {(it.brand || it.clientName) && (
                  <div style={{ fontWeight: 700 }}>
                    {it.clientName || 'Без имени'}{it.brand ? ` — ${it.brand}` : ''}
                  </div>
                )}
                <div style={{ color: it.date && label.past ? 'var(--text-faint)' : 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {label.text}
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
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm" onClick={() => setExpanded(isOpen ? null : it.id)}>
                    Чек-лист {doneCount}/{workOrderSteps.length}
                  </button>
                  {it.date && (
                    <button className="btn btn-sm" onClick={() => downloadIcs(it)}>📅 В календарь</button>
                  )}
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => removeItem(it.id)}>Удалить</button>
            </div>

            {isOpen && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {workOrderSteps.map((s) => (
                  <label key={s.id} className={`checklist-item ${it.checklist?.[s.id] ? 'done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!it.checklist?.[s.id]}
                      onChange={() => toggleChecklistItem(it.id, s.id)}
                    />
                    <span className="checklist-text">{s.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
