import { NavLink } from 'react-router-dom'

const items = [
  { to: '/reference', icon: '📖', label: 'Справочник' },
  { to: '/trainer', icon: '🎧', label: 'Тренажёр' },
  { to: '/tools', icon: '🛠️', label: 'Инструменты' },
  { to: '/more', icon: '⭐', label: 'Ещё' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span className="icon">{it.icon}</span>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
