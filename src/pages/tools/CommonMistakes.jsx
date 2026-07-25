import { useNavigate } from 'react-router-dom'
import { commonMistakes } from '../../data/checklists.js'

export default function CommonMistakes() {
  const navigate = useNavigate()

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Частые ошибки новичка</h1>
      <p className="screen-subtitle">
        Предупреждения, разбросанные по разным лекциям конспекта, собранные в одну шпаргалку.
      </p>

      <div className="card">
        {commonMistakes.map((m, i) => (
          <div
            key={m.id}
            style={{
              padding: '10px 0',
              borderBottom: i < commonMistakes.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ fontWeight: 700 }}>⚠️ {m.title}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
