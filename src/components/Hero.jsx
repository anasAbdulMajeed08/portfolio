import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export default function Hero({ started }) {
  const root = useRef(null)

  // Hide everything before the intro (skipped entirely for reduced motion).
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.set('.hero-title .tr-i', { yPercent: 118 })
      gsap.set('.hero-tag, .hero-meta, .hero-scroll', { opacity: 0, y: 26 })
    }, root)
    return () => ctx.revert()
  }, [])

  // Orchestrated intro, fired by the preloader handing off.
  useLayoutEffect(() => {
    if (!started) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.to('.hero-title .tr-i', { yPercent: 0, duration: 1.3, stagger: 0.03 }, 0.05)
        .to('.hero-tag', { opacity: 1, y: 0, duration: 1 }, 0.55)
        .to('.hero-meta', { opacity: 1, y: 0, duration: 1 }, 0.7)
        .to('.hero-scroll', { opacity: 1, y: 0, duration: 1 }, 0.95)

      // Drift the hero content away as the user scrolls past it.
      gsap.to('.hero-inner', {
        yPercent: -14,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom 35%',
          scrub: true,
        },
      })
    }, root)
    return () => ctx.revert()
  }, [started])

  const words = site.name.split(' ')

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-inner container">
        <p className="hero-tag mono">
          {site.role} — {site.focus}
        </p>

        <h1 className="hero-title" aria-label={site.name}>
          {words.map((word, wi) => (
            <span className={`hero-line ${wi === words.length - 1 ? 'is-outline' : ''}`} key={wi} aria-hidden="true">
              {[...word].map((ch, ci) => (
                <span className="tr-m" key={ci}>
                  <span className="tr-i">{ch}</span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="hero-meta">
          <p className="hero-tagline">{site.tagline}</p>
          <p className="mono dim">
            {site.location} · {site.availability}
          </p>
        </div>

        <div className="hero-scroll mono dim" aria-hidden="true">
          <span>Scroll</span>
          <span className="hero-scroll-line" />
        </div>
      </div>
    </section>
  )
}
