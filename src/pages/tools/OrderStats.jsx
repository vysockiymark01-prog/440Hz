import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { orderTotal, orderExpenses, orderProfit } from '../../utils/orderTotal.js'
import orderOperations from '../../data/orderOperations.js'

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

function timeToMin(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export default function OrderStats() {
  const navigate = useNavigate()
  const [items] = useLocalStorage('pt_my_orders_v1', [])
  const [rangeMode, setRangeMode] = useState('week') // 'week' | 'month' | 'custom'
  const today = useMemo(() => new Date(), [])
  const [customFrom, setCustomFrom] = useState(() => toDateInput(startOfWeek(new Date())))
  const [customTo, setCustomTo] = useState(() => toDateInput(new Date()))

  const priced = items
    .map((it) => ({ ...it, total: orderTotal(it), expenses: orderExpenses(it), profit: orderProfit(it) }))
    .filter((it) => it.total > 0)

  const grandTotal = priced.reduce((sum, it) => sum + it.total, 0)
  const grandExpenses = priced.reduce((sum, it) => sum + it.expenses, 0)
  const grandProfit = grandTotal - grandExpenses
  const avgCheck = priced.length ? Math.round(grandTotal / priced.length) : 0

  const byMonth = {}
  priced.forEach((it) => {
    if (!it.date) return
    const key = monthKey(it.date)
    if (!byMonth[key]) byMonth[key] = { sum: 0, expenses: 0, count: 0 }
    byMonth[key].sum += it.total
    byMonth[key].expenses += it.expenses
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
  const rangeExpenses = inRange.reduce((sum, it) => sum + it.expenses, 0)
  const rangeProfit = rangeSum - rangeExpenses

  const opStats = useMemo(() => {
    const withChecklist = items.filter((it) => it.checklist && Object.values(it.checklist).some(Boolean))
    const total = withChecklist.length
    return orderOperations
      .map((op) => {
        const count = withChecklist.filter((it) => it.checklist[op.id]).length
        return { ...op, count, pct: total ? Math.round((count / total) * 100) : 0 }
      })
      .sort((a, b) => a.pct - b.pct)
  }, [items])
  const opStatsTotal = items.filter((it) => it.checklist && Object.values(it.checklist).some(Boolean)).length
  const blindSpots = opStats.filter((op) => op.pct <= 25 && op.count > 0)

  const roadMinutes = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0
    const byDate = {}
    items.forEach((it) => {
      if (!it.date || !it.time) return
      const d = new Date(`${it.date}T00:00:00`)
      if (d < rangeStart || d > rangeEnd) return
      if (!byDate[it.date]) byDate[it.date] = []
      byDate[it.date].push(it)
    })
    let total = 0
    Object.values(byDate).forEach((dayItems) => {
      const sorted = [...dayItems].sort((a, b) => a.time.localeCompare(b.time))
      for (let i = 0; i < sorted.length - 1; i++) {
        const endMin = timeToMin(sorted[i].actualEndTime) ?? timeToMin(sorted[i].endTime) ?? timeToMin(sorted[i].time)
        const nextStartMin = timeToMin(sorted[i + 1].time)
        if (endMin != null && nextStartMin != null && nextStartMin > endMin) {
          total += nextStartMin - endMin
        }
      }
    })
    return total
  }, [items, rangeStart, rangeEnd])
  const roadHoursLabel = `${Math.floor(roadMinutes / 60)} ч ${roadMinutes % 60} мин`

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
            {rangeExpenses > 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
                расходы: {rangeExpenses.toLocaleString('ru-RU')} ₽ · прибыль: {rangeProfit.toLocaleString('ru-RU')} ₽
              </div>
            )}
            {roadMinutes > 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
                🚗 в разъездах между визитами: ~{roadHoursLabel}
              </div>
            )}
          </div>

          <div className="row" style={{ gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: '1 1 30%', textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{grandTotal.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>всего заработано</div>
            </div>
            <div className="card" style={{ flex: '1 1 30%', textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{avgCheck.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>средний чек</div>
            </div>
            <div className="card" style={{ flex: '1 1 30%', textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{priced.length}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>заказов с ценой</div>
            </div>
          </div>

          <div className="row" style={{ gap: 10, marginBottom: 16 }}>
            <div className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{grandExpenses.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>расходы на материалы</div>
            </div>
            <div className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{grandProfit.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>чистая прибыль</div>
            </div>
          </div>

          <h3 style={{ marginBottom: 8 }}>По месяцам</h3>
          {months.map((key) => (
            <div key={key} className="card row" style={{ alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{monthLabel(key)}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {byMonth[key].count} {byMonth[key].count === 1 ? 'заказ' : 'заказа'}
                  {byMonth[key].expenses > 0 ? ` · прибыль ${(byMonth[key].sum - byMonth[key].expenses).toLocaleString('ru-RU')} ₽` : ''}
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>{byMonth[key].sum.toLocaleString('ru-RU')} ₽</div>
            </div>
          ))}

          {opStatsTotal >= 3 && blindSpots.length > 0 && (
            <>
              <h3 style={{ marginBottom: 8 }}>Слепые зоны</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: -4, marginBottom: 8 }}>
                Эти операции реже всего попадают в чек-лист — возможно, вы иногда упускаете их из виду.
              </p>
              {blindSpots.map((op) => (
                <div key={op.id} className="card row" style={{ alignItems: 'center' }}>
                  <span>{op.title}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{op.pct}% заказов ({op.count})</span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
