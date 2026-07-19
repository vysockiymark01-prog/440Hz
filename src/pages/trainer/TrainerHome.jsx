import { Link } from 'react-router-dom'

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
]

export default function TrainerHome() {
  return (
    <div>
      <h1 className="screen-title">Тренажёр биений</h1>
      <p className="screen-subtitle">Web Audio: две синусоиды с плавной атакой/затуханием, без щелчков</p>

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
