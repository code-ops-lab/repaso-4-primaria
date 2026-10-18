// Dificultad adaptativa de las tareas diarias (sin tiempo: la niña trabaja sin presión).
// Al terminar una tarea, cada tema sube o baja un nivel según los aciertos de esa tarea.
export const MAX_LEVEL = 5

export function adjustLevel(level, ok, n) {
  if (n < 2) return level
  if (ok / n >= 0.8 && level < MAX_LEVEL) return level + 1
  if (ok / n < 0.5 && level > 1) return level - 1
  return level
}

// La princesa de la pantalla de inicio crece con los días completados.
export const PRINCESS_STAGES = [0, 1, 3, 6, 10, 15]

export function stageFor(days) {
  let stage = 0
  PRINCESS_STAGES.forEach((min, i) => {
    if (days >= min) stage = i
  })
  return stage
}

export function nextStageAt(days) {
  return PRINCESS_STAGES.find((min) => min > days) ?? null
}
