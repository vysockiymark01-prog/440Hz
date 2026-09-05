import { useNavigate } from 'react-router-dom'
import { commonMistakes } from '../../data/checklists.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function CommonMistakes() {
  const navigate = useNavigate()
  const { t, tr } = useLanguage()

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('cm_title')}</h1>
      <p className="screen-subtitle">{t('cm_subtitle')}</p>

      <div className="card">
        {commonMistakes.map((m, i) => (
          <div
            key={m.id}
            style={{
              padding: '10px 0',
              borderBottom: i < commonMistakes.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ fontWeight: 700 }}>⚠️ {tr(m.title)}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{tr(m.text)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
