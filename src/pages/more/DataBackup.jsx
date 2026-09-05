import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const PREFIX = 'pt_'

function collectAppData() {
  const data = {}
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i)
    if (key && key.startsWith(PREFIX)) {
      data[key] = window.localStorage.getItem(key)
    }
  }
  return data
}

export default function DataBackup() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState(null)

  const keyCount = collectAppData()
  const totalKeys = Object.keys(keyCount).length

  const download = () => {
    const payload = {
      app: 'nastroyshchik-fortepiano',
      exportedAt: new Date().toISOString(),
      data: collectAppData(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `nastroyshchik-backup-${date}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    window.localStorage.setItem('pt_last_backup_v1', JSON.stringify(new Date().toISOString()))
    setStatus({ type: 'good', text: t('db_status_downloaded') })
  }

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        const data = parsed?.data
        if (!data || typeof data !== 'object') {
          setStatus({ type: 'bad', text: t('db_status_not_backup') })
          return
        }
        const ok = window.confirm(t('db_confirm_import'))
        if (!ok) return

        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith(PREFIX) && typeof value === 'string') {
            window.localStorage.setItem(key, value)
          }
        })
        setStatus({ type: 'good', text: t('db_status_restored') })
        setTimeout(() => window.location.reload(), 700)
      } catch {
        setStatus({ type: 'bad', text: t('db_status_parse_fail') })
      }
    }
    reader.onerror = () => setStatus({ type: 'bad', text: t('db_status_read_fail') })
    reader.readAsText(file)
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ {t('back_more')}</button>
      <h1 className="screen-title">{t('db_title')}</h1>
      <p className="screen-subtitle">{t('db_subtitle')}</p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{t('db_included_title')}</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 0 }}>
          {t('db_included_desc', { n: totalKeys })}
        </p>
      </div>

      <button className="btn btn-block btn-primary" onClick={download}>
        {t('db_download_btn')}
      </button>

      <button className="btn btn-block" style={{ marginTop: 10 }} onClick={triggerImport}>
        {t('db_restore_btn')}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {status && (
        <div className={`result-flash ${status.type === 'good' ? 'good' : 'bad'}`} style={{ marginTop: 14 }}>
          {status.text}
        </div>
      )}
    </div>
  )
}
