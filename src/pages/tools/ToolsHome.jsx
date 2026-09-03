import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const GROUP_KEYS = [
  {
    labelKey: 'tools_group_clients',
    items: [
      { to: '/tools/my-orders', icon: '🗒️', titleKey: 'tools_item_my_orders', descKey: 'tools_desc_my_orders' },
      { to: '/tools/clients', icon: '👤', titleKey: 'tools_item_clients', descKey: 'tools_desc_clients' },
      { to: '/tools/order-stats', icon: '📊', titleKey: 'tools_item_order_stats', descKey: 'tools_desc_order_stats' },
      { to: '/tools/phrases', icon: '💬', titleKey: 'tools_item_phrases', descKey: 'tools_desc_phrases' },
    ],
  },
  {
    labelKey: 'tools_group_field',
    items: [
      { to: '/tools/field-visit', icon: '🧳', titleKey: 'tools_item_field_visit', descKey: 'tools_desc_field_visit' },
      { to: '/tools/diagnostic', icon: '🔍', titleKey: 'tools_item_diagnostic', descKey: 'tools_desc_diagnostic' },
      { to: '/tools/work-order', icon: '✅', titleKey: 'tools_item_work_order', descKey: 'tools_desc_work_order' },
      { to: '/tools/tuning-fork', icon: '🎵', titleKey: 'tools_item_tuning_fork', descKey: 'tools_desc_tuning_fork' },
      { to: '/tools/pitch-detector', icon: '🎙️', titleKey: 'tools_item_pitch_detector', descKey: 'tools_desc_pitch_detector' },
      { to: '/tools/symptom-quiz', icon: '🩺', titleKey: 'tools_item_symptom_quiz', descKey: 'tools_desc_symptom_quiz' },
      { to: '/tools/common-mistakes', icon: '⚠️', titleKey: 'tools_item_common_mistakes', descKey: 'tools_desc_common_mistakes' },
    ],
  },
  {
    labelKey: 'tools_group_calc',
    items: [
      { to: '/tools/tension', icon: '⚖️', titleKey: 'tools_item_tension', descKey: 'tools_desc_tension' },
      { to: '/tools/order-form', icon: '📝', titleKey: 'tools_item_order_form', descKey: 'tools_desc_order_form' },
      { to: '/tools/wire', icon: '📏', titleKey: 'tools_item_wire', descKey: 'tools_desc_wire' },
      { to: '/tools/inventory', icon: '📦', titleKey: 'tools_item_inventory', descKey: 'tools_desc_inventory' },
    ],
  },
  {
    labelKey: 'tools_group_shop',
    items: [
      { to: '/tools/shop', icon: '🛒', titleKey: 'tools_item_shop', descKey: 'tools_desc_shop' },
    ],
  },
]

export default function ToolsHome() {
  const { t } = useLanguage()
  const groups = GROUP_KEYS.map((g) => ({
    labelKey: g.labelKey,
    label: t(g.labelKey),
    items: g.items.map((it) => ({ ...it, title: t(it.titleKey), desc: t(it.descKey) })),
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
