import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { diagnosticStages, workOrderSteps } from '../../data/checklists.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

function buildShareText(diagDone, diagTotal, workDone, workTotal) {
  const lines = [
    'Чек-лист на выезд — «Настройщик фортепиано»',
    `Диагностика: ${diagDone}/${diagTotal} этапов отмечено`,
    `Порядок работы: ${workDone}/${workTotal} шагов отмечено`,
  ]
  return lines.join('\n')
}

export default function FieldVisit() {
  const navigate = useNavigate()
  // Те же ключи localStorage, что и в отдельных чек-листах — отметки синхронны.
  const [diagChecked, setDiagChecked] = useLocalStorage('pt_diagnostic_checked_v1', {})
  const [workChecked, setWorkChecked] = useLocalStorage('pt_workorder_checked_v1', {})
  const [shareStatus, setShareStatus] = useState(null)

  const toggleDiag = (id) => setDiagChecked((c) => ({ ...c, [id]: !c[id] }))
  const toggleWork = (id) => setWorkChecked((c) => ({ ...c, [id]: !c[id] }))

  const diagDone = diagnosticStages.filter((s) => diagChecked[s.id]).length
  const workDone = workOrderSteps.filter((s) => workChecked[s.id]).length

  const share = async () => {
    const text = buildShareText(diagDone, diagnosticStages.length, workDone, workOrderSteps.length)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Чек-лист на выезд', text })
        return
      } catch {
        // пользователь отменил или Web Share недоступен — пробуем буфер обмена
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('Скопировано в буфер обмена')
    } catch {
      setShareStatus('Не удалось поделиться — скопируйте вручную')
    }
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">На выезд</h1>
      <p className="screen-subtitle">Свод перед визитом к клиенту: диагностика, порядок работы и быстрые инструменты</p>

      <div className="section-label">Диагностика ({diagDone}/{diagnosticStages.length})</div>
      <div className="card">
        {diagnosticStages.map((s) => (
          <label key={s.id} className={`checklist-item ${diagChecked[s.id] ? 'done' : ''}`}>
            <input type="checkbox" checked={!!diagChecked[s.id]} onChange={() => toggleDiag(s.id)} />
            <span className="checklist-text">{s.title}</span>
          </label>
        ))}
      </div>
      <Link to="/tools/diagnostic" className="card-tap row" style={{ marginBottom: 20 }}>
        <span>Полное описание этапов диагностики</span>
        <span>›</span>
      </Link>

      <div className="section-label">Порядок работы ({workDone}/{workOrderSteps.length})</div>
      <div className="card">
        {workOrderSteps.map((s, i) => (
          <label key={s.id} className={`checklist-item ${workChecked[s.id] ? 'done' : ''}`}>
            <input type="checkbox" checked={!!workChecked[s.id]} onChange={() => toggleWork(s.id)} />
            <span className="checklist-text">{i + 1}. {s.title}</span>
          </label>
        ))}
      </div>
      <Link to="/tools/work-order" className="card-tap row" style={{ marginBottom: 20 }}>
        <span>Полное описание порядка работы</span>
        <span>›</span>
      </Link>

      <div className="section-label">Быстрый доступ</div>
      <Link to="/tools/wire" className="card-tap row">
        <span className="row-start">📏 <span>Таблица проволоки Röslau</span></span>
        <span>›</span>
      </Link>
      <Link to="/tools/tuning-fork" className="card-tap row" style={{ marginBottom: 20 }}>
        <span className="row-start">🎵 <span>Камертон</span></span>
        <span>›</span>
      </Link>

      <button className="btn btn-block btn-primary" onClick={share}>📤 Поделиться списком</button>
      {shareStatus && (
        <div className="result-flash good" style={{ marginTop: 12 }}>{shareStatus}</div>
      )}
    </div>
  )
}
