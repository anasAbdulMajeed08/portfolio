import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Splits a string into masked words/characters and slides them up
 * when the element scrolls into view. Purely GSAP-driven, so with
 * prefers-reduced-motion the text simply renders static.
 */
export default function TextReveal({
  children,
  as: Tag = 'div',
  className = '',
  mode = 'chars', // 'chars' | 'words'
  delay = 0,
  start = 'top 88%',
  stagger,
  duration = 1.1,
}) {
  const ref = useRef(null)
  const text = typeof children === 'string' ? children : ''

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.tr-i'),
        { yPercent: 118 },
        {
          yPercent: 0,
          duration,
          delay,
          ease: 'power4.out',
          stagger: stagger ?? (mode === 'chars' ? 0.02 : 0.055),
          scrollTrigger: { trigger: el, start, once: true },
        }
      )
    }, el)
    return () => ctx.revert()
  }, [text, mode, delay, start, stagger, duration])

  return (
    <Tag ref={ref} className={`tr ${className}`} aria-label={text}>
      {text.split(' ').map((word, wi) => (
        <span className="tr-w" key={wi} aria-hidden="true">
          {mode === 'chars' ? (
            [...word].map((ch, ci) => (
              <span className="tr-m" key={ci}>
                <span className="tr-i">{ch}</span>
              </span>
            ))
          ) : (
            <span className="tr-m">
              <span className="tr-i">{word}</span>
            </span>
          )}
        </span>
      ))}
    </Tag>
  )
}
