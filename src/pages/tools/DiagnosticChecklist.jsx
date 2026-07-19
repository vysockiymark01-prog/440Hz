import { useNavigate } from 'react-router-dom'
import { diagnosticStages, doNotBuyOrTune } from '../../data/checklists.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export default function DiagnosticChecklist() {
  const navigate = useNavigate()
  const [checked, setChecked] = useLocalStorage('pt_diagnostic_checked_v1', {})

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }))
  const reset = () => setChecked({})

  const done = diagnosticStages.filter((s) => checked[s.id]).length

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Чек-лист диагностики</h1>
      <p className="screen-subtitle">{done} из {diagnosticStages.length} этапов отмечено</p>

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

      <button className="btn btn-block" onClick={reset} style={{ marginBottom: 20 }}>Сбросить отметки</button>

      <div className="section-label">Когда НЕ покупают и НЕ настраивают</div>
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
