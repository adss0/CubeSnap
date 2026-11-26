export type SolverRequest =
  | { id: number; type: 'warmup' }
  | { id: number; type: 'solve'; facelets: string }

export type SolverResponse =
  | { id: number; ok: true; solution: string }
  | { id: number; ok: false; error: string }

type Pending = { resolve: (solution: string) => void; reject: (error: Error) => void }

let worker: Worker | undefined
let nextId = 0
const pending = new Map<number, Pending>()

const getWorker = (): Worker => {
  if (worker) return worker
  worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' })
  worker.addEventListener('message', (event: MessageEvent<SolverResponse>) => {
    const response = event.data
    const request = pending.get(response.id)
    if (!request) return
    pending.delete(response.id)
    if (response.ok) request.resolve(response.solution)
    else request.reject(new Error(response.error))
  })
  worker.addEventListener('error', (event) => {
    const error = new Error(event.message || 'The solver worker failed to load')
    pending.forEach((request) => request.reject(error))
    pending.clear()
    worker = undefined
  })
  return worker
}

const send = (request: SolverRequest): Promise<string> =>
  new Promise((resolve, reject) => {
    pending.set(request.id, { resolve, reject })
    getWorker().postMessage(request)
  })

/** Builds the solver tables in the background (about 4–5 s) so the first solve is instant. */
export const warmUpSolver = (): Promise<string> => send({ id: nextId++, type: 'warmup' })

/** Kociemba two-phase solve. Takes a validated facelet string and returns moves like "R U' F2". */
export const solveFast = (facelets: string): Promise<string> =>
  send({ id: nextId++, type: 'solve', facelets })
