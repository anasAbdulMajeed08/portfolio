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

/** Reduced motion / already loaded: skip straight to the finished state. */
export function completeIntro() {
  intro.assemble = 1
  intro.burst = 1
  intro.released = true
}
