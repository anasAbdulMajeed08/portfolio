import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'
import Magnetic from './Magnetic'
import { site } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const cta = useRef(null)

  // Phones have no hover, so the CTA fills with ember while it's centred.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(max-width: 860px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: cta.current,
        start: 'top 72%',
        end: 'bottom 28%',
        toggleClass: { targets: cta.current, className: 'is-lit' },
      })
    })
    return () => mm.revert()
  }, [])

  const toTop = (e) => {
    e.preventDefault()
    const lenis = window.__lenis
    if (lenis) lenis.scrollTo(0, { duration: 1.8 })
    else window.scrollTo({ top: 0 })
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-inner container">
        <p className="eyebrow mono" data-reveal>
          {site.contact.eyebrow}
        </p>

        <TextReveal as="h2" className="contact-heading" mode="words" stagger={0.07}>
          {site.contact.heading}
        </TextReveal>

        <p className="contact-note dim" data-reveal>
          {site.contact.note}
        </p>

        <div data-reveal>
          <Magnetic>
            <a className="contact-cta" href={`mailto:${site.email}`} ref={cta}>
              {site.email}
            </a>
          </Magnetic>
        </div>

        <ul className="socials mono" data-reveal>
          {/* {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.url} target="_blank" rel="noreferrer" className="social-link">
                {s.label} ↗
              </a>
            </li>
          ))} */}
        </ul>
      </div>

      <footer className="footer container mono dim">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span className="footer-mid">React · Three.js · GSAP</span>
        <a href="#top" onClick={toTop} className="footer-top">
          Back to top ↑
        </a>
      </footer>
    </section>
  )
}
