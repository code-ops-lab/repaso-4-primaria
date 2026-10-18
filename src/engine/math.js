import { rnd, pick } from './helpers.js'

const num = (prompt, answer, extra = {}) => ({ type: 'number', prompt, answer, ...extra })

export function suma(level) {
  const ranges = { 1: [1, 10], 2: [10, 60], 3: [50, 200], 4: [100, 900], 5: [1000, 5000] }
  const [lo, hi] = ranges[level]
  const a = rnd(lo, hi)
  const b = rnd(level === 1 ? 1 : lo, hi)
  return num(`${a} + ${b} = ?`, a + b)
}

export function resta(level) {
  const ranges = { 1: [1, 10], 2: [10, 60], 3: [50, 200], 4: [100, 900], 5: [1000, 5000] }
  const [lo, hi] = ranges[level]
  let a = rnd(lo, hi)
  let b = rnd(1, hi)
  if (b > a) [a, b] = [b, a]
  return num(`${a} − ${b} = ?`, a - b)
}

export function multiplicacion(level) {
  switch (level) {
    case 1: return numMul(pick([2, 5, 10]), rnd(1, 10))
    case 2: return numMul(rnd(2, 9), rnd(2, 10))
    case 3: return numMul(rnd(10, 99), rnd(2, 5))
    case 4: return numMul(rnd(100, 999), rnd(2, 9))
    default: return Math.random() < 0.5 ? numMul(rnd(11, 60), rnd(11, 30)) : numMul(rnd(101, 999), rnd(11, 60))
  }
}
const numMul = (a, b) => num(`${a} × ${b} = ?`, a * b)

// División:
// N1: 2 cifras, tablas fáciles (confianza)   N2: 2 cifras ÷ 1 cifra, exacta
// N3: 3 cifras ÷ 1 cifra, exacta             N4: 3 cifras ÷ 1 cifra, con resto
// N5: 3 cifras ÷ 1 cifra con divisores altos y resto
export function division(level) {
  if (level === 1) {
    const d = pick([2, 3, 4, 5])
    const q = rnd(Math.ceil(10 / d), Math.floor(99 / d / 2))
    return num(`${d * q} ÷ ${d} = ?`, q)
  }
  if (level === 2) {
    const d = rnd(2, 9)
    const q = rnd(Math.ceil(10 / d), Math.floor(99 / d))
    return num(`${d * q} ÷ ${d} = ?`, q)
  }
  if (level === 3) {
    // A veces el cociente lleva un cero (ej.: 612 ÷ 6 = 102).
    if (Math.random() < 0.3) {
      const d = rnd(2, 4)
      const q = rnd(1, Math.floor(999 / d / 100)) * 100 + rnd(1, 9)
      if (d * q <= 999) return num(`${d * q} ÷ ${d} = ?`, q)
    }
    const d = rnd(2, 9)
    const q = rnd(Math.ceil(100 / d), Math.floor(999 / d))
    return num(`${d * q} ÷ ${d} = ?`, q)
  }
  const d = level === 4 ? rnd(2, 5) : rnd(6, 9)
  const dividend = rnd(100, 999)
  const q = Math.floor(dividend / d)
  const r = dividend % d
  if (r === 0) return division(level) // queremos resto distinto de 0
  return num(`${dividend} ÷ ${d}`, q, { remainder: r })
}
