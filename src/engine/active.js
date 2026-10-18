import { SUBJECTS } from './subjects.js'
import { extrasFor, BASE_PACK } from './packs.js'
import { topicsFor, activeTopics } from './daily.js'

// Qué temas y asignaturas están activos ahora mismo (según lo que se haya desactivado en la zona de padres).
export const simsFor = (state, subjectId) => (state.sims ?? []).filter((s) => s.subject === subjectId)

export const extrasOf = (state, subjectId) => extrasFor([BASE_PACK, ...(state.packs ?? [])], subjectId)

export const subjectTopics = (state, subject) => topicsFor(subject, extrasOf(state, subject.id), simsFor(state, subject.id))

export function activeSubjects(state) {
  const disabled = state.disabled ?? {}
  return SUBJECTS.filter((s) => activeTopics(subjectTopics(state, s), disabled).length > 0)
}
