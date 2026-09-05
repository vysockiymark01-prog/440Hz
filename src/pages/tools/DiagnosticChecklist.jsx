import { useNavigate, useSearchParams } from 'react-router-dom'
import { diagnosticStages, doNotBuyOrTune } from '../../data/checklists.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function DiagnosticChecklist() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')
  const storageKey = orderId ? `pt_diagnostic_checked_v1_${orderId}` : 'pt_diagnostic_checked_v1'
  const [checked, setChecked] = useLocalStorage(storageKey, {})
  const { t } = useLanguage()

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }))
  const reset = () => setChecked({})

  const done = diagnosticStages.filter((s) => checked[s.id]).length

  return (
    <div>
      <button
        className="back-link"
        onClick={() => navigate(orderId ? '/tools/my-orders' : '/tools')}
      >
        {orderId ? t('back_order') : `‹ ${t('back_tools')}`}
      </button>
      <h1 className="screen-title">{t('dc_title')}</h1>
      <p className="screen-subtitle">
        {t('dc_progress', { done, total: diagnosticStages.length })}{orderId ? t('dc_saved_for_order') : ''}
      </p>

      <div className="card">
        {diagnosticStages.map((s) => (
          <label key={s.id} className={`checklist-item ${checked[s.id] ? 'done' : ''}`}>
            <input type="checkbox" checked={!!checked[s.id]} onChange={() => toggle(s.id)} />
            <span className="checklist-text">
              <strong>{s.title}.</strong> {s.text}
            </span>
          </label>
        ))}
      </div>

      <button className="btn btn-block" onClick={reset} style={{ marginBottom: 20 }}>{t('dc_reset')}</button>

      <div className="section-label">{t('dc_do_not')}</div>
      <div className="card">
        {doNotBuyOrTune.map((text, i) => (
          <p key={i} style={{ marginBottom: i === doNotBuyOrTune.length - 1 ? 0 : 10 }}>
            ⚠️ {text}
          </p>
        ))}
      </div>
    </div>
  )
}
