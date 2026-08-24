import { config } from '../config'

/**
 * Shared clock for the loading sequence.
 *
 * The DOM preloader drives these numbers with one GSAP timeline; the WebGL
 * scene reads them every frame. Keeping the state in a plain object (not
 * React state) means the two halves stay in lock-step at 60fps with no
 * re-renders.
 *
 *   assemble  0 → 1  ember particles fly in and settle on the forge
 *   burst     0 → 1  particles flare outward, the solid core lands,
 *                    the ambient sparks fade in
 *   released         the forge may leave the centre for its hero waypoint
 */
export const intro = { assemble: 0, burst: 0, released: false }

/** Reduced motion / already seen: jump straight to the finished state. */
export function completeIntro() {
  intro.assemble = 1
  intro.burst = 1
  intro.released = true
}

/**
 * True when the intro should not play at all. Both the preloader and the
 * scene call this at mount so they agree: reduced motion, or the
 * once-per-session flag is on and this session has already seen it.
 * sessionStorage can throw (private mode, blocked storage) — treat that as
 * "not seen".
 */
export function shouldSkipIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  if (!config.intro.oncePerSession) return false
  try {
    return window.sessionStorage.getItem(config.intro.storageKey) === '1'
  } catch {
    return false
  }
}

/** Record that this session has watched the intro (no-op if flag is off). */
export function markIntroSeen() {
  if (!config.intro.oncePerSession) return
  try {
    window.sessionStorage.setItem(config.intro.storageKey, '1')
  } catch {
    /* storage unavailable — the intro simply plays again next time */
  }
}
