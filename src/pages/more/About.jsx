import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()
  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">О приложении</h1>
      <div className="card">
        <p>
          «Настройщик фортепиано» — офлайн-справочник и тренажёр слуха на биения,
          собранные по материалам курса «440Гц, 88 поток».
        </p>
        <p>
          Приложение работает полностью локально: все данные и прогресс хранятся
          только в памяти вашего устройства (localStorage), без аккаунтов и
          обращений к серверу.
        </p>
        <p>
          Раздел «Справочник» содержит переработанный конспект девяти лекций и
          глоссарий терминов. Раздел «Тренажёр» использует Web Audio API для
          генерации звука без аудиофайлов. Раздел «Инструменты» — рабочие
          материалы для выезда к клиенту.
        </p>
      </div>
      <div className="card">
        <p style={{ marginBottom: 0 }}>Версия 1.0.0 · MVP</p>
      </div>
    </div>
  )
}
