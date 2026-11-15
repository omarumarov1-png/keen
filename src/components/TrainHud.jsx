import { useLang } from '../lib/i18n.jsx'
import { summarize, signed } from '../lib/stats.js'
import { Ring, Trail } from './StatViz.jsx'

// Edge vs chance is only shown once a session has a few attempts -- one lucky
// tap is not "+50%".
export const EDGE_MIN = 5

// The calm training HUD: read in one glance, nothing moves except numbers.
//   [ring: session accuracy, tick = chance]  ATTEMPTS  VS CHANCE  STREAK
//   [● ● ● ... last 20 results, newest right]              [extra stat]
// `metric` replaces the vs-chance column (time mode: average error).
export default function TrainHud({ session, total, chance, streak, best, recent, metric = null, extra = null }) {
  const { t } = useLang()
  const s = summarize(session.n, session.c, chance)
  const showEdge = s.n >= EDGE_MIN && s.edge !== null
  const tone = showEdge ? (s.edge > 0 ? 'good' : s.edge < 0 ? 'bad' : null) : null
  const accText = s.accuracy === null ? '—' : Math.round(s.accuracy * 100)

  return (
    <div className="hud" data-testid="hud">
      <div className="hud-row">
        <Ring
          value={s.accuracy}
          chance={chance}
          tone={metric ? metric.tone : tone}
          label={t('hud.ringAria', { acc: s.accuracy === null ? '—' : `${accText}%` })}
        >
          <b data-hud="acc">{accText}</b>{s.accuracy !== null && <small>%</small>}
        </Ring>

        <span className="hud-col">
          <small>{t('hud.attempts')}</small>
          <b data-hud="session">{s.n}</b>
          <em>{t('hud.ofTotal', { total })}</em>
        </span>

        {metric ? (
          <span className={`hud-col${metric.tone ? ` tone-${metric.tone}` : ''}`}>
            <small>{metric.label}</small>
            <b data-hud="metric">{metric.value}</b>
            <em>{metric.sub}</em>
          </span>
        ) : (
          <span className={`hud-col${tone ? ` tone-${tone}` : ''}`}>
            <small>{t('hud.edge')}</small>
            <b data-hud="edge">{showEdge ? signed(s.edge) : '—'}</b>
            <em>{t('hud.chanceIs', { p: Math.round(chance * 1000) / 10 })}</em>
          </span>
        )}

        <span className="hud-col">
          <small>{t('hud.streak')}</small>
          <b data-hud="streak">{streak}</b>
          <em data-hud="best">{t('hud.best', { best })}</em>
        </span>
      </div>
      <div className="hud-trail-row">
        <Trail results={recent} label={t('hud.trailAria')} />
        {extra && (
          <span className="hud-extra">
            <small>{extra.label}</small>
            <b data-hud="extra">{extra.value}</b>
          </span>
        )}
      </div>
    </div>
  )
}
