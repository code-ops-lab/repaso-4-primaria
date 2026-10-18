import { rnd, pick, shuffle } from './helpers.js'
import { num, choice, dots } from './math2.js'

// Temas del cuaderno de Matemáticas de 4º (1.er trimestre): multiplicar y dividir con ceros,
// partes y prueba de la división, divisor de dos cifras, operaciones combinadas,
// números romanos y números escritos con letras.

// ---------- Por 10, 100 y 1000 · divisiones con ceros ----------
export function ceros(level) {
  if (level === 1) {
    const x = rnd(11, 999)
    const m = pick([10, 100, 1000])
    return num(`${dots(x)} × ${dots(m)} =`, x * m)
  }
  if (level === 2) {
    const q = rnd(11, 999)
    const m = pick([10, 100, 1000])
    return num(`${dots(q * m)} ÷ ${dots(m)} =`, q)
  }
  if (level === 3) {
    const d = rnd(2, 9) * 10
    const q = rnd(2, 99)
    return num(`${dots(d * q)} ÷ ${d} =`, q)
  }
  if (level === 4) {
    const d = rnd(2, 9) * 100
    const q = rnd(2, 200)
    return num(`${dots(d * q)} ÷ ${dots(d)} =`, q)
  }
  const a = rnd(2, 9) * 100
  const b = rnd(101, 999)
  return num(`${dots(a)} × ${b} =`, a * b)
}

// ---------- Partes de la división y prueba (D = d × c + r) ----------
const PARTES = ['dividendo', 'divisor', 'cociente', 'resto']

export function partesDivision(level) {
  if (level === 1) {
    const d = rnd(2, 9), q = rnd(2, 9)
    const target = pick([['dividendo', d * q], ['divisor', d], ['cociente', q]])
    return choice(`En ${d * q} ÷ ${d} = ${q}, ¿cómo se llama el ${target[1]}?`, target[0], PARTES)
  }
  if (level === 2) {
    if (Math.random() < 0.5) {
      const d = rnd(2, 9), q = rnd(2, 9)
      return num(`Divisor ${d}, cociente ${q} y resto 0. ¿Cuál es el dividendo?`, d * q)
    }
    const d = rnd(3, 9), D = rnd(20, 80)
    return num(`¿Cuál es el resto de ${D} ÷ ${d}?`, D % d)
  }
  if (level === 3) {
    const d = rnd(3, 9), q = rnd(4, 12), r = rnd(1, d - 1)
    if (Math.random() < 0.5) return num(`Divisor ${d}, cociente ${q} y resto ${r}. ¿Cuál es el dividendo?`, d * q + r)
    const D = rnd(30, 99), dd = rnd(3, 9)
    const exact = D % dd === 0
    return choice(`¿Es exacta la división ${D} ÷ ${dd}?`, exact ? 'sí, el resto es 0' : 'no, el resto no es 0', ['sí, el resto es 0', 'no, el resto no es 0'])
  }
  if (level === 4) {
    const d = rnd(6, 12), q = rnd(10, 30), r = rnd(0, d - 1)
    return num(`Comprueba: ${d} × ${q} + ${r} = ?`, d * q + r)
  }
  const d = rnd(11, 25), q = rnd(11, 40), r = rnd(1, d - 1)
  return num(`Divisor ${d}, cociente ${q} y resto ${r}. ¿Cuál es el dividendo?`, d * q + r)
}

// ---------- División con divisor de dos cifras ----------
export function divisionDosCifras(level) {
  const withRest = (d, q) => {
    const r = rnd(1, d - 1)
    return { type: 'number', prompt: `${d * q + r} ÷ ${d}`, answer: q, remainder: r }
  }
  if (level === 1) { const d = rnd(11, 20), q = rnd(2, 9); return num(`${d * q} ÷ ${d} =`, q) }
  if (level === 2) { const d = rnd(11, 30), q = rnd(10, 30); return num(`${d * q} ÷ ${d} =`, q) }
  if (level === 3) return withRest(rnd(11, 30), rnd(2, 9))
  if (level === 4) return withRest(rnd(11, 40), rnd(10, 30))
  return withRest(rnd(12, 45), rnd(25, 90))
}

// ---------- Operaciones combinadas ----------
export function combinadas(level) {
  if (level === 1) {
    const a = rnd(10, 30), b = rnd(5, 20), c = rnd(2, a + b - 1)
    return num(`${a} + ${b} − ${c} =`, a + b - c)
  }
  if (level === 2) {
    if (Math.random() < 0.5) {
      const b = rnd(3, 12), c = rnd(3, 12), a = b + c + rnd(2, 20)
      return num(`${a} − (${b} + ${c}) =`, a - (b + c))
    }
    const b = rnd(3, 15), a = b + rnd(2, 30), c = rnd(2, 20)
    return num(`${a} − ${b} + ${c} =`, a - b + c)
  }
  if (level === 3) { const a = rnd(2, 20), b = rnd(2, 9), c = rnd(2, 9); return num(`${a} + ${b} × ${c} =`, a + b * c) }
  if (level === 4) { const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 9); return num(`(${a} + ${b}) × ${c} =`, (a + b) * c) }
  const a = rnd(3, 9), b = rnd(3, 9), d = rnd(2, 6), k = rnd(2, 6)
  const c = d * k
  return num(`${a} × ${b} + ${c} ÷ ${d} =`, a * b + k)
}

// ---------- Números romanos ----------
const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]

export function toRoman(n) {
  let out = ''
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v }
  return out
}

export function romanos(level) {
  const max = { 1: 20, 2: 49, 3: 399, 4: 1000, 5: 3999 }[level]
  const n = rnd(level === 1 ? 4 : 11, max)
  if (Math.random() < 0.5) return num(`¿Qué número es ${toRoman(n)}?`, n)
  const wrong = [n + 1, n - 1, n + 5, n - 5, n + 10, n - 10, n + 4, n - 4].filter((x) => x > 0 && x <= 3999 && x !== n)
  return choice(`¿Cómo se escribe ${dots(n)} en números romanos?`, toRoman(n), shuffle(wrong).map(toRoman))
}

// ---------- Números con letras ----------
const U = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince',
  'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco',
  'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const T = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const C = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

function below1000(n) {
  if (n === 100) return 'cien'
  const parts = []
  if (n >= 100) parts.push(C[Math.floor(n / 100)])
  const r = n % 100
  if (r) {
    if (r < 30) parts.push(U[r])
    else parts.push(r % 10 ? `${T[Math.floor(r / 10)]} y ${U[r % 10]}` : T[Math.floor(r / 10)])
  }
  return parts.join(' ')
}

// "uno" → "un" delante de "mil" y "millones" ("veintiuno" → "veintiún").
const apocope = (s) => (s.endsWith('veintiuno') ? s.replace(/veintiuno$/, 'veintiún') : s.replace(/uno$/, 'un'))

export function numberToWords(n) {
  if (n === 0) return 'cero'
  const parts = []
  const millions = Math.floor(n / 1e6)
  const thousands = Math.floor((n % 1e6) / 1000)
  const low = n % 1000
  if (millions) parts.push(millions === 1 ? 'un millón' : `${apocope(below1000(millions))} millones`)
  if (thousands) parts.push(thousands === 1 ? 'mil' : `${apocope(below1000(thousands))} mil`)
  if (low) parts.push(below1000(low))
  return parts.join(' ')
}

// Variantes engañosas de un número: cifras cambiadas de sitio o con un cero de más/menos.
export function lookalikes(n) {
  const s = String(n)
  const out = new Set()
  for (let i = 0; i < s.length - 1; i++) {
    if (s[i] !== s[i + 1]) out.add(Number(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)))
  }
  out.add(n * 10)
  out.add(Math.floor(n / 10))
  out.delete(n)
  out.delete(0)
  return shuffle([...out])
}

export function numerosConLetras(level) {
  const digits = Math.min(7, level + 3)
  let ds = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, digits)
  if (ds[0] === 0) ds = [ds[1], 0, ...ds.slice(2)]
  const n = Number(ds.join(''))
  if (Math.random() < 0.5) {
    return choice(`¿Qué número es «${numberToWords(n)}»?`, dots(n), lookalikes(n).map(dots))
  }
  return choice(`¿Cómo se lee ${dots(n)}?`, numberToWords(n), lookalikes(n).map(numberToWords))
}
