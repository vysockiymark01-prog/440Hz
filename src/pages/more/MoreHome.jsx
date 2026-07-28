import { Link } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

function daysSince(iso) {
  if (!iso) return null
  return Math.floor((new Date() - new Date(iso)) / 86400000)
}

export default function MoreHome() {
  const [lastBackup] = useLocalStorage('pt_last_backup_v1', null)
  const daysAgo = daysSince(lastBackup)
  const showReminder = daysAgo === null || daysAgo >= 30

  return (
    <div>
      <h1 className="screen-title">Ещё</h1>

      {showReminder && (
        <Link to="/more/backup" className="card-tap row" style={{ borderColor: 'var(--accent)' }}>
          <span className="row-start">
            💾 <span>
              {daysAgo === null
                ? 'Вы ни разу не делали резервную копию'
                : `Резервная копия не обновлялась ${daysAgo} дн.`}
            </span>
          </span>
          <span>›</span>
        </Link>
      )}

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
      <Link to="/more/tax" className="card-tap row">
        <span className="row-start">🧾 <span>Налоги</span></span>
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
