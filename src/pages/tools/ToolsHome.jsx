import { Link } from 'react-router-dom'

const groups = [
  {
    label: 'Работа с клиентами',
    items: [
      { to: '/tools/my-orders', icon: '🗒️', title: 'Мои заказы', desc: 'Клиенты, дата и время визита, чек-лист операций с ценами, экспорт в календарь' },
      { to: '/tools/clients', icon: '👤', title: 'Клиенты', desc: 'История визитов, оплат и заметок по каждому клиенту' },
      { to: '/tools/order-stats', icon: '📊', title: 'Статистика заработка', desc: 'Заработок по неделе, месяцу или своему периоду, слепые зоны по операциям' },
      { to: '/tools/phrases', icon: '💬', title: 'Фразы для клиента', desc: 'Готовые объяснения с копированием в буфер' },
    ],
  },
  {
    label: 'На выезде',
    items: [
      { to: '/tools/field-visit', icon: '🧳', title: 'На выезд', desc: 'Свод чек-листов + быстрые ссылки, можно поделиться' },
      { to: '/tools/diagnostic', icon: '🔍', title: 'Чек-лист диагностики', desc: '5 этапов + когда не покупают и не настраивают' },
      { to: '/tools/work-order', icon: '✅', title: 'Порядок работы на заказе', desc: '7 шагов канонического порядка' },
      { to: '/tools/tuning-fork', icon: '🎵', title: 'Камертон', desc: 'Эталонный тон 438–443 Гц для сверки на слух' },
      { to: '/tools/pitch-detector', icon: '🎙️', title: 'Определитель высоты звука', desc: 'Слушает микрофон и показывает ближайшую ноту и отклонение в центах' },
      { to: '/tools/symptom-quiz', icon: '🩺', title: 'Определи неисправность', desc: 'Квиз: по описанию симптома угадать тип шума' },
      { to: '/tools/common-mistakes', icon: '⚠️', title: 'Частые ошибки новичка', desc: '12 предупреждений из конспекта в одном месте' },
    ],
  },
  {
    label: 'Расчёты и склад',
    items: [
      { to: '/tools/tension', icon: '⚖️', title: 'Калькулятор натяжения', desc: 'Диаметр, мензура, частота → натяжение в Н и кгс' },
      { to: '/tools/order-form', icon: '📝', title: 'Заказ басовой струны', desc: '8 параметров → готовый текст заказа мастеру' },
      { to: '/tools/wire', icon: '📏', title: 'Таблица проволоки Röslau', desc: 'Номер проволоки ↔ диаметр в мм, с поиском' },
      { to: '/tools/inventory', icon: '📦', title: 'Склад расходников', desc: 'Остатки струн, войлока и клея с закупочной ценой, списание в заказах' },
    ],
  },
  {
    label: 'Магазин',
    items: [
      { to: '/tools/shop', icon: '🛒', title: 'Где купить инструменты', desc: 'Ссылки на маркетплейсы: ключи, смазка, полироль' },
    ],
  },
]

export default function ToolsHome() {
  return (
    <div>
      <h1 className="screen-title">Инструменты мастера</h1>
      <p className="screen-subtitle">Рабочие справочные материалы для выезда к клиенту</p>
      {groups.map((group) => (
        <div key={group.label}>
          <div className="section-label">{group.label}</div>
          {group.items.map((it) => (
            <Link key={it.to} to={it.to} className="card-tap row">
              <span className="row-start">
                <span style={{ fontSize: 22 }}>{it.icon}</span>
                <span>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{it.desc}</div>
                </span>
              </span>
              <span>›</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}
