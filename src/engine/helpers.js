export const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
export const pick = (arr) => arr[rnd(0, arr.length - 1)]
export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const questionId = (it) => `${it.q}|${it.a}`

// Crea un tema de opción múltiple a partir de un banco de preguntas.
// Cada item: { l: nivel 1-5, q: enunciado, o: [opciones], a: respuesta correcta }.
// `exclude` = ids ya dominados. Si el banco se agota, repite y lo marca con repeat:true.
export function bankTopic(items) {
  const all = items.map((it) => ({ ...it, id: questionId(it) }))
  return (level, exclude = new Set()) => {
    const fresh = all.filter((x) => !exclude.has(x.id))
    const pool = fresh.length ? fresh : all
    const dist = (it) => Math.abs(it.l - level)
    const best = Math.min(...pool.map(dist))
    // Ventana de ±1 nivel alrededor del más cercano para dar más variedad.
    const it = pick(pool.filter((x) => dist(x) <= best + 1))
    return {
      type: 'choice',
      prompt: it.q,
      options: shuffle(it.o),
      answer: it.a,
      id: it.id,
      text: it.t,
      why: it.e,
      repeat: fresh.length === 0
    }
  }
}
