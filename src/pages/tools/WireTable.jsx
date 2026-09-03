import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import wireTable from '../../data/wireTable.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function WireTable() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { t } = useLanguage()

  const filtered = useMemo(() => {
    if (!query.trim()) return wireTable
    const q = query.trim().replace(',', '.')
    return wireTable.filter((row) => row.nr.includes(q) || String(row.mm).includes(q))
  }, [query])

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('wt_title')}</h1>
      <p className="screen-subtitle">{t('wt_subtitle')}</p>
      <input
        type="search"
        placeholder={t('wt_search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <div className="card" style={{ padding: '4px 12px' }}>
        <table className="wire-table">
          <thead>
            <tr><th>{t('wt_col_nr')}</th><th>{t('wt_col_mm')}</th></tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.nr}><td>{row.nr}</td><td>{row.mm.toFixed(3)}</td></tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">{t('wt_empty')}</div>}
      </div>
    </div>
  )
}
