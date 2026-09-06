import { Link } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import glossary from '../../data/glossary.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

function formatUnlockDate(iso, lang, t) {
  if (!iso) return ''
  const d = new Date(iso)
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (lang === 'mn') {
    // Хромиум-браузерүүдийн ICU-д mn-MN бүрэн дэмжигдэхгүй байж болзошгүй тул
    // огноог гараар (тоон сар) форматлана.
    return t('rh_unlock_at', { date: `${d.getMonth() + 1}-р сарын ${d.getDate()}`, time })
  }
  return t('rh_unlock_at', { date: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }), time })
}

function daysUntil(iso) {
  if (!iso) return null
  const diffMs = new Date(iso) - new Date()
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / 86400000)
}

function pluralDaysRu(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `через ${n} день`
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `через ${n} дня`
  return `через ${n} дней`
}

function pluralDays(n, lang, t) {
  if (lang === 'mn') return t('rh_days', { n })
  return pluralDaysRu(n)
}

function dayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  return Math.floor(diff / 86400000)
}

export default function ReferenceHome() {
  const { status, isLectureUnlocked, unlockDateFor, lockReason, testsPassed, passedCount, totalLectures } = useCourseProgress()
  const isNovice = status === 'novice'
  const { t, tr, lang } = useLanguage()

  const termOfDay = glossary.length > 0 ? glossary[dayOfYear() % glossary.length] : null

  return (
    <div>
      <h1 className="screen-title">{t('reference_title')}</h1>
      <p className="screen-subtitle">{t('rh_subtitle')}</p>

      {isNovice && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{t('rh_progress_title')}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {t('rh_topics_open', { done: passedCount, total: totalLectures })}
          </div>
        </div>
      )}

      {termOfDay && (
        <Link to={`/reference/glossary/${termOfDay.id}`} className="card-tap row" style={{ marginBottom: 14 }}>
          <span className="row-start">🔁 <span><b>{t('rh_term_of_day')}</b> {tr(termOfDay.term)}</span></span>
          <span>›</span>
        </Link>
      )}

      <Link to="/reference/search" className="card-tap row">
        <span className="row-start">🔍 <span>{t('reference_item_search')}</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/glossary" className="card-tap row">
        <span className="row-start">🔤 <span>{t('reference_item_glossary')}</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/quiz" className="card-tap row">
        <span className="row-start">📝 <span>{t('reference_item_quiz')}</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/review" className="card-tap row">
        <span className="row-start">📚 <span>{t('reference_item_review')}</span></span>
        <span>›</span>
      </Link>
      <Link to="/reference/care" className="card-tap row">
        <span className="row-start">🧴 <span>{t('reference_item_care')}</span></span>
        <span>›</span>
      </Link>

      <div className="section-label">{t('reference_lectures')}</div>
      <div className="lecture-stepper">
        {lectures.map((l) => {
          const unlocked = isLectureUnlocked(l.id)
          const done = !!testsPassed[l.id]
          const dotClass = done ? 'done' : unlocked ? 'current' : 'locked'
          const dotContent = done ? '✓' : unlocked ? l.num : '🔒'

          const body = !unlocked ? (
            <div>
              <div>{l.title}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 2 }}>
                {lockReason(l.id) === 'prev_test'
                  ? t('rh_lock_prev_test')
                  : `${formatUnlockDate(unlockDateFor(l.id), lang, t)}${
                      daysUntil(unlockDateFor(l.id)) > 0 ? ` · ${pluralDays(daysUntil(unlockDateFor(l.id)), lang, t)}` : ''
                    }`}
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: done ? 400 : 700 }}>{l.title}</div>
          )

          return (
            <div key={l.id} className="stepper-item">
              <div className={`stepper-dot ${dotClass}`}>{dotContent}</div>
              {unlocked ? (
                <Link to={`/reference/${l.id}`} className="stepper-body" style={{ color: 'inherit' }}>
                  {body}
                </Link>
              ) : (
                <div className="stepper-body" style={{ opacity: 0.7 }}>{body}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
