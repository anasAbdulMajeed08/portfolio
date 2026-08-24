import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { intro } from '../lib/intro'

/**
 * The loading sequence, rendered inside the main scene so it hands off to
 * the real forge with no cut:
 *
 *   <Assembly>  — a GPU particle cloud that flies in from off-screen and
 *                 settles on the forge's wireframe (70%) and faces (30%),
 *                 then flares outward on the burst and disappears.
 *   <Shockwave> — a single expanding ring fired at the burst.
 *
 * Everything is driven by `intro.assemble` / `intro.burst`, which the DOM
 * preloader tweens with GSAP.
 */

const VERT = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aTarget;
  attribute float aDelay;
  attribute float aSeed;

  uniform float uAssemble;
  uniform float uBurst;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uMaxSize;

  varying float vHeat;
  varying float vAlpha;

  float easeInOut(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    // Each particle leaves on its own delay so the cloud streams in rather
    // than moving as one block.
    float p = smoothstep(aDelay, aDelay + 0.55, uAssemble);
    float e = easeInOut(p);

    // Swing around a side vector so the paths arc instead of beelining.
    vec3 dir = aTarget - aStart;
    vec3 side = normalize(cross(dir, vec3(0.3, 1.0, 0.2))) * (1.2 + aSeed * 1.6);
    vec3 pos = mix(aStart, aTarget, e) + side * sin(p * 3.14159) * (1.0 - e * 0.5);

    // In flight the cloud churns; seated particles only shimmer in place.
    pos += vec3(
      sin(uTime * 1.3 + aSeed * 31.0),
      cos(uTime * 1.1 + aSeed * 17.0),
      sin(uTime * 0.9 + aSeed * 23.0)
    ) * 0.35 * (1.0 - e);
    vec3 n = normalize(aTarget);
    pos += n * sin(uTime * 2.0 + aSeed * 40.0) * 0.012 * e;

    // Burst: fly outward along the normal and fade.
    pos += n * uBurst * (1.8 + aSeed * 2.4);

    vHeat = e;
    float fade = 1.0 - uBurst;
    vAlpha = (0.45 + 0.55 * e) * fade * fade;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float size = uSize * (0.55 + aSeed * 0.9) * (0.75 + 0.25 * e) * (1.0 + uBurst * 0.8);
    // Cap so particles flying at the camera don't balloon into blobs
    // (tighter on phones: overlapping additive sprites are fill-rate bound).
    gl_PointSize = min(size * uPixelRatio * (6.0 / -mv.z), uMaxSize * uPixelRatio);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vHeat;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    a *= a;
    // Particles run ember → white-hot as they seat on the object.
    vec3 c = mix(uColor, uHot, vHeat * vHeat * 0.85);
    gl_FragColor = vec4(c, a * vAlpha);
  }
`

/** Start / target positions for `count` particles, in the forge's local space. */
function buildAttributes(count) {
  const solid = new THREE.IcosahedronGeometry(1.35, 1) // same shape as the forge
  const faces = solid.attributes.position.array // 9 floats per triangle
  const edgesGeo = new THREE.EdgesGeometry(solid)
  const edges = edgesGeo.attributes.position.array // 6 floats per edge
  solid.dispose()
  edgesGeo.dispose()

  const triCount = faces.length / 9
  const edgeCount = edges.length / 6
  const start = new Float32Array(count * 3)
  const target = new Float32Array(count * 3)
  const delay = new Float32Array(count)
  const seed = new Float32Array(count)
  const v = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.7) {
      // On the wireframe (which the forge draws at 1.12× the solid).
      const e = Math.floor(Math.random() * edgeCount) * 6
      const t = Math.random()
      v.set(
        edges[e] + (edges[e + 3] - edges[e]) * t,
        edges[e + 1] + (edges[e + 4] - edges[e + 1]) * t,
        edges[e + 2] + (edges[e + 5] - edges[e + 2]) * t
      ).multiplyScalar(1.12)
    } else {
      // On a face, uniform by barycentric sampling.
      const f = Math.floor(Math.random() * triCount) * 9
      let r1 = Math.random()
      let r2 = Math.random()
      if (r1 + r2 > 1) {
        r1 = 1 - r1
        r2 = 1 - r2
      }
      const r0 = 1 - r1 - r2
      v.set(
        faces[f] * r0 + faces[f + 3] * r1 + faces[f + 6] * r2,
        faces[f + 1] * r0 + faces[f + 4] * r1 + faces[f + 7] * r2,
        faces[f + 2] * r0 + faces[f + 5] * r1 + faces[f + 8] * r2
      )
    }
    target.set([v.x, v.y, v.z], i * 3)

    // Start well outside the viewport, in every direction.
    v.randomDirection().multiplyScalar(3.2 + Math.random() * 4.5)
    start.set([v.x, v.y, v.z], i * 3)

    delay[i] = Math.random() * 0.45
    seed[i] = Math.random()
  }
  return { start, target, delay, seed }
}

export function Assembly() {
  const { size, gl } = useThree()
  const narrow = size.width < 700
  const count = narrow ? 4500 : 9000
  const attrs = useMemo(() => buildAttributes(count), [count])
  const pts = useRef()
  const [done, setDone] = useState(false)

  const uniforms = useMemo(
    () => ({
      uAssemble: { value: 0 },
      uBurst: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: gl.getPixelRatio() },
      uSize: { value: narrow ? 11 : 13 },
      uMaxSize: { value: narrow ? 30 : 42 },
      uColor: { value: new THREE.Color('#ee7a3c') },
      uHot: { value: new THREE.Color('#ffe6c4') },
    }),
    [gl, narrow]
  )

  useFrame((state) => {
    const p = pts.current
    if (!p) return
    if (intro.burst >= 1) {
      // Finished: park the camera and unmount so the GPU buffers are freed.
      state.camera.position.z = 6
      if (!done) setDone(true)
      return
    }
    uniforms.uAssemble.value = intro.assemble
    uniforms.uBurst.value = intro.burst
    uniforms.uTime.value = state.clock.elapsedTime
    // Slow dolly-in while the cloud gathers; lands on the scene's camera z.
    const a = intro.assemble
    state.camera.position.z = 6 + 1.2 * (1 - a * a * (3 - 2 * a))
  })

  if (done) return null

  return (
    <points ref={pts} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attrs.target, 3]} />
        <bufferAttribute attach="attributes-aStart" args={[attrs.start, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[attrs.target, 3]} />
        <bufferAttribute attach="attributes-aDelay" args={[attrs.delay, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[attrs.seed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Radial ember gradient for the centre glow (generated once, 128px). */
function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255, 214, 170, 0.9)')
  g.addColorStop(0.25, 'rgba(238, 122, 60, 0.55)')
  g.addColorStop(0.6, 'rgba(238, 122, 60, 0.12)')
  g.addColorStop(1, 'rgba(238, 122, 60, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Soft ember glow at the heart of the assembly; swells, then flares out. */
export function Glow() {
  const ref = useRef()
  const tex = useMemo(makeGlowTexture, [])
  const [done, setDone] = useState(false)
  useEffect(() => () => tex.dispose(), [tex])

  useFrame(() => {
    const m = ref.current
    if (!m) return
    const a = intro.assemble
    const b = intro.burst
    if (b >= 1) {
      if (!done) setDone(true)
      return
    }
    const s = 0.8 + a * 2.6 + b * 4
    m.scale.set(s, s, 1)
    m.material.opacity = (0.12 + 0.45 * a) * (1 - b)
  })

  if (done) return null

  return (
    <sprite ref={ref}>
      <spriteMaterial
        map={tex}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}

/** Expanding ring fired at the burst, centred on the forge group. */
export function Shockwave({ target }) {
  const ref = useRef()
  const [done, setDone] = useState(false)

  useFrame(() => {
    const m = ref.current
    if (!m) return
    const b = intro.burst
    if (b >= 1) {
      if (!done) setDone(true)
      return
    }
    m.visible = b > 0
    if (!m.visible) return
    if (target.current) m.position.copy(target.current.position)
    m.scale.setScalar(0.8 + b * 7.5)
    m.material.opacity = Math.pow(1 - b, 1.6) * 0.75
  })

  if (done) return null

  return (
    <mesh ref={ref} visible={false}>
      <ringGeometry args={[0.94, 1, 128]} />
      <meshBasicMaterial
        color="#ee7a3c"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
