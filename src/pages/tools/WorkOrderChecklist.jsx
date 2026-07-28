import { useNavigate, useSearchParams } from 'react-router-dom'
import { workOrderSteps } from '../../data/checklists.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export default function WorkOrderChecklist() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')
  const storageKey = orderId ? `pt_workorder_checked_v1_${orderId}` : 'pt_workorder_checked_v1'
  const [checked, setChecked] = useLocalStorage(storageKey, {})

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }))
  const reset = () => setChecked({})

  const done = workOrderSteps.filter((s) => checked[s.id]).length

  return (
    <div>
      <button
        className="back-link"
        onClick={() => navigate(orderId ? '/tools/my-orders' : '/tools')}
      >
        {orderId ? '‹ К заказу' : '‹ Инструменты'}
      </button>
      <h1 className="screen-title">Порядок работы на заказе</h1>
      <p className="screen-subtitle">
        {done} из {workOrderSteps.length} шагов выполнено{orderId ? ' · сохраняется для этого заказа' : ''}
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

      <button className="btn btn-block" onClick={reset}>Сбросить чек-лист</button>
    </div>
  )
}
