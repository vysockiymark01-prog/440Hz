import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { orderTotal } from '../../utils/orderTotal.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

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
  const { t } = useLanguage()
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

  const orderWord = count === 1
    ? t('tax_order_one')
    : (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)
      ? t('tax_order_few')
      : t('tax_order_many'))

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ {t('back_more')}</button>
      <h1 className="screen-title">{t('tax_title')}</h1>
      <p className="screen-subtitle">{t('tax_subtitle')}</p>

      <div className="row" style={{ gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('tax_label_year')}</label>
          <input
            type="number"
            inputMode="numeric"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || today.getFullYear())}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('tax_label_quarter')}</label>
          <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
            <option value={1}>{t('tax_q1')}</option>
            <option value={2}>{t('tax_q2')}</option>
            <option value={3}>{t('tax_q3')}</option>
            <option value={4}>{t('tax_q4')}</option>
          </select>
        </div>
      </div>

      {count === 0 ? (
        <div className="empty-state">{t('tax_empty')}</div>
      ) : (
        <>
          <div className="card" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div className="big-number">{totalTax.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
              {t('tax_due_for', { count, orders: orderWord })}
            </div>
          </div>

          <div className="card row" style={{ alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{t('tax_from_person')}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                {t('tax_income', { amount: personIncome.toLocaleString('ru-RU') })}
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>{taxPerson.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
          </div>

          <div className="card row" style={{ alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{t('tax_from_org')}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                {t('tax_income', { amount: orgIncome.toLocaleString('ru-RU') })}
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>{taxOrg.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
          </div>

          <div className="card row" style={{ alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>{t('tax_total_income')}</div>
            <div style={{ fontWeight: 700 }}>{totalIncome.toLocaleString('ru-RU')} ₽</div>
          </div>
        </>
      )}
    </div>
  )
}
