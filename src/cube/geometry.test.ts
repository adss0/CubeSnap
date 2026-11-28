import { describe, expect, it } from 'vitest'
import Cube from '../vendor/cubejs/index.js'
import { FACES } from './colors'
import { CORNER_FACELETS, EDGE_FACELETS } from './facelets'
import { STICKER_PLACEMENTS, applyMoveGeometrically, inverseMove } from './geometry'
import { parseMove } from './moves'
import { applyAlgorithm } from './state'

const ALL_MOVES = FACES.flatMap((face) => [face, `${face}'`, `${face}2`])

describe('sticker geometry', () => {
  it('gives every sticker a unique cubie + direction', () => {
    const keys = STICKER_PLACEMENTS.map(({ cubie, normal }) => `${cubie}|${normal}`)
    expect(new Set(keys).size).toBe(54)
  })

  it('puts the stickers of each corner and edge on the same cubie', () => {
    for (const piece of [...CORNER_FACELETS, ...EDGE_FACELETS]) {
      const cubies = piece.map((i) => STICKER_PLACEMENTS[i].cubie.join())
      expect(new Set(cubies).size).toBe(1)
    }
  })

  it('agrees with the solver for every move from random states', () => {
    for (let i = 0; i < 20; i++) {
      const start = Cube.random().asString()
      for (const notation of ALL_MOVES) {
        expect(applyMoveGeometrically(start, parseMove(notation))).toBe(applyAlgorithm(start, notation))
      }
    }
  })

  it('undoes a move with its inverse', () => {
    const start = Cube.random().asString()
    for (const notation of ALL_MOVES) {
      const move = parseMove(notation)
      const back = applyMoveGeometrically(applyMoveGeometrically(start, move), inverseMove(move))
      expect(back).toBe(start)
    }
  })
})
