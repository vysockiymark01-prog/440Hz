import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function About() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ {t('back_more')}</button>
      <h1 className="screen-title">{t('ab_title')}</h1>
      <div className="card">
        <p>{t('ab_p1')}</p>
        <p>{t('ab_p2')}</p>
        <p>{t('ab_p3')}</p>
      </div>
      <div className="card">
        <p style={{ marginBottom: 0 }}>{t('ab_version')} · <Link to="/more/changelog">{t('ab_whats_new')}</Link></p>
      </div>
    </div>
  )
}
