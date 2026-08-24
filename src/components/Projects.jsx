import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'
import { site } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

function Card({ project, index }) {
  return (
    <a
      className="card"
      href={project.link}
      target={project.link === '#' ? undefined : '_blank'}
      rel="noreferrer"
    >
      <div className="card-art" style={{ background: `radial-gradient(120% 120% at 20% 10%, ${project.tint}, transparent 60%)` }}>
        {project.image && (
          // Image and scrim share one layer so the hover scale never
          // leaves a hairline seam at the clipped edge (see .card-media).
          <div className="card-media">
            <img
              className="card-img"
              src={project.image}
              alt={`${project.title} — homepage`}
              loading={index < 2 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        )}
        <span className="card-index mono">{String(index + 1).padStart(2, '0')}</span>
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="card-body">
        <div className="card-top mono dim">
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
        <h3 className="card-title">{project.title}</h3>
        <p className="card-desc">{project.description}</p>
        <p className="card-meta mono dim">{project.meta}</p>
      </div>
    </a>
  )
}

export default function Projects() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const mm = gsap.matchMedia()

    // Desktop: pin the section and translate the track horizontally.
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      const getDistance = () => track.scrollWidth - section.clientWidth
      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + getDistance(),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    })

    // Mobile: vertical stack. Cards reveal on entry, light up while they
    // cross the middle of the screen (the touch equivalent of :hover) and
    // their artwork drifts slightly against the scroll.
    mm.add('(max-width: 860px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray(track.querySelectorAll('.card')).forEach((card) => {
        gsap.fromTo(
          card,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            clearProps: 'transform', // hand transform back to CSS for .is-active
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          }
        )

        ScrollTrigger.create({
          trigger: card,
          start: 'top 50%',
          end: 'bottom 50%',
          toggleClass: { targets: card, className: 'is-active' },
        })

        const media = card.querySelector('.card-media')
        if (media) {
          gsap.fromTo(
            media,
            { yPercent: -3 },
            {
              yPercent: 3,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          )
        }
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="work section-solid" id="work" ref={sectionRef}>
      <div className="work-head container">
        <p className="eyebrow mono" data-reveal>
          Selected work
        </p>
        <TextReveal as="h2" className="h2" mode="words">
          Built to hold up in public.
        </TextReveal>
      </div>
      <div className="work-track" ref={trackRef}>
        {site.projects.map((p, i) => (
          <Card project={p} index={i} key={p.title} />
        ))}
        <div className="work-endcap">
          <p className="mono dim">
            + {site.stats[1].value}
            {site.stats[1].suffix} more shipped since 2019
          </p>
        </div>
      </div>
    </section>
  )
}
