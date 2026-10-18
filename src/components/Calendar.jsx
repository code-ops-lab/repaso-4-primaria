import React, { useState } from 'react'
import { SUBJECTS } from '../engine/subjects.js'
import { dayStatus, keyOf, streak } from '../engine/calendar.js'

const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// Calendario del mes: los días con todas las tareas hechas aparecen tachados con un ✔.
export default function Calendar({ state, subjectCount = SUBJECTS.length }) {
  const [offset, setOffset] = useState(0) // meses respecto al actual
  const days = dayStatus(state, subjectCount)

  const today = new Date()
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // la semana empieza en lunes
  const todayKey = keyOf(today)
  const raw = first.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const title = raw.charAt(0).toUpperCase() + raw.slice(1)

  const cells = []
  for (let i = 0; i < lead; i++) cells.push(<span key={`b${i}`} className="cal-cell blank" />)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = keyOf(new Date(first.getFullYear(), first.getMonth(), d))
    const st = days[key]
    const cls = ['cal-cell']
    if (key === todayKey) cls.push('today')
    if (st?.all) cls.push('all')
    else if (st?.passed.size) cls.push('some')
    cells.push(
      <span
        key={key}
        className={cls.join(' ')}
        title={st?.all ? 'Todas las tareas hechas' : st?.passed.size ? `${st.passed.size} de ${subjectCount} tareas` : ''}
      >
        <span className="num">{d}</span>
        {st?.all && <span className="stamp" aria-label="Todas las tareas hechas">✔</span>}
        {!st?.all && st?.passed.size > 0 && <span className="dots">{'•'.repeat(st.passed.size)}</span>}
      </span>
    )
  }

  const run = streak(days)

  return (
    <section className="card calendar" aria-label="Calendario de tareas">
      <div className="cal-head">
        <button className="btn ghost" onClick={() => setOffset((o) => o - 1)} aria-label="Mes anterior">‹</button>
        <h2>{title}</h2>
        <button className="btn ghost" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0} aria-label="Mes siguiente">›</button>
      </div>
      <div className="cal-grid">
        {WEEK.map((w) => <span key={w} className="cal-dow">{w}</span>)}
        {cells}
      </div>
      <p className="small-note">
        ✔ todas las tareas hechas · • tareas sueltas
        {run > 0 && <> · 🔥 racha de <strong>{run}</strong> {run === 1 ? 'día' : 'días'}</>}
      </p>
    </section>
  )
}
