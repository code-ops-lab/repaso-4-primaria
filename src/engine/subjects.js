import { bankTopic } from './helpers.js'
import { suma, resta, multiplicacion, division } from './math.js'
import { ceros, partesDivision, divisionDosCifras, combinadas, romanos, numerosConLetras } from './math3.js'
import { numerosGrandes, fracciones, decimales, medidas, geometria, problemas, calculoMental } from './math2.js'

// NOTA: los bancos de preguntas son una muestra inicial pensada para ampliar
// y contrastar con el libro de texto y el temario del colegio.
// Cada item: { l: nivel 1-5, q: enunciado, o: opciones, a: respuesta }.

const TIPO = ['aguda', 'llana', 'esdrújula']
const CLASE = ['sustantivo', 'adjetivo', 'verbo']

const lengua = {
  ortografia: bankTopic([
    { l: 1, q: '¿Cuál está bien escrita?', o: ['hormiga', 'ormiga'], a: 'hormiga' },
    { l: 1, q: '¿Cuál está bien escrita?', o: ['jirafa', 'girafa'], a: 'jirafa' },
    { l: 1, q: '¿Cuál está bien escrita?', o: ['huevo', 'uevo'], a: 'huevo' },
    { l: 1, q: '¿Cuál está bien escrita?', o: ['ventana', 'bentana'], a: 'ventana' },
    { l: 2, q: '¿Cuál está bien escrita?', o: ['gigante', 'jigante'], a: 'gigante' },
    { l: 2, q: '¿Cuál está bien escrita?', o: ['bruja', 'bruga'], a: 'bruja' },
    { l: 2, q: '¿Cuál está bien escrita?', o: ['invierno', 'imbierno'], a: 'invierno' },
    { l: 3, q: '¿Cuál está bien escrita?', o: ['excursión', 'escursión'], a: 'excursión' },
    { l: 3, q: '¿Cuál está bien escrita?', o: ['exclamar', 'esclamar'], a: 'exclamar' },
    { l: 3, q: '¿Cuál está bien escrita?', o: ['bombero', 'bonbero'], a: 'bombero' }
  ]),
  tildes: bankTopic([
    { l: 1, q: '«mesa» es una palabra…', o: TIPO, a: 'llana' },
    { l: 1, q: '«sofá» es una palabra…', o: TIPO, a: 'aguda' },
    { l: 1, q: '«teléfono» es una palabra…', o: TIPO, a: 'esdrújula' },
    { l: 2, q: '«árbol» es una palabra…', o: TIPO, a: 'llana' },
    { l: 2, q: '«reloj» es una palabra…', o: TIPO, a: 'aguda' },
    { l: 2, q: '«pájaro» es una palabra…', o: TIPO, a: 'esdrújula' },
    { l: 3, q: '«canción» es una palabra…', o: TIPO, a: 'aguda' },
    { l: 3, q: '«lápiz» es una palabra…', o: TIPO, a: 'llana' },
    { l: 3, q: '«murciélago» es una palabra…', o: TIPO, a: 'esdrújula' }
  ]),
  clases: bankTopic([
    { l: 1, q: '«princesa» es un…', o: CLASE, a: 'sustantivo' },
    { l: 1, q: '«azul» es un…', o: CLASE, a: 'adjetivo' },
    { l: 1, q: '«saltar» es un…', o: CLASE, a: 'verbo' },
    { l: 2, q: '«castillo» es un…', o: CLASE, a: 'sustantivo' },
    { l: 2, q: '«alegre» es un…', o: CLASE, a: 'adjetivo' },
    { l: 2, q: '«cantan» es un…', o: CLASE, a: 'verbo' },
    { l: 3, q: 'En «El dragón verde duerme», ¿cuál es el adjetivo?', o: ['dragón', 'verde', 'duerme'], a: 'verde' },
    { l: 3, q: 'En «Ana pinta un cuadro», ¿cuál es el verbo?', o: ['Ana', 'pinta', 'cuadro'], a: 'pinta' },
    { l: 3, q: 'En «La rosa roja huele bien», ¿cuál es el sustantivo?', o: ['rosa', 'roja', 'huele'], a: 'rosa' }
  ])
}

const valencia = {
  vocabulari: bankTopic([
    { l: 1, q: '¿Cómo se dice «ventana» en valenciano?', o: ['finestra', 'porta', 'taula'], a: 'finestra' },
    { l: 1, q: '¿Cómo se dice «manzana» en valenciano?', o: ['poma', 'pera', 'taronja'], a: 'poma' },
    { l: 1, q: '¿Cómo se dice «perro» en valenciano?', o: ['gat', 'gos', 'cavall'], a: 'gos' },
    { l: 1, q: '¿Cómo se dice «niño» en valenciano?', o: ['xiquet', 'pare', 'mestre'], a: 'xiquet' },
    { l: 2, q: '¿Cómo se dice «leche» en valenciano?', o: ['llet', 'aigua', 'pa'], a: 'llet' },
    { l: 2, q: '¿Cómo se dice «zapato» en valenciano?', o: ['sabata', 'cadira', 'camisa'], a: 'sabata' },
    { l: 2, q: '¿Cómo se dice «silla» en valenciano?', o: ['taula', 'cadira', 'llibre'], a: 'cadira' },
    { l: 2, q: '¿Cómo se dice «pez» en valenciano?', o: ['peix', 'ocell', 'ull'], a: 'peix' },
    { l: 3, q: '¿Cómo se dice «cuchara» en valenciano?', o: ['forquilla', 'cullera', 'ganivet'], a: 'cullera' },
    { l: 3, q: '¿Cómo se dice «ciudad» en valenciano?', o: ['ciutat', 'poble', 'carrer'], a: 'ciutat' },
    { l: 3, q: '¿Cómo se dice «hermano» en valenciano?', o: ['germà', 'oncle', 'cosí'], a: 'germà' }
  ]),
  ortografia: bankTopic([
    { l: 1, q: 'Quina paraula està ben escrita?', o: ['lluna', 'yuna'], a: 'lluna' },
    { l: 1, q: 'Quina paraula està ben escrita?', o: ['xiquet', 'chiquet'], a: 'xiquet' },
    { l: 1, q: 'Quina paraula està ben escrita?', o: ['peix', 'peich'], a: 'peix' },
    { l: 2, q: 'Quina paraula està ben escrita?', o: ['dijous', 'dijoux'], a: 'dijous' },
    { l: 2, q: 'Quina paraula està ben escrita?', o: ['setmana', 'semana'], a: 'setmana' },
    { l: 2, q: 'Quina paraula està ben escrita?', o: ['cavall', 'cavayl'], a: 'cavall' },
    { l: 3, q: 'Quin és el plural de «llibre»?', o: ['llibres', 'llibros', 'llibrs'], a: 'llibres' },
    { l: 3, q: 'Quin és el plural de «gos»?', o: ['goss', 'gossos', 'goses'], a: 'gossos' },
    { l: 3, q: 'Quin és el femení de «xiquet»?', o: ['xiqueta', 'xiquete', 'xiquita'], a: 'xiqueta' }
  ])
}

const ingles = {
  vocabulary: bankTopic([
    { l: 1, q: 'How do you say «gato» in English?', o: ['cat', 'dog', 'bird'], a: 'cat' },
    { l: 1, q: 'How do you say «rojo» in English?', o: ['blue', 'red', 'green'], a: 'red' },
    { l: 1, q: 'How do you say «libro» in English?', o: ['book', 'pen', 'door'], a: 'book' },
    { l: 2, q: 'How do you say «estuche» in English?', o: ['pencil case', 'backpack', 'ruler'], a: 'pencil case' },
    { l: 2, q: 'What day comes after Monday?', o: ['Sunday', 'Tuesday', 'Friday'], a: 'Tuesday' },
    { l: 2, q: 'How do you say «ventana» in English?', o: ['door', 'window', 'table'], a: 'window' },
    { l: 3, q: 'How do you say «nublado» in English?', o: ['sunny', 'cloudy', 'windy'], a: 'cloudy' },
    { l: 3, q: 'How do you say «lluvioso» in English?', o: ['rainy', 'snowy', 'hot'], a: 'rainy' }
  ]),
  grammar: bankTopic([
    { l: 1, q: 'She ___ a princess.', o: ['is', 'are', 'am'], a: 'is' },
    { l: 1, q: 'They ___ happy.', o: ['is', 'are', 'am'], a: 'are' },
    { l: 1, q: 'I ___ nine years old.', o: ['is', 'are', 'am'], a: 'am' },
    { l: 2, q: 'He ___ pizza.', o: ['like', 'likes', 'liking'], a: 'likes' },
    { l: 2, q: 'We ___ to school every day.', o: ['go', 'goes', 'going'], a: 'go' },
    { l: 3, q: 'There ___ two cats in the garden.', o: ['is', 'are', 'am'], a: 'are' },
    { l: 3, q: 'I ___ have a brother.', o: ["don't", "doesn't", 'not'], a: "don't" }
  ])
}

export const SUBJECTS = [
  {
    id: 'mates', name: 'Matemáticas', emoji: '🔢', color: '#ff5fa2',
    topics: [
      { id: 'mental', name: 'Cálculo mental rápido', emoji: '⚡', make: calculoMental },
      { id: 'suma', name: 'Sumas', emoji: '➕', make: suma },
      { id: 'resta', name: 'Restas', emoji: '➖', make: resta },
      { id: 'mult', name: 'Multiplicaciones', emoji: '✖️', make: multiplicacion },
      { id: 'div', name: 'Divisiones', emoji: '➗', make: division },
      { id: 'div2', name: 'División con divisor de dos cifras', emoji: '➗', make: divisionDosCifras },
      { id: 'ceros', name: 'Por y entre 10, 100 y 1000', emoji: '0️⃣', make: ceros },
      { id: 'partes', name: 'Partes y prueba de la división', emoji: '🔍', make: partesDivision },
      { id: 'comb', name: 'Operaciones combinadas', emoji: '🧮', make: combinadas },
      { id: 'letras', name: 'Números con letras', emoji: '🔠', make: numerosConLetras },
      { id: 'roman', name: 'Números romanos', emoji: '🏛️', make: romanos },
      { id: 'grandes', name: 'Números grandes', emoji: '🔟', make: numerosGrandes },
      { id: 'frac', name: 'Fracciones', emoji: '🍕', make: fracciones },
      { id: 'dec', name: 'Decimales', emoji: '🔹', make: decimales },
      { id: 'med', name: 'Medidas y hora', emoji: '📏', make: medidas },
      { id: 'geo', name: 'Geometría', emoji: '📐', make: geometria },
      { id: 'prob', name: 'Problemas', emoji: '🧩', make: problemas }
    ]
  },
  {
    id: 'lengua', name: 'Lengua castellana', emoji: '📖', color: '#a855f7',
    topics: [
      { id: 'orto', name: 'Ortografía', emoji: '✏️', make: lengua.ortografia },
      { id: 'tildes', name: 'Agudas, llanas y esdrújulas', emoji: '🎵', make: lengua.tildes },
      { id: 'clases', name: 'Clases de palabras', emoji: '🔤', make: lengua.clases }
    ]
  },
  {
    id: 'valencia', name: 'Valencià: Llengua', emoji: '🍊', color: '#f97316',
    topics: [
      { id: 'val-voc', name: 'Vocabulari', emoji: '💬', make: valencia.vocabulari },
      { id: 'val-orto', name: 'Ortografia i plurals', emoji: '✏️', make: valencia.ortografia }
    ]
  },
  {
    id: 'ingles', name: 'Inglés', emoji: '🇬🇧', color: '#3b82f6',
    topics: [
      { id: 'en-voc', name: 'Vocabulary', emoji: '🐱', make: ingles.vocabulary },
      { id: 'en-gram', name: 'Grammar', emoji: '🧩', make: ingles.grammar }
    ]
  },
  {
    // Conocimiento del Medio Natural, Social y Cultural. Sus preguntas vienen del paquete base y de los PDF,
    // agrupadas en bloques (cuerpo humano, seres vivos, agua y clima…) que se activan desde la zona de padres.
    id: 'medio', name: 'Conocimiento del Medio', full: 'Conocimiento del Medio Natural, Social y Cultural', emoji: '🌍', color: '#10b981',
    topics: []
  }
]
