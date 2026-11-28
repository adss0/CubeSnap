import { OrbitControls, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentRef } from 'react'
import { Color, Quaternion, Vector3, type Group } from 'three'
import { COLOR_HEX, FACE_COLOR, type Face } from '../cube/colors'
import { FACE_NORMAL, STICKER_PLACEMENTS, isInLayer, moveAngle, type Vec3 } from '../cube/geometry'
import type { Move } from '../cube/moves'

export type CubeAnimation = { id: number; move: Move }

type Cube3DProps = {
  facelets: string
  animation?: CubeAnimation
  durationMs: number
  onAnimationEnd: () => void
  highlightFace?: Face
  resetViewSignal: number
}

type Cubie = { position: Vec3; stickers: number[] }

const CUBIES: readonly Cubie[] = (() => {
  const byKey = new Map<string, Cubie>()
  STICKER_PLACEMENTS.forEach(({ cubie }, index) => {
    const key = cubie.join()
    const existing = byKey.get(key)
    if (existing) existing.stickers.push(index)
    else byKey.set(key, { position: cubie, stickers: [index] })
  })
  return [...byKey.values()]
})()

/** Rotation that turns a plane facing +z so it faces the given normal. */
const planeRotation = ([x, y, z]: Vec3): [number, number, number] => {
  if (x !== 0) return [0, (x * Math.PI) / 2, 0]
  if (y !== 0) return [(-y * Math.PI) / 2, 0, 0]
  return [0, z > 0 ? 0 : Math.PI, 0]
}

/** Applied in linear colour space, so it looks about 35% as bright. */
const DIM = 0.12
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

type CubieMeshProps = { cubie: Cubie; facelets: string; dimmed: boolean }

const CubieMesh = ({ cubie, facelets, dimmed }: CubieMeshProps) => (
  <group position={cubie.position as [number, number, number]}>
    <RoundedBox args={[0.96, 0.96, 0.96]} radius={0.08} smoothness={3}>
      <meshStandardMaterial color="#0b0c0e" roughness={0.6} />
    </RoundedBox>
    {cubie.stickers.map((index) => {
      const { normal } = STICKER_PLACEMENTS[index]
      const color = new Color(COLOR_HEX[FACE_COLOR[facelets[index] as Face]])
      if (dimmed) color.multiplyScalar(DIM)
      return (
        <mesh
          key={index}
          position={[normal[0] * 0.485, normal[1] * 0.485, normal[2] * 0.485]}
          rotation={planeRotation(normal)}
        >
          <planeGeometry args={[0.8, 0.8]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      )
    })}
  </group>
)

type CubeModelProps = Omit<Cube3DProps, 'resetViewSignal'>

const CubeModel = ({ facelets, animation, durationMs, onAnimationEnd, highlightFace }: CubeModelProps) => {
  const layerRef = useRef<Group>(null)
  const progress = useRef(0)
  const ended = useRef(false)
  const axis = useMemo(
    () => (animation ? new Vector3(...FACE_NORMAL[animation.move.face]) : undefined),
    [animation],
  )
  const turning = animation?.move.face

  useLayoutEffect(() => {
    progress.current = 0
    ended.current = false
    layerRef.current?.quaternion.identity()
  }, [animation?.id])

  useFrame((_, delta) => {
    if (!animation || !axis || !layerRef.current || ended.current) return
    progress.current = Math.min(1, progress.current + (delta * 1000) / durationMs)
    const angle = moveAngle(animation.move) * easeInOutCubic(progress.current)
    layerRef.current.quaternion.copy(new Quaternion().setFromAxisAngle(axis, angle))
    if (progress.current >= 1) {
      ended.current = true
      onAnimationEnd()
    }
  })

  const inTurningLayer = (cubie: Cubie) => turning !== undefined && isInLayer(cubie.position, turning)
  const isDimmed = (cubie: Cubie) =>
    !turning && highlightFace !== undefined && !isInLayer(cubie.position, highlightFace)

  return (
    <>
      <group>
        {CUBIES.filter((c) => !inTurningLayer(c)).map((cubie) => (
          <CubieMesh key={cubie.position.join()} cubie={cubie} facelets={facelets} dimmed={isDimmed(cubie)} />
        ))}
      </group>
      <group ref={layerRef}>
        {CUBIES.filter(inTurningLayer).map((cubie) => (
          <CubieMesh key={cubie.position.join()} cubie={cubie} facelets={facelets} dimmed={false} />
        ))}
      </group>
    </>
  )
}

export const Cube3D = ({ resetViewSignal, ...modelProps }: Cube3DProps) => {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)

  useEffect(() => {
    controls.current?.reset()
  }, [resetViewSignal])

  return (
    <div className="cube-3d" aria-label="3D cube preview">
      <Canvas camera={{ position: [4.2, 3.6, 5.6], fov: 34 }} dpr={[1, 2]}>
        <ambientLight intensity={1.6} />
        <directionalLight position={[5, 8, 6]} intensity={1.4} />
        <directionalLight position={[-6, -4, -5]} intensity={0.5} />
        <CubeModel {...modelProps} />
        <OrbitControls ref={controls} enablePan={false} enableZoom={false} rotateSpeed={0.8} />
      </Canvas>
    </div>
  )
}
