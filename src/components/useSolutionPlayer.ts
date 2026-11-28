import { useCallback, useEffect, useRef, useState } from 'react'
import { inverseMove } from '../cube/geometry'
import type { Move } from '../cube/moves'
import type { CubeAnimation } from './Cube3D'

type PlayerAnimation = CubeAnimation & { fromStep: number; toStep: number }

const AUTOPLAY_PAUSE_MS = 180

/**
 * Drives stepping through a solution. With `animate` on, each step plays a layer
 * turn first and only advances once it finishes; without it, steps change at once.
 */
export const useSolutionPlayer = (moves: readonly Move[], animate: boolean) => {
  const [step, setStep] = useState(0)
  const [animation, setAnimation] = useState<PlayerAnimation>()
  const [playRequested, setPlayRequested] = useState(false)
  const nextId = useRef(0)
  const isFinished = step >= moves.length
  const playing = playRequested && !isFinished

  const stepForward = useCallback(() => {
    if (animation || step >= moves.length) return
    if (!animate) {
      setStep(step + 1)
      return
    }
    setAnimation({ id: nextId.current++, move: moves[step], fromStep: step, toStep: step + 1 })
  }, [animate, animation, moves, step])

  const stepBack = useCallback(() => {
    if (animation || step === 0) return
    setPlayRequested(false)
    if (!animate) {
      setStep(step - 1)
      return
    }
    setAnimation({ id: nextId.current++, move: inverseMove(moves[step - 1]), fromStep: step, toStep: step - 1 })
  }, [animate, animation, moves, step])

  const finishAnimation = useCallback(() => {
    if (!animation) return
    setStep(animation.toStep)
    setAnimation(undefined)
  }, [animation])

  const jumpTo = useCallback((target: number) => {
    setPlayRequested(false)
    setAnimation(undefined)
    setStep(target)
  }, [])

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlayRequested(false)
      return
    }
    if (isFinished) setStep(0)
    setPlayRequested(true)
  }, [isFinished, playing])

  useEffect(() => {
    if (!playing || animation) return
    const timer = setTimeout(stepForward, animate ? AUTOPLAY_PAUSE_MS : 700)
    return () => clearTimeout(timer)
  }, [animate, animation, playing, stepForward])

  return {
    step,
    isFinished,
    playing,
    animation,
    /** The state to draw: while animating, the layer turns away from the starting state. */
    displayStep: animation ? animation.fromStep : step,
    stepForward,
    stepBack,
    finishAnimation,
    jumpTo,
    togglePlay,
  }
}
