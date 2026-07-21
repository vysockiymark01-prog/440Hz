import { Link } from 'react-router-dom'

const items = [
  { to: '/tools/wire', icon: '📏', title: 'Таблица проволоки Röslau', desc: 'Номер проволоки ↔ диаметр в мм, с поиском' },
  { to: '/tools/order-form', icon: '📝', title: 'Заказ басовой струны', desc: '8 параметров → готовый текст заказа мастеру' },
  { to: '/tools/diagnostic', icon: '🔍', title: 'Чек-лист диагностики', desc: '5 этапов + когда не покупают и не настраивают' },
  { to: '/tools/work-order', icon: '✅', title: 'Порядок работы на заказе', desc: '7 шагов канонического порядка' },
  { to: '/tools/shop', icon: '🛒', title: 'Где купить инструменты', desc: 'Ссылки на маркетплейсы: ключи, смазка, полироль' },
]

export default function ToolsHome() {
  return (
    <div>
      <h1 className="screen-title">Инструменты мастера</h1>
      <p className="screen-subtitle">Рабочие справочные материалы для выезда к клиенту</p>
      {items.map((it) => (
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
  )
}
