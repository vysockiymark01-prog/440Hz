import { Link } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

function daysSince(iso) {
  if (!iso) return null
  return Math.floor((new Date() - new Date(iso)) / 86400000)
}

const groups = [
  {
    label: 'Курс',
    items: [
      { to: '/more/course', icon: '🎓', title: 'Мой курс' },
      { to: '/more/favorites', icon: '⭐', title: 'Избранное' },
    ],
  },
  {
    label: 'Профиль и финансы',
    items: [
      { to: '/more/business-card', icon: '💳', title: 'Визитка мастера' },
      { to: '/more/tax', icon: '🧾', title: 'Налоги' },
    ],
  },
  {
    label: 'Настройки',
    items: [
      { to: '/more/appearance', icon: '🎨', title: 'Оформление' },
      { to: '/more/notifications', icon: '🔔', title: 'Уведомления' },
      { to: '/more/backup', icon: '💾', title: 'Резервная копия' },
    ],
  },
  {
    label: 'Информация',
    items: [
      { to: '/more/changelog', icon: '🆕', title: 'Что нового' },
      { to: '/more/about', icon: 'ℹ️', title: 'О приложении' },
    ],
  },
]

export default function MoreHome() {
  const [lastBackup] = useLocalStorage('pt_last_backup_v1', null)
  const daysAgo = daysSince(lastBackup)
  const showReminder = daysAgo === null || daysAgo >= 30

  return (
    <div>
      <h1 className="screen-title">Ещё</h1>

      {showReminder && (
        <Link to="/more/backup" className="card-tap row" style={{ borderColor: 'var(--accent)', marginBottom: 4 }}>
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

      {groups.map((group) => (
        <div key={group.label}>
          <div className="section-label">{group.label}</div>
          {group.items.map((it) => (
            <Link key={it.to} to={it.to} className="card-tap row">
              <span className="row-start">{it.icon} <span>{it.title}</span></span>
              <span>›</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}
