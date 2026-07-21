import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
    setStatus({ type: 'good', text: 'Файл резервной копии скачан.' })
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
          setStatus({ type: 'bad', text: 'Файл не похож на резервную копию этого приложения.' })
          return
        }
        const ok = window.confirm(
          'Импорт заменит текущие данные приложения (избранное, прогресс, настройки) данными из файла. Продолжить?'
        )
        if (!ok) return

        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith(PREFIX) && typeof value === 'string') {
            window.localStorage.setItem(key, value)
          }
        })
        setStatus({ type: 'good', text: 'Данные восстановлены. Перезагружаю приложение…' })
        setTimeout(() => window.location.reload(), 700)
      } catch {
        setStatus({ type: 'bad', text: 'Не удалось прочитать файл — убедитесь, что это резервная копия JSON.' })
      }
    }
    reader.onerror = () => setStatus({ type: 'bad', text: 'Не удалось прочитать файл.' })
    reader.readAsText(file)
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Резервная копия</h1>
      <p className="screen-subtitle">
        Все данные приложения хранятся только на этом устройстве (localStorage). Если смените телефон
        или очистите браузер — без резервной копии они пропадут.
      </p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Что входит в копию</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 0 }}>
          Избранное, тема оформления, результаты тестов, статистика тренажёра, отметки в чек-листах —
          всего сохранено значений: {totalKeys}.
        </p>
      </div>

      <button className="btn btn-block btn-primary" onClick={download}>
        ⬇️ Скачать резервную копию
      </button>

      <button className="btn btn-block" style={{ marginTop: 10 }} onClick={triggerImport}>
        ⬆️ Восстановить из файла
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
