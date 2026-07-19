import { Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'

const SECTIONS = ['reference', 'trainer', 'tools', 'more']
const STORAGE_PREFIX = 'pt_last_path_'

function getStoredPath(section) {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + section) || `/${section}`
  } catch {
    return `/${section}`
  }
}

const items = [
  { key: 'reference', icon: '📖', label: 'Справочник' },
  { key: 'trainer', icon: '🎧', label: 'Тренажёр' },
  { key: 'tools', icon: '🛠️', label: 'Инструменты' },
  { key: 'more', icon: '⭐', label: 'Ещё' },
]

export default function BottomNav() {
  const location = useLocation()

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
        return (
          <Link key={it.key} to={targets[it.key]} className={active ? 'active' : ''}>
            <span className="icon">{it.icon}</span>
            <span>{it.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
