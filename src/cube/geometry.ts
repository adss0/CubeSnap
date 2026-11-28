import { FACES, STICKER_COUNT, STICKERS_PER_FACE, type Face } from './colors'
import type { Move, Turn } from './moves'

/** Integer 3D vector. x points right (R), y up (U), z towards you (F). */
export type Vec3 = readonly [number, number, number]

export type StickerPlacement = {
  /** Centre of the cubie the sticker sits on, each coordinate in -1..1. */
  cubie: Vec3
  /** Outward direction the sticker faces. */
  normal: Vec3
}

export const FACE_NORMAL: Record<Face, Vec3> = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1],
}

/**
 * Where sticker (row, col) of each face sits, as seen when looking straight at that face
 * in the standard unfolded net (U above F, then L F R B in a row, D below F).
 */
const CUBIE_FOR: Record<Face, (row: number, col: number) => Vec3> = {
  U: (r, c) => [c - 1, 1, r - 1],
  R: (r, c) => [1, 1 - r, 1 - c],
  F: (r, c) => [c - 1, 1 - r, 1],
  D: (r, c) => [c - 1, -1, 1 - r],
  L: (r, c) => [-1, 1 - r, c - 1],
  B: (r, c) => [1 - c, 1 - r, -1],
}

export const STICKER_PLACEMENTS: readonly StickerPlacement[] = FACES.flatMap((face) =>
  Array.from({ length: STICKERS_PER_FACE }, (_, i) => ({
    cubie: CUBIE_FOR[face](Math.floor(i / 3), i % 3),
    normal: FACE_NORMAL[face],
  })),
)

const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

const QUARTER_TURNS: Record<Turn, number> = { clockwise: 1, anticlockwise: -1, half: 2 }

/** Signed angle in radians: clockwise as seen from outside the face is a negative rotation about its normal. */
export const moveAngle = (move: Move): number => (-Math.PI / 2) * QUARTER_TURNS[move.turn]

export const isInLayer = (cubie: Vec3, face: Face): boolean => dot(cubie, FACE_NORMAL[face]) === 1

/** Rotates an integer vector about a face normal by a whole number of quarter turns (Rodrigues' formula). */
export const rotateQuarter = (v: Vec3, axis: Vec3, turn: Turn): Vec3 => {
  const along = dot(axis, v)
  const perp = cross(axis, v)
  const parallel = (k: number): Vec3 => [axis[0] * along * k, axis[1] * along * k, axis[2] * along * k]
  if (turn === 'half') {
    const p = parallel(2)
    return [p[0] - v[0], p[1] - v[1], p[2] - v[2]]
  }
  const sign = turn === 'clockwise' ? -1 : 1
  const p = parallel(1)
  return [p[0] + sign * perp[0], p[1] + sign * perp[1], p[2] + sign * perp[2]]
}

const placementKey = ({ cubie, normal }: StickerPlacement): string => `${cubie.join()}|${normal.join()}`

const INDEX_BY_PLACEMENT = new Map(STICKER_PLACEMENTS.map((p, i) => [placementKey(p), i]))

/**
 * Applies a move purely from the geometry. The 3D animation relies on this model,
 * so the tests check it against the solver's own move logic.
 */
export const applyMoveGeometrically = (facelets: string, move: Move): string => {
  const next = [...facelets]
  const axis = FACE_NORMAL[move.face]
  for (let i = 0; i < STICKER_COUNT; i++) {
    const { cubie, normal } = STICKER_PLACEMENTS[i]
    if (!isInLayer(cubie, move.face)) continue
    const target = placementKey({
      cubie: rotateQuarter(cubie, axis, move.turn),
      normal: rotateQuarter(normal, axis, move.turn),
    })
    const j = INDEX_BY_PLACEMENT.get(target)
    if (j === undefined) throw new Error(`No sticker at ${target}`)
    next[j] = facelets[i]
  }
  return next.join('')
}

export const inverseMove = (move: Move): Move => {
  if (move.turn === 'half') return move
  const turn: Turn = move.turn === 'clockwise' ? 'anticlockwise' : 'clockwise'
  return { face: move.face, turn, notation: turn === 'clockwise' ? move.face : `${move.face}'` }
}
