import { Link, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import quizzes from '../../data/quizzes.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export default function QuizHome() {
  const navigate = useNavigate()
  const [results] = useLocalStorage('pt_quiz_results_v1', {})

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ Справочник</button>
      <h1 className="screen-title">Тесты по темам</h1>
      <p className="screen-subtitle">По 6 вопросов на каждую лекцию — проверьте, что запомнилось</p>

      {lectures.map((l) => {
        const questions = quizzes[l.id] || []
        const best = results[l.id]
        return (
          <Link key={l.id} to={`/reference/quiz/${l.id}`} className="card-tap row">
            <span className="row-start">
              <span className="pill badge-accent">{l.num}</span>
              <span>
                <div style={{ fontWeight: 700 }}>{l.title}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {questions.length} вопросов
                  {best ? ` · лучший результат ${best.score}/${best.total}` : ''}
                </div>
              </span>
            </span>
            <span>›</span>
          </Link>
        )
      })}
    </div>
  )
}
