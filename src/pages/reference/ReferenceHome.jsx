import { Link } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import glossary from '../../data/glossary.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'

function formatUnlockDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) +
    ' в ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function daysUntil(iso) {
  if (!iso) return null
  const diffMs = new Date(iso) - new Date()
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / 86400000)
}

function pluralDays(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} день`
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${n} дня`
  return `${n} дней`
}

function dayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  return Math.floor(diff / 86400000)
}

export default function ReferenceHome() {
  const { status, isLectureUnlocked, unlockDateFor, lockReason, testsPassed, passedCount, totalLectures } = useCourseProgress()
  const isNovice = status === 'novice'

  const termOfDay = glossary.length > 0 ? glossary[dayOfYear() % glossary.length] : null

  return (
    <div>
      <h1 className="screen-title">Справочник</h1>
      <p className="screen-subtitle">Конспект курса по настройке фортепиано, разбитый на короткие карточки</p>

      {isNovice && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Прогресс курса</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            Открыто тем: {passedCount} из {totalLectures}
          </div>
        </div>
      )}

      {termOfDay && (
        <Link to={`/reference/glossary/${termOfDay.id}`} className="card-tap row" style={{ marginBottom: 14 }}>
          <span className="row-start">🔁 <span><b>Повторим термин:</b> {termOfDay.term}</span></span>
          <span>›</span>
        </Link>
      )}

      <Link to="/reference/search" className="card-tap row">
        <span className="row-start">🔍 <span>Поиск по справочнику</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/glossary" className="card-tap row">
        <span className="row-start">🔤 <span>Глоссарий терминов</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/quiz" className="card-tap row">
        <span className="row-start">📝 <span>Тесты по темам</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/review" className="card-tap row">
        <span className="row-start">📚 <span>Итоговое повторение</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/care" className="card-tap row">
        <span className="row-start">🧴 <span>Уход за инструментом</span></span>
        <span>›</span>
      </Link>

      <div className="section-label">Лекции</div>
      <div className="lecture-stepper">
        {lectures.map((l) => {
          const unlocked = isLectureUnlocked(l.id)
          const done = !!testsPassed[l.id]
          const dotClass = done ? 'done' : unlocked ? 'current' : 'locked'
          const dotContent = done ? '✓' : unlocked ? l.num : '🔒'

          const body = !unlocked ? (
            <div>
              <div>{l.title}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 2 }}>
                {lockReason(l.id) === 'prev_test'
                  ? 'сначала пройдите тест предыдущей темы'
                  : `откроется ${formatUnlockDate(unlockDateFor(l.id))}${
                      daysUntil(unlockDateFor(l.id)) > 0 ? ` · через ${pluralDays(daysUntil(unlockDateFor(l.id)))}` : ''
                    }`}
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: done ? 400 : 700 }}>{l.title}</div>
          )

          return (
            <div key={l.id} className="stepper-item">
              <div className={`stepper-dot ${dotClass}`}>{dotContent}</div>
              {unlocked ? (
                <Link to={`/reference/${l.id}`} className="stepper-body" style={{ color: 'inherit' }}>
                  {body}
                </Link>
              ) : (
                <div className="stepper-body" style={{ opacity: 0.7 }}>{body}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
