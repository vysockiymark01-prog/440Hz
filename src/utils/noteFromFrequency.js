const NOTE_NAMES = ['До', 'До-диез', 'Ре', 'Ре-диез', 'Ми', 'Фа', 'Фа-диез', 'Соль', 'Соль-диез', 'Ля', 'Ля-диез', 'Си']

// A4 = 440 Гц = MIDI-нота 69. Возвращает ближайшую ноту и отклонение в центах.
export function noteFromFrequency(freq, a4 = 440) {
  if (!freq || freq <= 0) return null
  const midiFloat = 69 + 12 * Math.log2(freq / a4)
  const midi = Math.round(midiFloat)
  const cents = Math.round((midiFloat - midi) * 100)
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]
  return { name, octave, cents, midi, freq }
}
