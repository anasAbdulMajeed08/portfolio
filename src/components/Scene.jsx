import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { intro, shouldSkipIntro } from '../lib/intro'
import { Assembly, Glow, Shockwave } from './LoaderParticles'

gsap.registerPlugin(ScrollTrigger)

// easeOutBack — the solid core lands with a little overshoot.
const backOut = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)

const EMBER = '#ee7a3c'
const STEEL = '#4a6ea8'

/**
 * The object travels between four waypoints as the page scrolls:
 * hero (right) -> about (far left, small) -> work (far right, small)
 * -> contact (center, large, "heated up"). Position is interpolated
 * procedurally from scroll progress, then damped per-frame, so adding
 * or removing page sections only shifts the pacing, never breaks it.
 */
const KEYS = [
  { p: 0.0, x: 1.95, y: -0.15, s: 1.0 },
  { p: 0.3, x: -2.5, y: 0.35, s: 0.6 },
  { p: 0.65, x: 2.5, y: -0.4, s: 0.5 },
  { p: 1.0, x: 0, y: 0.15, s: 1.22 },
]

function interp(p) {
  let a = KEYS[0]
  let b = KEYS[KEYS.length - 1]
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (p >= KEYS[i].p && p <= KEYS[i + 1].p) {
      a = KEYS[i]
      b = KEYS[i + 1]
      break
    }
  }
  const t = b.p === a.p ? 0 : (p - a.p) / (b.p - a.p)
  const e = t * t * (3 - 2 * t) // smoothstep
  return {
    x: a.x + (b.x - a.x) * e,
    y: a.y + (b.y - a.y) * e,
    s: a.s + (b.s - a.s) * e,
  }
}

function Forge({ reduced, skip, groupRef }) {
  const group = groupRef
  const core = useRef()
  const wire = useRef()
  const rim = useRef()
  const scroll = useRef(0)
  const velocity = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        scroll.current = self.progress
        velocity.current = self.getVelocity()
      },
    })
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      st.kill()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const p = scroll.current
    const k = interp(p)
    const t = state.clock.elapsedTime
    const d = 1 - Math.exp(-4.5 * delta) // frame-rate independent damping

    // Keep waypoints on screen for narrow viewports.
    const fit = Math.min(1, state.viewport.width / 8.6)
    // Portrait-ish viewports (same threshold as the hero media query in
    // index.css): the object can't sit beside the hero text, so it sits
    // above it (the lift fades out by the about waypoint) and stays a touch
    // smaller at the contact end so the CTA isn't buried in the wireframe.
    const narrow = state.size.width / state.size.height < 1.2
    const lift = narrow ? (1 - Math.min(p / 0.3, 1)) * 1.35 : 0
    const mobileScale = narrow ? 0.72 - Math.max(0, (p - 0.65) / 0.35) * 0.1 : 1

    // Until the intro releases it, the forge assembles at the centre of the
    // screen; then it glides to its hero waypoint as the title rises.
    const a = intro.assemble
    const b = intro.burst
    const tx = intro.released ? k.x * fit : 0
    const ty = intro.released ? k.y + lift : 0
    g.position.x += (tx - g.position.x) * d
    g.position.y += (ty + Math.sin(t * 0.55) * 0.09 - g.position.y) * d

    const targetS = k.s * mobileScale
    const s = g.scale.x + (targetS - g.scale.x) * d
    g.scale.setScalar(s)

    // Scroll velocity spins the object up (decays once scrolling stops) —
    // the touch-screen stand-in for the pointer parallax.
    velocity.current *= Math.exp(-2.5 * delta)
    const kick = reduced ? 0 : Math.min(Math.abs(velocity.current) / 2200, 1.4)
    // Spins faster while the particle cloud is still gathering.
    const spin = reduced ? 0.03 : 0.2 + p * 0.55 + kick + (1 - a) * 1.1
    g.rotation.y += delta * spin
    const rx = Math.sin(t * 0.25) * 0.12 + (reduced ? 0 : pointer.current.y * 0.22)
    const rz = reduced ? 0 : pointer.current.x * 0.1
    g.rotation.x += (rx - g.rotation.x) * d
    g.rotation.z += (rz - g.rotation.z) * d

    // Intro: the core pops in with overshoot as the particles burst, the
    // wireframe fades up behind them and the rim light flashes.
    if (core.current) {
      core.current.visible = b > 0
      core.current.scale.setScalar(b >= 1 ? 1 : b <= 0 ? 0.001 : backOut(b))
    }
    const flash = Math.sin(Math.min(1, b) * Math.PI) * 7

    // "Heat up" toward the contact section.
    if (wire.current) {
      wire.current.material.opacity = (0.24 + p * 0.34) * Math.min(1, b * 1.6)
      const pulse = 1.12 + Math.sin(t * 0.9) * 0.014
      wire.current.scale.setScalar(pulse)
    }
    if (rim.current) rim.current.intensity = 2.4 + p * 4.2 + flash
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 6]} intensity={1.9} color="#f4ead9" />
      <directionalLight ref={rim} position={[-5, -3, -4]} intensity={2.4} color={EMBER} />
      <directionalLight position={[0, 6, -6]} intensity={0.7} color={STEEL} />

      <group ref={group} position={skip ? [1.95, -0.15, 0] : [0, 0, 0]}>
        <mesh ref={core} visible={skip}>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshStandardMaterial color="#131826" metalness={0.72} roughness={0.26} flatShading />
        </mesh>
        <mesh ref={wire} scale={1.12}>
          <icosahedronGeometry args={[1.35, 1]} />
          {/* depthWrite off: while invisible during the intro it must not
              carve depth holes through the particles and glow behind it. */}
          <meshBasicMaterial
            color={EMBER}
            wireframe
            transparent
            depthWrite={false}
            opacity={skip ? 0.28 : 0}
          />
        </mesh>
        {!skip && <Glow />}
        {!skip && <Assembly />}
      </group>
    </>
  )
}

function Sparks({ reduced, skip }) {
  const pts = useRef()
  const mat = useRef()

  const geometry = useMemo(() => {
    const count = 650
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.4 + Math.random() * 2.6
      const theta = Math.acos(2 * Math.random() - 1)
      const phi = Math.random() * Math.PI * 2
      arr[i * 3] = r * Math.sin(theta) * Math.cos(phi)
      arr[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
      arr[i * 3 + 2] = r * Math.cos(theta)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    if (!pts.current || reduced) return
    // Ambient sparks only appear once the assembly has burst.
    if (mat.current) mat.current.opacity = 0.65 * Math.min(1, intro.burst * 1.2)
    pts.current.rotation.y -= delta * 0.03
    pts.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.12
  })

  return (
    <points ref={pts} geometry={geometry}>
      <pointsMaterial
        ref={mat}
        size={0.02}
        color={EMBER}
        transparent
        opacity={skip ? 0.65 : 0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function Scene() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // No intro this load (reduced motion, or once-per-session already seen):
  // render the finished state directly. Decided once, at mount, in step
  // with the preloader.
  const skip = typeof window !== 'undefined' && shouldSkipIntro()
  const forgeGroup = useRef()

  return (
    <div className="webgl" aria-hidden="true">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Forge reduced={reduced} skip={skip} groupRef={forgeGroup} />
        {!skip && <Shockwave target={forgeGroup} />}
        <Sparks reduced={reduced} skip={skip} />
      </Canvas>
    </div>
  )
}
