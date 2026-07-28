import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

function buildVCard(card) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  if (card.name) lines.push(`FN:${card.name}`, `N:${card.name};;;;`)
  if (card.phone) lines.push(`TEL;TYPE=CELL:${card.phone}`)
  if (card.email) lines.push(`EMAIL:${card.email}`)
  if (card.city) lines.push(`ADR;TYPE=WORK:;;${card.city};;;;`)
  if (card.note) lines.push(`NOTE:${card.note.replace(/\n/g, '\\n')}`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

function buildSummary(card) {
  const parts = ['Визитка настройщика фортепиано']
  if (card.name) parts.push(card.name)
  if (card.phone) parts.push(`Тел.: ${card.phone}`)
  if (card.email) parts.push(`Email: ${card.email}`)
  if (card.city) parts.push(`Город: ${card.city}`)
  return parts.join('\n')
}

function downloadVCard(card) {
  const vcf = buildVCard(card)
  const blob = new Blob([vcf], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${card.name || 'vizitka'}.vcf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Пробует поделиться файлом .vcf, затем текстом, и только если оба способа
// недоступны или дали сбой (а не просто отмену пользователем) — копирует
// сводку в буфер обмена, чтобы кнопка никогда не оставалась «немой».
async function shareVCard(card, setStatus) {
  setStatus(null)
  const vcf = buildVCard(card)
  const summary = buildSummary(card)

  if (navigator.canShare && navigator.share) {
    try {
      const file = new File([vcf], `${card.name || 'vizitka'}.vcf`, { type: 'text/vcard' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Визитка', text: card.name })
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Визитка', text: summary })
      return
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
  }

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(summary)
      setStatus({ type: 'good', text: 'Отправка через это приложение недоступна — визитка скопирована в буфер обмена. Или покажите клиенту QR-код ниже.' })
      return
    } catch {
      /* переходим к сообщению об ошибке ниже */
    }
  }
  setStatus({ type: 'bad', text: 'Отправка недоступна в этом браузере. Покажите клиенту QR-код ниже или скачайте файл .vcf.' })
}

export default function BusinessCard() {
  const navigate = useNavigate()
  const [card, setCard] = useLocalStorage('pt_business_card_v1', {
    name: '', phone: '', email: '', city: '', note: '',
  })
  const [draft, setDraft] = useState(card)
  const [status, setStatus] = useState(null)
  const [qrUrl, setQrUrl] = useState(null)

  const save = () => setCard(draft)
  const field = (key, label, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={draft[key]}
        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
        onBlur={save}
      />
    </div>
  )

  const hasData = card.name || card.phone

  useEffect(() => {
    if (!hasData) {
      setQrUrl(null)
      return
    }
    let cancelled = false
    QRCode.toDataURL(buildVCard(card), { width: 240, margin: 1 })
      .then((url) => { if (!cancelled) setQrUrl(url) })
      .catch(() => { if (!cancelled) setQrUrl(null) })
    return () => { cancelled = true }
  }, [card, hasData])

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Визитка мастера</h1>
      <p className="screen-subtitle">
        Заполните свои контакты один раз — потом можно отправить визитку клиенту или показать QR-код,
        который камера телефона распознает как контакт.
      </p>

      <div className="card">
        {field('name', 'Имя и фамилия', 'text', 'например, Иван Петров')}
        {field('phone', 'Телефон', 'tel', 'например, +7 900 123-45-67')}
        {field('email', 'Email', 'email', 'например, tuner@example.com')}
        {field('city', 'Город', 'text', 'например, Москва')}
        {field('note', 'Кратко о себе', 'text', 'например, настройка и ремонт пианино, 10 лет опыта')}
      </div>

      {hasData && (
        <>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-block btn-primary" onClick={() => shareVCard(card, setStatus)}>📤 Отправить клиенту</button>
            <button className="btn" onClick={() => downloadVCard(card)}>⬇️ .vcf</button>
          </div>

          {status && (
            <div className={`result-flash ${status.type === 'good' ? 'good' : 'bad'}`} style={{ marginTop: 12 }}>
              {status.text}
            </div>
          )}

          {qrUrl && (
            <div className="card" style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>QR-код визитки</div>
              <img src={qrUrl} alt="QR-код визитки" style={{ width: 200, height: 200, borderRadius: 8 }} />
              <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 10 }}>
                Дайте клиенту навести камеру телефона — большинство камер сами предложат добавить контакт.
                Работает даже без интернета и без «Поделиться».
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
