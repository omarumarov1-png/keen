import { useLang } from '../lib/i18n.jsx'
import { summarize, verdictKey, signed } from '../lib/stats.js'
import { Ring, SessionBars } from './StatViz.jsx'

function dayLabel(ts, lang, t) {
  const d = new Date(ts)
  const now = new Date()
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((startOf(now) - startOf(d)) / 86400000)
  if (days === 0) return t('record.today')
  if (days === 1) return t('record.yesterday')
  return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'short' })
}

// All-time record for one mode: accuracy ring (tick = chance), attempts,
// best streak, edge vs chance, a plain-language "is it more than luck?"
// verdict, and accuracy per recent session as a bar strip.
//
// `chance` = null for modes without a guessing baseline (time); pass
// `metric` = { label, value } to fill that slot instead.
export default function RecordCard({ hue, title = null, n, c, chance, bestStreak, sessions, metric = null, extras = [], note = null }) {
  const { t, lang } = useLang()
  const s = summarize(n, c, chance)
  const vKey = chance !== null ? verdictKey(n, s.z) : null
  const tone = s.edge === null || n < 10 ? null : s.edge > 0 ? 'good' : s.edge < 0 ? 'bad' : null
  const last = sessions[sessions.length - 1]
  const bestSession = sessions.filter((x) => x.n >= 10).reduce((b, x) => (!b || x.c / x.n > b.c / b.n ? x : b), null)

  const cells = [
    { k: 'attempts', label: t('record.attempts'), value: n.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US') },
    { k: 'best', label: t('stat.bestStreak'), value: bestStreak },
    metric
      ? { k: 'metric', label: metric.label, value: metric.value }
      : { k: 'edge', label: t('record.edge'), value: n >= 10 ? signed(s.edge) : '—', tone },
    ...extras,
  ]
  if (cells.length < 4) cells.push({ k: 'sessions', label: t('record.sessions'), value: sessions.length })

  return (
    <section className={`record-card hue-${hue}`} data-testid={`record-${hue}${title ? `-${title}` : ''}`}>
      <header className="record-head">
        <span className="record-eyebrow">{t('record.title')}</span>
        {title && <span className="record-title">{title}</span>}
      </header>

      {n === 0 ? (
        <p className="record-empty">{t('record.empty')}</p>
      ) : (
        <>
          <div className="record-main">
            <Ring value={s.accuracy} chance={chance} size={104} stroke={8} label={t('record.ringAria')}>
              <b data-record="acc">{Math.round(s.accuracy * 100)}<small>%</small></b>
              <em>{chance !== null ? t('record.chanceAt', { p: Math.round(chance * 1000) / 10 }) : t('record.hitRate')}</em>
            </Ring>
            <dl className="record-grid">
              {cells.map((x) => (
                <div key={x.k} className={x.tone ? `tone-${x.tone}` : ''}>
                  <dt>{x.label}</dt>
                  <dd data-record={x.k}>{x.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {vKey && (
            <p className={`record-verdict v-${vKey.split('.')[1]}`} data-record="verdict">
              <i aria-hidden="true" />
              <span className="record-verdict-text">{t(vKey)}</span>
              {s.z !== null && n >= 20 && <span className="record-z">z = {s.z.toFixed(1)}</span>}
            </p>
          )}
          {note && <p className="record-note">{note}</p>}

          <div className="record-spark">
            <div className="record-spark-head">
              <span>{t('record.perSession')}</span>
              <span>{sessions.length ? t('record.lastN', { count: sessions.length }) : ''}</span>
            </div>
            {sessions.length ? (
              <>
                <SessionBars sessions={sessions} chance={chance} />
                <div className="record-spark-foot">
                  <span data-record="last">
                    {t('record.lastSession', {
                      when: dayLabel(last.id, lang, t),
                      n: last.n,
                      acc: Math.round((last.c / last.n) * 100),
                    })}
                  </span>
                  {bestSession && (
                    <span>{t('record.bestSession', { acc: Math.round((bestSession.c / bestSession.n) * 100) })}</span>
                  )}
                </div>
              </>
            ) : (
              <p className="record-spark-empty">{t('record.noSessions')}</p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
