import { todayKey } from './daily.js'

const pad = (n) => String(n).padStart(2, '0')
export const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Estado de cada día a partir del historial: qué asignaturas superó y si las hizo todas.
// Devuelve { 'AAAA-MM-DD': { passed: Set(ids), all: boolean } }
export function dayStatus(state, subjectCount) {
  const days = {}
  const get = (date) => (days[date] ??= { passed: new Set(), all: false })

  ;(state.history ?? []).forEach((h) => {
    if (h.passed && !h.voided) get(h.date).passed.add(h.subjectId)
  })
  // Hoy: lo que ya consta en las tareas del día (por si falta en el historial).
  const d = state.daily
  if (d) {
    Object.entries(d.subjects ?? {}).forEach(([id, r]) => {
      if (r?.passed) get(d.date).passed.add(id)
    })
  }
  Object.keys(days).forEach((date) => {
    if (days[date].passed.size >= subjectCount) days[date].all = true
  })
  Object.keys(state.completions ?? {}).forEach((date) => {
    get(date).all = true
  })
  return days
}

// Días seguidos con todas las tareas, contando hacia atrás desde hoy
// (si hoy aún no está hecho, no rompe la racha: se cuenta desde ayer).
export function streak(days) {
  const cur = new Date()
  let n = 0
  if (!days[todayKey()]?.all) cur.setDate(cur.getDate() - 1)
  while (days[keyOf(cur)]?.all) {
    n++
    cur.setDate(cur.getDate() - 1)
  }
  return n
}

// Los últimos `n` días (el más reciente primero), incluido hoy.
export function lastDays(n) {
  const out = []
  const cur = new Date()
  for (let i = 0; i < n; i++) {
    out.push(keyOf(cur))
    cur.setDate(cur.getDate() - 1)
  }
  return out
}
