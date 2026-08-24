import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { site } from '../data/content'

const LINKS = [
  { label: 'About', id: '#about' },
  { label: 'Work', id: '#work' },
  { label: 'Contact', id: '#contact' },
]

export default function Navbar({ started }) {
  const root = useRef(null)

  // The preloader overlay is transparent, so hide the nav until the intro
  // hands off (skipped for reduced motion, where there is no intro).
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => gsap.set('.nav-item', { opacity: 0 }), root)
    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    if (!started) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.nav-item',
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'power3.out', delay: 0.4 }
      )
    }, root)
    return () => ctx.revert()
  }, [started])

  const go = (e, id) => {
    e.preventDefault()
    const el = document.querySelector(id)
    if (!el) return
    const lenis = window.__lenis
    if (lenis) lenis.scrollTo(el, { duration: 1.6, offset: 0 })
    else el.scrollIntoView()
  }

  return (
    <header className="nav" ref={root}>
      <a className="nav-item nav-logo" href="#top" onClick={(e) => go(e, '#top')}>
        {site.name}
      </a>
      <nav className="nav-links">
        {LINKS.map((l) => (
          <a key={l.id} className="nav-item nav-link" href={l.id} onClick={(e) => go(e, l.id)}>
            {l.label}
          </a>
        ))}
      </nav>
      <span className="nav-item nav-loc">{site.location}</span>
    </header>
  )
}
