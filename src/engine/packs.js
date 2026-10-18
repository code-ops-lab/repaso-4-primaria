import { SUBJECTS } from './subjects.js'
import { questionId } from './helpers.js'
import baseData from '../data/paquete-base.json'

// Formato del archivo de ejercicios:
// { "name": "Octubre", "questions": [
//   { "subject": "lengua", "level": 2, "q": "...", "o": ["a","b","c"], "a": "b" } ] }
const IDS = SUBJECTS.map((s) => s.id)
// Archivos antiguos con la asignatura «ciencias» pasan a «medio» (Conocimiento del Medio).
const ALIAS = { ciencias: 'medio' }
const MAX_QUESTIONS = 2000

const isStr = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max

function validate(x) {
  if (!x || typeof x !== 'object') return false
  if (!IDS.includes(x.subject)) return false
  if (!Number.isInteger(x.level) || x.level < 1 || x.level > 5) return false
  if (!isStr(x.q, 200) || !isStr(x.a, 60)) return false
  if (!Array.isArray(x.o) || x.o.length < 2 || x.o.length > 5) return false
  if (!x.o.every((o) => isStr(o, 60)) || new Set(x.o).size !== x.o.length) return false
  if (x.t !== undefined && !isStr(x.t, 900)) return false
  if (x.e !== undefined && !isStr(x.e, 400)) return false
  if (x.topic !== undefined && !isStr(x.topic, 60)) return false
  return x.o.includes(x.a)
}

export function parsePack(text) {
  let data
  try { data = JSON.parse(text) } catch { return { error: 'El archivo no es un JSON válido.' } }
  if (!data || !Array.isArray(data.questions)) return { error: 'Falta la lista "questions" en el archivo.' }
  if (data.questions.length > MAX_QUESTIONS) return { error: `Demasiadas preguntas (máximo ${MAX_QUESTIONS}).` }

  const questions = []
  const seen = new Set()
  let skipped = 0
  const packName = isStr(data.name, 40) ? data.name.trim() : 'Paquete sin nombre'
  for (const raw of data.questions) {
    const x = raw && ALIAS[raw.subject] ? { ...raw, subject: ALIAS[raw.subject] } : raw
    if (!validate(x)) { skipped++; continue }
    // `topic` agrupa las preguntas en temas que se pueden activar o desactivar; sin él, el tema es el nombre del paquete.
    const item = { subject: x.subject, l: x.level, q: x.q.trim(), o: x.o.map((o) => o.trim()), a: x.a.trim(), topic: x.topic ? x.topic.trim() : packName, ...(x.t ? { t: x.t.trim() } : {}), ...(x.e ? { e: x.e.trim() } : {}) }
    const id = questionId(item)
    if (seen.has(id)) { skipped++; continue }
    seen.add(id)
    questions.push(item)
  }
  if (!questions.length) return { error: 'Ninguna pregunta del archivo es válida.' }
  return { pack: { id: `${Date.now()}`, name: packName, addedAt: Date.now(), questions }, skipped }
}

export const extrasFor = (packs, subjectId) =>
  packs.flatMap((p) => p.questions.filter((q) => q.subject === subjectId))

// Paquete que viene dentro de la app (siempre disponible, sin internet).
export const BASE_PACK = (() => {
  const res = parsePack(JSON.stringify(baseData))
  if (res.skipped) console.warn(`Paquete base: ${res.skipped} preguntas ignoradas`)
  return { ...res.pack, id: 'base', builtin: true }
})()
