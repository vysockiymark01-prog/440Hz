import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { clientKey } from '../../utils/clientKey.js'
import { orderTotal, orderExpenses, orderProfit } from '../../utils/orderTotal.js'
import { getRemainingChecklist } from '../../utils/remainingWork.js'
import orderOperations from '../../data/orderOperations.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const CONTINUE_DRAFT_KEY = 'pt_continue_draft_v1'

// Хромиум-браузерүүдийн ICU-д mn-MN бүрэн дэмжигдэхгүй байж болзошгүй тул
// огноог гараар (тоон сар) форматлана.
function shortDate(d, lang) {
  if (lang === 'mn') return `${d.getMonth() + 1}-р сарын ${d.getDate()}`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function longDate(d, lang) {
  if (lang === 'mn') return `${d.getFullYear()} · ${d.getMonth() + 1}-р сарын ${d.getDate()}`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ClientProfile() {
  const { key } = useParams()
  const navigate = useNavigate()
  const { t, tr, lang } = useLanguage()
  const PAYMENT_LABELS = { paid: t('cpf_paid'), partial: t('cpf_partial'), unpaid: t('cpf_unpaid') }
  const [items] = useLocalStorage('pt_my_orders_v1', [])
  const [blacklist, setBlacklist] = useLocalStorage('pt_blacklist_v1', [])
  const decodedKey = decodeURIComponent(key)

  const visits = useMemo(
    () =>
      items
        .filter((it) => clientKey(it) === decodedKey)
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [items, decodedKey]
  )

  if (visits.length === 0) {
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/tools/clients')}>{t('cpf_back')}</button>
        <div className="empty-state">{t('cpf_not_found')}</div>
      </div>
    )
  }

  const latest = visits[0]
  const totalEarned = visits.reduce((sum, it) => sum + orderTotal(it), 0)
  const totalExpenses = visits.reduce((sum, it) => sum + orderExpenses(it), 0)
  const totalProfit = totalEarned - totalExpenses
  const debtVisits = visits.filter((it) => !it.isWarranty && orderTotal(it) > 0 && it.paymentStatus !== 'paid')
  const totalDebt = debtVisits.reduce((sum, it) => sum + orderTotal(it), 0)
  const firstDate = visits[visits.length - 1].date
  const lastDate = latest.date
  const allTags = [...new Set(visits.flatMap((it) => it.tags || []))]
  const serialNumbers = [...new Set(visits.map((it) => it.serialNumber).filter(Boolean))]
  const blacklistEntry = blacklist.find((b) => b.key === decodedKey)
  const notes = visits.filter((it) => it.note && it.note.trim())
  // visits отсортированы по дате по убыванию — первый незаконченный и есть актуальный.
  const unfinishedVisit = visits.find((it) => it.unfinished)
  const stoppedOpTitle = unfinishedVisit
    ? tr(orderOperations.find((op) => op.id === unfinishedVisit.stoppedOpId)?.title)
    : null

  const removeFromBlacklist = () => {
    setBlacklist((prev) => prev.filter((b) => b.key !== decodedKey))
  }

  const continueVisit = () => {
    if (!unfinishedVisit) return
    const { checklist, prices } = getRemainingChecklist(unfinishedVisit)
    const draft = {
      brand: unfinishedVisit.brand || '',
      clientName: unfinishedVisit.clientName || '',
      clientType: unfinishedVisit.clientType || 'person',
      phone: unfinishedVisit.phone || '',
      address: unfinishedVisit.address || '',
      serialNumber: unfinishedVisit.serialNumber || '',
      checklist,
      prices,
    }
    try {
      window.localStorage.setItem(CONTINUE_DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* ignore */
    }
    navigate('/tools/my-orders')
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools/clients')}>{t('cpf_back')}</button>
      <h1 className="screen-title">{latest.clientName || latest.brand || t('cl_no_name')}</h1>
      <p className="screen-subtitle">
        {latest.clientType === 'org' ? t('cpf_org') : t('cpf_person')}
        {latest.phone && <> · <a href={`tel:${latest.phone.replace(/[^+\d]/g, '')}`}>{latest.phone}</a></>}
      </p>

      {blacklistEntry && (
        <div className="result-flash bad" style={{ marginBottom: 14 }}>
          <div style={{ marginBottom: 8 }}>
            {t('cpf_blacklisted')}{blacklistEntry.reason ? `: ${blacklistEntry.reason}` : ''}
          </div>
          <button className="btn btn-sm" onClick={removeFromBlacklist}>{t('cpf_unblacklist')}</button>
        </div>
      )}

      <div className="row" style={{ gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 45%', textAlign: 'center' }}>
          <div className="big-number" style={{ fontSize: 22 }}>{visits.length}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>{t('cpf_visits_label')}</div>
        </div>
        <div className="card" style={{ flex: '1 1 45%', textAlign: 'center' }}>
          <div className="big-number" style={{ fontSize: 22 }}>{totalEarned.toLocaleString('ru-RU')} ₽</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>{t('cpf_earned_label')}</div>
        </div>
      </div>

      {totalExpenses > 0 && (
        <div className="card row" style={{ marginBottom: 14, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{t('cpf_profit_label')}</span>
          <span style={{ fontWeight: 700 }}>{totalProfit.toLocaleString('ru-RU')} ₽</span>
        </div>
      )}

      {unfinishedVisit && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 6 }}>{t('cpf_unfinished_title')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10 }}>
            {t('cpf_stopped_at')}: {stoppedOpTitle || '—'}
            {unfinishedVisit.stoppedNote ? ` — ${unfinishedVisit.stoppedNote}` : ''}
          </div>
          <button className="btn btn-block btn-primary" onClick={continueVisit}>{t('cpf_continue_btn')}</button>
        </div>
      )}

      {totalDebt > 0 && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: 'var(--danger)' }}>
            💰 {t('cpf_debt_label')}: {totalDebt.toLocaleString('ru-RU')} ₽ · {debtVisits.length} {debtVisits.length === 1 ? t('cpf_debt_order_one') : t('cpf_debt_order_many')}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          {t('cpf_first_visit')}: {firstDate ? longDate(new Date(firstDate), lang) : t('cpf_no_date')}
          <br />
          {t('cpf_last_visit')}: {lastDate ? longDate(new Date(lastDate), lang) : t('cpf_no_date')}
        </div>
      </div>

      {latest.address && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 6 }}>{t('cpf_last_address')}</div>
          <div>{latest.address}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <a className="btn btn-sm" href={`https://2gis.ru/search/${encodeURIComponent(latest.address)}`} target="_blank" rel="noopener noreferrer">2ГИС</a>
            <a className="btn btn-sm" href={`https://yandex.ru/maps/?text=${encodeURIComponent(latest.address)}`} target="_blank" rel="noopener noreferrer">Я.Карты</a>
          </div>
        </div>
      )}

      {serialNumbers.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 4 }}>{t('cpf_instruments_label')}</div>
          {serialNumbers.map((sn) => <div key={sn}>🔧 {sn}</div>)}
        </div>
      )}

      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {allTags.map((t) => <span key={t} className="pill">{t}</span>)}
        </div>
      )}

      <div className="section-label">{t('cpf_history_label')}</div>
      {visits.map((it) => {
        const opsText = orderOperations.filter((op) => it.checklist?.[op.id]).map((op) => tr(op.title)).join(', ')
        const total = orderTotal(it)
        return (
          <div key={it.id} className="card">
            <div className="row" style={{ alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>
                {it.date ? longDate(new Date(it.date), lang) : t('cpf_no_date_short')}
              </div>
              {it.unfinished && (
                <span className="pill" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>{t('cpf_unfinished_pill')}</span>
              )}
              {it.isWarranty ? (
                <span className="pill">{t('cpf_warranty_pill')}</span>
              ) : total > 0 ? (
                <span className="pill badge-accent">{total.toLocaleString('ru-RU')} ₽ · {PAYMENT_LABELS[it.paymentStatus] || PAYMENT_LABELS.unpaid}</span>
              ) : null}
            </div>
            {opsText && <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{opsText}</div>}
            {it.unfinished && (
              <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>
                {t('cpf_stopped_at')}: {tr(orderOperations.find((op) => op.id === it.stoppedOpId)?.title) || '—'}
                {it.stoppedNote ? ` — ${it.stoppedNote}` : ''}
              </div>
            )}
            {it.note && <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 4 }}>{it.note}</div>}
          </div>
        )
      })}

      {notes.length > 0 && (
        <>
          <div className="section-label">{t('cpf_notes_label')}</div>
          <div className="card">
            {notes.map((it, i) => (
              <div key={it.id} style={{ marginBottom: i < notes.length - 1 ? 8 : 0 }}>
                <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                  {it.date ? shortDate(new Date(it.date), lang) : ''}
                </span>{' '}
                {it.note}
              </div>
            ))}
          </div>
        </>
      )}

      <Link to="/tools/my-orders" className="btn btn-block" style={{ marginTop: 16 }}>{t('cpf_to_orders')}</Link>
    </div>
  )
}
