import { Link } from 'react-router-dom'
import termStems from '../data/termStems.js'
import glossary from '../data/glossary.js'
import { tokenizeWithTerms } from '../utils/linkifyTerms.js'

const glossaryIds = new Set(glossary.map((g) => g.id))

// Рендерит многоабзацный текст (\n\n — разделитель абзацев), автоматически
// подсвечивая упоминания терминов кликабельными ссылками на глоссарий.
export default function TermText({ text }) {
  const paragraphs = text.split('\n\n')
  return (
    <>
      {paragraphs.map((para, pi) => {
        const tokens = tokenizeWithTerms(para, termStems)
        return (
          <p key={pi}>
            {tokens.map((tok, ti) =>
              tok.term && glossaryIds.has(tok.id) ? (
                <Link key={ti} to={`/reference/glossary/${tok.id}`} className="term-link">
                  {tok.text}
                </Link>
              ) : (
                <span key={ti}>{tok.text}</span>
              ),
            )}
          </p>
        )
      })}
    </>
  )
}
