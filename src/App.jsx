import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import Scene from './components/Scene'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Marquee from './components/Marquee'
import Projects from './components/Projects'
import Contact from './components/Contact'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const onPreloaderDone = useCallback(() => setLoaded(true), [])

  // Smooth scrolling (skipped when the OS asks for reduced motion).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    window.__lenis = lenis
    lenis.stop() // locked while the preloader runs

    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  // Release scroll + settle trigger positions once the intro hands off.
  useEffect(() => {
    if (!loaded) return
    window.__lenis?.start()
    ScrollTrigger.refresh()
  }, [loaded])

  // Generic fade-up for anything tagged data-reveal.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        )
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <Preloader onDone={onPreloaderDone} />
      <Scene />
      <div className="grain" aria-hidden="true" />
      <Navbar started={loaded} />
      <main className="page">
        <Hero started={loaded} />
        <About />
        <Marquee />
        <Projects />
        <Contact />
      </main>
    </>
  )
}
