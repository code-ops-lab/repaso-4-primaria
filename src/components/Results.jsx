import React from 'react'
import { SUBJECTS } from '../engine/subjects.js'
import { todayKey, TASK_SIZE } from '../engine/daily.js'
import { lastDays } from '../engine/calendar.js'
import { activeSubjects } from '../engine/active.js'

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const parseDate = (date) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const dayLabel = (date) => cap(parseDate(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))
const shortLabel = (date) => cap(parseDate(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }).replace('.', ''))
const hour = (ts) => new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

// Resultados de la alumna para los padres: por día, con la hora de cada intento,
// si lo superó, los fallos y qué preguntas falló.
// Tabla de los últimos 7 días: mejor nota de cada asignatura, fallos y hora de fin.
function WeekSummary({ state, byDate, completions }) {
  const days = lastDays(7)
  return (
    <div className="week">
      <table>
        <thead>
          <tr>
            <th>Día</th>
            {SUBJECTS.map((s) => <th key={s.id} title={s.name}>{s.emoji}</th>)}
            <th>Fallos</th>
            <th>Terminó</th>
          </tr>
        </thead>
        <tbody>
          {days.map((date) => {
            const list = byDate[date] ?? []
            const fails = list.reduce((n, h) => n + (h.total - h.score), 0)
            return (
              <tr key={date}>
                <td>{shortLabel(date)}</td>
                {SUBJECTS.map((s) => {
                  const tries = list.filter((h) => h.subjectId === s.id)
                  if (!tries.length) return <td key={s.id} className="none">—</td>
                  const best = tries.reduce((a, b) => (b.score > a.score ? b : a))
                  const passed = tries.some((h) => h.passed)
                  return <td key={s.id} className={passed ? 'ok' : 'no'} title={`${best.score} de ${best.total}${passed ? ' · superada' : ' · no superada'}`}>{best.score}</td>
                })}
                <td>{list.length ? fails : '—'}</td>
                <td>{completions[date] ? hour(completions[date]) : list.length ? 'a medias' : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function Results({ state }) {
  const history = state.history ?? []
  const completions = state.completions ?? {}

  const byDate = {}
  history.forEach((h) => (byDate[h.date] ??= []).push(h))
  const dates = Object.keys(byDate).sort().reverse()

  const today = (byDate[todayKey()] ?? []).filter((h) => !h.voided)
  const active = activeSubjects(state)
  const passedToday = active.filter((s) => today.some((h) => h.subjectId === s.id && h.passed)).length
  const failsToday = today.reduce((n, h) => n + (h.total - h.score), 0)

  return (
    <section className="card panel">
      <h2>Resultados de {state.name}</h2>
      <p>
        Hoy: <strong>{passedToday} de {active.length}</strong> tareas superadas · <strong>{failsToday}</strong> fallos en total
        {completions[todayKey()] && <> · terminó todo a las <strong>{hour(completions[todayKey()])}</strong></>}
      </p>

      <h3>Últimos 7 días</h3>
      <WeekSummary state={state} byDate={byDate} completions={completions} />
      <p className="small-note">Nota sobre 10 de cada tarea: <strong>verde</strong> = superada, <strong>rojo</strong> = no superada. 🔢 mates · 📖 lengua · 🍊 valencià · 🇬🇧 inglés · 🌍 medio. «Fallos» suma todos los intentos del día.</p>

      <h3>Detalle por día</h3>
      {dates.length === 0 && <p className="small-note">Todavía no ha hecho ninguna tarea.</p>}

      {dates.map((date) => {
        const list = byDate[date]
        const fails = list.reduce((n, h) => n + (h.total - h.score), 0)
        return (
          <div key={date} className="day">
            <h3>
              {dayLabel(date)}
              {completions[date] && <span className="badge ok">✅ todo completado a las {hour(completions[date])}</span>}
            </h3>
            <p className="small-note">{list.length} intentos · {fails} fallos</p>
            <ul className="attempts">
              {list.map((h) => (
                <li key={h.id}>
                  <details>
                    <summary>
                      <span className="time">{hour(h.ts)}</span>
                      <span className="subj">{h.subject}</span>
                      <span className="sc">{h.score}/{h.total ?? TASK_SIZE}</span>
                      <span className="fails">{h.total - h.score} {h.total - h.score === 1 ? 'fallo' : 'fallos'}</span>
                      <span className={`badge ${h.passed ? 'ok' : 'bad'}`}>{h.passed ? 'Superada' : 'No superada'}</span>
                      {h.voided && <span className="badge">reiniciada</span>}
                    </summary>
                    {h.wrong.length === 0 ? (
                      <p className="small-note">¡Sin fallos!</p>
                    ) : (
                      <ul className="wrong">
                        {h.wrong.map((w, i) => (
                          <li key={i}>
                            <span>{w.prompt}</span>
                            <span>Respondió: <strong>{w.given || '—'}</strong> · Correcta: <strong>{w.correct}</strong></span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
