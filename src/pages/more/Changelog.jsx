import { useNavigate } from 'react-router-dom'
import changelog from '../../data/changelog.js'

export default function Changelog() {
  const navigate = useNavigate()
  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Что нового</h1>
      <p className="screen-subtitle">История обновлений приложения</p>

      {changelog.map((release) => (
        <div key={release.version} className="card">
          <div className="row" style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Версия {release.version}</span>
            <span className="pill">{release.date}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {release.items.map((item, i) => (
              <li key={i} style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 4 }}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
