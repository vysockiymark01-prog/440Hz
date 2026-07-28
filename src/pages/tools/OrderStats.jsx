import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { orderTotal } from '../../utils/orderTotal.js'

const MONTH_NAMES = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
]

function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} ${year}`
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function toDateInput(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function startOfWeek(d) {
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function endOfDay(d) {
  const nd = new Date(d)
  nd.setHours(23, 59, 59, 999)
  return nd
}

export default function OrderStats() {
  const navigate = useNavigate()
  const [items] = useLocalStorage('pt_my_orders_v1', [])
  const [rangeMode, setRangeMode] = useState('week') // 'week' | 'month' | 'custom'
  const today = useMemo(() => new Date(), [])
  const [customFrom, setCustomFrom] = useState(() => toDateInput(startOfWeek(new Date())))
  const [customTo, setCustomTo] = useState(() => toDateInput(new Date()))

  const priced = items
    .map((it) => ({ ...it, total: orderTotal(it) }))
    .filter((it) => it.total > 0)

  const grandTotal = priced.reduce((sum, it) => sum + it.total, 0)
  const avgCheck = priced.length ? Math.round(grandTotal / priced.length) : 0

  const byMonth = {}
  priced.forEach((it) => {
    if (!it.date) return
    const key = monthKey(it.date)
    if (!byMonth[key]) byMonth[key] = { sum: 0, count: 0 }
    byMonth[key].sum += it.total
    byMonth[key].count += 1
  })
  const months = Object.keys(byMonth).sort().reverse()

  const { rangeStart, rangeEnd, rangeLabel } = useMemo(() => {
    if (rangeMode === 'week') {
      const start = startOfWeek(today)
      const end = endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6))
      return {
        rangeStart: start,
        rangeEnd: end,
        rangeLabel: `неделя ${start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`,
      }
    }
    if (rangeMode === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0))
      return {
        rangeStart: start,
        rangeEnd: end,
        rangeLabel: monthLabel(monthKey(start)),
      }
    }
    const start = customFrom ? new Date(`${customFrom}T00:00:00`) : null
    const end = customTo ? endOfDay(new Date(`${customTo}T00:00:00`)) : null
    return {
      rangeStart: start,
      rangeEnd: end,
      rangeLabel: start && end
        ? `${start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} – ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`
        : 'выберите даты',
    }
  }, [rangeMode, today, customFrom, customTo])

  const inRange = priced.filter((it) => {
    if (!it.date || !rangeStart || !rangeEnd) return false
    const d = new Date(`${it.date}T00:00:00`)
    return d >= rangeStart && d <= rangeEnd
  })
  const rangeSum = inRange.reduce((sum, it) => sum + it.total, 0)

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools/my-orders')}>‹ Мои заказы</button>
      <h1 className="screen-title">Статистика заработка</h1>
      <p className="screen-subtitle">
        Считается по заказам с отмеченными операциями и указанными ценами. Данные берутся из «Моих заказов».
      </p>

      {priced.length === 0 ? (
        <div className="empty-state">
          Пока нет заказов с ценами — отметьте операции и укажите стоимость в «Моих заказах».
        </div>
      ) : (
        <>
          <div className="theme-options" style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <button
              className={`theme-option ${rangeMode === 'week' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '10px 6px' }}
              onClick={() => setRangeMode('week')}
            >
              Эта неделя
            </button>
            <button
              className={`theme-option ${rangeMode === 'month' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '10px 6px' }}
              onClick={() => setRangeMode('month')}
            >
              Этот месяц
            </button>
            <button
              className={`theme-option ${rangeMode === 'custom' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '10px 6px' }}
              onClick={() => setRangeMode('custom')}
            >
              Свой период
            </button>
          </div>

          {rangeMode === 'custom' && (
            <div className="row" style={{ gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>С</label>
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>По</label>
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            </div>
          )}

          <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="big-number">{rangeSum.toLocaleString('ru-RU')} ₽</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
              {rangeLabel} · {inRange.length} {inRange.length === 1 ? 'заказ' : 'заказов'}
            </div>
          </div>

          <div className="row" style={{ gap: 10, marginBottom: 16 }}>
            <div className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{grandTotal.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>всего заработано</div>
            </div>
            <div className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{avgCheck.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>средний чек</div>
            </div>
            <div className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{priced.length}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>заказов с ценой</div>
            </div>
          </div>

          <h3 style={{ marginBottom: 8 }}>По месяцам</h3>
          {months.map((key) => (
            <div key={key} className="card row" style={{ alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{monthLabel(key)}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {byMonth[key].count} {byMonth[key].count === 1 ? 'заказ' : 'заказа'}
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>{byMonth[key].sum.toLocaleString('ru-RU')} ₽</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
