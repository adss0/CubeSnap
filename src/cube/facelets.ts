import type { Face } from './colors'

type CornerTriple = readonly [number, number, number]
type EdgePair = readonly [number, number]

/**
 * Facelet indices of each corner slot (URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB),
 * listed clockwise starting from the U/D sticker. This matches Kociemba's definition.
 */
export const CORNER_FACELETS: readonly CornerTriple[] = [
  [8, 9, 20],
  [6, 18, 38],
  [0, 36, 47],
  [2, 45, 11],
  [29, 26, 15],
  [27, 44, 24],
  [33, 53, 42],
  [35, 17, 51],
]

export const CORNER_FACES: readonly (readonly [Face, Face, Face])[] = [
  ['U', 'R', 'F'],
  ['U', 'F', 'L'],
  ['U', 'L', 'B'],
  ['U', 'B', 'R'],
  ['D', 'F', 'R'],
  ['D', 'L', 'F'],
  ['D', 'B', 'L'],
  ['D', 'R', 'B'],
]

/** Edge slots: UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR. */
export const EDGE_FACELETS: readonly EdgePair[] = [
  [5, 10],
  [7, 19],
  [3, 37],
  [1, 46],
  [32, 16],
  [28, 25],
  [30, 43],
  [34, 52],
  [23, 12],
  [21, 41],
  [50, 39],
  [48, 14],
]

export const EDGE_FACES: readonly (readonly [Face, Face])[] = [
  ['U', 'R'],
  ['U', 'F'],
  ['U', 'L'],
  ['U', 'B'],
  ['D', 'R'],
  ['D', 'F'],
  ['D', 'L'],
  ['D', 'B'],
  ['F', 'R'],
  ['F', 'L'],
  ['B', 'L'],
  ['B', 'R'],
]
