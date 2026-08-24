import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { site } from '../data/content'

export default function Preloader({ onDone }) {
  const root = useRef(null)
  const num = useRef(null)
  const done = useRef(false)

  useLayoutEffect(() => {
    const finish = () => {
      if (done.current) return
      done.current = true
      onDone()
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(root.current, { display: 'none' })
      finish()
      return
    }

    const counter = { v: 0 }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.to(counter, {
        v: 100,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
        },
      })
        .to('.pre-row', { yPercent: -110, duration: 0.5, ease: 'power3.in' }, '+=0.15')
        .to(root.current, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '<0.1')
        .call(finish, null, '<0.35')
        .set(root.current, { display: 'none' })
    }, root)

    return () => ctx.revert()
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
    </div>
  )
}
