import { useNavigate } from 'react-router-dom'
import shopLinks from '../../data/shopLinks.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function ShopLinks() {
  const navigate = useNavigate()
  const { t, tr } = useLanguage()
  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('sl_title')}</h1>
      <p className="screen-subtitle">{t('sl_subtitle')}</p>

      {shopLinks.map((item) => (
        <a
          key={item.id}
          className="card-tap row"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span style={{ flex: 1 }}>
            <span className="pill" style={{ marginBottom: 6 }}>{item.shop}</span>
            <div style={{ fontWeight: 700 }}>{tr(item.title)}</div>
            {item.note && (
              <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{tr(item.note)}</div>
            )}
          </span>
          <span style={{ fontSize: 18, color: 'var(--text-dim)' }}>↗</span>
        </a>
      ))}
    </div>
  )
}
