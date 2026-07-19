import { Link } from 'react-router-dom'
import lectures from '../../data/lectures.js'

export default function ReferenceHome() {
  return (
    <div>
      <h1 className="screen-title">Справочник</h1>
      <p className="screen-subtitle">Конспект курса по настройке фортепиано, разбитый на короткие карточки</p>

      <Link to="/reference/search" className="card-tap row">
        <span className="row-start">🔍 <span>Поиск по справочнику</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/glossary" className="card-tap row">
        <span className="row-start">🔤 <span>Глоссарий терминов</span></span>
        <span>›</span>
      </Link>

      <div className="section-label">Лекции</div>
      {lectures.map((l) => (
        <Link key={l.id} to={`/reference/${l.id}`} className="card-tap row">
          <span className="row-start">
            <span className="pill badge-accent">{l.num}</span>
            <span>{l.title}</span>
          </span>
          <span>›</span>
        </Link>
      ))}
    </div>
  )
}
