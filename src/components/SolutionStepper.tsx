import { useEffect, useMemo, useState } from 'react'
import { describeMove, parseAlgorithm } from '../cube/moves'
import { colorsFromFacelets, statesAlong } from '../cube/state'
import { CubeNet } from './CubeNet'

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
  const [step, setStep] = useState(0)
  const isFinished = step === moves.length
  const nextMove = moves[step]

  const goBack = () => setStep((s) => Math.max(0, s - 1))
  const goForward = () => setStep((s) => Math.min(moves.length, s + 1))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') goForward()
      if (event.key === 'ArrowLeft') goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

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
              onClick={() => setStep(i)}
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
            <h2 className="step-notation">{nextMove.notation}</h2>
            <p>{describeMove(nextMove)}</p>
          </>
        )}
      </div>

      <CubeNet colors={colorsFromFacelets(states[step])} highlightFace={nextMove?.face} />

      <div className="actions">
        <button type="button" onClick={goBack} disabled={step === 0}>
          ← Previous
        </button>
        {isFinished ? (
          <button type="button" className="primary" onClick={onDone}>
            Solve another
          </button>
        ) : (
          <button type="button" className="primary" onClick={goForward}>
            Done, next →
          </button>
        )}
      </div>
      <p className="hint">Tip: use the ← → arrow keys or Space to step.</p>
    </section>
  )
}
