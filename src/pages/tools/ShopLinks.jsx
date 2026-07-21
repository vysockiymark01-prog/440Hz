import { useNavigate } from 'react-router-dom'
import shopLinks from '../../data/shopLinks.js'

export default function ShopLinks() {
  const navigate = useNavigate()
  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты мастера</button>
      <h1 className="screen-title">Где купить инструменты</h1>
      <p className="screen-subtitle">Ссылки на маркетплейсы — открываются в браузере, заказ оформляется на сайте магазина</p>

      {shopLinks.map((item) => (
        <a
          key={item.id}
          className="card-tap row"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span style={{ flex: 1 }}>
            <span className="pill" style={{ marginBottom: 6 }}>{item.shop}</span>
            <div style={{ fontWeight: 700 }}>{item.title}</div>
            {item.note && (
              <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{item.note}</div>
            )}
          </span>
          <span style={{ fontSize: 18, color: 'var(--text-dim)' }}>↗</span>
        </a>
      ))}
    </div>
  )
}
