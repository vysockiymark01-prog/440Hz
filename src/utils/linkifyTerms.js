const CYR = 'а-яёА-ЯЁ'

let cachedRegex = null
let cachedStems = null

function buildRegex(termStems) {
  if (cachedRegex && cachedStems === termStems) return cachedRegex
  const sorted = [...termStems].sort((a, b) => b.stem.length - a.stem.length)
  const alternation = sorted.map((t) => t.stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const re = new RegExp(`(?<![${CYR}])(${alternation})[${CYR}]{0,3}(?![${CYR}])`, 'giu')
  cachedRegex = re
  cachedStems = termStems
  return re
}

// Возвращает массив токенов {term:false,text} / {term:true,id,text} для рендера.
export function tokenizeWithTerms(text, termStems) {
  const regex = buildRegex(termStems)
  const stemToId = {}
  for (const t of termStems) stemToId[t.stem.toLowerCase()] = t.id

  const tokens = []
  let lastIndex = 0
  let match
  regex.lastIndex = 0
  while ((match = regex.exec(text)) !== null) {
    const full = match[0]
    const stemMatched = match[1].toLowerCase()
    const id = stemToId[stemMatched]
    if (match.index > lastIndex) {
      tokens.push({ term: false, text: text.slice(lastIndex, match.index) })
    }
    tokens.push({ term: true, id, text: full })
    lastIndex = match.index + full.length
  }
  if (lastIndex < text.length) {
    tokens.push({ term: false, text: text.slice(lastIndex) })
  }
  return tokens
}
