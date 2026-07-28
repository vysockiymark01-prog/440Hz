import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

async function shareVCard(card) {
  const vcf = buildVCard(card)
  if (navigator.canShare && navigator.share) {
    try {
      const file = new File([vcf], `${card.name || 'vizitka'}.vcf`, { type: 'text/vcard' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Визитка', text: card.name })
        return
      }
    } catch {
      /* откатываемся на текстовый вариант ниже */
    }
  }
  const textParts = ['Визитка настройщика фортепиано']
  if (card.name) textParts.push(card.name)
  if (card.phone) textParts.push(`Тел.: ${card.phone}`)
  if (card.email) textParts.push(`Email: ${card.email}`)
  if (card.city) textParts.push(`Город: ${card.city}`)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Визитка', text: textParts.join('\n') })
      return
    } catch {
      /* пользователь отменил */
    }
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(textParts.join('\n'))
    alert('Визитка скопирована в буфер обмена')
  }
}

export default function BusinessCard() {
  const navigate = useNavigate()
  const [card, setCard] = useLocalStorage('pt_business_card_v1', {
    name: '', phone: '', email: '', city: '', note: '',
  })
  const [draft, setDraft] = useState(card)

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

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Визитка мастера</h1>
      <p className="screen-subtitle">
        Заполните свои контакты один раз — потом можно отправить визитку клиенту одним нажатием
        (файл .vcf добавляется в контакты телефона автоматически).
      </p>

      <div className="card">
        {field('name', 'Имя и фамилия', 'text', 'например, Иван Петров')}
        {field('phone', 'Телефон', 'tel', 'например, +7 900 123-45-67')}
        {field('email', 'Email', 'email', 'например, tuner@example.com')}
        {field('city', 'Город', 'text', 'например, Москва')}
        {field('note', 'Кратко о себе', 'text', 'например, настройка и ремонт пианино, 10 лет опыта')}
      </div>

      {hasData && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn btn-block btn-primary" onClick={() => shareVCard(card)}>📤 Отправить клиенту</button>
          <button className="btn" onClick={() => downloadVCard(card)}>⬇️ .vcf</button>
        </div>
      )}
    </div>
  )
}
