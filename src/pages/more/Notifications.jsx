import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

const SUPPORTED = typeof window !== 'undefined' && 'Notification' in window

export default function Notifications() {
  const navigate = useNavigate()
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
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Уведомления</h1>
      <p className="screen-subtitle">
        Напоминание о визитах на завтра. Важно: без своего сервера настоящий push-режим при закрытом
        приложении невозможен — уведомление придёт, когда вы откроете или развернёте приложение накануне визита.
      </p>

      {!SUPPORTED && (
        <div className="empty-state">Этот браузер не поддерживает уведомления.</div>
      )}

      {SUPPORTED && (
        <>
          <div className="theme-options">
            <button className={`theme-option ${enabled ? 'active' : ''}`} onClick={toggle}>
              <span>
                <div style={{ fontWeight: 700 }}>Напоминать о визите накануне</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {permission === 'denied'
                    ? 'Уведомления запрещены в настройках браузера/устройства'
                    : permission === 'granted'
                      ? 'Разрешение получено'
                      : 'При включении запросим разрешение'}
                </div>
              </span>
              <span className="check">✓</span>
            </button>
          </div>

          {permission === 'denied' && (
            <div className="result-flash bad" style={{ marginTop: 12 }}>
              Разрешение отклонено. Включите уведомления для приложения в настройках браузера или
              телефона, затем вернитесь сюда.
            </div>
          )}
        </>
      )}
    </div>
  )
}
