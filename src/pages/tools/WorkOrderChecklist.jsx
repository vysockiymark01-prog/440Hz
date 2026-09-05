import { useNavigate, useSearchParams } from 'react-router-dom'
import { workOrderSteps } from '../../data/checklists.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function WorkOrderChecklist() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')
  const storageKey = orderId ? `pt_workorder_checked_v1_${orderId}` : 'pt_workorder_checked_v1'
  const [checked, setChecked] = useLocalStorage(storageKey, {})
  const { t } = useLanguage()

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }))
  const reset = () => setChecked({})

  const done = workOrderSteps.filter((s) => checked[s.id]).length

  return (
    <div>
      <button
        className="back-link"
        onClick={() => navigate(orderId ? '/tools/my-orders' : '/tools')}
      >
        {orderId ? t('back_order') : `‹ ${t('back_tools')}`}
      </button>
      <h1 className="screen-title">{t('wo_title')}</h1>
      <p className="screen-subtitle">
        {t('wo_progress', { done, total: workOrderSteps.length })}{orderId ? t('dc_saved_for_order') : ''}
      </p>

      <div className="card">
        {workOrderSteps.map((s, i) => (
          <label key={s.id} className={`checklist-item ${checked[s.id] ? 'done' : ''}`}>
            <input type="checkbox" checked={!!checked[s.id]} onChange={() => toggle(s.id)} />
            <span className="checklist-text">
              <strong>{i + 1}. {s.title}.</strong> {s.text}
            </span>
          </label>
        ))}
      </div>

      <button className="btn btn-block" onClick={reset}>{t('wo_reset')}</button>
    </div>
  )
}
