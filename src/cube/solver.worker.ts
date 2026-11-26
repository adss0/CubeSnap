import Cube from '../vendor/cubejs/index.js'
import type { SolverRequest, SolverResponse } from './solver'

let initialised = false

const ensureInitialised = () => {
  if (initialised) return
  Cube.initSolver()
  initialised = true
}

const respond = (response: SolverResponse) => self.postMessage(response)

self.addEventListener('message', (event: MessageEvent<SolverRequest>) => {
  const request = event.data
  try {
    ensureInitialised()
    if (request.type === 'warmup') {
      respond({ id: request.id, ok: true, solution: '' })
      return
    }
    const solution = Cube.fromString(request.facelets).solve()
    respond({ id: request.id, ok: true, solution })
  } catch (error) {
    respond({ id: request.id, ok: false, error: String(error) })
  }
})
