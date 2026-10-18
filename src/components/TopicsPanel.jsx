import React from 'react'
import { SUBJECTS } from '../engine/subjects.js'
import { subjectTopics } from '../engine/active.js'

// Zona de padres: elegir qué temas está dando el niño o la niña. Los desactivados no salen en las tareas.
export default function TopicsPanel({ state, setState }) {
  const disabled = state.disabled ?? {}

  const setMany = (ids, on) =>
    setState((s) => {
      const d = { ...(s.disabled ?? {}) }
      ids.forEach((id) => {
        if (on) delete d[id]
        else d[id] = true
      })
      return { ...s, disabled: d }
    })

  return (
    <section className="card panel">
      <h2>Temas que está dando</h2>
      <p>
        Desactiva lo que <strong>todavía no ha dado en clase</strong>: no le saldrán preguntas de esos temas. Puedes activarlos cuando
        los empiece. Si desactivas todos los temas de una asignatura, esa asignatura desaparece de sus tareas.
      </p>

      {SUBJECTS.map((s) => {
        const topics = subjectTopics(state, s)
        const on = topics.filter((t) => !disabled[t.id]).length
        const ids = topics.map((t) => t.id)
        return (
          <details key={s.id} className="topics">
            <summary>
              <span className="tname">{s.emoji} {s.full ?? s.name}</span>
              <span className={`badge ${on ? 'ok' : 'bad'}`}>{on} de {topics.length} activos</span>
            </summary>
            {topics.length === 0 ? (
              <p className="small-note">Esta asignatura aún no tiene preguntas. Importa un paquete o un PDF.</p>
            ) : (
              <>
                <div className="actions">
                  <button className="btn ghost" onClick={() => setMany(ids, true)}>Activar todos</button>
                  <button className="btn ghost" onClick={() => setMany(ids, false)}>Desactivar todos</button>
                </div>
                <ul className="toplist">
                  {topics.map((t) => (
                    <li key={t.id}>
                      <label>
                        <input type="checkbox" checked={!disabled[t.id]} onChange={(e) => setMany([t.id], e.target.checked)} />
                        <span className="ttitle">{t.emoji} {t.name}</span>
                        <span className="small-note">{t.count ? `${t.count} preguntas` : t.sim ? 'del PDF' : 'sin límite'}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </details>
        )
      })}
    </section>
  )
}
