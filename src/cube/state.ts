import Cube from '../vendor/cubejs/index.js'
import { FACES, FACE_COLOR, STICKERS_PER_FACE, type Color, type CubeColors, type Face } from './colors'

export const solvedColors = (): Color[] =>
  FACES.flatMap((face) => Array<Color>(STICKERS_PER_FACE).fill(FACE_COLOR[face]))

export const colorsFromFacelets = (facelets: string): Color[] =>
  [...facelets].map((face) => FACE_COLOR[face as Face])

/** Applies moves to a validated facelet string and returns the new facelet string. */
export const applyAlgorithm = (facelets: string, algorithm: string): string => {
  if (algorithm.trim() === '') return facelets
  return Cube.fromString(facelets).move(algorithm).asString()
}

/** Each state along the way: index 0 is the start, index k is after k moves. */
export const statesAlong = (facelets: string, moves: readonly string[]): string[] => {
  const cube = Cube.fromString(facelets)
  return [facelets, ...moves.map((move) => cube.move(move).asString())]
}

export const randomColors = (): CubeColors => colorsFromFacelets(Cube.random().asString())
