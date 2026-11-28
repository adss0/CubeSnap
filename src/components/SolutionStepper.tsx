import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { describeMove, parseAlgorithm } from '../cube/moves'
import { colorsFromFacelets, statesAlong } from '../cube/state'
import { CubeNet } from './CubeNet'
import { useSolutionPlayer } from './useSolutionPlayer'

const Cube3D = lazy(() => import('./Cube3D').then((module) => ({ default: module.Cube3D })))

type View = '3d' | 'net'

const MOVE_DURATION_MS = 450

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type SolutionStepperProps = {
  startFacelets: string
  solution: string
  onDone: () => void
}

export const SolutionStepper = ({ startFacelets, solution, onDone }: SolutionStepperProps) => {
  const moves = useMemo(() => parseAlgorithm(solution), [solution])
  const states = useMemo(
    () => statesAlong(startFacelets, moves.map((move) => move.notation)),
    [startFacelets, moves],
  )
  const [view, setView] = useState<View>('3d')
  const [resetViewSignal, setResetViewSignal] = useState(0)
  const animate = view === '3d' && !prefersReducedMotion()
  const player = useSolutionPlayer(moves, animate)
  const { step, isFinished, playing, animation, displayStep } = player
  const currentMove = animation?.move ?? moves[step]

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') player.stepForward()
      if (event.key === 'ArrowLeft') player.stepBack()
      if (event.key === ' ') {
        event.preventDefault()
        player.togglePlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [player])

  return (
    <section className="stepper">
      <ol className="move-list" aria-label="All moves">
        {moves.map((move, i) => (
          <li key={i}>
            <button
              type="button"
              className={[
                'move-chip',
                i < step ? 'move-chip--done' : '',
                i === step ? 'move-chip--current' : '',
              ].join(' ')}
              onClick={() => player.jumpTo(i)}
            >
              {move.notation}
            </button>
          </li>
        ))}
      </ol>

      <div className="step-card" aria-live="polite">
        {isFinished ? (
          <>
            <p className="step-count">All {moves.length} moves done</p>
            <h2>Solved! 🎉</h2>
          </>
        ) : (
          <>
            <p className="step-count">
              Step {step + 1} of {moves.length}
            </p>
            <h2 className="step-notation">{moves[step].notation}</h2>
            <p>{describeMove(moves[step])}</p>
          </>
        )}
      </div>

      <div className="view-bar">
        <div className="segmented" role="radiogroup" aria-label="Cube view">
          {(['3d', 'net'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={view === option}
              className={view === option ? 'segment segment--active' : 'segment'}
              onClick={() => setView(option)}
            >
              {option === '3d' ? '3D' : 'Net'}
            </button>
          ))}
        </div>
        {view === '3d' && (
          <button type="button" className="link-button" onClick={() => setResetViewSignal((n) => n + 1)}>
            Reset view
          </button>
        )}
      </div>

      {view === '3d' ? (
        <Suspense fallback={<CubeNet colors={colorsFromFacelets(states[displayStep])} />}>
          <Cube3D
            facelets={states[displayStep]}
            animation={animation}
            durationMs={MOVE_DURATION_MS}
            onAnimationEnd={player.finishAnimation}
            highlightFace={currentMove?.face}
            resetViewSignal={resetViewSignal}
          />
        </Suspense>
      ) : (
        <CubeNet colors={colorsFromFacelets(states[displayStep])} highlightFace={currentMove?.face} />
      )}

      <div className="actions">
        <button type="button" onClick={player.stepBack} disabled={step === 0 || animation !== undefined}>
          ← Previous
        </button>
        <button type="button" onClick={player.togglePlay} aria-pressed={playing}>
          {playing ? '❚❚ Pause' : '▶ Play'}
        </button>
        {isFinished ? (
          <button type="button" className="primary" onClick={onDone}>
            Solve another
          </button>
        ) : (
          <button type="button" className="primary" onClick={player.stepForward} disabled={animation !== undefined}>
            Done, next →
          </button>
        )}
      </div>
      <p className="hint">
        The highlighted layer is the one to turn. Drag the cube to look around. Keys: ← → to step, Space to play/pause.
      </p>
    </section>
  )
}
