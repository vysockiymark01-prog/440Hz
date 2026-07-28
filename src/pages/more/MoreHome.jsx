import { Link } from 'react-router-dom'

export default function MoreHome() {
  return (
    <div>
      <h1 className="screen-title">Ещё</h1>
      <Link to="/more/course" className="card-tap row">
        <span className="row-start">🎓 <span>Мой курс</span></span>
        <span>›</span>
      </Link>
      <Link to="/more/favorites" className="card-tap row">
        <span className="row-start">⭐ <span>Избранное</span></span>
        <span>›</span>
      </Link>
      <Link to="/more/appearance" className="card-tap row">
        <span className="row-start">🎨 <span>Оформление</span></span>
        <span>›</span>
      </Link>
      <Link to="/more/business-card" className="card-tap row">
        <span className="row-start">💳 <span>Визитка мастера</span></span>
        <span>›</span>
      </Link>
      <Link to="/more/backup" className="card-tap row">
        <span className="row-start">💾 <span>Резервная копия</span></span>
        <span>›</span>
      </Link>
      <Link to="/more/changelog" className="card-tap row">
        <span className="row-start">🆕 <span>Что нового</span></span>
        <span>›</span>
      </Link>
      <Link to="/more/about" className="card-tap row">
        <span className="row-start">ℹ️ <span>О приложении</span></span>
        <span>›</span>
      </Link>
    </div>
  )
}
