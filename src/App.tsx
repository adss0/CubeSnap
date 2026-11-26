import { useEffect, useState } from 'react'
import { ColorPalette } from './components/ColorPalette'
import { CubeNet } from './components/CubeNet'
import { SolutionStepper } from './components/SolutionStepper'
import type { Color } from './cube/colors'
import { solveFast, warmUpSolver } from './cube/solver'
import { randomColors, solvedColors } from './cube/state'
import { validateColors } from './cube/validate'

type Solution = { startFacelets: string; moves: string }

type SolverStatus = 'warming' | 'ready' | 'solving'

export const App = () => {
  const [colors, setColors] = useState<Color[]>(solvedColors)
  const [brush, setBrush] = useState<Color>('white')
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<SolverStatus>('warming')
  const [solution, setSolution] = useState<Solution>()

  useEffect(() => {
    warmUpSolver()
      .then(() => setStatus('ready'))
      .catch((error: unknown) => setErrors([`The solver failed to start: ${String(error)}`]))
  }, [])

  const paintSticker = (index: number) => {
    setErrors([])
    setColors((current) => current.map((color, i) => (i === index ? brush : color)))
  }

  const resetCube = () => {
    setErrors([])
    setColors(solvedColors())
  }

  const scrambleCube = () => {
    setErrors([])
    setColors([...randomColors()])
  }

  const solve = async () => {
    const result = validateColors(colors)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setStatus('solving')
    try {
      const moves = await solveFast(result.facelets)
      if (moves.trim() === '') {
        setErrors(['This cube is already solved.'])
        return
      }
      setSolution({ startFacelets: result.facelets, moves })
    } catch (error) {
      setErrors([`Could not solve this cube: ${String(error)}`])
    } finally {
      setStatus('ready')
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>CubeSnap</h1>
        <p className="tagline">Hold your cube with <strong>white on top</strong> and <strong>green facing you</strong>.</p>
      </header>

      {solution ? (
        <SolutionStepper
          startFacelets={solution.startFacelets}
          solution={solution.moves}
          onDone={() => setSolution(undefined)}
        />
      ) : (
        <section className="editor">
          <p className="hint">
            Pick a colour, then tap stickers to paint your cube. Centres are fixed. (Camera scanning is coming in Phase 3.)
          </p>
          <ColorPalette colors={colors} selected={brush} onSelect={setBrush} />
          <CubeNet colors={colors} onStickerClick={paintSticker} />

          {errors.length > 0 && (
            <ul className="errors" role="alert">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          <div className="mode-switch" role="radiogroup" aria-label="Solve mode">
            <button type="button" role="radio" aria-checked="true" className="mode mode--active">
              Fast (~20 moves)
            </button>
            <button type="button" role="radio" aria-checked="false" className="mode" disabled title="Coming in Phase 4">
              Beginner (soon)
            </button>
          </div>

          <div className="actions">
            <button type="button" onClick={resetCube}>Reset</button>
            <button type="button" onClick={scrambleCube}>Random scramble</button>
            <button type="button" className="primary" onClick={solve} disabled={status !== 'ready'}>
              {status === 'warming' && 'Preparing solver…'}
              {status === 'solving' && 'Solving…'}
              {status === 'ready' && 'Solve'}
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
