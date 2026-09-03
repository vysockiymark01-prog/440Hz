import { Link } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

function daysSince(iso) {
  if (!iso) return null
  return Math.floor((new Date() - new Date(iso)) / 86400000)
}

const GROUP_KEYS = [
  {
    labelKey: 'more_group_course',
    items: [
      { to: '/more/course', icon: '🎓', titleKey: 'more_item_my_course' },
      { to: '/more/favorites', icon: '⭐', titleKey: 'more_item_favorites' },
    ],
  },
  {
    labelKey: 'more_group_profile',
    items: [
      { to: '/more/business-card', icon: '💳', titleKey: 'more_item_business_card' },
      { to: '/more/tax', icon: '🧾', titleKey: 'more_item_tax' },
    ],
  },
  {
    labelKey: 'more_group_settings',
    items: [
      { to: '/more/appearance', icon: '🎨', titleKey: 'more_item_appearance' },
      { to: '/more/notifications', icon: '🔔', titleKey: 'more_item_notifications' },
      { to: '/more/backup', icon: '💾', titleKey: 'more_item_backup' },
    ],
  },
  {
    labelKey: 'more_group_info',
    items: [
      { to: '/more/changelog', icon: '🆕', titleKey: 'more_item_changelog' },
      { to: '/more/about', icon: 'ℹ️', titleKey: 'more_item_about' },
    ],
  },
]

export default function MoreHome() {
  const [lastBackup] = useLocalStorage('pt_last_backup_v1', null)
  const daysAgo = daysSince(lastBackup)
  const showReminder = daysAgo === null || daysAgo >= 30
  const { t } = useLanguage()
  const groups = GROUP_KEYS.map((g) => ({
    label: t(g.labelKey),
    items: g.items.map((it) => ({ ...it, title: t(it.titleKey) })),
  }))

  return (
    <div>
      <h1 className="screen-title">{t('more_title')}</h1>

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
