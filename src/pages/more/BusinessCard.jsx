import { useState, useEffect, useRef } from 'react'
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
  const parts = ['🎹 Настройщик фортепиано']
  if (card.name) parts.push(card.name)
  if (card.note) parts.push(card.note)
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

function downloadImage(blob, card) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${card.name || 'vizitka'}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Перенос текста по словам под заданную ширину — canvas сам этого не умеет.
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

// Рисует визитку как картинку 1080×1080 — квадрат подходит и для сторис,
// и для постов, и для отправки в мессенджеры. Возвращает PNG-Blob.
async function buildCardImage(card, qrDataUrl) {
  const W = 1080
  const H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Фон — тёмный градиент в стиле приложения.
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1c1c1e')
  bg.addColorStop(1, '#121212')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Декоративная золотая дуга сверху.
  ctx.strokeStyle = '#d9a441'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(W / 2, -220, 620, 0.78, Math.PI - 0.78)
  ctx.stroke()

  const padX = 96
  let y = 200

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#d9a441'
  ctx.font = '600 40px "Segoe UI", Roboto, sans-serif'
  ctx.fillText('🎹 НАСТРОЙЩИК ФОРТЕПИАНО', padX, y)
  y += 90

  ctx.fillStyle = '#f0f0f0'
  ctx.font = '800 76px "Segoe UI", Roboto, sans-serif'
  const nameLines = wrapText(ctx, card.name || '', W - padX * 2)
  for (const line of nameLines) {
    ctx.fillText(line, padX, y)
    y += 86
  }
  y += 16

  if (card.note) {
    ctx.fillStyle = '#a0a0a6'
    ctx.font = '400 36px "Segoe UI", Roboto, sans-serif'
    const noteLines = wrapText(ctx, card.note, W - padX * 2).slice(0, 3)
    for (const line of noteLines) {
      ctx.fillText(line, padX, y)
      y += 48
    }
  }

  // Контакты — прибиты к низу карточки.
  let contactY = H - 300
  ctx.font = '500 42px "Segoe UI", Roboto, sans-serif'
  const contactLines = []
  if (card.phone) contactLines.push(`📞  ${card.phone}`)
  if (card.city) contactLines.push(`📍  ${card.city}`)
  if (card.email) contactLines.push(`✉️  ${card.email}`)
  ctx.fillStyle = '#f0f0f0'
  for (const line of contactLines) {
    ctx.fillText(line, padX, contactY)
    contactY += 58
  }

  if (qrDataUrl) {
    const qrSize = 220
    const qrImg = await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = qrDataUrl
    })
    const qx = W - padX - qrSize
    const qy = H - padX - qrSize
    ctx.fillStyle = '#ffffff'
    const pad = 16
    ctx.beginPath()
    ctx.roundRect(qx - pad, qy - pad, qrSize + pad * 2, qrSize + pad * 2, 16)
    ctx.fill()
    ctx.drawImage(qrImg, qx, qy, qrSize, qrSize)
  }

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// Общий помощник: пробует «Поделиться» с файлом, при неудаче/недоступности —
// скачивает файл, чтобы кнопка никогда не оставалась «немой».
async function shareOrDownloadFile(file, blob, card, download, setStatus, okMessage) {
  if (navigator.canShare && navigator.share) {
    try {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Визитка' })
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
  }
  download(blob, card)
  setStatus({ type: 'good', text: okMessage })
}

async function shareCardImage(card, qrUrl, setStatus) {
  setStatus(null)
  try {
    const blob = await buildCardImage(card, qrUrl)
    if (!blob) throw new Error('no blob')
    const file = new File([blob], `${card.name || 'vizitka'}.png`, { type: 'image/png' })
    await shareOrDownloadFile(
      file, blob, card, downloadImage, setStatus,
      'Отправка через это приложение недоступна — картинка скачана, отправьте её вручную в соцсеть или мессенджер.'
    )
  } catch {
    setStatus({ type: 'bad', text: 'Не удалось собрать картинку визитки. Попробуйте ещё раз или используйте QR-код ниже.' })
  }
}

async function shareCardText(card, setStatus) {
  setStatus(null)
  const summary = buildSummary(card)

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
      setStatus({ type: 'good', text: 'Отправка через это приложение недоступна — текст визитки скопирован в буфер обмена, вставьте его в пост или сообщение.' })
      return
    } catch {
      /* переходим к сообщению об ошибке ниже */
    }
  }
  setStatus({ type: 'bad', text: 'Отправка недоступна в этом браузере. Скопируйте текст визитки вручную.' })
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
  const [imagePreview, setImagePreview] = useState(null)
  const previewUrlRef = useRef(null)

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

  // Превью картинки визитки — пересобирается при изменении данных или QR-кода.
  useEffect(() => {
    if (!hasData) {
      setImagePreview(null)
      return
    }
    let cancelled = false
    buildCardImage(card, qrUrl).then((blob) => {
      if (cancelled || !blob) return
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      const url = URL.createObjectURL(blob)
      previewUrlRef.current = url
      setImagePreview(url)
    })
    return () => { cancelled = true }
  }, [card, qrUrl, hasData])

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Визитка мастера</h1>
      <p className="screen-subtitle">
        Заполните свои контакты один раз — потом можно отправить визитку клиенту, выложить картинкой
        в соцсети или показать QR-код, который камера телефона распознает как контакт.
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
          {imagePreview && (
            <div className="card" style={{ textAlign: 'center', marginTop: 12, padding: 8 }}>
              <img src={imagePreview} alt="Превью визитки для соцсетей" style={{ width: '100%', borderRadius: 10, display: 'block' }} />
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <button className="btn btn-block btn-primary" onClick={() => shareCardImage(card, qrUrl, setStatus)}>🖼️ Поделиться картинкой</button>
            <button className="btn btn-block" onClick={() => shareCardText(card, setStatus)}>📝 Поделиться текстом</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn" onClick={() => shareVCard(card, setStatus)}>📇 Контакт</button>
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
                Дайте клиенту навести камеру телефона — большинство камера сами предложат добавить контакт.
                Работает даже без интернета и без «Поделиться».
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
