import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import orderOperations from '../../data/orderOperations.js'
import { orderTotal } from '../../utils/orderTotal.js'

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

function clientKey(order) {
  if (order.phone && order.phone.trim()) return `phone:${order.phone.replace(/[^+\d]/g, '')}`
  if (order.clientName && order.clientName.trim()) return `name:${order.clientName.trim().toLowerCase()}`
  return null
}

function getOverdueClients(items) {
  const groups = {}
  items.forEach((it) => {
    if (!it.date) return
    const key = clientKey(it)
    if (!key) return
    if (!groups[key] || new Date(it.date) > new Date(groups[key].latest)) {
      groups[key] = {
        key,
        label: it.clientName || it.brand || 'Без имени',
        latest: it.date,
        phone: it.phone,
      }
    }
  })
  const now = new Date()
  return Object.values(groups)
    .filter((g) => (now - new Date(g.latest)) / 86400000 >= 365)
    .sort((a, b) => new Date(a.latest) - new Date(b.latest))
}

function buildIcs(order) {
  if (!order.date) return null
  const start = new Date(`${order.date}T${order.time || '10:00'}`)
  if (Number.isNaN(start.getTime())) return null
  let end = order.endTime ? new Date(`${order.date}T${order.endTime}`) : null
  if (!end || Number.isNaN(end.getTime()) || end <= start) {
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  }

  const descriptionParts = []
  if (order.brand) descriptionParts.push(`Инструмент: ${order.brand}`)
  if (order.phone) descriptionParts.push(`Телефон: ${order.phone}`)
  const included = orderOperations.filter((s) => order.checklist?.[s.id])
  if (included.length) {
    const lines = included.map((s) => {
      const price = order.prices?.[s.id]
      const priceText = typeof price === 'number' && !Number.isNaN(price) && price > 0 ? `${price} ₽` : 'без цены'
      return `- ${s.title}: ${priceText}`
    })
    descriptionParts.push(`Операции:\n${lines.join('\n')}`)
  }
  const total = orderTotal(order)
  if (total > 0) descriptionParts.push(`Итого: ${total} ₽`)
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

function csvCell(value) {
  const s = String(value ?? '')
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function downloadCsv(items) {
  const header = ['Дата', 'Время', 'Клиент', 'Телефон', 'Адрес', 'Инструмент', 'Операции', 'Сумма, ₽', 'Заметка']
  const rows = items.map((it) => {
    const opsText = orderOperations
      .filter((op) => it.checklist?.[op.id])
      .map((op) => op.title)
      .join(', ')
    return [
      it.date || '',
      it.time || '',
      it.clientName || '',
      it.phone || '',
      it.address || '',
      it.brand || '',
      opsText,
      orderTotal(it),
      it.note || '',
    ]
  })
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `zakazy-${date}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function dateTimeLabel(dateStr, timeStr, endTimeStr) {
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
  const timePart = timeStr ? `, ${timeStr}${endTimeStr ? `–${endTimeStr}` : ''}` : ''
  return { text: `${datePart}${timePart} · ${relative}`, past: diffDays < 0 }
}

function ChecklistFields({ checklist, prices, onToggle, onPriceChange }) {
  return (
    <div>
      {orderOperations.map((s, i) => (
        <div
          key={s.id}
          className="row"
          style={{
            alignItems: 'center',
            gap: 8,
            padding: '9px 0',
            borderBottom: i < orderOperations.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, margin: 0, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!checklist?.[s.id]}
              onChange={() => onToggle(s.id)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent)', flexShrink: 0 }}
            />
            <span
              style={{
                color: checklist?.[s.id] ? 'var(--text)' : 'var(--text-dim)',
              }}
            >
              {s.title}
            </span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="₽"
            value={prices?.[s.id] ?? ''}
            onChange={(e) => onPriceChange(s.id, e.target.value)}
            style={{ width: 84, flexShrink: 0, textAlign: 'right' }}
          />
        </div>
      ))}
    </div>
  )
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
  const [endTime, setEndTime] = useState('')
  const [note, setNote] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [formChecklist, setFormChecklist] = useState({})
  const [formPrices, setFormPrices] = useState({})

  const toggleFormChecklistItem = (opId) => {
    setFormChecklist((prev) => {
      const wasChecked = !!prev[opId]
      if (!wasChecked && formPrices[opId] === undefined) {
        const op = orderOperations.find((o) => o.id === opId)
        setFormPrices((p) => ({ ...p, [opId]: op?.defaultPrice ?? '' }))
      }
      return { ...prev, [opId]: !wasChecked }
    })
  }

  const setFormPrice = (opId, value) => {
    const num = value === '' ? '' : Number(value)
    setFormPrices((prev) => ({ ...prev, [opId]: num }))
  }

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
      endTime,
      note: note.trim(),
      checklist: formChecklist,
      prices: formPrices,
    }
    setItems((prev) => [...prev, entry])
    setBrand('')
    setClientName('')
    setPhone('')
    setAddress('')
    setDate('')
    setTime('')
    setEndTime('')
    setNote('')
    setFormChecklist({})
    setFormPrices({})
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const toggleChecklistItem = (orderId, opId) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== orderId) return it
        const wasChecked = !!it.checklist?.[opId]
        const nextChecklist = { ...it.checklist, [opId]: !wasChecked }
        // При первом включении подставляем ориентировочную цену, если своя ещё не введена.
        let nextPrices = it.prices || {}
        if (!wasChecked && nextPrices[opId] === undefined) {
          const op = orderOperations.find((o) => o.id === opId)
          nextPrices = { ...nextPrices, [opId]: op?.defaultPrice ?? '' }
        }
        return { ...it, checklist: nextChecklist, prices: nextPrices }
      })
    )
  }

  const setOpPrice = (orderId, opId, value) => {
    const num = value === '' ? '' : Number(value)
    setItems((prev) =>
      prev.map((it) =>
        it.id === orderId ? { ...it, prices: { ...it.prices, [opId]: num } } : it
      )
    )
  }

  const sorted = [...items].sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`)
  })

  const overdueClients = getOverdueClients(items)

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <h1 className="screen-title" style={{ marginBottom: 0 }}>Мои заказы</h1>
        <span style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={() => navigate('/tools/order-stats')}>📊 Статистика</button>
          {items.length > 0 && (
            <button className="btn btn-sm" onClick={() => downloadCsv(items)}>⬇️ CSV</button>
          )}
        </span>
      </div>
      <p className="screen-subtitle">
        Клиенты, даты и чек-лист операций с ценами по каждому заказу. Дату и время можно
        экспортировать в календарь телефона или планшета. Хранится только на этом устройстве.
      </p>

      {overdueClients.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            ⏰ {overdueClients.length} {overdueClients.length === 1 ? 'клиент не настраивался' : 'клиентов не настраивались'} больше года
          </div>
          {overdueClients.map((g) => {
            const monthsAgo = Math.floor((new Date() - new Date(g.latest)) / 86400000 / 30)
            return (
              <div key={g.key} className="row" style={{ padding: '6px 0', fontSize: 13 }}>
                <span>{g.label}</span>
                <span style={{ color: 'var(--text-dim)' }}>
                  {monthsAgo} мес. назад
                  {g.phone && <> · <a href={`tel:${g.phone.replace(/[^+\d]/g, '')}`}>{g.phone}</a></>}
                </span>
              </div>
            )
          })}
        </div>
      )}

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
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Дата визита
          </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
              Начало работы
            </label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
              Окончание
            </label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Заметка
          </label>
          <input type="text" placeholder="например, особенности инструмента" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
          Какие работы планируются
        </label>
        <ChecklistFields
          checklist={formChecklist}
          prices={formPrices}
          onToggle={toggleFormChecklistItem}
          onPriceChange={setFormPrice}
        />

        <button className="btn btn-block btn-primary" style={{ marginTop: 12 }} onClick={addItem} disabled={!brand.trim() && !clientName.trim()}>
          Добавить
        </button>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">Список пуст — добавьте первый заказ выше.</div>
      )}

      {sorted.map((it) => {
        const label = dateTimeLabel(it.date, it.time, it.endTime)
        const doneCount = orderOperations.filter((s) => it.checklist?.[s.id]).length
        const total = orderTotal(it)
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
                  <div style={{ marginTop: 2 }}>
                    <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>{it.address}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a
                        className="btn btn-sm"
                        href={`https://2gis.ru/search/${encodeURIComponent(it.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        2ГИС
                      </a>
                      <a
                        className="btn btn-sm"
                        href={`https://yandex.ru/maps/?text=${encodeURIComponent(it.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Я.Карты
                      </a>
                    </div>
                  </div>
                )}
                {it.note && <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 4 }}>{it.note}</div>}
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button className="btn btn-sm" onClick={() => setExpanded(isOpen ? null : it.id)}>
                    Чек-лист {doneCount}/{orderOperations.length}
                  </button>
                  {it.date && (
                    <button className="btn btn-sm" onClick={() => downloadIcs(it)}>📅 В календарь</button>
                  )}
                  {total > 0 && (
                    <span className="pill badge-accent">{total.toLocaleString('ru-RU')} ₽</span>
                  )}
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => removeItem(it.id)}>Удалить</button>
            </div>

            {isOpen && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <ChecklistFields
                  checklist={it.checklist}
                  prices={it.prices}
                  onToggle={(opId) => toggleChecklistItem(it.id, opId)}
                  onPriceChange={(opId, value) => setOpPrice(it.id, opId, value)}
                />
                <div className="row" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontWeight: 700 }}>
                  <span>Итого</span>
                  <span>{total.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
