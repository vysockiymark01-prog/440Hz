import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import orderOperations from '../../data/orderOperations.js'
import { orderTotal, orderExpenses, orderProfit } from '../../utils/orderTotal.js'

const PAYMENT_LABELS = { paid: 'Оплачено', partial: 'Частично', unpaid: 'Должен' }
const PAYMENT_ORDER = ['unpaid', 'partial', 'paid']
const PAYMENT_METHOD_LABELS = { cash: 'Наличные', card: 'Карта', transfer: 'Перевод' }
const PAYMENT_METHODS = ['cash', 'card', 'transfer']

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
    .filter((g) => (now - new Date(g.latest)) / 86400000 >= 270)
    .sort((a, b) => new Date(a.latest) - new Date(b.latest))
}

function isHeatingSeason() {
  const month = new Date().getMonth() // 0 = январь
  return month <= 2 || month >= 9 // октябрь–март
}

function getTodayOrders(items) {
  const todayStr = new Date().toISOString().slice(0, 10)
  return items
    .filter((it) => it.date === todayStr)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
}

function getDebtors(items) {
  return items
    .filter((it) => !it.isWarranty && orderTotal(it) > 0 && (it.paymentStatus === 'unpaid' || it.paymentStatus === 'partial'))
    .map((it) => ({ ...it, total: orderTotal(it) }))
}

// Для каждого заказа определяет, первый ли это визит этого клиента (по телефону/имени) или повторный.
function getReturningMap(items) {
  const byKey = {}
  items.forEach((it) => {
    const key = clientKey(it)
    if (!key) return
    if (!byKey[key]) byKey[key] = []
    byKey[key].push(it)
  })
  const map = {}
  Object.values(byKey).forEach((group) => {
    const sorted = [...group].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    sorted.forEach((it, i) => {
      map[it.id] = i > 0
    })
  })
  return map
}

async function shareText(title, text) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
    } catch {
      /* пользователь отменил — ничего не делаем */
    }
  } else if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      alert('Текст скопирован в буфер обмена')
    } catch {
      /* ignore */
    }
  }
}

function shareReminder(order) {
  const parts = ['Напоминаю о визите:']
  if (order.date) {
    const dt = new Date(`${order.date}T${order.time || '00:00'}`)
    parts.push(`${dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}${order.time ? `, ${order.time}` : ''}`)
  }
  if (order.address) parts.push(`Адрес: ${order.address}`)
  parts.push('Если планы меняются — дайте, пожалуйста, знать.')
  shareText('Напоминание о визите', parts.join('\n'))
}

function shareOnMyWay(order) {
  const eta = window.prompt('Через сколько минут будете на месте?', '30')
  if (eta === null) return
  const parts = ['Выезжаю к вам']
  if (eta.trim()) parts.push(`, буду примерно через ${eta.trim()} мин`)
  parts.push('.')
  if (order.address) parts.push(` Адрес: ${order.address}.`)
  shareText('Выезжаю', parts.join(''))
}

function shareBulkReminder(overdueClients) {
  const lines = overdueClients.map((g) => `${g.label}${g.phone ? ` — ${g.phone}` : ''}`)
  const text = ['Пора напомнить о повторной настройке:', '', ...lines].join('\n')
  shareText('Напоминания клиентам', text)
}

function shareEstimate(order) {
  const included = orderOperations.filter((s) => order.checklist?.[s.id])
  const lines = included.map((s) => {
    const price = order.prices?.[s.id]
    const priceText = typeof price === 'number' && !Number.isNaN(price) && price > 0 ? ` — ${price} ₽` : ''
    return `• ${s.title}${priceText}`
  })
  const total = orderTotal(order)
  const headerParts = ['Смета']
  if (order.clientName) headerParts.push(`для ${order.clientName}`)
  if (order.brand) headerParts.push(`(${order.brand})`)
  const parts = [headerParts.join(' '), '', ...lines]
  if (total > 0) parts.push('', `Итого: ${total.toLocaleString('ru-RU')} ₽`)
  shareText('Смета', parts.join('\n'))
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
  if (order.packingList) descriptionParts.push(`Взять с собой: ${order.packingList}`)
  const included = orderOperations.filter((s) => order.checklist?.[s.id])
  if (included.length) {
    const lines = included.map((s) => {
      const price = order.prices?.[s.id]
      const priceText = typeof price === 'number' && !Number.isNaN(price) && price > 0 ? `${price} ₽` : 'без цены'
      return `- ${s.title}: ${priceText}`
    })
    descriptionParts.push(`Операции:\n${lines.join('\n')}`)
  }
  if (order.isWarranty) {
    descriptionParts.push('Гарантийный визит — без оплаты')
  } else {
    const total = orderTotal(order)
    if (total > 0) descriptionParts.push(`Итого: ${total} ₽ (${PAYMENT_LABELS[order.paymentStatus] || PAYMENT_LABELS.unpaid})`)
  }
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
  const header = [
    'Дата', 'Время', 'Клиент', 'Тип клиента', 'Телефон', 'Адрес', 'Инструмент', 'Серийный номер',
    'Операции', 'Сумма, ₽', 'Расходы, ₽', 'Прибыль, ₽', 'Оплата', 'Способ оплаты', 'Гарантия', 'Взять с собой', 'Теги', 'Заметка',
  ]
  const rows = items.map((it) => {
    const opsText = orderOperations
      .filter((op) => it.checklist?.[op.id])
      .map((op) => op.title)
      .join(', ')
    return [
      it.date || '',
      it.time || '',
      it.clientName || '',
      it.clientType === 'org' ? 'Организация' : 'Физлицо',
      it.phone || '',
      it.address || '',
      it.brand || '',
      it.serialNumber || '',
      opsText,
      orderTotal(it),
      orderExpenses(it),
      orderProfit(it),
      it.isWarranty ? '' : (PAYMENT_LABELS[it.paymentStatus] || PAYMENT_LABELS.unpaid),
      it.paymentMethod ? (PAYMENT_METHOD_LABELS[it.paymentMethod] || '') : '',
      it.isWarranty ? 'Да' : '',
      it.packingList || '',
      (it.tags || []).join(', '),
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
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'upcoming' | 'past'
  const [clientType, setClientType] = useState('person') // 'person' | 'org'
  const [packingList, setPackingList] = useState('')
  const [expenses, setExpenses] = useState('')
  const [isWarranty, setIsWarranty] = useState(false)
  const [blacklist, setBlacklist] = useLocalStorage('pt_blacklist_v1', [])
  const [blacklistOpen, setBlacklistOpen] = useState(false)
  const [templates, setTemplates] = useLocalStorage('pt_checklist_templates_v1', [])
  const [dayOrder, setDayOrder] = useLocalStorage('pt_day_order_v1', {})
  const [inventory, setInventory] = useLocalStorage('pt_inventory_v1', [])
  const [invPick, setInvPick] = useState('')
  const [invQty, setInvQty] = useState('1')
  const [tagInput, setTagInput] = useState('')
  const [formTags, setFormTags] = useState([])
  const [serialNumber, setSerialNumber] = useState('')
  const formCardRef = useRef(null)
  const speechRef = useRef(null)
  const [listening, setListening] = useState(false)

  const saveTemplate = () => {
    const hasAny = Object.values(formChecklist).some(Boolean)
    if (!hasAny) {
      alert('Сначала отметьте хотя бы одну работу, чтобы сохранить шаблон.')
      return
    }
    const name = window.prompt('Название шаблона (например: Быстрая настройка):', '')
    if (!name || !name.trim()) return
    setTemplates((prev) => [
      ...prev,
      { id: Date.now().toString(36), name: name.trim(), checklist: formChecklist, prices: formPrices },
    ])
  }

  const applyTemplate = (t) => {
    setFormChecklist(t.checklist)
    setFormPrices(t.prices)
  }

  const removeTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const addFormTag = () => {
    const t = tagInput.trim()
    if (!t || formTags.includes(t)) return
    setFormTags((prev) => [...prev, t])
    setTagInput('')
  }

  const removeFormTag = (t) => {
    setFormTags((prev) => prev.filter((x) => x !== t))
  }

  const moveTodayOrder = (id, dir) => {
    setDayOrder((prev) => {
      const current = prev[todayStr] && prev[todayStr].length
        ? prev[todayStr]
        : getTodayOrders(items).map((o) => o.id)
      const idx = current.indexOf(id)
      if (idx === -1) return prev
      const next = [...current]
      const swapWith = idx + dir
      if (swapWith < 0 || swapWith >= next.length) return prev
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return { ...prev, [todayStr]: next }
    })
  }

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Голосовой ввод не поддерживается в этом браузере.')
      return
    }
    if (listening) {
      speechRef.current?.stop()
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'ru-RU'
    recognition.interimResults = false
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      setNote((prev) => (prev ? `${prev} ${text}` : text))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    speechRef.current = recognition
    setListening(true)
    recognition.start()
  }

  const findBlacklistEntry = (key) => blacklist.find((b) => b.key === key)

  const addToBlacklist = (it) => {
    const key = clientKey(it)
    if (!key) {
      alert('Укажите телефон или имя клиента, чтобы добавить в чёрный список.')
      return
    }
    if (findBlacklistEntry(key)) return
    const reason = window.prompt('Причина (например: не заплатил, конфликтный клиент):', '') || ''
    setBlacklist((prev) => [
      ...prev,
      { key, label: it.clientName || it.brand || 'Без имени', phone: it.phone || '', reason, addedAt: new Date().toISOString() },
    ])
  }

  const removeFromBlacklist = (key) => {
    setBlacklist((prev) => prev.filter((b) => b.key !== key))
  }

  const formBlacklistMatch = findBlacklistEntry(clientKey({ phone, clientName }))

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
      clientType,
      phone: phone.trim(),
      address: address.trim(),
      date,
      time,
      endTime,
      note: note.trim(),
      packingList: packingList.trim(),
      expenses: expenses === '' ? '' : Number(expenses),
      isWarranty,
      paymentStatus: 'unpaid',
      checklist: formChecklist,
      prices: formPrices,
      tags: formTags,
      serialNumber: serialNumber.trim(),
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
    setClientType('person')
    setPackingList('')
    setExpenses('')
    setIsWarranty(false)
    setFormChecklist({})
    setFormPrices({})
    setFormTags([])
    setSerialNumber('')
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const togglePaymentStatus = (orderId) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== orderId) return it
        const current = it.paymentStatus || 'unpaid'
        const idx = PAYMENT_ORDER.indexOf(current)
        const next = PAYMENT_ORDER[(idx + 1) % PAYMENT_ORDER.length]
        return { ...it, paymentStatus: next }
      })
    )
  }

  const setPaymentMethod = (orderId, method) => {
    setItems((prev) =>
      prev.map((it) => (it.id === orderId ? { ...it, paymentMethod: it.paymentMethod === method ? null : method } : it))
    )
  }

  const repeatOrder = (it) => {
    setBrand(it.brand || '')
    setClientName(it.clientName || '')
    setClientType(it.clientType || 'person')
    setPhone(it.phone || '')
    setAddress(it.address || '')
    setDate('')
    setTime('')
    setEndTime('')
    setNote('')
    setPackingList('')
    setExpenses('')
    setIsWarranty(false)
    setFormChecklist({})
    setFormPrices({})
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const setOrderExpenses = (orderId, value) => {
    const num = value === '' ? '' : Number(value)
    setItems((prev) => prev.map((it) => (it.id === orderId ? { ...it, expenses: num } : it)))
  }

  const setActualEndTime = (orderId, value) => {
    setItems((prev) => prev.map((it) => (it.id === orderId ? { ...it, actualEndTime: value } : it)))
  }

  const consumeInventory = (orderId) => {
    const item = inventory.find((i) => i.id === invPick)
    const qty = Number(invQty)
    if (!item || !qty || qty <= 0) return
    const cost = qty * (item.unitCost || 0)
    setInventory((prev) => prev.map((i) => (i.id === item.id ? { ...i, qty: Math.max(0, i.qty - qty) } : i)))
    setItems((prev) =>
      prev.map((it) => (it.id === orderId ? { ...it, expenses: orderExpenses(it) + cost } : it))
    )
    setInvPick('')
    setInvQty('1')
  }

  const sorted = [...items].sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`)
  })

  const todayStr = new Date().toISOString().slice(0, 10)
  const filtered = sorted.filter((it) => {
    if (filterMode === 'upcoming' && (!it.date || it.date < todayStr)) return false
    if (filterMode === 'past' && (!it.date || it.date >= todayStr)) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const haystack = [it.clientName, it.phone, it.address, it.brand, it.note, it.serialNumber, ...(it.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const overdueClients = getOverdueClients(items)
  const todayOrders = getTodayOrders(items)
  const debtors = getDebtors(items)
  const returningMap = getReturningMap(items)

  const savedOrderIds = dayOrder[todayStr]
  const reorderedToday = savedOrderIds
    ? savedOrderIds.map((id) => todayOrders.find((o) => o.id === id)).filter(Boolean).concat(
        todayOrders.filter((o) => !savedOrderIds.includes(o.id))
      )
    : todayOrders

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

      {isHeatingSeason() && (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div style={{ fontWeight: 700 }}>🔥 Отопительный сезон</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Сухой воздух от отопления быстрее расстраивает инструменты — хороший повод напомнить клиентам о настройке.
          </div>
        </div>
      )}

      {todayOrders.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            📅 Сегодня {todayOrders.length === 1 ? 'визит' : `визитов: ${todayOrders.length}`}
          </div>
          {reorderedToday.map((o, i) => (
            <div key={o.id} className="row" style={{ padding: '6px 0', fontSize: 13, alignItems: 'flex-start' }}>
              <span>
                {o.time && <b>{o.time}</b>}{o.time ? ' — ' : ''}{o.clientName || o.brand || 'Без имени'}
              </span>
              <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {o.address && <span style={{ color: 'var(--text-dim)' }}>{o.address}</span>}
                <button
                  className="btn btn-sm"
                  style={{ padding: '4px 8px' }}
                  disabled={i === 0}
                  onClick={() => moveTodayOrder(o.id, -1)}
                  aria-label="Выше"
                >
                  ▲
                </button>
                <button
                  className="btn btn-sm"
                  style={{ padding: '4px 8px' }}
                  disabled={i === reorderedToday.length - 1}
                  onClick={() => moveTodayOrder(o.id, 1)}
                  aria-label="Ниже"
                >
                  ▼
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {overdueClients.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div className="row" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>
              ⏰ {overdueClients.length} {overdueClients.length === 1 ? 'клиента пора пригласить' : 'клиентов пора пригласить'} на повторную настройку
            </div>
            <button className="btn btn-sm" onClick={() => shareBulkReminder(overdueClients)}>✉️ Напомнить всем</button>
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

      {debtors.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            💰 {debtors.length === 1 ? 'Есть должник' : `Должников: ${debtors.length}`}
          </div>
          {debtors.map((d) => (
            <div key={d.id} className="row" style={{ padding: '6px 0', fontSize: 13 }}>
              <span>{d.clientName || d.brand || 'Без имени'}</span>
              <span style={{ color: 'var(--danger)' }}>
                {d.total.toLocaleString('ru-RU')} ₽ · {PAYMENT_LABELS[d.paymentStatus] || PAYMENT_LABELS.unpaid}
              </span>
            </div>
          ))}
        </div>
      )}

      {blacklist.length > 0 && (
        <div className="card">
          <button
            className="row"
            style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={() => setBlacklistOpen((v) => !v)}
          >
            <span style={{ fontWeight: 700 }}>🚫 Чёрный список: {blacklist.length}</span>
            <span>{blacklistOpen ? '▲' : '▼'}</span>
          </button>
          {blacklistOpen && blacklist.map((b) => (
            <div key={b.key} className="row" style={{ padding: '8px 0', borderTop: '1px solid var(--border)', fontSize: 13, alignItems: 'flex-start' }}>
              <span>
                <div style={{ fontWeight: 700 }}>{b.label}</div>
                {b.reason && <div style={{ color: 'var(--text-dim)' }}>{b.reason}</div>}
              </span>
              <button className="btn btn-sm" onClick={() => removeFromBlacklist(b.key)}>Убрать</button>
            </div>
          ))}
        </div>
      )}

      <div className="card" ref={formCardRef}>
        <h3 style={{ marginTop: 0 }}>Добавить заказ</h3>

        <div className="theme-options" style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <button
            className={`theme-option ${clientType === 'person' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center', padding: '8px 6px', fontSize: 13 }}
            onClick={() => setClientType('person')}
          >
            Физлицо
          </button>
          <button
            className={`theme-option ${clientType === 'org' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center', padding: '8px 6px', fontSize: 13 }}
            onClick={() => setClientType('org')}
          >
            Организация
          </button>
        </div>

        {formBlacklistMatch && (
          <div className="result-flash bad" style={{ marginBottom: 10 }}>
            ⚠️ Этот клиент в чёрном списке{formBlacklistMatch.reason ? `: ${formBlacklistMatch.reason}` : ''}
          </div>
        )}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Инструмент (марка / модель)
          </label>
          <input type="text" placeholder="например, Petrof P118" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Серийный номер (необязательно)
          </label>
          <input
            type="text"
            placeholder="например, 123456"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
          {serialNumber.trim() && items.some((it) => it.serialNumber && it.serialNumber === serialNumber.trim()) && (
            <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>
              Этот инструмент уже встречался — история визитов сохранится по номеру.
            </div>
          )}
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            {clientType === 'org' ? 'Название организации' : 'Имя клиента'}
          </label>
          <input
            type="text"
            placeholder={clientType === 'org' ? 'например, Детская школа искусств №3' : 'например, Ирина'}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
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
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="например, особенности инструмента"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className={`btn btn-sm ${listening ? 'btn-primary' : ''}`}
              onClick={toggleListening}
              aria-label="Голосовой ввод заметки"
            >
              {listening ? '⏹️' : '🎙️'}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Особенности (теги)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="например, скрипучая педаль"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFormTag() } }}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-sm" onClick={addFormTag}>+</button>
          </div>
          {formTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {formTags.map((t) => (
                <span key={t} className="pill" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {t}
                  <button
                    type="button"
                    onClick={() => removeFormTag(t)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                    aria-label={`Убрать тег ${t}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Взять с собой
          </label>
          <input
            type="text"
            placeholder="например, струна №34, войлок для молоточков"
            value={packingList}
            onChange={(e) => setPackingList(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
            Расходы на материалы, ₽
          </label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isWarranty}
            onChange={(e) => setIsWarranty(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
          />
          <span style={{ fontSize: 13 }}>Гарантийный визит (без оплаты)</span>
        </label>

        <div className="row" style={{ alignItems: 'center', marginBottom: 4 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            Какие работы планируются
          </label>
          <button className="btn btn-sm" onClick={saveTemplate}>💾 Сохранить как шаблон</button>
        </div>

        {templates.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {templates.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button className="btn btn-sm" onClick={() => applyTemplate(t)}>{t.name}</button>
                <button
                  className="btn btn-sm"
                  style={{ padding: '8px 10px' }}
                  onClick={() => removeTemplate(t.id)}
                  aria-label={`Удалить шаблон ${t.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

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

      {items.length > 0 && (
        <>
          <input
            type="text"
            placeholder="Поиск по имени, телефону, адресу…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <div className="theme-options" style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <button
              className={`theme-option ${filterMode === 'all' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '8px 6px', fontSize: 13 }}
              onClick={() => setFilterMode('all')}
            >
              Все
            </button>
            <button
              className={`theme-option ${filterMode === 'upcoming' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '8px 6px', fontSize: 13 }}
              onClick={() => setFilterMode('upcoming')}
            >
              Предстоящие
            </button>
            <button
              className={`theme-option ${filterMode === 'past' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '8px 6px', fontSize: 13 }}
              onClick={() => setFilterMode('past')}
            >
              Прошедшие
            </button>
          </div>
        </>
      )}

      {items.length === 0 && (
        <div className="empty-state">Список пуст — добавьте первый заказ выше.</div>
      )}
      {items.length > 0 && filtered.length === 0 && (
        <div className="empty-state">Ничего не найдено.</div>
      )}

      {filtered.map((it) => {
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
                    {it.clientType === 'org' ? '🏢 ' : ''}{it.clientName || 'Без имени'}{it.brand ? ` — ${it.brand}` : ''}
                    {clientKey(it) && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          fontWeight: 400,
                          color: returningMap[it.id] ? 'var(--text-dim)' : 'var(--accent)',
                        }}
                      >
                        {returningMap[it.id] ? 'постоянный' : 'новый'}
                      </span>
                    )}
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
                {it.packingList && (
                  <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 4 }}>🎒 {it.packingList}</div>
                )}
                {it.serialNumber && (
                  <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 4 }}>🔧 № {it.serialNumber}</div>
                )}
                {it.note && <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 4 }}>{it.note}</div>}
                {it.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {it.tags.map((t) => (
                      <span key={t} className="pill">{t}</span>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button className="btn btn-sm" onClick={() => setExpanded(isOpen ? null : it.id)}>
                    Чек-лист {doneCount}/{orderOperations.length}
                  </button>
                  {it.date && (
                    <button className="btn btn-sm" onClick={() => downloadIcs(it)}>📅 В календарь</button>
                  )}
                  {it.date && !label.past && (
                    <button className="btn btn-sm" onClick={() => shareReminder(it)}>✉️ Напомнить</button>
                  )}
                  {it.date === todayStr && (
                    <button className="btn btn-sm" onClick={() => shareOnMyWay(it)}>🚗 Выезжаю</button>
                  )}
                  <button className="btn btn-sm" onClick={() => navigate(`/tools/diagnostic?order=${it.id}`)}>🔍 Диагностика</button>
                  <button className="btn btn-sm" onClick={() => navigate(`/tools/work-order?order=${it.id}`)}>📋 Порядок работ</button>
                  {doneCount > 0 && (
                    <button className="btn btn-sm" onClick={() => shareEstimate(it)}>📤 Смета</button>
                  )}
                  <button className="btn btn-sm" onClick={() => repeatOrder(it)}>🔁 Повторить</button>
                  {it.serialNumber && (
                    <button className="btn btn-sm" onClick={() => setSearch(it.serialNumber)}>🔧 История инструмента</button>
                  )}
                  {!findBlacklistEntry(clientKey(it)) && (
                    <button className="btn btn-sm" onClick={() => addToBlacklist(it)}>🚫 В ЧС</button>
                  )}
                  {it.isWarranty ? (
                    <span className="pill">Гарантия</span>
                  ) : (
                    total > 0 && (
                      <button
                        className="pill badge-accent"
                        style={{ border: 'none', cursor: 'pointer' }}
                        onClick={() => togglePaymentStatus(it.id)}
                      >
                        {total.toLocaleString('ru-RU')} ₽ · {PAYMENT_LABELS[it.paymentStatus] || PAYMENT_LABELS.unpaid}
                      </button>
                    )
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
                <div className="row" style={{ marginTop: 8, alignItems: 'center' }}>
                  <label style={{ fontSize: 13, color: 'var(--text-dim)' }}>Расходы на материалы, ₽</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={it.expenses ?? ''}
                    onChange={(e) => setOrderExpenses(it.id, e.target.value)}
                    style={{ width: 84, textAlign: 'right' }}
                  />
                </div>
                {orderExpenses(it) > 0 && !it.isWarranty && (
                  <div className="row" style={{ marginTop: 4, fontSize: 13, color: 'var(--text-dim)' }}>
                    <span>Прибыль</span>
                    <span>{orderProfit(it).toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                {inventory.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
                      Списать со склада
                    </label>
                    <div className="row" style={{ gap: 8 }}>
                      <select value={invPick} onChange={(e) => setInvPick(e.target.value)} style={{ flex: 1 }}>
                        <option value="">Выберите материал…</option>
                        {inventory.map((i) => (
                          <option key={i.id} value={i.id}>{i.name} ({i.qty} {i.unit})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={invQty}
                        onChange={(e) => setInvQty(e.target.value)}
                        style={{ width: 60, textAlign: 'center' }}
                      />
                      <button className="btn btn-sm" onClick={() => consumeInventory(it.id)} disabled={!invPick}>
                        Списать
                      </button>
                    </div>
                  </div>
                )}
                {it.time && (
                  <div className="row" style={{ marginTop: 8, alignItems: 'center' }}>
                    <label style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                      Фактическое окончание (план: {it.endTime || '—'})
                    </label>
                    <input
                      type="time"
                      value={it.actualEndTime || ''}
                      onChange={(e) => setActualEndTime(it.id, e.target.value)}
                      style={{ width: 110 }}
                    />
                  </div>
                )}
                {it.time && it.endTime && it.actualEndTime && (() => {
                  const plannedMin = it.endTime.split(':').reduce((h, m, i) => h + (i === 0 ? Number(m) * 60 : Number(m)), 0)
                  const actualMin = it.actualEndTime.split(':').reduce((h, m, i) => h + (i === 0 ? Number(m) * 60 : Number(m)), 0)
                  const diff = actualMin - plannedMin
                  if (diff === 0) return null
                  return (
                    <div style={{ fontSize: 12, color: diff > 0 ? 'var(--danger)' : 'var(--text-dim)', marginTop: 2 }}>
                      {diff > 0 ? `⏱ Задержка на ${diff} мин` : `⏱ Закончили на ${Math.abs(diff)} мин раньше`}
                    </div>
                  )
                })()}
                {!it.isWarranty && total > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
                      Способ оплаты
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m}
                          className={`btn btn-sm ${it.paymentMethod === m ? 'btn-primary' : ''}`}
                          style={{ flex: 1 }}
                          onClick={() => setPaymentMethod(it.id, m)}
                        >
                          {PAYMENT_METHOD_LABELS[m]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
