import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { site } from '../data/content'
import { intro, completeIntro } from '../lib/intro'

/**
 * DOM half of the loading sequence: name, counter and progress line over a
 * transparent overlay, so the WebGL assembly (see LoaderParticles.jsx) plays
 * through it. One timeline drives both — it tweens the shared `intro` clock
 * the scene reads, and hands off to the page part-way through the burst so
 * the hero title rises while the forge is still settling.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null)
  const num = useRef(null)
  const bar = useRef(null)
  const done = useRef(false)

  useLayoutEffect(() => {
    const finish = () => {
      if (done.current) return
      done.current = true
      onDone()
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      completeIntro()
      gsap.set(root.current, { display: 'none' })
      finish()
      return
    }

    // The overlay is see-through, so the page must sit at the top while the
    // intro plays: browsers restore the previous offset on reload (and jump
    // to #hash targets) around the time React mounts. Pin to 0 until
    // hand-off; App.jsx then scrolls to any hash target.
    const pin = () => window.scrollTo(0, 0)
    pin()
    window.addEventListener('scroll', pin)
    const release = () => window.removeEventListener('scroll', pin)

    // Absolute positions (seconds) so the overlap between phases is explicit.
    const ASSEMBLE = 2.4
    const BURST_AT = ASSEMBLE - 0.15

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.to(
        intro,
        {
          assemble: 1,
          duration: ASSEMBLE,
          ease: 'power1.inOut',
          onUpdate: () => {
            const pct = Math.round(intro.assemble * 100)
            if (num.current) num.current.textContent = String(pct).padStart(3, '0')
            if (bar.current) bar.current.style.transform = `scaleX(${intro.assemble})`
          },
        },
        0
      )
        .to(
          intro,
          { burst: 1, duration: 1.4, ease: 'power3.out', onStart: () => (intro.released = true) },
          BURST_AT
        )
        .to('.pre-row', { yPercent: -110, duration: 0.5, ease: 'power3.in' }, BURST_AT)
        .to(root.current, { opacity: 0, duration: 0.6, ease: 'power2.out' }, BURST_AT + 0.2)
        .call(
          () => {
            release()
            finish()
          },
          null,
          BURST_AT + 0.3
        )
        .set(root.current, { display: 'none' }, BURST_AT + 0.8)
    }, root)

    return () => {
      release()
      ctx.revert()
      // Keep the shared clock coherent if the effect ever re-runs (HMR).
      intro.released = false
    }
  }, [onDone])

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="pre-mask">
        <div className="pre-row">
          <span className="pre-name">{site.name}</span>
          <span className="pre-num" ref={num}>
            000
          </span>
        </div>
      </div>
      <span className="pre-bar" ref={bar} />
    </div>
  )
}
