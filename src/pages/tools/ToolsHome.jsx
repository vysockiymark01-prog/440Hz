import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const GROUP_KEYS = [
  {
    labelKey: 'tools_group_clients',
    items: [
      { to: '/tools/my-orders', icon: '🗒️', titleKey: 'tools_item_my_orders', desc: 'Клиенты, дата и время визита, чек-лист операций с ценами, экспорт в календарь' },
      { to: '/tools/clients', icon: '👤', titleKey: 'tools_item_clients', desc: 'История визитов, оплат и заметок по каждому клиенту' },
      { to: '/tools/order-stats', icon: '📊', titleKey: 'tools_item_order_stats', desc: 'Заработок по неделе, месяцу или своему периоду, слепые зоны по операциям' },
      { to: '/tools/phrases', icon: '💬', titleKey: 'tools_item_phrases', desc: 'Готовые объяснения с копированием в буфер' },
    ],
  },
  {
    labelKey: 'tools_group_field',
    items: [
      { to: '/tools/field-visit', icon: '🧳', titleKey: 'tools_item_field_visit', desc: 'Свод чек-листов + быстрые ссылки, можно поделиться' },
      { to: '/tools/diagnostic', icon: '🔍', titleKey: 'tools_item_diagnostic', desc: '5 этапов + когда не покупают и не настраивают' },
      { to: '/tools/work-order', icon: '✅', titleKey: 'tools_item_work_order', desc: '7 шагов канонического порядка' },
      { to: '/tools/tuning-fork', icon: '🎵', titleKey: 'tools_item_tuning_fork', desc: 'Эталонный тон 438–443 Гц для сверки на слух' },
      { to: '/tools/pitch-detector', icon: '🎙️', titleKey: 'tools_item_pitch_detector', desc: 'Слушает микрофон и показывает ближайшую ноту и отклонение в центах' },
      { to: '/tools/symptom-quiz', icon: '🩺', titleKey: 'tools_item_symptom_quiz', desc: 'Квиз: по описанию симптома угадать тип шума' },
      { to: '/tools/common-mistakes', icon: '⚠️', titleKey: 'tools_item_common_mistakes', desc: '12 предупреждений из конспекта в одном месте' },
    ],
  },
  {
    labelKey: 'tools_group_calc',
    items: [
      { to: '/tools/tension', icon: '⚖️', titleKey: 'tools_item_tension', desc: 'Диаметр, мензура, частота → натяжение в Н и кгс' },
      { to: '/tools/order-form', icon: '📝', titleKey: 'tools_item_order_form', desc: '8 параметров → готовый текст заказа мастеру' },
      { to: '/tools/wire', icon: '📏', titleKey: 'tools_item_wire', desc: 'Номер проволоки ↔ диаметр в мм, с поиском' },
      { to: '/tools/inventory', icon: '📦', titleKey: 'tools_item_inventory', desc: 'Остатки струн, войлока и клея с закупочной ценой, списание в заказах' },
    ],
  },
  {
    labelKey: 'tools_group_shop',
    items: [
      { to: '/tools/shop', icon: '🛒', titleKey: 'tools_item_shop', desc: 'Ссылки на маркетплейсы: ключи, смазка, полироль' },
    ],
  },
]

export default function ToolsHome() {
  const { t } = useLanguage()
  const groups = GROUP_KEYS.map((g) => ({
    labelKey: g.labelKey,
    label: t(g.labelKey),
    items: g.items.map((it) => ({ ...it, title: t(it.titleKey) })),
  }))

  return (
    <div>
      <h1 className="screen-title">{t('tools_title')}</h1>
      <p className="screen-subtitle">{t('tools_subtitle')}</p>
      {groups.map((group) => (
        <div key={group.labelKey}>
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
