import { Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext.jsx'

const SECTIONS = ['reference', 'trainer', 'tools', 'more']
const STORAGE_PREFIX = 'pt_last_path_'

function getStoredPath(section) {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + section) || `/${section}`
  } catch {
    return `/${section}`
  }
}

const ITEM_KEYS = [
  { key: 'reference', icon: '📖', labelKey: 'nav_reference' },
  { key: 'trainer', icon: '🎧', labelKey: 'nav_trainer' },
  { key: 'tools', icon: '🛠️', labelKey: 'nav_tools' },
  { key: 'more', icon: '⭐', labelKey: 'nav_more' },
]

export default function BottomNav() {
  const location = useLocation()
  const { t } = useLanguage()
  const items = ITEM_KEYS.map((it) => ({ ...it, label: t(it.labelKey) }))

  // Запоминаем последний открытый экран каждого раздела, чтобы при
  // переключении вкладок не терять место, где пользователь читал.
  useEffect(() => {
    const section = location.pathname.split('/')[1]
    if (SECTIONS.includes(section)) {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + section, location.pathname)
      } catch {
        // ignore
      }
    }
  }, [location.pathname])

  const targets = useMemo(
    () => Object.fromEntries(SECTIONS.map((s) => [s, getStoredPath(s)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname],
  )

  return (
    <nav className="bottom-nav">
      {items.map((it) => {
        const active = location.pathname.split('/')[1] === it.key
        // Если раздел уже открыт — ведём на его начало (работает как «назад»
        // снизу, не нужно тянуться к ссылке «‹ Назад» в верхней части экрана).
        // Если раздел не открыт — возвращаем туда, где читали в прошлый раз.
        const to = active ? `/${it.key}` : targets[it.key]
        return (
          <Link key={it.key} to={to} className={active ? 'active' : ''}>
            <span className="icon">{it.icon}</span>
            <span>{it.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
