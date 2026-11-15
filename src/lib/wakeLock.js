import { useEffect } from 'react'

// Keep the screen on while a training screen is mounted (eyes-free training:
// the phone must not dim/lock between answers). The browser drops the lock
// whenever the page is hidden, so it is re-requested on visibilitychange.
// Fails silently where the Screen Wake Lock API is unsupported or denied.
export function useWakeLock() {
  useEffect(() => {
    let sentinel = null
    let active = true

    async function acquire() {
      try {
        if (!active || document.visibilityState !== 'visible') return
        if (!('wakeLock' in navigator) || !navigator.wakeLock?.request) return
        if (sentinel && !sentinel.released) return
        sentinel = await navigator.wakeLock.request('screen')
        if (!active) {
          sentinel.release().catch(() => {})
          sentinel = null
        }
      } catch {
        // unsupported, denied or low battery -- not critical
      }
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', onVisibility)
      if (sentinel) {
        sentinel.release().catch(() => {})
        sentinel = null
      }
    }
  }, [])
}
