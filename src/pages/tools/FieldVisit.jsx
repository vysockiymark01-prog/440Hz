import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { diagnosticStages, workOrderSteps } from '../../data/checklists.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

function buildShareText(t, diagDone, diagTotal, workDone, workTotal) {
  const lines = [
    'Чек-лист на выезд — «Настройщик фортепиано»',
    `${t('fv_diag_label')}: ${diagDone}/${diagTotal}`,
    `${t('fv_work_label')}: ${workDone}/${workTotal}`,
  ]
  return lines.join('\n')
}

export default function FieldVisit() {
  const navigate = useNavigate()
  // Те же ключи localStorage, что и в отдельных чек-листах — отметки синхронны.
  const [diagChecked, setDiagChecked] = useLocalStorage('pt_diagnostic_checked_v1', {})
  const [workChecked, setWorkChecked] = useLocalStorage('pt_workorder_checked_v1', {})
  const [shareStatus, setShareStatus] = useState(null)
  const { t, tr } = useLanguage()

  const toggleDiag = (id) => setDiagChecked((c) => ({ ...c, [id]: !c[id] }))
  const toggleWork = (id) => setWorkChecked((c) => ({ ...c, [id]: !c[id] }))

  const diagDone = diagnosticStages.filter((s) => diagChecked[s.id]).length
  const workDone = workOrderSteps.filter((s) => workChecked[s.id]).length

  const share = async () => {
    const text = buildShareText(t, diagDone, diagnosticStages.length, workDone, workOrderSteps.length)
    if (navigator.share) {
      try {
        await navigator.share({ title: t('fv_title'), text })
        return
      } catch {
        // пользователь отменил или Web Share недоступен — пробуем буфер обмена
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus(t('fv_share_copied'))
    } catch {
      setShareStatus(t('fv_share_failed'))
    }
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('fv_title')}</h1>
      <p className="screen-subtitle">{t('fv_subtitle')}</p>

      <div className="section-label">{t('fv_diag_label')} ({diagDone}/{diagnosticStages.length})</div>
      <div className="card">
        {diagnosticStages.map((s) => (
          <label key={s.id} className={`checklist-item ${diagChecked[s.id] ? 'done' : ''}`}>
            <input type="checkbox" checked={!!diagChecked[s.id]} onChange={() => toggleDiag(s.id)} />
            <span className="checklist-text">{tr(s.title)}</span>
          </label>
        ))}
      </div>
      <Link to="/tools/diagnostic" className="card-tap row" style={{ marginBottom: 20 }}>
        <span>{t('fv_diag_full')}</span>
        <span>›</span>
      </Link>

      <div className="section-label">{t('fv_work_label')} ({workDone}/{workOrderSteps.length})</div>
      <div className="card">
        {workOrderSteps.map((s, i) => (
          <label key={s.id} className={`checklist-item ${workChecked[s.id] ? 'done' : ''}`}>
            <input type="checkbox" checked={!!workChecked[s.id]} onChange={() => toggleWork(s.id)} />
            <span className="checklist-text">{i + 1}. {tr(s.title)}</span>
          </label>
        ))}
      </div>
      <Link to="/tools/work-order" className="card-tap row" style={{ marginBottom: 20 }}>
        <span>{t('fv_work_full')}</span>
        <span>›</span>
      </Link>

      <div className="section-label">{t('fv_quick_access')}</div>
      <Link to="/tools/wire" className="card-tap row">
        <span className="row-start">📏 <span>{t('fv_wire_table')}</span></span>
        <span>›</span>
      </Link>
      <Link to="/tools/tuning-fork" className="card-tap row" style={{ marginBottom: 20 }}>
        <span className="row-start">🎵 <span>{t('fv_tuning_fork')}</span></span>
        <span>›</span>
      </Link>

      <button className="btn btn-block btn-primary" onClick={share}>{t('fv_share')}</button>
      {shareStatus && (
        <div className="result-flash good" style={{ marginTop: 12 }}>{shareStatus}</div>
      )}
    </div>
  )
}
