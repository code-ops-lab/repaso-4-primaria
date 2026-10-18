import { registerSW } from 'virtual:pwa-register'

// Actualizaciones de la app instalada. La versión nueva se descarga sola cuando hay internet
// y se aplica al volver al inicio (nunca en mitad de una tarea, para no perder las respuestas).
let updateSW = null
let registration = null
export const updateState = { waiting: false }
const listeners = new Set()

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'desarrollo'

export function initPwa() {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateState.waiting = true
      listeners.forEach((f) => f())
    },
    onRegisteredSW(_url, r) {
      registration = r ?? null
    }
  })
  const check = () => document.visibilityState === 'visible' && checkForUpdate()
  document.addEventListener('visibilitychange', check)
  setInterval(checkForUpdate, 30 * 60 * 1000)
}

// Busca una versión nueva. Devuelve 'offline', 'nueva' o 'al-dia'.
export async function checkForUpdate() {
  if (!navigator.onLine) return 'offline'
  try {
    await registration?.update()
    await new Promise((r) => setTimeout(r, 1500)) // da tiempo a que el service worker nuevo se instale
  } catch {
    return 'offline'
  }
  return updateState.waiting ? 'nueva' : 'al-dia'
}

export const applyUpdate = () => updateSW?.(true)

export function onUpdate(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
