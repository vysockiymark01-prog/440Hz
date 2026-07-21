// Кварто-квинтовый метод темперации (лекция 3 конспекта «440Гц, 88 поток»):
// цепочка A → a → E → h → Fis → cis → Gis → es → b → F → c → G → d → A,
// подъёмы — квинты (немного заужены), спуски — кварты (немного расширены).
// Частоты считаются напрямую как равномерно темперированные (12-TET) —
// поэтому темперирование уже «зашито» в самих 12-TET частотах, а не
// добавляется отдельно: биения получаются естественным образом.

const A3 = 220 // ля малой октавы

function freqFor(semitonesFromA3) {
  return A3 * 2 ** (semitonesFromA3 / 12)
}

// Русские названия нот, встречающихся в цепочке.
const NOTE_NAMES = {
  0: 'Ля (A₃)',
  1: 'Си-бемоль (B♭)',
  2: 'Си (H)',
  3: 'До (C)',
  4: 'До-диез (Cis)',
  5: 'Ре (D)',
  6: 'Ре-диез / Ми-бемоль (Es)',
  7: 'Ми (E)',
  8: 'Фа (F)',
  9: 'Фа-диез (Fis)',
  10: 'Соль (G)',
  11: 'Соль-диез (Gis)',
  12: 'Ля (A₄, 440 Гц)',
}

// Последовательность позиций (полутонов от A3) в порядке прохождения цепочки.
const CHAIN = [12, 0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5, 12]

function kindFromDiff(diff) {
  const abs = Math.abs(diff)
  if (abs === 12) return 'octave'
  if (abs === 7) return 'fifth'
  if (abs === 5) return 'fourth'
  throw new Error(`Неожиданный интервал в цепочке темперации: ${diff} полутонов`)
}

function beatRate(fLow, fHigh, kind) {
  if (kind === 'octave') return 0
  if (kind === 'fifth') return Math.abs(3 * fLow - 2 * fHigh)
  return Math.abs(4 * fLow - 3 * fHigh) // fourth
}

const KIND_LABELS = {
  octave: 'октава (чистая, 0 биений)',
  fifth: 'квинта (заужена)',
  fourth: 'кварта (расширена)',
}

const temperamentChain = []
for (let i = 1; i < CHAIN.length; i += 1) {
  const fromPos = CHAIN[i - 1]
  const toPos = CHAIN[i]
  const fromFreq = freqFor(fromPos)
  const toFreq = freqFor(toPos)
  const kind = kindFromDiff(toPos - fromPos)
  const direction = toFreq > fromFreq ? 'up' : 'down'
  const fLow = Math.min(fromFreq, toFreq)
  const fHigh = Math.max(fromFreq, toFreq)
  temperamentChain.push({
    index: i,
    total: CHAIN.length - 1,
    fromLabel: NOTE_NAMES[fromPos],
    toLabel: NOTE_NAMES[toPos],
    fromFreq,
    toFreq,
    kind,
    kindLabel: KIND_LABELS[kind],
    direction,
    targetBeatHz: beatRate(fLow, fHigh, kind),
  })
}

export { beatRate }
export default temperamentChain
