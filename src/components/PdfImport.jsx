import React, { useState } from 'react'
import { SUBJECTS } from '../engine/subjects.js'
import { extractPdfItems } from '../engine/pdfText.js'
import { parseOperations, buildSimulator, simulate, OP_NAMES } from '../engine/pdfSim.js'
import { buildCandidates, KIND_NAMES } from '../engine/pdfQuestions.js'
import { parsePack } from '../engine/packs.js'

// Subir un PDF de CUALQUIER asignatura. Todo se lee en el propio dispositivo (sin internet).
//  · Matemáticas con operaciones → ejercicios nuevos del mismo estilo (simulador).
//  · Preguntas con opciones, pares de palabras y frases del texto → una lista para revisar y añadir.
export default function PdfImport({ state, setState }) {
  const sims = state.sims ?? []
  const [subject, setSubject] = useState('mates')
  const [level, setLevel] = useState(3)
  const [forceOp, setForceOp] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [review, setReview] = useState(null) // { name, subject, items }

  const subjectName = (id) => SUBJECTS.find((s) => s.id === id)?.name ?? id

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 15_000_000) return setMsg({ bad: true, text: 'El PDF es demasiado grande (máximo 15 MB).' })
    setBusy(true)
    setMsg(null)
    setReview(null)
    try {
      const { items, text, pages, truncated } = await extractPdfItems(file)
      const name = file.name.replace(/\.pdf$/i, '').slice(0, 40)
      const parts = [`He leído ${pages} ${pages === 1 ? 'página' : 'páginas'}${truncated ? ' (solo las primeras)' : ''}.`]

      // Operaciones → simulador (solo Matemáticas).
      let simmed = false
      if (subject === 'mates') {
        const ops = parseOperations(items, forceOp || null)
        if (ops.length) {
          const sim = buildSimulator(name, ops)
          const kinds = {}
          ops.forEach((o) => (kinds[o.op] = (kinds[o.op] ?? 0) + 1))
          const example = simulate(sim)
          setState((s) => ({
            ...s,
            sims: [...(s.sims ?? []).filter((x) => x.name !== sim.name), { id: String(Date.now()), subject: 'mates', ...sim }]
          }))
          parts.push(
            `Encontré ${ops.length} operaciones (${Object.entries(kinds).map(([k, v]) => `${v} ${OP_NAMES[k]}`).join(', ')}): Matemáticas creará ejercicios nuevos parecidos. Ejemplo: ${example.prompt}${example.remainder !== undefined ? ' (con resto)' : ''}.`
          )
          simmed = true
        }
      }

      // Preguntas con opciones, pares y frases → lista para revisar.
      const items2 = buildCandidates(text, { subject, skipCloze: simmed })
      if (items2.length) {
        const kinds = {}
        items2.forEach((c) => (kinds[c.kind] = (kinds[c.kind] ?? 0) + 1))
        parts.push(`Preparé ${items2.length} preguntas (${Object.entries(kinds).map(([k, v]) => `${v} ${KIND_NAMES[k]}`).join(', ')}) para ${subjectName(subject)}. Revísalas abajo antes de añadirlas.`)
        setReview({ name, subject, items: items2 })
      }

      if (!simmed && !items2.length) {
        setMsg({
          bad: true,
          text: 'No encontré nada que convertir en ejercicios. Funciona con PDF con texto (no escaneados como imagen) que tengan preguntas con opciones a) b) c), listas «palabra – palabra», un texto de lectura o, en Matemáticas, operaciones.'
        })
      } else {
        setMsg({ bad: false, text: parts.join(' ') })
      }
    } catch {
      setMsg({ bad: true, text: 'No pude leer ese PDF. Prueba con otro archivo.' })
    } finally {
      setBusy(false)
    }
  }

  const update = (id, patch) =>
    setReview((r) => ({ ...r, items: r.items.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  const markAll = (value) =>
    setReview((r) => ({ ...r, items: r.items.map((c) => ({ ...c, include: value && c.a !== null })) }))

  const chosen = review ? review.items.filter((c) => c.include && c.a !== null) : []

  const addChosen = () => {
    const pack = { name: `${review.name} (PDF)`, questions: chosen.map((c) => ({ subject: review.subject, level: Number(level), q: c.q, o: c.o, a: c.a })) }
    const res = parsePack(JSON.stringify(pack))
    if (res.error) return setMsg({ bad: true, text: res.error })
    setState((s) => ({ ...s, packs: [...(s.packs ?? []).filter((p) => p.name !== res.pack.name), res.pack] }))
    setMsg({ bad: false, text: `Añadidas ${res.pack.questions.length} preguntas a ${subjectName(review.subject)}${res.skipped ? ` (${res.skipped} ignoradas por inválidas o repetidas)` : ''}.` })
    setReview(null)
  }

  const removeSim = (id) => {
    if (window.confirm('¿Quitar este PDF? Dejarán de salir sus ejercicios parecidos.')) {
      setState((s) => ({ ...s, sims: (s.sims ?? []).filter((x) => x.id !== id) }))
    }
  }

  return (
    <section className="card panel">
      <h2>Ejercicios a partir de un PDF</h2>
      <p>
        Sube un PDF de <strong>cualquier asignatura</strong>. La app lo lee en la tablet (sin internet) y prepara ejercicios nuevos:
        en Matemáticas, <strong>operaciones nuevas del mismo estilo</strong> que las del PDF; en las demás, preguntas con opciones
        sacadas del PDF (preguntas que ya traiga, listas de palabras o frases del texto). Tú las revisas antes de añadirlas.
      </p>

      <div className="row">
        <label htmlFor="pdfsubject">Asignatura</label>
        <select id="pdfsubject" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
        </select>
      </div>
      <div className="row">
        <label htmlFor="pdflevel">Dificultad de las preguntas</label>
        <select id="pdflevel" className="select" value={level} onChange={(e) => setLevel(e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}{n === 1 ? ' (fácil)' : n === 5 ? ' (difícil)' : ''}</option>)}
        </select>
      </div>
      {subject === 'mates' && (
        <div className="row">
          <label htmlFor="forceop">Si el signo no se lee, tratar como</label>
          <select id="forceop" className="select" value={forceOp} onChange={(e) => setForceOp(e.target.value)}>
            <option value="">Detectar automáticamente</option>
            <option value="d">División</option>
            <option value="x">Multiplicación</option>
            <option value="a">Suma</option>
            <option value="s">Resta</option>
          </select>
        </div>
      )}

      <label className={`btn primary filebtn${busy ? ' disabled' : ''}`}>
        {busy ? '⏳ Leyendo PDF…' : '📄 Subir PDF'}
        <input type="file" accept=".pdf,application/pdf" onChange={onFile} disabled={busy} hidden />
      </label>
      {msg && <p className={`msg ${msg.bad ? 'bad' : 'ok'}`}>{msg.text}</p>}

      {review && (
        <div className="review">
          <h3>Revisa las preguntas de «{review.name}»</h3>
          <p className="small-note">
            Se añadirán a <strong>{subjectName(review.subject)}</strong>. Marca las que valgan y elige la opción correcta en cada una.
            Las de «completa la frase» salen sin marcar: léelas con calma, porque a veces la frase queda rara.
          </p>
          <div className="actions">
            <button className="btn ghost" onClick={() => markAll(true)}>Marcar todas</button>
            <button className="btn ghost" onClick={() => markAll(false)}>Quitar todas</button>
          </div>
          <ul className="cands">
            {review.items.map((c) => (
              <li key={c.id} className={c.include ? 'on' : ''}>
                <label className="candhead">
                  <input type="checkbox" checked={c.include} disabled={c.a === null} onChange={(e) => update(c.id, { include: e.target.checked })} />
                  <span>{c.q}</span>
                </label>
                <div className="candopts">
                  {c.o.map((o) => (
                    <label key={o} className={c.a === o ? 'right' : ''}>
                      <input type="radio" name={c.id} checked={c.a === o} onChange={() => update(c.id, { a: o, include: true })} /> {o}
                    </label>
                  ))}
                </div>
                {c.a === null && <p className="small-note">Elige la opción correcta para poder añadirla.</p>}
              </li>
            ))}
          </ul>
          <button className="btn primary" disabled={!chosen.length} onClick={addChosen}>Añadir {chosen.length} preguntas</button>
        </div>
      )}

      <h3>PDF de operaciones cargados</h3>
      {sims.length === 0 && <p className="small-note">Todavía no has subido ninguno.</p>}
      <ul className="packs">
        {sims.map((s) => (
          <li key={s.id}>
            <span>📄 {s.name} · {s.count} operaciones leídas</span>
            <button className="btn ghost" onClick={() => removeSim(s.id)}>Quitar</button>
          </li>
        ))}
      </ul>
      <p className="small-note">Las preguntas que añadas desde un PDF aparecen en «Paquetes importados» y se pueden quitar desde allí.</p>
    </section>
  )
}
