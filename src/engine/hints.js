import { WHY, RULE_BY_ANSWER, TIPS } from '../data/explain.js'

// Cuando el niño o la niña falla: un diagnóstico del error, una explicación breve y un truco corto.
// Devuelve { diag, why, tip } (cada uno puede ser null).

const nf = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const zeros = (n) => (String(n).match(/0*$/) ?? [''])[0].length
const isPow10 = (n) => /^10*$/.test(String(n))

// Lee una operación sencilla "a ○ b" del enunciado ("24 × 15 = ?", "9.200 ÷ 10 =", "845 ÷ 4").
function binary(prompt) {
  const m = prompt.replace(/ /g, ' ').match(/^\s*(\d[\d.]*)\s*([+−×÷-])\s*(\d[\d.]*)/)
  if (!m) return null
  const a = Number(m[1].replace(/\./g, ''))
  const b = Number(m[3].replace(/\./g, ''))
  return { a, b, op: m[2] === '-' ? '−' : m[2] }
}

// ---------- 1. Diagnóstico del error (solo preguntas numéricas) ----------
function diagnose(q, raw) {
  if (q.type !== 'number' || !raw || raw.value === '' || raw.value == null) return null
  const g = Number(raw.value)
  const bin = binary(q.prompt)
  if (!bin || !Number.isFinite(g)) return null
  const { a, b, op } = bin
  const ans = q.answer
  const diff = Math.abs(g - ans)
  const tenPow = diff > 0 && [10, 100, 1000, 10000].includes(diff)
  if (op === '+') {
    if (g === a - b || g === b - a) return 'Parece que has restado en vez de sumar.'
    if (g === a * b) return 'Parece que has multiplicado en vez de sumar.'
    if (tenPow) return 'Revisa las llevadas: cuando una columna suma 10 o más, te llevas 1 a la columna de la izquierda.'
  }
  if (op === '−') {
    if (g === a + b) return 'Parece que has sumado en vez de restar.'
    if (tenPow) return 'Revisa cuando «pides prestado»: si la cifra de arriba es menor, le quitas 1 a la de su izquierda.'
  }
  if (op === '×') {
    if (g === a + b) return 'Parece que has sumado en vez de multiplicar.'
    if (g !== 0 && (g / ans === 10 || ans / g === 10 || g / ans === 100 || ans / g === 100)) return 'Tienes las cifras bien pero te falta o te sobra algún cero. Revisa dónde colocas cada resultado.'
    if (tenPow) return 'Revisa las llevadas al multiplicar cifra por cifra.'
  }
  if (op === '÷') {
    if (g === a * b) return 'Parece que has multiplicado en vez de dividir.'
    if (q.remainder !== undefined) {
      const r = raw.rest === '' || raw.rest == null ? null : Number(raw.rest)
      if (r !== null && r >= b) return 'El resto siempre tiene que ser menor que el divisor. Si no, todavía cabe otra vez.'
      if (g === ans && r !== null && r !== q.remainder) return 'El cociente está bien. Revisa el resto: dividendo − divisor × cociente.'
    }
    if (Math.abs(g - ans) === 1) return 'Casi. Haz la prueba: divisor × cociente + resto tiene que dar el dividendo.'
  }
  if (diff <= 2 && diff > 0) return 'Casi lo tienes: te has equivocado por muy poco. Repasa la cuenta paso a paso.'
  return null
}

// ---------- 2. Explicación ----------
function worked(q) {
  const bin = binary(q.prompt)
  if (!bin) return null
  const { a, b, op } = bin
  const ans = q.answer
  if (op === '+') return `Suma de derecha a izquierda, llevando cuando pasa de 9: ${nf(a)} + ${nf(b)} = ${nf(ans)}.`
  if (op === '−') return `Resta de derecha a izquierda (pide prestado si hace falta): ${nf(a)} − ${nf(b)} = ${nf(ans)}. Prueba: ${nf(ans)} + ${nf(b)} = ${nf(a)}.`
  if (op === '×') {
    if (isPow10(b) && b >= 10) return `Multiplicar por ${nf(b)} es añadir ${zeros(b)} ${zeros(b) === 1 ? 'cero' : 'ceros'}: ${nf(a)} × ${nf(b)} = ${nf(ans)}.`
    const digits = String(b).split('').reverse()
    if (digits.length === 1) return `Con la tabla del ${b}: ${nf(a)} × ${b} = ${nf(ans)}.`
    const parts = digits.map((d, i) => Number(d) * a * 10 ** i).filter((x) => x > 0)
    if (digits.length <= 3 && parts.length > 1) return `Multiplica por cada cifra y suma: ${digits.map((d, i) => `${nf(a)} × ${Number(d) * 10 ** i}`).filter((_, i) => Number(digits[i]) > 0).join(' + ')} = ${parts.map(nf).join(' + ')} = ${nf(ans)}.`
    return `${nf(a)} × ${nf(b)} = ${nf(ans)}.`
  }
  if (op === '÷') {
    if (isPow10(b) && b >= 10 && q.remainder === undefined) return `Dividir entre ${nf(b)} es quitar ${zeros(b)} ${zeros(b) === 1 ? 'cero' : 'ceros'}: ${nf(a)} ÷ ${nf(b)} = ${nf(ans)}.`
    const r = q.remainder ?? 0
    if (r) return `Busca cuántas veces cabe ${nf(b)} en ${nf(a)}: caben ${nf(ans)} y sobran ${r}. Prueba: ${nf(b)} × ${nf(ans)} + ${r} = ${nf(a)}.`
    if (zeros(a) > 0 && zeros(b) > 0 && b >= 20) {
      const z = Math.min(zeros(a), zeros(b))
      return `Quita los mismos ceros al dividendo y al divisor: ${nf(a / 10 ** z)} ÷ ${nf(b / 10 ** z)} = ${nf(ans)}.`
    }
    return `¿Cuántas veces cabe ${nf(b)} en ${nf(a)}? Caben ${nf(ans)}. Prueba: ${nf(b)} × ${nf(ans)} = ${nf(a)}.`
  }
  return null
}

// Explicación según el tema, leyendo el enunciado.
function topicWhy(topicId, q) {
  const p = q.prompt
  if (q.type === 'number' || q.type === 'choice') {
    // Operaciones sencillas (suma, resta, multiplicación, división, cálculo mental, ceros, división de 2 cifras).
    if (['mental', 'suma', 'resta', 'mult', 'div', 'div2', 'ceros'].includes(topicId)) return worked(q)
  }
  switch (topicId) {
    case 'partes':
      if (/cómo se llama/.test(p)) return 'Dividendo: lo que se reparte. Divisor: entre cuántos. Cociente: lo que toca a cada uno. Resto: lo que sobra.'
      if (/exacta/.test(p)) return 'Una división es exacta si el resto es 0.'
      return 'Dividendo = divisor × cociente + resto.'
    case 'comb':
      return 'Se resuelve en este orden: paréntesis, después × y ÷, y al final + y −.'
    case 'letras':
      return 'Lee el número de tres en tres cifras: primero los millones, luego los miles y al final las unidades.'
    case 'roman':
      return 'I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Una letra menor delante de otra mayor resta (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).'
    case 'grandes':
      if (/valor tiene/.test(p)) return 'Cada cifra vale según su sitio: unidades, decenas (×10), centenas (×100), millares (×1.000)…'
      if (/Redondea/.test(p)) return 'Mira la cifra de la derecha del lugar al que redondeas: si es 5 o más, el número sube; si es menos de 5, se queda.'
      return 'Compara las cifras de izquierda a derecha: el primer sitio donde se diferencian decide cuál es mayor.'
    case 'frac':
      if (/ de \d+/.test(p)) return 'Para calcular una fracción de una cantidad, divide entre el denominador y multiplica por el numerador.'
      if (/\+/.test(p)) return 'Con el mismo denominador se suman los numeradores y el denominador se queda igual.'
      if (/mayor|menor/.test(p)) return 'Con el mismo denominador, la fracción con el numerador más grande es la mayor.'
      return 'Para una fracción equivalente, multiplica numerador y denominador por el mismo número.'
    case 'dec':
      if (/×/.test(p)) return 'Al multiplicar por 10, 100 o 1.000 la coma se mueve 1, 2 o 3 lugares a la derecha.'
      if (/÷/.test(p)) return 'Al dividir entre 10, 100 o 1.000 la coma se mueve 1, 2 o 3 lugares a la izquierda.'
      if (/mayor/.test(p)) return 'Compara primero las décimas, luego las centésimas.'
      return 'Suma alineando las comas: unidades con unidades, décimas con décimas.'
    case 'med':
      if (/reloj digital/.test(p)) return '«Y cuarto» = :15 · «y media» = :30 · «menos cuarto» = :45 de la hora anterior.'
      if (/Empieza a las/.test(p)) return 'Cuenta desde la hora de inicio hasta la hora en punto y suma los minutos que quedan.'
      return '1 m = 100 cm · 1 km = 1.000 m · 1 kg = 1.000 g · 1 l = 1.000 ml · 1 h = 60 min.'
    case 'geo':
      if (/ángulo/.test(p)) return 'Agudo: menos de 90°. Recto: exactamente 90°. Obtuso: más de 90°.'
      if (/Área/.test(p)) return 'El área de un rectángulo es base × altura; la del cuadrado, lado × lado.'
      return 'El perímetro es la suma de todos los lados (en un polígono regular, lado × número de lados).'
    case 'prob': {
      if (/reparte|a partes iguales/.test(p)) return 'Repartir en partes iguales es dividir.'
      if (/cada uno|cajas|autobuses/.test(p)) return 'Grupos iguales: se multiplica (y a veces después hay que restar).'
      if (/se ha gastado|le quedan|devuelven/.test(p)) return 'Si quitas o gastas, se resta. Si pagas con billetes, la vuelta es lo que pagas menos lo que cuesta.'
      return 'Si juntas cantidades, se suma.'
    }
    default:
      return null
  }
}

// Texto "por qué" de una pregunta de opciones (explicación propia, diccionario o regla).
// En las preguntas de lectura, señala la frase del texto donde está la respuesta.
function sentenceFor(text, ...hay) {
  const words = (s) => (s.toLowerCase().match(/\p{L}{3,}/gu) ?? [])
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
  for (const source of hay) {
    const target = new Set(words(source))
    let best = null
    let bestScore = 0
    for (const s of sentences) {
      const score = words(s).filter((w) => target.has(w)).length
      if (score > bestScore) { best = s; bestScore = score }
    }
    if (best) return `Vuelve a leer el texto: «${best}»`
  }
  return null
}

function choiceWhy(q) {
  if (q.why) return q.why
  if (q.text) return sentenceFor(q.text, q.answer, q.prompt)
  if (WHY[q.answer]) return WHY[q.answer]
  if (RULE_BY_ANSWER[q.answer] && /palabra|paraula|oración|oració|tiempo|temps|sustantivo|adjetivo|verbo|nom|adjectiu|verb|diptongo|hiato|diftong|hiat|Quin|Quina|En «|es un|és un|És/.test(q.prompt)) {
    return RULE_BY_ANSWER[q.answer]
  }
  return null
}

export function tipFor(topic) {
  return topic.tip ?? TIPS[topic.id] ?? TIPS[topic.name] ?? null
}

export function explain(topic, q, raw) {
  let why = null
  if (q.type === 'choice') why = choiceWhy(q) ?? topicWhy(topic.id, q)
  else why = q.why ?? topicWhy(topic.id, q)
  return { diag: diagnose(q, raw), why, tip: tipFor(topic) }
}
