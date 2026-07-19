import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import wireTable from '../../data/wireTable.js'

export default function WireTable() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return wireTable
    const q = query.trim().replace(',', '.')
    return wireTable.filter((row) => row.nr.includes(q) || String(row.mm).includes(q))
  }, [query])

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Проволока Röslau</h1>
      <p className="screen-subtitle">Сравнительная таблица номеров и диаметров стальной проволоки</p>
      <input
        type="search"
        placeholder="Поиск по номеру или диаметру…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <div className="card" style={{ padding: '4px 12px' }}>
        <table className="wire-table">
          <thead>
            <tr><th>№ проволоки</th><th>Диаметр, мм</th></tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.nr}><td>{row.nr}</td><td>{row.mm.toFixed(3)}</td></tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">Ничего не найдено</div>}
      </div>
    </div>
  )
}
