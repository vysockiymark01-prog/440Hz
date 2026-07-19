import { useEffect, useRef } from 'react'

// Рисует скроллящуюся огибающую амплитуды (визуализация биений) на canvas,
// используя данные AnalyserNode из активного BeatEngine.
export default function BeatVisualizer({ getAnalyser, isPlaying, height = 110 }) {
  const canvasRef = useRef(null)
  const bufferRef = useRef([])
  const rafRef = useRef(null)
  const timeArrRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx2d = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    function resize() {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      const width = canvas.getBoundingClientRect().width
      const h = canvas.getBoundingClientRect().height

      const analyser = getAnalyser?.()
      if (analyser && isPlaying) {
        if (!timeArrRef.current || timeArrRef.current.length !== analyser.fftSize) {
          timeArrRef.current = new Uint8Array(analyser.fftSize)
        }
        analyser.getByteTimeDomainData(timeArrRef.current)
        let min = 255
        let max = 0
        for (let i = 0; i < timeArrRef.current.length; i++) {
          const v = timeArrRef.current[i]
          if (v < min) min = v
          if (v > max) max = v
        }
        const amp = (max - min) / 255 // 0..1
        bufferRef.current.push(amp)
      } else {
        bufferRef.current.push(0)
      }
      const maxPoints = 260
      if (bufferRef.current.length > maxPoints) {
        bufferRef.current.splice(0, bufferRef.current.length - maxPoints)
      }

      ctx2d.clearRect(0, 0, width, h)

      // baseline
      ctx2d.strokeStyle = '#2e2e32'
      ctx2d.lineWidth = 1
      ctx2d.beginPath()
      ctx2d.moveTo(0, h / 2)
      ctx2d.lineTo(width, h / 2)
      ctx2d.stroke()

      const buf = bufferRef.current
      const step = width / maxPoints
      const offset = maxPoints - buf.length

      ctx2d.strokeStyle = '#d9a441'
      ctx2d.lineWidth = 2
      ctx2d.beginPath()
      buf.forEach((amp, i) => {
        const x = (offset + i) * step
        const y = h / 2 - (amp * h * 0.46)
        if (i === 0) ctx2d.moveTo(x, y)
        else ctx2d.lineTo(x, y)
      })
      ctx2d.stroke()

      ctx2d.beginPath()
      buf.forEach((amp, i) => {
        const x = (offset + i) * step
        const y = h / 2 + (amp * h * 0.46)
        if (i === 0) ctx2d.moveTo(x, y)
        else ctx2d.lineTo(x, y)
      })
      ctx2d.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [getAnalyser, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height, display: 'block', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
    />
  )
}
