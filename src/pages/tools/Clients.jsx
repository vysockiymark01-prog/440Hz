import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { clientKey } from '../../utils/clientKey.js'
import { orderTotal } from '../../utils/orderTotal.js'

function buildClients(items) {
  const groups = {}
  items.forEach((it) => {
    const key = clientKey(it)
    if (!key) return
    if (!groups[key]) {
      groups[key] = { key, label: it.clientName || it.brand || 'Без имени', phone: it.phone || '', visits: 0, total: 0, lastDate: null }
    }
    const g = groups[key]
    g.visits += 1
    g.total += orderTotal(it)
    if (it.clientName) g.label = it.clientName
    if (it.phone) g.phone = it.phone
    if (it.date && (!g.lastDate || it.date > g.lastDate)) g.lastDate = it.date
  })
  return Object.values(groups).sort((a, b) => (b.lastDate || '').localeCompare(a.lastDate || ''))
}

export default function Clients() {
  const navigate = useNavigate()
  const [items] = useLocalStorage('pt_my_orders_v1', [])
  const [search, setSearch] = useState('')

  const clients = useMemo(() => buildClients(items), [items])
  const filtered = clients.filter((c) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return [c.label, c.phone].filter(Boolean).join(' ').toLowerCase().includes(q)
  })

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Клиенты</h1>
      <p className="screen-subtitle">Вся история визитов, оплат и заметок по каждому клиенту в одном месте</p>

      {clients.length > 0 && (
        <input
          type="text"
          placeholder="Поиск по имени или телефону…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 12 }}
        />
      )}

      {clients.length === 0 && (
        <div className="empty-state">Пока нет клиентов — они появятся здесь после первого заказа.</div>
      )}
      {clients.length > 0 && filtered.length === 0 && (
        <div className="empty-state">Ничего не найдено.</div>
      )}

      {filtered.map((c) => (
        <Link key={c.key} to={`/tools/clients/${encodeURIComponent(c.key)}`} className="card-tap row" style={{ alignItems: 'center' }}>
          <span>
            <div style={{ fontWeight: 700 }}>{c.label}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
              {c.visits} {c.visits === 1 ? 'визит' : 'визитов'}
              {c.lastDate ? ` · последний ${new Date(c.lastDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}` : ''}
            </div>
          </span>
          <span style={{ textAlign: 'right' }}>
            {c.total > 0 && <div style={{ fontWeight: 700 }}>{c.total.toLocaleString('ru-RU')} ₽</div>}
            <span>›</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
