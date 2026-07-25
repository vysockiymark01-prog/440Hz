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

export default function OrderStats() {
  const navigate = useNavigate()
  const [items] = useLocalStorage('pt_my_orders_v1', [])

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
