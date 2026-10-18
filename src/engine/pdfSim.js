import { rnd, pick } from './helpers.js'
import { dots } from './math2.js'

// Simulador de operaciones a partir de un PDF.
// 1) parseOperations: busca operaciones (a + b, a − b, a × b, a ÷ b) en el texto del PDF.
// 2) buildSimulator: guarda la "forma" de cada una (nº de cifras, ceros finales, si la división es exacta).
// 3) simulate: crea operaciones NUEVAS con esas mismas formas, sin repetir las del PDF.

const NUM = '(\\d{1,3}(?:[ \\u00a0.]\\d{3})+|\\d+)'
const toInt = (s) => Number(s.replace(/[  .]/g, ''))
const OPS = { x: 'x', X: 'x', '×': 'x', '*': 'x', '·': 'x', '÷': 'd', ':': 'd', '/': 'd', '+': 'a', '−': 's', '–': 's', '-': 's' }

// `items` = trozos de texto del PDF tal como los entrega el lector (cada operación suele ir en el suyo).
// `forced`: 'x' | 'd' | 'a' | 's' para PDFs donde el signo es un dibujo y no sale en el texto.
export function parseOperations(items, forced = null) {
  const text = items.join('\n')
  const ops = []
  const seen = new Set()
  const push = (a, b, op) => {
    const k = `${a}${op}${b}`
    if (!seen.has(k) && Number.isSafeInteger(a) && Number.isSafeInteger(b) && a > 0 && b > 0) {
      seen.add(k)
      ops.push({ a, b, op })
    }
  }

  // Con signo escrito: "159 x 231 =", "1 200 ÷ 10", "45 + 38 =" …
  // (?<![\d.,]) y (?![.,]\d): no leer a medias un decimal como "12,50 x 4".
  const re = new RegExp(`(?<![\\d.,])${NUM}[ \\t\\n]*([x×X*·÷:/+−–-])[ \\t\\n]*${NUM}(?![.,]\\d)([ \\t]*=)?`, 'g')
  for (const m of text.matchAll(re)) {
    const sym = m[2]
    const hasEq = !!m[4]
    const op = OPS[sym]
    if (!op) continue
    // + − : solo si acaban en "=" (evita fechas, rangos o guiones del texto).
    if ((op === 'a' || op === 's' || sym === ':' || sym === '/') && !hasEq) continue
    push(toInt(m[1]), toInt(m[3]), op)
  }

  // Sin signo en el texto (el ÷ es un dibujo): un número y, justo después, "número =".
  const doc = text.toLowerCase()
  const hint = forced ?? (/divisi|cociente|dividendo/.test(doc) && !ops.some((o) => o.op === 'd') ? 'd' : null)
  if (hint) {
    const tokens = items.map((s) => s.trim()).filter(Boolean)
    for (let i = 1; i < tokens.length; i++) {
      const eq = tokens[i].match(new RegExp(`^${NUM}\\s*=$`))
      const prev = tokens[i - 1].match(new RegExp(`^${NUM}$`))
      if (eq && prev) push(toInt(prev[1]), toInt(eq[1]), hint)
    }
  }
  return ops
}

// ---------- Formas ----------
const digits = (n) => String(n).length
const zeros = (n) => (String(n).match(/0*$/) ?? [''])[0].length
const isPow10 = (n) => /^10*$/.test(String(n))

export function shapeOf({ a, b, op }) {
  const shape = { op, da: digits(a), db: digits(b), za: Math.min(zeros(a), digits(a) - 1), zb: Math.min(zeros(b), digits(b) - 1), pow: isPow10(b) && b >= 10 }
  if (op === 'd') {
    const q = Math.floor(a / b)
    shape.exact = a % b === 0
    shape.dq = digits(q)
    shape.zq = Math.min(zeros(q), digits(q) - 1)
  }
  return shape
}

// Número aleatorio de `d` cifras acabado en `z` ceros.
function gen(d, z = 0) {
  z = Math.min(z, d - 1)
  const body = d - z
  const first = rnd(1, 9)
  let s = String(first)
  for (let i = 1; i < body; i++) s += String(rnd(0, 9))
  return Number(s + '0'.repeat(z))
}

export function buildSimulator(name, ops) {
  const byKey = new Map()
  ops.forEach((o) => {
    const s = shapeOf(o)
    byKey.set(JSON.stringify(s), s)
  })
  return {
    name,
    shapes: [...byKey.values()].slice(0, 80),
    originals: ops.map((o) => `${o.a}${o.op}${o.b}`).slice(0, 400),
    count: ops.length
  }
}

const SYMBOL = { x: '×', d: '÷', a: '+', s: '−' }

export function simulate(sim) {
  const originals = new Set(sim.originals)
  for (let tries = 0; tries < 40; tries++) {
    const sh = pick(sim.shapes)
    let a, b, answer, remainder
    if (sh.op === 'x') {
      a = gen(sh.da, sh.za)
      b = sh.pow ? 10 ** (sh.db - 1) : gen(sh.db, sh.zb)
      answer = a * b
    } else if (sh.op === 'a') {
      a = gen(sh.da, sh.za); b = gen(sh.db, sh.zb); answer = a + b
    } else if (sh.op === 's') {
      a = gen(sh.da, sh.za); b = gen(sh.db, sh.zb)
      if (b > a) [a, b] = [b, a]
      if (a === b) continue
      answer = a - b
    } else {
      b = sh.pow ? 10 ** (sh.db - 1) : gen(sh.db, sh.zb)
      const q = gen(sh.dq, sh.zq)
      if (sh.exact) {
        a = b * q; answer = q
      } else {
        if (b < 2) continue
        const r = rnd(1, b - 1)
        a = b * q + r; answer = q; remainder = r
      }
    }
    if (originals.has(`${a}${sh.op}${b}`) || answer < 0 || !Number.isSafeInteger(answer)) continue
    const prompt = remainder !== undefined ? `${dots(a)} ÷ ${dots(b)}` : `${dots(a)} ${SYMBOL[sh.op]} ${dots(b)} =`
    return { type: 'number', prompt, answer, ...(remainder !== undefined ? { remainder } : {}) }
  }
  // Muy improbable: devuelve algo válido del primer tipo.
  const sh = sim.shapes[0]
  const a = gen(Math.max(2, sh.da)), b = gen(Math.max(1, sh.db))
  return { type: 'number', prompt: `${dots(a)} + ${dots(b)} =`, answer: a + b }
}

export const OP_NAMES = { x: 'multiplicaciones', d: 'divisiones', a: 'sumas', s: 'restas' }
