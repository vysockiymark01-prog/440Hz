import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function CareGuide() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ {t('cg_back_reference')}</button>
      <h1 className="screen-title">{t('cg_title')}</h1>
      <p className="screen-subtitle">{t('cg_subtitle')}</p>

      <div className="card">
        <h3>{t('cg_h_storage')}</h3>
        <p>{t('cg_storage_p1')}</p>
        <p>{t('cg_storage_p2')}</p>
        <p>{t('cg_storage_p3')}</p>
        <p>{t('cg_storage_p4')}</p>
      </div>

      <div className="card">
        <h3>{t('cg_h_tuning_freq')}</h3>
        <p>{t('cg_tuning_p1')}</p>
        <p>{t('cg_tuning_p2')}</p>
      </div>

      <div className="card">
        <h3>{t('cg_h_before_master')}</h3>
        <p>{t('cg_before_p1')}</p>
        <p>{t('cg_before_p2')}</p>
      </div>

      <div className="card">
        <h3>{t('cg_h_accept_work')}</h3>
        <p>{t('cg_accept_p1')}</p>
        <p>{t('cg_accept_p2')}</p>
      </div>
    </div>
  )
}
