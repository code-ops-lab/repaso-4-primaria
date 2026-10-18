import { DEFAULT_DISABLED } from './daily.js'

const KEY = 'repaso4primaria.v1'

const defaults = { name: 'Princesa', daysCompleted: 0, levels: {} }

// Cada vez que se guarda se anota una marca ("rev"). Si la app está abierta a la vez como app instalada
// y en una pestaña del navegador, cada una puede detectar que la otra guardó algo más nuevo
// y adoptarlo en vez de pisarlo con su copia vieja.
let lastRev = null

const parse = (raw) => {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const STORAGE_KEY = KEY

// Adapta lo guardado por versiones anteriores:
//  · la asignatura «Ciencias» pasó a ser «Conocimiento del Medio»,
//  · las preguntas de paquetes antiguos se agrupan en un tema con el nombre del paquete,
//  · la primera vez se aplican los temas desactivados por defecto (el usuario los cambia desde Padres).
function migrate(st) {
  const out = { ...st }
  if (out.packs) {
    out.packs = out.packs.map((p) => ({
      ...p,
      questions: p.questions.map((q) => ({ ...q, subject: q.subject === 'ciencias' ? 'medio' : q.subject, topic: q.topic || p.name }))
    }))
  }
  if (out.sims) out.sims = out.sims.map((s) => (s.subject === 'ciencias' ? { ...s, subject: 'medio' } : s))
  if (out.history) {
    out.history = out.history.map((h) => (h.subjectId === 'ciencias' ? { ...h, subjectId: 'medio', subject: 'Conocimiento del Medio' } : h))
  }
  if (out.daily?.subjects?.ciencias) {
    const { ciencias, ...rest } = out.daily.subjects // no se arrastra como «hecha»: el contenido es distinto
    void ciencias
    out.daily = { ...out.daily, subjects: rest }
  }
  if (!out.topicsInit) {
    out.disabled = { ...DEFAULT_DISABLED, ...(out.disabled ?? {}) }
    out.topicsInit = 1
  }
  return out
}

export function loadState() {
  try {
    let raw = localStorage.getItem(KEY)
    if (!raw) {
      // Versión anterior: el progreso estaba guardado bajo otra clave (repaso….v1). Se copia a la nueva la primera vez.
      const oldKey = Object.keys(localStorage).find((k) => /^repaso\w*\.v1$/.test(k) && k !== KEY)
      const legacy = oldKey ? localStorage.getItem(oldKey) : null
      if (legacy) {
        raw = legacy
        localStorage.setItem(KEY, legacy)
      }
    }
    const st = raw ? parse(raw) : null
    lastRev = st?.rev ?? null
    return migrate(st ? { ...defaults, ...st } : { ...defaults })
  } catch {
    return migrate({ ...defaults })
  }
}

export function saveState(state) {
  try {
    const rev = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    lastRev = rev
    localStorage.setItem(KEY, JSON.stringify({ ...state, rev }))
  } catch {
    /* sin almacenamiento: la app sigue funcionando sin guardar */
  }
}

// Si otro ejemplar de la app guardó algo más nuevo, devuelve ese estado (y null si no hay nada nuevo).
export function newerFromStorage() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const st = parse(raw)
    if (!st || st.rev === lastRev) return null
    lastRev = st.rev
    return migrate({ ...defaults, ...st })
  } catch {
    return null
  }
}
