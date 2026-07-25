// Определение высоты звука с микрофона методом автокорреляции (ACF2+,
// классический приём, используемый в большинстве браузерных тюнеров).
// Не требует внешних библиотек — считает всё на чистом JS поверх
// AnalyserNode.getFloatTimeDomainData.

const RMS_THRESHOLD = 0.01 // ниже — считаем тишиной

function autoCorrelate(buffer, sampleRate) {
  const SIZE = buffer.length

  let rms = 0
  for (let i = 0; i < SIZE; i += 1) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / SIZE)
  if (rms < RMS_THRESHOLD) return -1

  // Обрезаем тихие «хвосты» сигнала по краям буфера.
  const threshold = 0.2
  let start = 0
  let end = SIZE - 1
  while (start < SIZE / 2 && Math.abs(buffer[start]) < threshold) start += 1
  while (end > SIZE / 2 && Math.abs(buffer[end]) < threshold) end -= 1

  const trimmed = buffer.subarray(start, end)
  const n = trimmed.length
  if (n < 8) return -1

  const c = new Float32Array(n)
  for (let lag = 0; lag < n; lag += 1) {
    let sum = 0
    for (let i = 0; i < n - lag; i += 1) {
      sum += trimmed[i] * trimmed[i + lag]
    }
    c[lag] = sum
  }

  let d = 0
  while (d < n - 1 && c[d] > c[d + 1]) d += 1

  let maxVal = -1
  let maxPos = -1
  for (let i = d; i < n; i += 1) {
    if (c[i] > maxVal) {
      maxVal = c[i]
      maxPos = i
    }
  }
  if (maxPos <= 0) return -1

  // Параболическая интерполяция вокруг пика для точности выше разрешения буфера.
  let T0 = maxPos
  if (maxPos > 0 && maxPos < n - 1) {
    const x1 = c[maxPos - 1]
    const x2 = c[maxPos]
    const x3 = c[maxPos + 1]
    const a = (x1 + x3 - 2 * x2) / 2
    const b = (x3 - x1) / 2
    if (a !== 0) T0 = maxPos - b / (2 * a)
  }
  if (T0 <= 0) return -1

  return sampleRate / T0
}

export default class PitchDetector {
  constructor() {
    this.ctx = null
    this.stream = null
    this.source = null
    this.analyser = null
    this.buffer = null
    this.rafId = null
    this.running = false
  }

  async start(onPitch, onError) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      this.ctx = new AC()
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      this.source = this.ctx.createMediaStreamSource(this.stream)
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 2048
      this.buffer = new Float32Array(this.analyser.fftSize)
      this.source.connect(this.analyser)
      this.running = true

      const tick = () => {
        if (!this.running) return
        this.analyser.getFloatTimeDomainData(this.buffer)
        const freq = autoCorrelate(this.buffer, this.ctx.sampleRate)
        onPitch(freq)
        this.rafId = requestAnimationFrame(tick)
      }
      tick()
    } catch (err) {
      onError?.(err)
    }
  }

  stop() {
    this.running = false
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = null
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
    }
  }
}
