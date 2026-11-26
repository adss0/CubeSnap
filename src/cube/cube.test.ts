import Cube from '../vendor/cubejs/index.js'
import { beforeAll, describe, expect, it } from 'vitest'
import type { Color } from './colors'
import { describeMove, parseAlgorithm, parseMove } from './moves'
import { applyAlgorithm, colorsFromFacelets, solvedColors, statesAlong } from './state'
import { validateColors } from './validate'

const SOLVED = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'

const swap = (colors: Color[], a: number, b: number): Color[] => {
  const next = [...colors]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

const scrambledColors = (algorithm: string): Color[] =>
  colorsFromFacelets(applyAlgorithm(SOLVED, algorithm))

describe('validateColors', () => {
  it('accepts a solved cube and returns the facelet string', () => {
    expect(validateColors(solvedColors())).toEqual({ ok: true, facelets: SOLVED })
  })

  it('accepts random reachable states', () => {
    for (let i = 0; i < 200; i++) {
      const facelets = Cube.random().asString()
      expect(validateColors(colorsFromFacelets(facelets))).toEqual({ ok: true, facelets })
    }
  })

  it('reports wrong sticker counts', () => {
    const colors = solvedColors()
    colors[0] = 'yellow'
    const result = validateColors(colors)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('There are 8 white stickers. There should be exactly 9.')
      expect(result.errors).toContain('There are 10 yellow stickers. There should be exactly 9.')
    }
  })

  it('detects a flipped edge', () => {
    // UF edge: facelets 7 (U) and 19 (F)
    const result = validateColors(swap(scrambledColors("R U F' D2"), 7, 19))
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/flipped/)
  })

  it('detects a twisted corner', () => {
    // URF corner: rotate stickers 8 -> 9 -> 20
    const colors = solvedColors()
    const [a, b, c] = [colors[8], colors[9], colors[20]]
    colors[8] = c
    colors[9] = a
    colors[20] = b
    const result = validateColors(colors)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/twisted/)
  })

  it('detects two swapped edges (parity)', () => {
    // swap the UF and UR edges entirely
    const colors = swap(swap(solvedColors(), 7, 5), 19, 10)
    const result = validateColors(colors)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/swapped/)
  })

  it('detects an impossible corner', () => {
    // put two white stickers on the same corner
    const colors = swap(solvedColors(), 9, 2)
    const result = validateColors(colors)
    expect(result).toMatchObject({ ok: false })
  })
})

describe('moves', () => {
  it('parses notation', () => {
    expect(parseAlgorithm("R U' F2")).toEqual([
      { face: 'R', turn: 'clockwise', notation: 'R' },
      { face: 'U', turn: 'anticlockwise', notation: "U'" },
      { face: 'F', turn: 'half', notation: 'F2' },
    ])
    expect(parseAlgorithm('  ')).toEqual([])
  })

  it('rejects unknown moves', () => {
    expect(() => parseMove('X')).toThrow()
    expect(() => parseMove('R3')).toThrow()
  })

  it('describes moves in plain English', () => {
    expect(describeMove(parseMove("R'"))).toBe(
      'Turn the right face (red centre) a quarter turn anticlockwise.',
    )
    expect(describeMove(parseMove('B'))).toMatch(/from behind/)
  })
})

describe('solving', () => {
  beforeAll(() => {
    Cube.initSolver()
  }, 30_000)

  it('solves random scrambles, and replaying the steps ends solved', () => {
    for (let i = 0; i < 10; i++) {
      const start = Cube.random().asString()
      const solution = Cube.fromString(start).solve()
      const moves = parseAlgorithm(solution).map((move) => move.notation)
      expect(moves.length).toBeLessThanOrEqual(22)
      const states = statesAlong(start, moves)
      expect(states).toHaveLength(moves.length + 1)
      expect(states.at(-1)).toBe(SOLVED)
    }
  })
})
