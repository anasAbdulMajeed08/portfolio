import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'
import { site } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

function Stat({ value, suffix, label }) {
  const numRef = useRef(null)

  useLayoutEffect(() => {
    const el = numRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = value
      return
    }
    const obj = { v: 0 }
    const tween = gsap.to(obj, {
      v: value,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [value])

  return (
    <div className="stat">
      <div className="stat-num">
        <span ref={numRef}>0</span>
        <span className="stat-suffix">{suffix}</span>
      </div>
      <div className="stat-label mono dim">{label}</div>
    </div>
  )
}

export default function About() {
  return (
    <section className="about section-solid" id="about">
      <div className="container about-grid">
        <div className="about-side">
          <p className="eyebrow mono" data-reveal>
            About
          </p>
        </div>

        <div className="about-main">
          <TextReveal as="h2" className="h2" mode="words">
            Design file to production, end to end.
          </TextReveal>

          {site.about.map((para, i) => (
            <p className="about-para" data-reveal key={i}>
              {para}
            </p>
          ))}

          <p className="about-clients mono dim" data-reveal>
            {site.clients}
          </p>

          <div className="stats" data-reveal>
            {site.stats.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
