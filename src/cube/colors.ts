export const FACES = ['U', 'R', 'F', 'D', 'L', 'B'] as const
export type Face = (typeof FACES)[number]

export const COLORS = ['white', 'red', 'green', 'yellow', 'orange', 'blue'] as const
export type Color = (typeof COLORS)[number]

/** 54 sticker colours in Kociemba order: U R F D L B, 9 each, row by row. */
export type CubeColors = readonly Color[]

export const STICKER_COUNT = 54
export const STICKERS_PER_FACE = 9

/** Standard Western scheme, held with white on top and green facing you. */
export const FACE_COLOR: Record<Face, Color> = {
  U: 'white',
  R: 'red',
  F: 'green',
  D: 'yellow',
  L: 'orange',
  B: 'blue',
}

export const FACE_NAME: Record<Face, string> = {
  U: 'top',
  R: 'right',
  F: 'front',
  D: 'bottom',
  L: 'left',
  B: 'back',
}

export const COLOR_HEX: Record<Color, string> = {
  white: '#f5f5f5',
  red: '#d32f2f',
  green: '#2e9d4f',
  yellow: '#fdd835',
  orange: '#f57c00',
  blue: '#1e63d6',
}

/** Single-letter labels so the net is usable without relying on colour alone. */
export const COLOR_LETTER: Record<Color, string> = {
  white: 'W',
  red: 'R',
  green: 'G',
  yellow: 'Y',
  orange: 'O',
  blue: 'B',
}

export const centerIndex = (face: Face): number =>
  FACES.indexOf(face) * STICKERS_PER_FACE + 4

export const isCenterIndex = (index: number): boolean => index % STICKERS_PER_FACE === 4
