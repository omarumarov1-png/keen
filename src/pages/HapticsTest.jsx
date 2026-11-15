import { useState } from 'react'
import { hapticSuccess, hapticError, hapticSupport, PATTERNS } from '../lib/haptics.js'
import { getSoundOn, setSoundOn, playCue } from '../lib/sound.js'
import { useLang } from '../lib/i18n.jsx'
import ModeHeader from '../components/ModeHeader.jsx'
import TapZones from '../components/TapZones.jsx'

function PulseEmblem() {
  return (
    <svg className="emblem emblem-pulse" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="16" y="8" width="16" height="32" rx="4" />
      <path d="M9 17v14M4 20v8M39 17v14M44 20v8" />
    </svg>
  )
}

function Check() {
  return <svg className="zone-disc" viewBox="0 0 100 100"><path d="M22 52l18 18 38-40" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function Cross() {
  return <svg className="zone-disc" viewBox="0 0 100 100"><path d="M28 28l44 44M72 28L28 72" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" /></svg>
}

// "Vibration test": feel both answer patterns on demand, see what this device
// supports, and switch the optional sound cues on/off.
export default function HapticsTest() {
  const { t } = useLang()
  const support = hapticSupport()
  const [sound, setSound] = useState(() => getSoundOn())
  const [count, setCount] = useState({ right: 0, wrong: 0 })

  function test(id) {
    // TapZones has just toggled the zone's real switch (native tick #1)
    if (id === 'right') hapticSuccess()
    else hapticError()
    setCount((c) => ({ ...c, [id]: c[id] + 1 }))
  }

  function toggleSound(e) {
    const on = e.target.checked
    setSoundOn(on) // inside the tap: also unlocks WebAudio on iOS
    setSound(on)
    if (on) playCue('right', { force: true })
  }

  let device
  if (support.kind === 'ios') {
    const v = support.version !== null ? support.version.toFixed(1).replace(/\.0$/, '') : '?'
    device = support.ok
      ? { tone: 'ok', title: t('ht.ios.ok', { v }), body: t('ht.ios.okBody') }
      : { tone: 'warn', title: t('ht.ios.old', { v }), body: t('ht.ios.oldBody') }
  } else if (support.kind === 'vibrate') {
    device = { tone: 'ok', title: t('ht.android.title'), body: t('ht.android.body') }
  } else {
    device = { tone: 'muted', title: t('ht.none.title'), body: t('ht.none.body') }
  }

  const ios = PATTERNS.ios
  const and = PATTERNS.android

  return (
    <div className="home-page haptics-page">
      <ModeHeader hue="cards" Emblem={PulseEmblem} title={t('ht.title')} tagline={t('ht.tagline')} />

      <section className={`ht-device tone-${device.tone}`} data-testid="ht-device" data-kind={support.kind}>
        <span className="ht-device-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M3 9v6M21 9v6" /></svg>
        </span>
        <div>
          <h2>{device.title}</h2>
          <p>{device.body}</p>
        </div>
      </section>

      <div className="ht-pads">
        <TapZones
          layout="halves"
          size="panel"
          zones={[
            { id: 'right', tone: 'yes', glyph: <Check />, label: t('ht.testRight') },
            { id: 'wrong', tone: 'no', glyph: <Cross />, label: t('ht.testWrong') },
          ]}
          onPick={test}
        />
        <div className="ht-legend">
          <span>
            <span className="hl hl-right"><i /><i /></span>
            {support.kind === 'vibrate'
              ? t('ht.legend.android', { p: and.success.join('/') })
              : t('ht.legend.ios', { n: ios.success.ticks, gap: ios.success.gapMs })}
            <b data-testid="ht-count-right">{count.right ? `×${count.right}` : ''}</b>
          </span>
          <span>
            <span className="hl hl-wrong"><i /><i /></span>
            {support.kind === 'vibrate'
              ? t('ht.legend.android', { p: and.error.join('/') })
              : t('ht.legend.ios', { n: ios.error.ticks, gap: ios.error.gapMs })}
            <b data-testid="ht-count-wrong">{count.wrong ? `×${count.wrong}` : ''}</b>
          </span>
        </div>
      </div>

      <section className="ht-tips">
        <h2>{t('ht.tips.title')}</h2>
        <ol>
          <li>{t('ht.tip.systemHaptics')}</li>
          <li>{t('ht.tip.update')}</li>
          <li>{t('ht.tip.whatYouFeel')}</li>
        </ol>
      </section>

      <label className="ht-sound">
        <span>
          <b>{t('ht.sound.title')}</b>
          <small>{t('ht.sound.body')}</small>
        </span>
        <input type="checkbox" switch="" checked={sound} onChange={toggleSound} data-testid="sound-toggle" />
      </label>
    </div>
  )
}
