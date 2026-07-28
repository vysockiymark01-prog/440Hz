import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { orderTotal } from '../../utils/orderTotal.js'

function currentQuarter(date) {
  return Math.floor(date.getMonth() / 3) + 1
}

function quarterRange(year, quarter) {
  const startMonth = (quarter - 1) * 3
  const start = new Date(year, startMonth, 1)
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999)
  return { start, end }
}

export default function TaxCalculator() {
  const navigate = useNavigate()
  const [items] = useLocalStorage('pt_my_orders_v1', [])
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [quarter, setQuarter] = useState(currentQuarter(today))

  const { start, end } = quarterRange(year, quarter)

  const { personIncome, orgIncome, count } = useMemo(() => {
    let personIncome = 0
    let orgIncome = 0
    let count = 0
    items.forEach((it) => {
      if (it.isWarranty || !it.date) return
      const d = new Date(`${it.date}T00:00:00`)
      if (d < start || d > end) return
      const total = orderTotal(it)
      if (total <= 0) return
      count += 1
      if (it.clientType === 'org') orgIncome += total
      else personIncome += total
    })
    return { personIncome, orgIncome, count }
  }, [items, start, end])

  const totalIncome = personIncome + orgIncome
  const taxPerson = personIncome * 0.04
  const taxOrg = orgIncome * 0.06
  const totalTax = taxPerson + taxOrg

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Налоги</h1>
      <p className="screen-subtitle">
        Оценка налога на профессиональный доход (НПД, «самозанятость») по данным из «Моих заказов»:
        4% с расчётов от физлиц, 6% — от организаций. Это ориентировочный расчёт, а не официальная
        консультация — точную сумму и сроки уплаты смотрите в приложении «Мой налог» или у бухгалтера.
      </p>

      <div className="row" style={{ gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Год</label>
          <input
            type="number"
            inputMode="numeric"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || today.getFullYear())}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Квартал</label>
          <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
            <option value={1}>I (янв–мар)</option>
            <option value={2}>II (апр–июн)</option>
            <option value={3}>III (июл–сен)</option>
            <option value={4}>IV (окт–дек)</option>
          </select>
        </div>
      </div>

      {count === 0 ? (
        <div className="empty-state">За этот квартал нет оплаченных заказов с ценами.</div>
      ) : (
        <>
          <div className="card" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div className="big-number">{totalTax.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
              налог к уплате за {count} {count === 1 ? 'заказ' : 'заказов'}
            </div>
          </div>

          <div className="card row" style={{ alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>От физлиц (4%)</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                доход {personIncome.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>{taxPerson.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
          </div>

          <div className="card row" style={{ alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>От организаций (6%)</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                доход {orgIncome.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>{taxOrg.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
          </div>

          <div className="card row" style={{ alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>Итого доход за квартал</div>
            <div style={{ fontWeight: 700 }}>{totalIncome.toLocaleString('ru-RU')} ₽</div>
          </div>
        </>
      )}
    </div>
  )
}
