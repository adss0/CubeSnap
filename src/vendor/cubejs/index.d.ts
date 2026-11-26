// Types for the vendored cubejs ES module.
export default class Cube {
  constructor(state?: Cube)
  static fromString(facelets: string): Cube
  static random(): Cube
  static initSolver(): void
  static inverse(algorithm: string): string
  static scramble(): string
  move(algorithm: string): this
  asString(): string
  isSolved(): boolean
  clone(): Cube
  solve(maxDepth?: number): string
}
