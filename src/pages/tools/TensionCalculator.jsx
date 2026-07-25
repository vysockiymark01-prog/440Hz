import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const STEEL_DENSITY = 7850 // кг/м³, стальная музыкальная проволока

function calcTension(diameterMm, lengthMm, freqHz) {
  const d = diameterMm / 1000
  const L = lengthMm / 1000
  const area = Math.PI * (d / 2) ** 2
  const mu = STEEL_DENSITY * area // кг/м — линейная плотность
  const tensionN = mu * (2 * L * freqHz) ** 2
  return tensionN
}

export default function TensionCalculator() {
  const navigate = useNavigate()
  const [diameter, setDiameter] = useState('0.90')
  const [length, setLength] = useState('500')
  const [freq, setFreq] = useState('440')

  const d = parseFloat(diameter.replace(',', '.'))
  const L = parseFloat(length.replace(',', '.'))
  const f = parseFloat(freq.replace(',', '.'))
  const valid = d > 0 && L > 0 && f > 0

  const tensionN = valid ? calcTension(d, L, f) : null
  const tensionKgf = tensionN !== null ? tensionN / 9.80665 : null

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Калькулятор натяжения</h1>
      <p className="screen-subtitle">
        Только для стальной проволоки без обмотки (дискант и тенор). Для басовых струн с навивкой
        формула не подходит — линейная плотность там зависит от канители.
      </p>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
          Диаметр проволоки, мм
        </label>
        <input type="text" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} />
      </div>
      <Link to="/tools/wire" style={{ fontSize: 13 }}>Посмотреть таблицу Röslau →</Link>

      <div style={{ marginTop: 14, marginBottom: 10 }}>
        <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
          Мензура (рабочая длина струны), мм
        </label>
        <input type="text" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
          Частота ноты, Гц
        </label>
        <input type="text" inputMode="decimal" value={freq} onChange={(e) => setFreq(e.target.value)} />
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        {valid ? (
          <>
            <div className="big-number">{tensionKgf.toFixed(1)} кгс</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>≈ {tensionN.toFixed(0)} Н</div>
          </>
        ) : (
          <div style={{ color: 'var(--text-faint)' }}>Заполните все поля числами больше нуля</div>
        )}
      </div>
    </div>
  )
}
