import { shuffle, pick } from './helpers.js'

// Preguntas de opción múltiple a partir del texto de un PDF (cualquier asignatura), sin internet.
// Detecta tres cosas:
//  · preguntas con opciones a) b) c) (con o sin solucionario),
//  · pares "palabra – palabra" (sinónimos, vocabulario…),
//  · frases del texto convertidas en "completa la frase" con opciones sacadas del propio PDF.
// Todo sale como CANDIDATAS: la persona adulta las revisa antes de añadirlas.

// Une los trozos de texto del lector de PDF respetando los saltos de línea.
export function joinItems(items) {
  let out = ''
  for (const it of items) {
    out += it.str
    out += it.hasEOL ? '\n' : ' '
  }
  return out
}

const LETTERS = ['a', 'b', 'c', 'd', 'e']
const clean = (s) => s.replace(/\s+/g, ' ').trim()

// ---------- 1. Opción múltiple ----------
function parseKey(text) {
  const at = text.search(/soluciones|solucionario|solucions|respuestas|respostes|claves|answers?\b/i)
  const key = {}
  if (at < 0) return key
  const tail = text.slice(at)
  for (const m of tail.matchAll(/(\d{1,2})\s*[.):\-–]?\s*([a-eA-E])(?![\p{L}\d])/gu)) {
    if (!(m[1] in key)) key[m[1]] = m[2].toLowerCase()
  }
  return key
}

export function parseMultipleChoice(text) {
  const at = text.search(/soluciones|solucionario|solucions|respuestas|respostes|claves|answers?\b/i)
  const body = at > 0 ? text.slice(0, at) : text // lo que hay después de "Soluciones" es la clave, no preguntas
  const key = parseKey(text)
  const lines = body.split(/\n+/).map((l) => l.trim()).filter(Boolean)

  const blocks = []
  let cur = null
  for (const line of lines) {
    const m = line.match(/^(\d{1,2})\s*[.)\-–]\s*(.+)$/)
    if (m) {
      cur = { n: Number(m[1]), text: m[2] }
      blocks.push(cur)
    } else if (cur) cur.text += ' ' + line
  }

  const out = []
  for (const b of blocks) {
    // Marcadores a) b) c) … seguidos y en orden desde la "a".
    const marks = [...b.text.matchAll(/(?:^|\s)([a-eA-E])\s*[.)]\s+/g)]
    const seq = []
    for (const m of marks) {
      if (m[1].toLowerCase() === LETTERS[seq.length]) seq.push(m)
    }
    if (seq.length < 2) continue
    const stem = clean(b.text.slice(0, seq[0].index))
    const options = seq.map((m, i) => {
      const start = m.index + m[0].length
      const end = i + 1 < seq.length ? seq[i + 1].index : b.text.length
      return clean(b.text.slice(start, end))
    })
    if (!stem || options.some((o) => !o) || new Set(options).size !== options.length) continue
    const letter = key[String(b.n)]
    const idx = letter ? LETTERS.indexOf(letter) : -1
    out.push({ kind: 'mc', q: stem, o: options, a: idx >= 0 && idx < options.length ? options[idx] : null })
  }
  return out
}

// ---------- 2. Pares palabra – palabra ----------
export function parsePairs(text) {
  const re = /^\s*(?:[-•*·]\s*)?([\p{L}][\p{L}'’ ]{1,24}?)\s*(?:[–—=→:]|\s-\s)\s*([\p{L}][\p{L}'’, ]{1,29}?)\s*$/u
  const pairs = []
  for (const line of text.split(/\n+/)) {
    const m = line.match(re)
    if (!m) continue
    const [l, r] = [clean(m[1]), clean(m[2])]
    if (l.split(' ').length > 3 || r.split(' ').length > 3 || l.toLowerCase() === r.toLowerCase()) continue
    pairs.push([l, r])
  }
  // Una sola línea suelta con ":" no es una lista: se exigen varios pares.
  if (pairs.length < 4) return []
  const out = []
  pairs.forEach(([l, r], i) => {
    const others = pairs.filter((_, j) => j !== i).map((p) => p[1]).filter((x) => x.toLowerCase() !== r.toLowerCase())
    const wrong = shuffle([...new Set(others)]).slice(0, 3)
    if (wrong.length >= 2) out.push({ kind: 'pair', q: `¿Cuál corresponde a «${l}»?`, o: [r, ...wrong], a: r })
  })
  return out
}

// ---------- 3. Completa la frase ----------
const STOP = new Set(`
 pero porque cuando donde entre sobre desde hasta después antes mucho muchos mucha muchas algunos algunas todos todas
 también tampoco siempre nunca aunque mientras durante según cada otro otra otros otras estaba estaban estos estas
 había hacer hacia ellos ellas nosotros vosotros ustedes tiene tienen puede pueden fueron estar sido tener ahora
 aquí allí así bien solo sólo muy más menos tanto tanta tantos tantas ellos quien quienes cuyo cuya
 també perquè quan entre sobre fins després abans molt molts molta moltes alguns algunes tots totes sempre mai encara
 mentre durant segons cada altre altra altres estava estaven aquests aquestes havia fer cap ells elles nosaltres
 aquest aquesta tenen poden estar tenir ara aquí allí així bé només molt més menys tant tanta
 about after again also because before between could during every from have into just like many more most much other over really should since some such than that their them then there these they this those through under very want were what when where which while with would your
`.split(/\s+/).filter(Boolean))

const WORD = /\p{L}+(?:[·'’-]\p{L}+)*/gu

function suffixLen(a, b) {
  let n = 0
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++
  return n
}

export function makeClozes(text, max = 30) {
  // Las líneas cortas sin punto final son títulos: se cierran con un punto para que no se peguen a la frase siguiente.
  const flat = clean(
    text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => (l.split(/\s+/).length <= 7 && !/[.!?:;,…»”)]$/.test(l) ? `${l}.` : l))
      .join(' ')
  )
  const sentences = flat
    .split(/(?<=[.!?])\s+(?=[¿¡"«“]?\p{Lu})/u)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 170 && !/\d{4,}/.test(s) && !/[=_•]/.test(s))
    // Fuera restos de índices, numeraciones y puntos suspensivos de las fichas.
    .filter((s) => !/\.{3,}|…/.test(s) && (s.match(/\d+/g) ?? []).length <= 3 && !/\d+\s*[º.ª)]*\.?$/.test(s) && !/\bFICHA\b|\bUnidad\b|\bPágina\b/i.test(s))

  // Vocabulario del documento y frecuencias.
  const freq = new Map()
  const all = flat.match(WORD) ?? []
  all.forEach((w) => {
    const k = w.toLowerCase()
    freq.set(k, (freq.get(k) ?? 0) + 1)
  })
  const pool = [...freq.keys()].filter((w) => w.length >= 5 && w.length <= 14 && !STOP.has(w) && !/[·'’-]/.test(w))
  if (pool.length < 6) return []

  const out = []
  for (const s of shuffle(sentences)) {
    const ws = [...s.matchAll(WORD)]
    if (ws.length < 6 || ws.length > 28) continue
    const inSentence = new Set(ws.map((m) => m[0].toLowerCase()))
    // Palabra a ocultar: la más larga que no sea de las comunes, no empiece en mayúscula y salga pocas veces.
    const cands = ws
      .slice(1)
      .filter((m) => /^\p{Ll}/u.test(m[0]) && m[0].length >= 6 && m[0].length <= 14 && !STOP.has(m[0].toLowerCase()) && !/[·'’-]/.test(m[0]) && (freq.get(m[0].toLowerCase()) ?? 0) <= 2)
      .filter((m) => ws.filter((x) => x[0].toLowerCase() === m[0].toLowerCase()).length === 1)
    if (!cands.length) continue
    const best = cands.reduce((a, b) => (b[0].length > a[0].length ? b : a))
    const target = best[0].toLowerCase()
    const distractors = pool
      .filter((w) => w !== target && !inSentence.has(w))
      .map((w) => ({ w, score: Math.abs(w.length - target.length) + (suffixLen(w, target) >= 2 ? 0 : 1.5) + Math.random() }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((x) => x.w)
    if (distractors.length < 3) continue
    const before = s.slice(0, best.index)
    const after = s.slice(best.index + best[0].length)
    out.push({ kind: 'cloze', q: `Completa: «${before}____${after}»`, o: [target, ...distractors], a: target })
    if (out.length >= max) break
  }
  return out
}

// ---------- Todo junto ----------
// `subject`: en Matemáticas no se hacen frases a completar (los enunciados de las fichas no sirven).
export function buildCandidates(text, { subject, skipCloze = false } = {}) {
  const mc = parseMultipleChoice(text)
  const pairs = parsePairs(text)
  const mcQuestions = new Set(mc.map((c) => c.q))
  const cloze = skipCloze || subject === 'mates' ? [] : makeClozes(text, 30)
  const all = [...mc.slice(0, 60), ...shuffle(pairs).slice(0, 30), ...cloze]
  return all
    .filter((c) => c.kind !== 'cloze' || !mcQuestions.has(c.q))
    .filter((c) => c.q.length <= 200 && c.o.length >= 2 && c.o.length <= 5 && c.o.every((o) => o.length <= 60))
    .map((c, i) => ({ ...c, id: `c${i}`, include: c.a !== null && c.kind !== 'cloze' }))
}

export const KIND_NAMES = { mc: 'preguntas con opciones', pair: 'pares de palabras', cloze: 'frases para completar' }
export { pick }
