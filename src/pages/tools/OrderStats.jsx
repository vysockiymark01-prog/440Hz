import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { orderTotal, orderExpenses, orderProfit } from '../../utils/orderTotal.js'
import orderOperations from '../../data/orderOperations.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const MONTH_NAMES = {
  ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  mn: ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'],
}

function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key, lang) {
  const [year, month] = key.split('-').map(Number)
  const names = MONTH_NAMES[lang] || MONTH_NAMES.ru
  return `${names[month - 1]} ${year}`
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// Хромиум-браузерүүдийн ICU-д mn-MN бүрэн дэмжигдэхгүй байж болзошгүй тул
// огноог гараар (тоон сар) форматлана, toLocaleDateString('mn-MN', ...) дээр найдахгүй.
function shortDate(d, lang) {
  if (lang === 'mn') return `${d.getMonth() + 1}-р сарын ${d.getDate()}`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function longDate(d, lang) {
  if (lang === 'mn') return `${d.getMonth() + 1}-р сарын ${d.getDate()}`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
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

function orderCountLabel(count, t) {
  if (count === 1) return t('ost_order_one')
  if (count >= 2 && count <= 4) return t('ost_order_few')
  return t('ost_order_many')
}

export default function OrderStats() {
  const navigate = useNavigate()
  const { t, tr, lang } = useLanguage()
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
        rangeLabel: `${shortDate(start, lang)} – ${shortDate(end, lang)}`,
      }
    }
    if (rangeMode === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0))
      return {
        rangeStart: start,
        rangeEnd: end,
        rangeLabel: monthLabel(monthKey(start), lang),
      }
    }
    const start = customFrom ? new Date(`${customFrom}T00:00:00`) : null
    const end = customTo ? endOfDay(new Date(`${customTo}T00:00:00`)) : null
    return {
      rangeStart: start,
      rangeEnd: end,
      rangeLabel: start && end
        ? `${longDate(start, lang)} – ${longDate(end, lang)}`
        : t('ost_choose_dates'),
    }
  }, [rangeMode, today, customFrom, customTo, lang, t])

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
  const roadHoursLabel = `${Math.floor(roadMinutes / 60)} ${t('ost_hours_short')} ${roadMinutes % 60} ${t('ost_minutes_short')}`

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools/my-orders')}>‹ {t('tools_item_my_orders')}</button>
      <h1 className="screen-title">{t('tools_item_order_stats')}</h1>
      <p className="screen-subtitle">{t('ost_subtitle')}</p>

      {priced.length === 0 ? (
        <div className="empty-state">{t('ost_empty')}</div>
      ) : (
        <>
          <div className="theme-options" style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <button
              className={`theme-option ${rangeMode === 'week' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '10px 6px' }}
              onClick={() => setRangeMode('week')}
            >
              {t('ost_range_week')}
            </button>
            <button
              className={`theme-option ${rangeMode === 'month' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '10px 6px' }}
              onClick={() => setRangeMode('month')}
            >
              {t('ost_range_month')}
            </button>
            <button
              className={`theme-option ${rangeMode === 'custom' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '10px 6px' }}
              onClick={() => setRangeMode('custom')}
            >
              {t('ost_range_custom')}
            </button>
          </div>

          {rangeMode === 'custom' && (
            <div className="row" style={{ gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('ost_range_from')}</label>
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('ost_range_to')}</label>
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            </div>
          )}

          <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="big-number">{rangeSum.toLocaleString('ru-RU')} ₽</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
              {rangeLabel} · {inRange.length} {orderCountLabel(inRange.length, t)}
            </div>
            {rangeExpenses > 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
                {t('ost_expenses_profit', { expenses: rangeExpenses.toLocaleString('ru-RU'), profit: rangeProfit.toLocaleString('ru-RU') })}
              </div>
            )}
            {roadMinutes > 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
                {t('ost_road_time', { time: roadHoursLabel })}
              </div>
            )}
          </div>

          <div className="row" style={{ gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: '1 1 30%', textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{grandTotal.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>{t('ost_total_earned')}</div>
            </div>
            <div className="card" style={{ flex: '1 1 30%', textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{avgCheck.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>{t('ost_avg_check')}</div>
            </div>
            <div className="card" style={{ flex: '1 1 30%', textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{priced.length}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>{t('ost_orders_with_price')}</div>
            </div>
          </div>

          <div className="row" style={{ gap: 10, marginBottom: 16 }}>
            <div className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{grandExpenses.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>{t('ost_material_expenses')}</div>
            </div>
            <div className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="big-number" style={{ fontSize: 22 }}>{grandProfit.toLocaleString('ru-RU')} ₽</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>{t('ost_net_profit')}</div>
            </div>
          </div>

          <h3 style={{ marginBottom: 8 }}>{t('ost_by_month')}</h3>
          {months.map((key) => (
            <div key={key} className="card row" style={{ alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{monthLabel(key, lang)}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {byMonth[key].count} {orderCountLabel(byMonth[key].count, t)}
                  {byMonth[key].expenses > 0 ? ` · ${t('ost_net_profit')} ${(byMonth[key].sum - byMonth[key].expenses).toLocaleString('ru-RU')} ₽` : ''}
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>{byMonth[key].sum.toLocaleString('ru-RU')} ₽</div>
            </div>
          ))}

          {opStatsTotal >= 3 && blindSpots.length > 0 && (
            <>
              <h3 style={{ marginBottom: 8 }}>{t('ost_blind_spots')}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: -4, marginBottom: 8 }}>
                {t('ost_blind_spots_desc')}
              </p>
              {blindSpots.map((op) => (
                <div key={op.id} className="card row" style={{ alignItems: 'center' }}>
                  <span>{tr(op.title)}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{t('ost_pct_orders', { pct: op.pct, count: op.count })}</span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
