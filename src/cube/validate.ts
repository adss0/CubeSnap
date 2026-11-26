import {
  COLORS,
  FACES,
  STICKER_COUNT,
  STICKERS_PER_FACE,
  centerIndex,
  type Color,
  type CubeColors,
  type Face,
} from './colors'
import { CORNER_FACELETS, CORNER_FACES, EDGE_FACELETS, EDGE_FACES } from './facelets'

export type ValidationResult =
  | { ok: true; facelets: string }
  | { ok: false; errors: string[] }

const fail = (errors: string[]): ValidationResult => ({ ok: false, errors })

const checkColorCounts = (colors: CubeColors): string[] =>
  COLORS.flatMap((color) => {
    const count = colors.filter((c) => c === color).length
    if (count === STICKERS_PER_FACE) return []
    return [`There are ${count} ${color} stickers. There should be exactly 9.`]
  })

const checkCenters = (colors: CubeColors): string[] => {
  const centerColors = FACES.map((face) => colors[centerIndex(face)])
  if (new Set(centerColors).size === FACES.length) return []
  return ['Each centre must be a different colour.']
}

const countInversions = (permutation: readonly number[]): number => {
  let inversions = 0
  for (let i = 0; i < permutation.length; i++) {
    for (let j = i + 1; j < permutation.length; j++) {
      if (permutation[i] > permutation[j]) inversions++
    }
  }
  return inversions
}

const findDuplicates = (pieces: readonly number[]): number[] =>
  pieces.filter((piece, index) => pieces.indexOf(piece) !== index)

/**
 * Checks that the colours form a cube that can actually be solved, and explains
 * any problem in words a person can act on.
 * On success it returns the Kociemba facelet string.
 */
export const validateColors = (colors: CubeColors): ValidationResult => {
  if (colors.length !== STICKER_COUNT) {
    return fail([`Expected ${STICKER_COUNT} stickers but got ${colors.length}.`])
  }

  const basicErrors = [...checkColorCounts(colors), ...checkCenters(colors)]
  if (basicErrors.length > 0) return fail(basicErrors)

  const faceOfColor = new Map<Color, Face>(
    FACES.map((face) => [colors[centerIndex(face)], face]),
  )
  const colorOfFace = new Map<Face, Color>(
    FACES.map((face) => [face, colors[centerIndex(face)]]),
  )
  const facelets = colors.map((color) => faceOfColor.get(color) as Face)
  const describeColors = (indices: readonly number[]): string =>
    indices.map((i) => colors[i]).join('–')
  const describeFaces = (faces: readonly Face[]): string =>
    faces.map((face) => colorOfFace.get(face)).join('–')

  const errors: string[] = []

  const cornerPermutation: number[] = []
  let cornerTwist = 0
  CORNER_FACELETS.forEach((slot) => {
    const orientation = slot.findIndex((i) => facelets[i] === 'U' || facelets[i] === 'D')
    const second = facelets[slot[(orientation + 1) % 3]]
    const third = facelets[slot[(orientation + 2) % 3]]
    const piece = orientation < 0
      ? -1
      : CORNER_FACES.findIndex((faces) => faces[1] === second && faces[2] === third)
    if (piece < 0) {
      errors.push(`A corner shows ${describeColors(slot)}, which no real corner has. Check the stickers on that corner.`)
      return
    }
    cornerPermutation.push(piece)
    cornerTwist += orientation
  })

  const edgePermutation: number[] = []
  let edgeFlip = 0
  EDGE_FACELETS.forEach(([a, b]) => {
    const unflipped = EDGE_FACES.findIndex(([x, y]) => facelets[a] === x && facelets[b] === y)
    const flipped = EDGE_FACES.findIndex(([x, y]) => facelets[a] === y && facelets[b] === x)
    if (unflipped < 0 && flipped < 0) {
      errors.push(`An edge shows ${describeColors([a, b])}, which no real edge has. Check the stickers on that edge.`)
      return
    }
    edgePermutation.push(unflipped >= 0 ? unflipped : flipped)
    edgeFlip += unflipped >= 0 ? 0 : 1
  })

  if (errors.length > 0) return fail(errors)

  findDuplicates(cornerPermutation).forEach((piece) => {
    errors.push(`The ${describeFaces(CORNER_FACES[piece])} corner appears more than once.`)
  })
  findDuplicates(edgePermutation).forEach((piece) => {
    errors.push(`The ${describeFaces(EDGE_FACES[piece])} edge appears more than once.`)
  })
  if (errors.length > 0) return fail(errors)

  if (cornerTwist % 3 !== 0) {
    errors.push('One corner looks twisted in place. Re-check the three stickers on each corner.')
  }
  if (edgeFlip % 2 !== 0) {
    errors.push('One edge looks flipped. Its two stickers are probably entered the wrong way round.')
  }
  if (countInversions(cornerPermutation) % 2 !== countInversions(edgePermutation) % 2) {
    errors.push('Two pieces look swapped. Two stickers were probably entered in each other\'s place.')
  }
  if (errors.length > 0) return fail(errors)

  return { ok: true, facelets: facelets.join('') }
}
