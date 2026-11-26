import { FACES, FACE_COLOR, FACE_NAME, type Face } from './colors'

export type Turn = 'clockwise' | 'anticlockwise' | 'half'

export type Move = {
  face: Face
  turn: Turn
  notation: string
}

const SUFFIX_TURN: Record<string, Turn> = {
  '': 'clockwise',
  "'": 'anticlockwise',
  '2': 'half',
}

const isFace = (value: string): value is Face => (FACES as readonly string[]).includes(value)

export const parseMove = (token: string): Move => {
  const face = token[0]
  const suffix = token.slice(1)
  const turn = SUFFIX_TURN[suffix]
  if (!isFace(face) || turn === undefined) {
    throw new Error(`Unknown move "${token}"`)
  }
  return { face, turn, notation: token }
}

export const parseAlgorithm = (algorithm: string): Move[] =>
  algorithm.trim().split(/\s+/).filter(Boolean).map(parseMove)

const TURN_TEXT: Record<Turn, string> = {
  clockwise: 'a quarter turn clockwise',
  anticlockwise: 'a quarter turn anticlockwise',
  half: 'a half turn (180°)',
}

/** Back, left and bottom are hidden from you, so "clockwise" for them is easy to misread. */
const VIEWING_HINT: Partial<Record<Face, string>> = {
  B: 'Clockwise is judged as if you were looking at the back face from behind.',
  L: 'Clockwise is judged as if you were looking straight at the left face.',
  D: 'Clockwise is judged as if you were looking up at the bottom face from below.',
}

export const describeMove = (move: Move): string => {
  const faceText = `the ${FACE_NAME[move.face]} face (${FACE_COLOR[move.face]} centre)`
  const base = `Turn ${faceText} ${TURN_TEXT[move.turn]}.`
  const hint = move.turn === 'half' ? undefined : VIEWING_HINT[move.face]
  return hint ? `${base} ${hint}` : base
}
