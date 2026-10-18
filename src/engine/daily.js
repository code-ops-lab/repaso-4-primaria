import { bankTopic, shuffle } from './helpers.js'
import { simulate } from './pdfSim.js'
import { TOPIC_EMOJI } from '../data/explain.js'

export const TASK_SIZE = 10
export const PASS_MARK = 8

const pad = (n) => String(n).padStart(2, '0')

export function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const freshDaily = () => ({ date: todayKey(), subjects: {}, counted: false })

export const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const extraTopicId = (subjectId, name) => `x:${subjectId}:${slug(name)}`

// Temas que NO están activos al instalar (se pueden cambiar desde la zona de padres):
//  · la división con divisor de dos cifras (aún no la da),
//  · Conocimiento del Medio: solo «El cuerpo humano», que es lo del primer trimestre.
const MEDIO_OFF = [
  'Los seres vivos',
  'El agua, el tiempo y el clima',
  'Materia y energía',
  'La sociedad y el trabajo',
  'Historia: Prehistoria y Roma',
  'La Comunitat Valenciana y España'
]
export const DEFAULT_DISABLED = Object.fromEntries([['div2', true], ...MEDIO_OFF.map((n) => [extraTopicId('medio', n), true])])

// Todos los temas de una asignatura: los generados por la app, los bloques de preguntas
// (paquete base y paquetes importados, agrupados por `topic`) y un tema por cada PDF de operaciones.
export function topicsFor(subject, extraItems = [], sims = []) {
  const topics = [...subject.topics]
  const groups = new Map()
  extraItems.forEach((it) => {
    const name = it.topic || 'Ejercicios extra'
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(it)
  })
  groups.forEach((items, name) =>
    topics.push({ id: extraTopicId(subject.id, name), name, emoji: TOPIC_EMOJI[name] ?? '📚', make: bankTopic(items), count: items.length, extra: true })
  )
  sims.forEach((s) => topics.push({ id: `sim-${s.id}`, name: s.name, emoji: '📄', make: () => simulate(s), sim: true }))
  return topics
}

export const activeTopics = (topics, disabled = {}) => topics.filter((t) => !disabled[t.id])

// Tarea de una asignatura: reparte las 10 preguntas entre sus temas ACTIVOS, cada uno con su nivel.
// Evita las ya dominadas; si se agotan, completa con repetidas y devuelve exhausted:true.
export function buildTask(subject, levels, extraItems, mastered, sims = [], disabled = {}) {
  const all = topicsFor(subject, extraItems, sims)
  const active = activeTopics(all, disabled)
  // Orden aleatorio: con más de 10 temas, cada día salen unos distintos.
  const topics = shuffle(active.length ? active : all)
  const exclude = new Set(Object.keys(mastered))
  const items = []
  const seen = new Set()
  const leftovers = []

  for (let i = 0, tries = 0; items.length < TASK_SIZE && tries < 120; i++, tries++) {
    const topic = topics[i % topics.length]
    const level = levels[topic.id] ?? 1
    const q = topic.make(level, exclude)
    if (seen.has(q.prompt)) continue
    if (q.repeat) { leftovers.push({ topic, level, q }); continue }
    seen.add(q.prompt)
    if (q.id) exclude.add(q.id)
    items.push({ topic, level, q })
  }

  let exhausted = false
  for (const l of leftovers) {
    if (items.length >= TASK_SIZE) break
    if (seen.has(l.q.prompt)) continue
    seen.add(l.q.prompt)
    items.push(l)
    exhausted = true
  }
  for (let i = 0; items.length < TASK_SIZE; i++) {
    const topic = topics[i % topics.length]
    const level = levels[topic.id] ?? 1
    items.push({ topic, level, q: topic.make(level, new Set()) })
    exhausted = true
  }
  return { items, exhausted }
}
