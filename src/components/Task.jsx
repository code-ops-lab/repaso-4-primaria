import React, { useEffect, useRef, useState } from 'react'
import { buildTask, TASK_SIZE, PASS_MARK } from '../engine/daily.js'
import { explain } from '../engine/hints.js'

// Tarea de una asignatura: TASK_SIZE preguntas seguidas, sin tiempo ni presión.
// Al final se muestra el resultado y se avisa a la app con onFinish.
export default function Task({ subject, levels, extras, mastered, sims, disabled, onFinish, onExit }) {
  const [task, setTask] = useState(() => buildTask(subject, levels, extras, mastered, sims, disabled))
  const items = task.items
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState([]) // [{topicId, ok, id, prompt, correct, given}]
  const [input, setInput] = useState('')
  const [rest, setRest] = useState('')
  const [shown, setShown] = useState(null) // { ok, text, given, info } tras responder
  const [done, setDone] = useState(null) // { score, passed }
  const inputRef = useRef(null)

  const item = items[idx]
  const q = item.q

  const correctText = q.type === 'number'
    ? q.remainder !== undefined ? `${q.answer} y resto ${q.remainder}` : `${q.answer}`
    : q.answer

  const answer = (ok, given, raw) => {
    // Si falla: qué ha podido pasar, una explicación breve y un truco corto.
    const info = ok ? null : explain(item.topic, q, raw)
    const why = info ? [info.diag, info.why].filter(Boolean).join(' ') : ''
    setResults((r) => [...r, { topicId: item.topic.id, ok, id: q.id, prompt: q.prompt, correct: correctText, given, ...(why ? { why } : {}) }])
    setShown({ ok, text: ok ? '¡Correcto!' : `Era: ${correctText}`, given, info })
  }

  useEffect(() => {
    if (!shown && !done) inputRef.current?.focus()
  }, [idx, shown, done])

  const check = (value, valueRest) => {
    let ok
    let given = value
    if (q.type === 'number') {
      ok = value !== '' && Number(value) === q.answer
      if (q.remainder !== undefined) {
        ok = ok && valueRest !== '' && Number(valueRest) === q.remainder
        given = `${value || '—'} y resto ${valueRest || '—'}`
      }
    } else {
      ok = value === q.answer
    }
    answer(ok, given, q.type === 'number' ? { value, rest: valueRest } : { value })
  }

  const next = () => {
    if (idx + 1 < items.length) {
      setIdx(idx + 1)
      setInput('')
      setRest('')
      setShown(null)
      return
    }
    const score = results.filter((r) => r.ok).length
    const passed = score >= PASS_MARK
    setDone({ score, passed })
    onFinish(subject.id, score, results, task.exhausted)
  }

  const retry = () => {
    setTask(buildTask(subject, levels, extras, mastered, sims, disabled))
    setIdx(0)
    setResults([])
    setInput('')
    setRest('')
    setShown(null)
    setDone(null)
  }

  if (done) {
    return (
      <div className="screen" style={{ '--accent': subject.color }}>
        <div className="card result">
          <div className="big">{done.passed ? '🌟' : '💪'}</div>
          <h2>{done.passed ? '¡Tarea superada!' : '¡Casi lo tienes!'}</h2>
          <p className="score">{done.score} / {TASK_SIZE}</p>
          <p>
            {done.passed
              ? `${subject.name} completada por hoy.`
              : `Necesitas ${PASS_MARK} aciertos para superarla. Vuelve a intentarlo con preguntas nuevas, ¡sin prisa!`}
          </p>
          {task.exhausted && (
            <p className="note">📚 Ya has hecho casi todos los ejercicios de esta asignatura. Pídele a mamá o papá que añada más.</p>
          )}
          <div className="actions">
            {!done.passed && <button className="btn primary" onClick={retry}>Intentar de nuevo</button>}
            <button className="btn" onClick={onExit}>Volver al inicio</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ '--accent': subject.color }}>
      <header className="topbar">
        <button className="btn ghost" onClick={() => window.confirm('Si sales ahora perderás esta tarea. ¿Salir?') && onExit()}>
          ← Salir
        </button>
        <div className="title">{subject.emoji} {subject.name}</div>
        <div className="levelchip">{idx + 1} / {items.length}</div>
      </header>

      <section className="card question">
        <div className="steps" aria-hidden="true">
          {items.map((_, i) => (
            <span key={i} className={i < idx ? 'done' : i === idx ? 'now' : ''} />
          ))}
        </div>

        <p className="topic">{item.topic.emoji} {item.topic.name}</p>
        {q.text && <div className="passage">{q.text}</div>}
        <p className="prompt">{q.prompt}</p>

        {q.type === 'number' ? (
          <form
            className="answer"
            onSubmit={(e) => {
              e.preventDefault()
              if (!shown) check(input, rest)
            }}
          >
            <input
              ref={inputRef}
              inputMode="numeric"
              pattern="[0-9]*"
              value={input}
              disabled={!!shown}
              onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))}
              placeholder={q.remainder !== undefined ? 'Cociente' : 'Tu respuesta'}
              aria-label="Respuesta"
            />
            {q.remainder !== undefined && (
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={rest}
                disabled={!!shown}
                onChange={(e) => setRest(e.target.value.replace(/\D/g, ''))}
                placeholder="Resto"
                aria-label="Resto"
              />
            )}
            <button className="btn primary" type="submit" disabled={!!shown || input === ''}>Comprobar</button>
          </form>
        ) : (
          <div className="options">
            {q.options.map((o) => (
              <button key={o} className="btn option" disabled={!!shown} onClick={() => check(o)}>{o}</button>
            ))}
          </div>
        )}

        {shown && (
          <div className={`feedback ${shown.ok ? 'good' : 'bad'}`} role="status">
            <strong>{shown.ok ? '✅ ' : '💡 '}{shown.text}</strong>
            {!shown.ok && (
              <div className="why">
                <p className="given">Tu respuesta: <strong>{shown.given === '' || shown.given == null ? '—' : shown.given}</strong></p>
                {shown.info?.diag && <p>🔎 {shown.info.diag}</p>}
                {shown.info?.why && <p>📘 {shown.info.why}</p>}
                {shown.info?.tip && <p className="tip">💡 {shown.info.tip}</p>}
              </div>
            )}
            <button className="btn primary" onClick={next} autoFocus>
              {idx + 1 < items.length ? 'Siguiente →' : 'Ver resultado'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
