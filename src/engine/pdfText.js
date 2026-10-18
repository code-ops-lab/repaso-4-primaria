import { joinItems } from './pdfQuestions.js'

// Lee el texto de un PDF en el propio dispositivo (funciona sin internet).
// pdf.js se carga solo cuando se sube un PDF, para no pesar en el arranque.
// Devuelve `items` (trozos sueltos, para las operaciones) y `text` (con saltos de línea, para las preguntas).
export async function extractPdfItems(file, maxPages = 80) {
  const pdfjs = await import('pdfjs-dist/build/pdf.min.mjs')
  const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = worker

  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise
  const items = []
  const texts = []
  const pages = Math.min(doc.numPages, maxPages)
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    content.items.forEach((it) => items.push(it.str))
    items.push('')
    texts.push(joinItems(content.items))
  }
  return { items, text: texts.join('\n'), pages: doc.numPages, truncated: doc.numPages > maxPages }
}
