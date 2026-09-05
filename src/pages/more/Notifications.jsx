import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const SUPPORTED = typeof window !== 'undefined' && 'Notification' in window

export default function Notifications() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [enabled, setEnabled] = useLocalStorage('pt_notif_enabled_v1', false)
  const [permission, setPermission] = useState(SUPPORTED ? Notification.permission : 'unsupported')

  const requestPermission = async () => {
    if (!SUPPORTED) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') setEnabled(true)
  }

  const toggle = () => {
    if (!enabled && permission !== 'granted') {
      requestPermission()
      return
    }
    setEnabled((v) => !v)
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ {t('back_more')}</button>
      <h1 className="screen-title">{t('nt_title')}</h1>
      <p className="screen-subtitle">{t('nt_subtitle')}</p>

      {!SUPPORTED && (
        <div className="empty-state">{t('nt_unsupported')}</div>
      )}

      {SUPPORTED && (
        <>
          <div className="theme-options">
            <button className={`theme-option ${enabled ? 'active' : ''}`} onClick={toggle}>
              <span>
                <div style={{ fontWeight: 700 }}>{t('nt_toggle_title')}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {permission === 'denied'
                    ? t('nt_denied')
                    : permission === 'granted'
                      ? t('nt_granted')
                      : t('nt_will_request')}
                </div>
              </span>
              <span className="check">✓</span>
            </button>
          </div>

          {permission === 'denied' && (
            <div className="result-flash bad" style={{ marginTop: 12 }}>
              {t('nt_denied_flash')}
            </div>
          )}
        </>
      )}
    </div>
  )
}
