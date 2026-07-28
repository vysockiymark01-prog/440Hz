import { useNavigate, Link } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'

export default function FinalReview() {
  const navigate = useNavigate()
  const { notes } = useCourseProgress()
  const [wrongByLecture] = useLocalStorage('pt_quiz_wrong_v1', {})

  const lecturesWithNotes = lectures.filter((l) => notes[l.id] && notes[l.id].trim())
  const lecturesWithWrong = lectures.filter((l) => wrongByLecture[l.id]?.length > 0)

  const hasAnything = lecturesWithNotes.length > 0 || lecturesWithWrong.length > 0

  return (
    <div>
      <button className="back-link no-print" onClick={() => navigate('/reference')}>‹ Справочник</button>
      <h1 className="screen-title">Итоговое повторение</h1>
      <p className="screen-subtitle">
        Все ваши заметки к лекциям и вопросы, где были ошибки в тестах, — в одном месте перед экзаменом.
      </p>

      {hasAnything && (
        <button className="btn btn-block btn-primary no-print" style={{ marginBottom: 16 }} onClick={() => window.print()}>
          🖨️ Скачать / напечатать в PDF
        </button>
      )}

      {!hasAnything && (
        <div className="empty-state">
          Пока нечего повторять — заметок нет, а во всех сданных тестах ошибок не было. Отличный результат!
        </div>
      )}

      {lecturesWithWrong.length > 0 && (
        <>
          <div className="section-label">Вопросы с ошибками</div>
          {lecturesWithWrong.map((l) => (
            <div key={l.id} className="card">
              <div className="row" style={{ alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{l.title}</div>
                <Link to={`/reference/quiz/${l.id}`} className="btn btn-sm no-print">Пройти тест снова</Link>
              </div>
              {wrongByLecture[l.id].map((w, i) => (
                <div key={i} style={{ marginBottom: i < wrongByLecture[l.id].length - 1 ? 10 : 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{w.q}</div>
                  <div style={{ color: 'var(--success)', fontSize: 13, marginTop: 2 }}>Правильно: {w.correct}</div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {lecturesWithNotes.length > 0 && (
        <>
          <div className="section-label">Личные заметки</div>
          {lecturesWithNotes.map((l) => (
            <div key={l.id} className="card">
              <div className="row" style={{ alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{l.title}</div>
                <Link to={`/reference/${l.id}`} className="btn btn-sm no-print">К лекции</Link>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-dim)', fontSize: 14 }}>{notes[l.id]}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
