import { Link } from 'react-router-dom'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'

const modes = [
  {
    to: '/trainer/listen',
    icon: '🌊',
    title: 'Послушать биения',
    desc: 'Слайдер разницы частот 0–8 Гц, визуализация огибающей и счётчик биений в секунду',
  },
  {
    to: '/trainer/count',
    icon: '🔢',
    title: 'Посчитай биения',
    desc: 'Случайная пара 0.5–5 Гц — определите на слух скорость биений',
  },
  {
    to: '/trainer/second',
    icon: '⏱️',
    title: 'Чувство секунды',
    desc: 'Тапайте в ритм под звучащую пару 440/441 Гц — оценка отклонения в мс',
  },
  {
    to: '/trainer/unison',
    icon: '🎯',
    title: 'Сведи унисон',
    desc: 'Сведите скрытое смещение в ноль, ориентируясь только на поведение биений',
  },
  {
    to: '/trainer/temperament',
    icon: '🎼',
    title: 'Темперация по кругу квинт',
    desc: 'Реальная цепочка A–E–H–Fis–Cis–Gis–Es–B–F–C–G–D–A на настоящих частотах 12-TET',
  },
]

export default function TrainerHome() {
  const { streak, todayDone } = useTrainerStreak()

  return (
    <div>
      <h1 className="screen-title">Тренажёр биений</h1>
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
