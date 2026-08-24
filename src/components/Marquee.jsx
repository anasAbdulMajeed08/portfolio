import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

function Row({ items, reverse, outline }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { xPercent: reverse ? -24 : 0 },
        {
          xPercent: reverse ? 0 : -24,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )
    }, el)
    return () => ctx.revert()
  }, [reverse])

  const loop = [...items, ...items, ...items]

  return (
    <div className="marquee-row-wrap">
      <div className={`marquee-row ${outline ? 'is-outline' : ''}`} ref={ref} aria-hidden="true">
        {loop.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item}
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <section className="marquee section-solid" aria-label="Skills">
      <Row items={site.stack} />
      <Row items={site.practice} reverse outline />
    </section>
  )
}
