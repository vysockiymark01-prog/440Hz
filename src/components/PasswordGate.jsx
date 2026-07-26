import { useState, useEffect } from 'react'

// SHA-256 хэш пароля (не сам пароль) - см. README для смены пароля
const PASSWORD_HASH = '2e02bb4bed5af6a77fb3ab61077073123f8f606ea7bb5c173f2582bd289be957'
const STORAGE_KEY = 'piano-tuner-gate-ok'

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// TWA (приложение из Play Store) при запуске передаёт этот referrer -
// у обычного открытия сайта в браузере такого не бывает
function isTrustedWebActivity() {
  try {
    return document.referrer.startsWith('android-app://')
  } catch {
    return false
  }
}

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    if (isTrustedWebActivity()) return true
    try {
      return localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH
    } catch {
      return false
    }
  })
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (unlocked) {
      try {
        localStorage.setItem(STORAGE_KEY, PASSWORD_HASH)
      } catch {
        /* ignore */
      }
    }
  }, [unlocked])

  if (unlocked) return children

  async function handleSubmit(e) {
    e.preventDefault()
    setChecking(true)
    const hash = await sha256(value.trim())
    if (hash === PASSWORD_HASH) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
    setChecking(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '24px',
        background: '#121212',
        color: '#f0f0f0',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      }}
    >
      <div style={{ fontSize: 40 }}>🔒</div>
      <h1 style={{ fontSize: 20, margin: 0, textAlign: 'center' }}>Настройщик фортепиано</h1>
      <p style={{ color: '#a0a0a6', margin: 0, textAlign: 'center', maxWidth: 320 }}>
        Доступ только для выпускников курса. Введите пароль.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Пароль"
          style={{
            background: '#1c1c1e',
            border: `1px solid ${error ? '#e0645a' : '#2e2e32'}`,
            borderRadius: 10,
            color: '#f0f0f0',
            padding: '12px 14px',
            fontSize: 15,
            outline: 'none',
          }}
        />
        {error && (
          <div style={{ color: '#e0645a', fontSize: 13 }}>Неверный пароль, попробуйте ещё раз.</div>
        )}
        <button
          type="submit"
          disabled={checking || !value}
          style={{
            background: '#d9a441',
            color: '#1a1200',
            border: 'none',
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            opacity: checking || !value ? 0.6 : 1,
          }}
        >
          Войти
        </button>
      </form>
    </div>
  )
}
