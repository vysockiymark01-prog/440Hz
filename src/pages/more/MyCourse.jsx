import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'

function toLocalInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const dateInputStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  padding: '6px 8px',
  fontSize: 12,
}

export default function MyCourse() {
  const navigate = useNavigate()
  const {
    status, setStatus, startNoviceSchedule, schedule, setLectureDate,
    testsPassed, passedCount, totalLectures, isCourseComplete,
  } = useCourseProgress()
  const [pickingDate, setPickingDate] = useState(false)
  const [dateValue, setDateValue] = useState('')

  const hasSchedule = Object.keys(schedule).length > 0

  const switchToNovice = () => {
    if (hasSchedule) {
      setStatus('novice')
    } else {
      setPickingDate(true)
    }
  }

  const confirmFirstDate = () => {
    if (!dateValue) return
    startNoviceSchedule(new Date(dateValue).toISOString())
    setPickingDate(false)
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Мой курс</h1>
      <p className="screen-subtitle">Статус можно менять в любой момент — прогресс не теряется</p>

      <div className="theme-options">
        <button className={`theme-option ${status === 'novice' ? 'active' : ''}`} onClick={switchToNovice}>
          <span>
            <div style={{ fontWeight: 700 }}>🌱 Я новичок</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
              Темы открываются постепенно — по тестам и расписанию
            </div>
          </span>
          <span className="check">✓</span>
        </button>
        <button className={`theme-option ${status === 'graduate' ? 'active' : ''}`} onClick={() => setStatus('graduate')}>
          <span>
            <div style={{ fontWeight: 700 }}>🎓 Я уже проходил курс</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
              Весь справочник и тесты открыты сразу
            </div>
          </span>
          <span className="check">✓</span>
        </button>
      </div>

      {pickingDate && (
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Когда первая лекция?</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 10 }}>
            Остальные темы расставятся автоматически по будням, без выходных, в это же время.
          </div>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            style={{ ...dateInputStyle, width: '100%', padding: '10px 12px', fontSize: 14 }}
          />
          <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={confirmFirstDate}>
            Начать курс
          </button>
        </div>
      )}

      {status === 'novice' && (
        <>
          <div className="section-label">Прогресс</div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="big-number">{passedCount}/{totalLectures}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
              {isCourseComplete ? 'Курс пройден полностью 🎉' : 'тем пройдено'}
            </div>
          </div>

          <div className="section-label">Расписание тем</div>
          {lectures.map((l) => (
            <div key={l.id} className="card-tap row" style={{ alignItems: 'center', cursor: 'default' }}>
              <span className="row-start">
                <span className="pill badge-accent">{l.num}</span>
                <span>
                  <div style={{ fontWeight: 700 }}>{l.title}</div>
                  {testsPassed[l.id] && (
                    <div style={{ color: 'var(--success)', fontSize: 12, marginTop: 2 }}>✓ тест сдан</div>
                  )}
                </span>
              </span>
              <input
                type="datetime-local"
                value={toLocalInputValue(schedule[l.id])}
                onChange={(e) => e.target.value && setLectureDate(l.id, new Date(e.target.value).toISOString())}
                style={dateInputStyle}
              />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
