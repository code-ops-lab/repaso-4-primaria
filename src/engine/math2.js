import { rnd, pick, shuffle } from './helpers.js'

// Temas de Matemáticas de 4º según el temario valenciano: números de hasta 8 cifras,
// fracciones, decimales, medidas y hora, geometría y problemas. Todo se genera sin internet.

export const num = (prompt, answer) => ({ type: 'number', prompt, answer })

// Opción múltiple con distractores únicos (siempre incluye la respuesta).
export function choice(prompt, answer, distractors) {
  const correct = String(answer)
  const opts = [...new Set(distractors.map(String))].filter((d) => d !== correct).slice(0, 3)
  return { type: 'choice', prompt, answer: correct, options: shuffle([correct, ...opts]) }
}

export const dots = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

// ---------- Números grandes (4 a 8 cifras según el nivel) ----------
export function numerosGrandes(level) {
  const digits = level + 3 // N1: 4 cifras … N5: 8 cifras
  const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, digits) // cifras distintas
  const n = Number(ds.join(''))
  const kinds = level === 1 ? [1, 2, 3] : level === 2 ? [1, 2, 3, 4] : [1, 2, 3, 4]
  const kind = pick(kinds)

  if (kind === 1) {
    const pos = rnd(0, digits - 1) // 0 = unidades
    const d = ds[digits - 1 - pos]
    return num(`En ${dots(n)}, ¿qué valor tiene la cifra ${d}?`, d * 10 ** pos)
  }
  if (kind === 2) {
    const unit = level === 1 ? pick([10, 100]) : level === 2 ? 100 : pick([100, 1000])
    const name = unit === 10 ? 'la decena' : unit === 100 ? 'la centena' : 'el millar'
    return num(`Redondea ${dots(n)} a ${name} más próxima`, Math.round(n / unit) * unit)
  }
  if (kind === 3) {
    let m = n
    while (m === n) {
      const ds2 = [...ds]
      const i = rnd(Math.max(0, digits - 3), digits - 1)
      ds2[i] = rnd(0, 9)
      m = Number(ds2.join(''))
    }
    const sign = n > m ? '>' : n < m ? '<' : '='
    return choice(`¿Qué signo va entre ${dots(n)} y ${dots(m)}?`, sign, ['<', '>', '='])
  }
  // Ordenar tres números con las mismas cifras en distinto orden.
  const set = new Set([n])
  for (let i = 0; i < 40 && set.size < 3; i++) set.add(Number(shuffle(ds).join('')))
  const three = [...set].slice(0, 3)
  const asc = [...three].sort((x, y) => x - y)
  const text = (arr) => arr.map(dots).join(' < ')
  const wrong = [[asc[2], asc[1], asc[0]], [asc[1], asc[0], asc[2]], [asc[0], asc[2], asc[1]], [asc[1], asc[2], asc[0]]]
  return choice(`¿Qué fila está ordenada de menor a mayor?`, text(asc), wrong.map((w) => text(w).replace(/ < /g, ' < ')))
}

// ---------- Fracciones ----------
export function fracciones(level) {
  if (level === 1) {
    const d = pick([2, 3, 4, 5])
    const total = d * rnd(2, 6)
    return num(`1/${d} de ${total} =`, total / d)
  }
  if (level === 2) {
    const d = pick([3, 4, 5, 10])
    const k = rnd(2, d - 1)
    const total = d * rnd(2, 5)
    return num(`${k}/${d} de ${total} =`, (total / d) * k)
  }
  if (level === 3) {
    const d = rnd(5, 12)
    const a = rnd(1, d - 3)
    const b = rnd(1, d - a - 1)
    return choice(`${a}/${d} + ${b}/${d} =`, `${a + b}/${d}`, [`${a + b}/${d * 2}`, `${a * b}/${d}`, `${a + b + 1}/${d}`, `${a + b}/${d + d}`])
  }
  if (level === 4) {
    const d = rnd(5, 12)
    const a = rnd(1, d - 2)
    const b = rnd(a + 1, d - 1)
    const bigger = Math.random() < 0.5
    return choice(
      `¿Qué fracción es ${bigger ? 'mayor' : 'menor'}: ${a}/${d} o ${b}/${d}?`,
      `${bigger ? b : a}/${d}`,
      [`${bigger ? a : b}/${d}`, 'son iguales', 'no se puede saber']
    )
  }
  // N5: fracciones equivalentes
  const [a, b] = pick([[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [2, 5]])
  const k = rnd(2, 5)
  return num(`${a}/${b} = ?/${b * k}`, a * k)
}

// ---------- Decimales y euros ----------
const fmt = (h) => {
  const e = Math.floor(h / 100)
  const c = h % 100
  if (c === 0) return `${e}`
  return `${e},${c % 10 === 0 ? String(c / 10) : String(c).padStart(2, '0')}`
}

export function decimales(level) {
  if (level === 1) {
    const a = rnd(11, 99)
    let b = rnd(11, 99)
    while (b === a) b = rnd(11, 99)
    const x = `0,${a}`
    const y = `0,${b}`
    return choice(`¿Qué número es mayor: ${x} o ${y}?`, a > b ? x : y, [a > b ? y : x, 'son iguales'])
  }
  if (level === 2) {
    const m = pick([10, 100])
    const v = rnd(11, 99) / 10
    return num(`${String(v).replace('.', ',')} × ${m} =`, Math.round(v * m))
  }
  if (level === 3) {
    const m = pick([100, 1000])
    const h = rnd(11, 99)
    const v = h / 100
    return num(`${String(v).replace('.', ',')} × ${m} =`, Math.round(v * m))
  }
  if (level === 4) {
    const d = pick([10, 100])
    const n = rnd(11, 999)
    const r = n * (100 / d) // en centésimas
    return choice(`${n} ÷ ${d} =`, fmt(r), [fmt(r * 10), fmt(Math.floor(r / 10) || 5), fmt(r + 10), fmt(r + 100)])
  }
  const a = rnd(101, 599)
  const b = rnd(101, 399)
  return choice(`${fmt(a)} + ${fmt(b)} =`, fmt(a + b), [fmt(a + b + 10), fmt(a + b - 10), fmt(a + b + 100), fmt(a + b - 100)])
}

// ---------- Medidas, euros y hora ----------
export function medidas(level) {
  if (level === 1) {
    return pick([
      num('1 m = ? cm', 100), num('1 kg = ? g', 1000), num('1 l = ? ml', 1000),
      num('1 km = ? m', 1000), num('1 hora = ? minutos', 60)
    ])
  }
  if (level === 2) {
    const k = rnd(2, 9)
    return pick([
      num(`${k} m = ? cm`, k * 100), num(`${k} kg = ? g`, k * 1000),
      num(`${k} l = ? ml`, k * 1000), num(`${k} km = ? m`, k * 1000)
    ])
  }
  if (level === 3) {
    const h = rnd(2, 11)
    const cuarto = pick(['y cuarto', 'y media', 'menos cuarto'])
    const fh = cuarto === 'menos cuarto' ? h - 1 : h
    const fm = cuarto === 'y cuarto' ? '15' : cuarto === 'y media' ? '30' : '45'
    const right = `${fh}:${fm}`
    const wrongs = [`${h}:${fm === '45' ? '15' : '45'}`, `${h + 1}:${fm}`, `${fh}:${fm === '30' ? '15' : '30'}`]
    return choice(`¿Cómo se escribe «las ${h} ${cuarto}» en un reloj digital?`, right, wrongs)
  }
  if (level === 4) {
    const k = rnd(1, 3)
    if (Math.random() < 0.5) {
      const cm = rnd(1, 9) * 10 + 5
      return num(`${k} m y ${cm} cm = ? cm`, k * 100 + cm)
    }
    const m = rnd(1, 5) * 10 + (Math.random() < 0.5 ? 5 : 0)
    return num(`${k} h y ${m} min = ? minutos`, k * 60 + m)
  }
  const h1 = rnd(2, 9)
  const m1 = pick([10, 20, 30, 40])
  const dur = rnd(25, 85)
  const total = h1 * 60 + m1 + dur
  const h2 = Math.floor(total / 60)
  const m2 = total % 60
  const pad = (x) => String(x).padStart(2, '0')
  return num(`Empieza a las ${h1}:${pad(m1)} y termina a las ${h2}:${pad(m2)}. ¿Cuántos minutos dura?`, dur)
}

// ---------- Geometría ----------
export function geometria(level) {
  if (level <= 2 && Math.random() < 0.4) {
    const [deg, name] = pick([[30, 'agudo'], [45, 'agudo'], [90, 'recto'], [120, 'obtuso'], [150, 'obtuso'], [60, 'agudo']])
    return choice(`Un ángulo de ${deg}° es…`, name, ['agudo', 'recto', 'obtuso'])
  }
  if (level === 1) { const l = rnd(2, 9); return num(`Perímetro de un cuadrado de lado ${l} cm (cm)`, 4 * l) }
  if (level === 2) { const a = rnd(3, 12); const b = rnd(2, a - 1); return num(`Perímetro de un rectángulo de ${a} cm por ${b} cm (cm)`, 2 * (a + b)) }
  if (level === 3) { const a = rnd(3, 12); const b = rnd(2, 9); return num(`Área de un rectángulo de ${a} cm por ${b} cm (cm²)`, a * b) }
  if (level === 4) {
    const [name, sides] = pick([['triángulo equilátero', 3], ['pentágono regular', 5], ['hexágono regular', 6], ['octógono regular', 8]])
    const l = rnd(3, 12)
    return num(`Perímetro de un ${name} de lado ${l} cm (cm)`, sides * l)
  }
  const l = rnd(6, 15)
  return num(`Área de un cuadrado de lado ${l} cm (cm²)`, l * l)
}

// ---------- Problemas ----------
const NAMES = ['Valeria', 'Lucía', 'Marta', 'Sofía', 'Paula', 'Carlos', 'Pablo', 'Hugo']

export function problemas(level) {
  const nm = pick(NAMES)
  const type = Math.min(5, Math.max(1, level + pick([-1, 0, 0])))
  if (type === 1) {
    const a = rnd(12, 60), b = rnd(5, 30)
    return num(`${nm} tiene ${a} cromos y le regalan ${b} más. ¿Cuántos cromos tiene ahora?`, a + b)
  }
  if (type === 2) {
    const a = rnd(40, 120), b = rnd(10, a - 5)
    return num(`${nm} tenía ${a} euros y se ha gastado ${b}. ¿Cuántos euros le quedan?`, a - b)
  }
  if (type === 3) {
    const a = rnd(6, 12), b = rnd(3, 9)
    return num(`Una caja tiene ${a} lápices. ¿Cuántos lápices hay en ${b} cajas?`, a * b)
  }
  if (type === 4) {
    const b = rnd(3, 9), q = rnd(4, 15)
    return num(`${nm} reparte ${b * q} caramelos entre ${b} amigos a partes iguales. ¿Cuántos recibe cada uno?`, q)
  }
  if (Math.random() < 0.5) {
    const k = rnd(3, 6), pl = rnd(30, 60), free = rnd(5, 30)
    return num(`En una excursión van ${k} autobuses con ${pl} plazas cada uno y quedan ${free} asientos libres. ¿Cuántas personas viajan?`, k * pl - free)
  }
  const n = rnd(3, 8), p = rnd(2, 5)
  const pay = Math.ceil((n * p + 1) / 10) * 10
  return num(`${nm} compra ${n} cuadernos a ${p} € cada uno y paga con ${pay} €. ¿Cuánto dinero le devuelven? (€)`, pay - n * p)
}

// ---------- Cálculo mental rápido (como las hojas de "Rapidesa de càlcul mental") ----------
export function calculoMental(level) {
  if (level === 1) { const a = pick([8, 9]); const b = rnd(2, 9); return num(`${a} + ${b} =`, a + b) }
  if (level === 2) { const a = rnd(4, 7); const b = rnd(4, 9); return num(`${a} + ${b} =`, a + b) }
  if (level === 3) { const a = rnd(11, 18); const b = rnd(2, 9); return num(`${a} − ${b} =`, a - b) }
  if (level === 4) {
    const a = rnd(2, 8) * 10 + rnd(1, 9)
    const b = rnd(Math.max(2, 10 - (a % 10)), 9) // pasa a la decena siguiente
    return num(`${a} + ${b} =`, a + b)
  }
  const u = rnd(0, 5)
  const a = rnd(3, 9) * 10 + u
  const b = rnd(u + 1, 9) // obliga a "llevarse" una decena
  return num(`${a} − ${b} =`, a - b)
}
