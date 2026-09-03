import { Link } from 'react-router-dom'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const MODE_KEYS = [
  {
    to: '/trainer/daily-exam',
    icon: '🎓',
    titleKey: 'trainer_item_daily_exam',
    desc: '5 заданий вперемешку: счёт биений и диагностика на слух — один общий результат',
  },
  {
    to: '/trainer/listen',
    icon: '🌊',
    titleKey: 'trainer_item_listen',
    desc: 'Слайдер разницы частот 0–8 Гц, визуализация огибающей и счётчик биений в секунду',
  },
  {
    to: '/trainer/count',
    icon: '🔢',
    titleKey: 'trainer_item_count',
    desc: 'Случайная пара 0.5–5 Гц — определите на слух скорость биений',
  },
  {
    to: '/trainer/second',
    icon: '⏱️',
    titleKey: 'trainer_item_second',
    desc: 'Тапайте в ритм под звучащую пару 440/441 Гц — оценка отклонения в мс',
  },
  {
    to: '/trainer/unison',
    icon: '🎯',
    titleKey: 'trainer_item_unison',
    desc: 'Сведите скрытое смещение в ноль, ориентируясь только на поведение биений',
  },
  {
    to: '/trainer/temperament',
    icon: '🎼',
    titleKey: 'trainer_item_temperament',
    desc: 'Реальная цепочка A–E–H–Fis–Cis–Gis–Es–B–F–C–G–D–A на настоящих частотах 12-TET',
  },
  {
    to: '/trainer/ear-diagnostics',
    icon: '🩺',
    titleKey: 'trainer_item_ear_diagnostics',
    desc: 'Узнавайте дребезжание, лишние обертона и негармоничность — синтетическая имитация дефектов',
  },
]

export default function TrainerHome() {
  const { streak, todayDone } = useTrainerStreak()
  const [examHistory] = useLocalStorage('pt_daily_exam_v1', { history: [] })
  const recentExams = examHistory.history.slice(-14)
  const { t } = useLanguage()
  const modes = MODE_KEYS.map((m) => ({ ...m, title: t(m.titleKey) }))

  return (
    <div>
      <h1 className="screen-title">{t('trainer_title')}</h1>
      <p className="screen-subtitle">Web Audio: две синусоиды с плавной атакой/затуханием, без щелчков</p>

      {streak.current > 0 && (
        <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
          <div className="big-number">🔥 {streak.current}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {streak.current === 1 ? 'день подряд' : 'дней подряд'}
            {!todayDone && ' — позанимайтесь сегодня, чтобы не прервать серию'}
            {streak.best > streak.current && ` · рекорд: ${streak.best}`}
          </div>
        </div>
      )}

      {recentExams.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Точность «Экзамена дня»</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
            {recentExams.map((e) => {
              const pct = Math.round((e.score / e.total) * 100)
              return (
                <div
                  key={e.date}
                  title={`${new Date(e.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}: ${pct}%`}
                  style={{
                    flex: 1,
                    height: `${Math.max(6, pct)}%`,
                    background: pct >= 60 ? 'var(--success)' : 'var(--danger)',
                    borderRadius: 3,
                    minWidth: 6,
                  }}
                />
              )
            })}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 6 }}>
            последние {recentExams.length} {recentExams.length === 1 ? 'попытка' : 'попыток'}
          </div>
        </div>
      )}

      {modes.map((m) => (
        <Link key={m.to} to={m.to} className="card-tap row">
          <span className="row-start">
            <span style={{ fontSize: 22 }}>{m.icon}</span>
            <span>
              <div style={{ fontWeight: 700 }}>{m.title}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{m.desc}</div>
            </span>
          </span>
          <span>›</span>
        </Link>
      ))}
    </div>
  )
}
