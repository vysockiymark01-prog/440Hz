import { useEffect } from 'react'

const ORDERS_KEY = 'pt_my_orders_v1'
const ENABLED_KEY = 'pt_notif_enabled_v1'
const LAST_SENT_KEY = 'pt_notif_last_sent_v1'

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

// Проверяет при каждом открытии/возврате в приложение, есть ли визит завтра,
// и показывает локальное уведомление через service worker (если разрешено).
// Без сервера push-уведомлений при закрытом приложении не бывает — сработает
// только когда пользователь открывает или разворачивает приложение.
async function checkAndNotify() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (!readJson(ENABLED_KEY, false)) return

  const tomorrow = tomorrowStr()
  const lastSent = window.localStorage.getItem(LAST_SENT_KEY)
  if (lastSent === JSON.stringify(tomorrow)) return

  const orders = readJson(ORDERS_KEY, [])
  const tomorrowOrders = orders.filter((it) => it.date === tomorrow)
  if (tomorrowOrders.length === 0) return

  const names = tomorrowOrders
    .slice(0, 3)
    .map((it) => `${it.time ? it.time + ' — ' : ''}${it.clientName || it.brand || 'клиент'}`)
    .join(', ')
  const body = tomorrowOrders.length > 3 ? `${names} и ещё ${tomorrowOrders.length - 3}` : names

  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification('Завтра визит', {
      body,
      tag: 'visit-reminder',
      icon: './icons/icon-192.png',
    })
    window.localStorage.setItem(LAST_SENT_KEY, JSON.stringify(tomorrow))
  } catch {
    // service worker недоступен — тихо пропускаем
  }
}

export default function VisitReminderCheck() {
  useEffect(() => {
    checkAndNotify()
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkAndNotify()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return null
}
