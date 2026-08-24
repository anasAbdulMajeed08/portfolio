import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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

function Forge({ reduced }) {
  const group = useRef()
  const wire = useRef()
  const rim = useRef()
  const scroll = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => (scroll.current = self.progress),
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
    const mobileScale = state.viewport.width < 6 ? 0.78 : 1

    g.position.x += (k.x * fit - g.position.x) * d
    g.position.y += (k.y + Math.sin(t * 0.55) * 0.09 - g.position.y) * d

    const targetS = k.s * mobileScale
    const s = g.scale.x + (targetS - g.scale.x) * d
    g.scale.setScalar(s)

    const spin = reduced ? 0.03 : 0.2 + p * 0.55
    g.rotation.y += delta * spin
    const rx = Math.sin(t * 0.25) * 0.12 + (reduced ? 0 : pointer.current.y * 0.22)
    const rz = reduced ? 0 : pointer.current.x * 0.1
    g.rotation.x += (rx - g.rotation.x) * d
    g.rotation.z += (rz - g.rotation.z) * d

    // "Heat up" toward the contact section.
    if (wire.current) {
      wire.current.material.opacity = 0.24 + p * 0.34
      const pulse = 1.12 + Math.sin(t * 0.9) * 0.014
      wire.current.scale.setScalar(pulse)
    }
    if (rim.current) rim.current.intensity = 2.4 + p * 4.2
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 6]} intensity={1.9} color="#f4ead9" />
      <directionalLight ref={rim} position={[-5, -3, -4]} intensity={2.4} color={EMBER} />
      <directionalLight position={[0, 6, -6]} intensity={0.7} color={STEEL} />

      <group ref={group} position={[1.95, -0.15, 0]}>
        <mesh>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshStandardMaterial color="#131826" metalness={0.72} roughness={0.26} flatShading />
        </mesh>
        <mesh ref={wire} scale={1.12}>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshBasicMaterial color={EMBER} wireframe transparent opacity={0.28} />
        </mesh>
      </group>
    </>
  )
}

function Sparks({ reduced }) {
  const pts = useRef()

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
    pts.current.rotation.y -= delta * 0.03
    pts.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.12
  })

  return (
    <points ref={pts} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        color={EMBER}
        transparent
        opacity={0.65}
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

  return (
    <div className="webgl" aria-hidden="true">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Forge reduced={reduced} />
        <Sparks reduced={reduced} />
      </Canvas>
    </div>
  )
}
