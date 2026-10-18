import React, { useEffect, useRef, useState } from 'react'
import Princess from './components/Princess.jsx'
import Task from './components/Task.jsx'
import Reward from './components/Reward.jsx'
import ParentPanel from './components/ParentPanel.jsx'
import { SUBJECTS } from './engine/subjects.js'
import { loadState, saveState, newerFromStorage, STORAGE_KEY } from './engine/storage.js'
import { adjustLevel, stageFor, nextStageAt } from './engine/adaptive.js'
import { freshDaily, todayKey, TASK_SIZE, PASS_MARK } from './engine/daily.js'
import { activeSubjects, extrasOf, simsFor } from './engine/active.js'
import Calendar from './components/Calendar.jsx'
import { APP_VERSION, updateState, onUpdate, applyUpdate } from './pwa.js'

// Si cambió el día, las tareas empiezan de cero (se conservan niveles, días y preguntas dominadas).
function withToday(s) {
  return s.daily?.date === todayKey() ? s : { ...s, daily: freshDaily() }
}

export default function App() {
  const [state, setState] = useState(() => withToday(loadState()))
  const [active, setActive] = useState(null) // asignatura en curso
  const [parents, setParents] = useState(false)
  const [closed, setClosed] = useState(false)

  // Si el estado viene de otro ejemplar de la app (pestaña/app instalada) no se vuelve a guardar,
  // para no provocar un ir y venir de guardados entre las dos.
  const skipSave = useRef(false)
  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    saveState(state)
  }, [state])

  // Cambio de día con la app abierta (tablet que pasa la noche encendida o en segundo plano):
  // se comprueba al volver a la app y también cada 30 segundos.
  useEffect(() => {
    const check = () => {
      const other = newerFromStorage() // ¿guardó algo más nuevo otra ventana de la app?
      if (other) skipSave.current = true
      setState((s) => withToday(other ?? s))
    }
    const onStorage = (e) => (e.key === STORAGE_KEY || e.key === null) && check()
    const onVisible = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    window.addEventListener('online', check)
    window.addEventListener('storage', onStorage)
    document.addEventListener('resume', check)
    const id = setInterval(check, 30 * 1000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
      window.removeEventListener('online', check)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('resume', check)
      clearInterval(id)
    }
  }, [])

  // Versión nueva de la app: se aplica sola al estar en el inicio (nunca en mitad de una tarea).
  const [updateReady, setUpdateReady] = useState(updateState.waiting)
  useEffect(() => onUpdate(() => setUpdateReady(true)), [])
  useEffect(() => {
    if (updateReady && !active && !parents) applyUpdate()
  }, [updateReady, active, parents])

  const daily = state.daily
  // Solo cuentan las asignaturas que tienen algún tema activo (se eligen en la zona de padres).
  const subjects = activeSubjects(state)
  const passedCount = subjects.filter((s) => daily.subjects[s.id]?.passed).length
  const allDone = subjects.length > 0 && passedCount === subjects.length

  // Día nuevo (o tareas sin completar): el cartel de "ya puedes jugar" vuelve a estar disponible.
  useEffect(() => {
    if (!allDone) setClosed(false)
  }, [allDone])

  // Al completar todo, el día cuenta una sola vez.
  useEffect(() => {
    if (allDone && !daily.counted) {
      setState((s) => ({
        ...s,
        daysCompleted: (s.daysCompleted ?? 0) + 1,
        completions: { ...(s.completions ?? {}), [s.daily.date]: Date.now() },
        daily: { ...s.daily, counted: true }
      }))
    }
  }, [allDone, daily.counted])

  const finishTask = (subjectId, score, results, exhausted) => {
    setState((cur) => {
      const s = withToday(cur) // si pasó la medianoche durante la tarea, cuenta para el día nuevo
      const prev = s.daily.subjects[subjectId] ?? { attempts: 0, passed: false, score: 0 }
      const passed = score >= PASS_MARK
      const byTopic = {}
      const mastered = { ...(s.mastered ?? {}) }
      results.forEach((r) => {
        byTopic[r.topicId] ??= { ok: 0, n: 0 }
        byTopic[r.topicId].n++
        if (r.ok) {
          byTopic[r.topicId].ok++
          if (r.id) mastered[r.id] = 1 // pregunta dominada: no vuelve a salir mientras queden otras
        }
      })
      const levels = { ...s.levels }
      Object.entries(byTopic).forEach(([id, { ok, n }]) => {
        levels[id] = adjustLevel(levels[id] ?? 1, ok, n)
      })
      const entry = {
        id: `${Date.now()}-${subjectId}`,
        ts: Date.now(),
        date: s.daily.date,
        subjectId,
        subject: SUBJECTS.find((x) => x.id === subjectId)?.name ?? subjectId,
        score,
        total: TASK_SIZE,
        passed,
        wrong: results.filter((r) => !r.ok).map((r) => ({ prompt: r.prompt, correct: r.correct, given: r.given, ...(r.why ? { why: r.why } : {}) }))
      }
      return {
        ...s,
        levels,
        mastered,
        history: [...(s.history ?? []), entry].slice(-1500),
        daily: {
          ...s.daily,
          subjects: {
            ...s.daily.subjects,
            [subjectId]: {
              attempts: prev.attempts + 1,
              passed: prev.passed || passed,
              score: passed ? score : Math.max(prev.score, score),
              exhausted: exhausted || prev.exhausted
            }
          }
        }
      }
    })
  }

  const reset = () => {
    if (window.confirm('¿Borrar el progreso y empezar de nuevo? (se conservan los paquetes importados y el historial de resultados)')) {
      setState((s) => withToday({ name: s.name, pin: s.pin, packs: s.packs, sims: s.sims, history: s.history, completions: s.completions }))
      setClosed(false)
    }
  }

  // Zona de padres: vuelve a dejar las tareas de hoy como nuevas (el historial se conserva marcado como reiniciado).
  const resetToday = () => {
    if (!window.confirm('¿Reiniciar las tareas de hoy? Podrá hacerlas otra vez desde cero. Los resultados de hoy se conservan en el historial marcados como reiniciados.')) return
    setState((cur) => {
      const s = withToday(cur)
      const wasCounted = s.daily.counted
      const completions = { ...(s.completions ?? {}) }
      if (wasCounted) delete completions[s.daily.date]
      return {
        ...s,
        daysCompleted: Math.max(0, (s.daysCompleted ?? 0) - (wasCounted ? 1 : 0)),
        completions,
        history: (s.history ?? []).map((h) => (h.date === s.daily.date ? { ...h, voided: true } : h)),
        daily: freshDaily()
      }
    })
    setClosed(false)
  }

  // Zona de padres: olvida las preguntas ya acertadas para que puedan volver a salir.
  const resetSeen = () => {
    if (!window.confirm('¿Olvidar las preguntas ya acertadas? Podrán volver a salir en las tareas.')) return
    setState((cur) => {
      const s = withToday(cur)
      const subjects = Object.fromEntries(Object.entries(s.daily.subjects).map(([k, v]) => [k, { ...v, exhausted: false }]))
      return { ...s, mastered: {}, daily: { ...s.daily, subjects } }
    })
  }

  const days = state.daysCompleted ?? 0
  const stage = stageFor(days)
  const goal = nextStageAt(days)

  if (parents) {
    return <ParentPanel state={state} setState={setState} onReset={reset} onResetToday={resetToday} onResetSeen={resetSeen} onClose={() => setParents(false)} />
  }

  if (active) {
    return (
      <Task
        key={active.id}
        subject={active}
        levels={state.levels}
        extras={extrasOf(state, active.id)}
        mastered={state.mastered ?? {}}
        sims={simsFor(state, active.id)}
        disabled={state.disabled ?? {}}
        onFinish={finishTask}
        onExit={() => setActive(null)}
      />
    )
  }

  return (
    <div className="screen">
      <header className="hero card">
        <Princess stage={stage} size={150} />
        <div>
          <h1>¡Hola, {state.name}! 👑</h1>
          <p className="small-note">Hoy es {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p>
            Hoy has superado <strong>{passedCount}</strong> de <strong>{subjects.length}</strong> tareas.
            {!allDone && ' Cuando acabes todas, ¡tendrás una sorpresa!'}
          </p>
          <div className="meter"><div style={{ width: `${subjects.length ? (passedCount / subjects.length) * 100 : 0}%` }} /></div>
          <p className="small-note">
            Días completados: {days}
            {goal ? ` · faltan ${goal - days} para que tu princesa se vista más bonita` : ' · ¡princesa al máximo!'}
          </p>
          <div className="small">
            <button className="btn ghost" onClick={() => setParents(true)}>🔒 Padres</button>
          </div>
        </div>
      </header>

      <h2 className="sectitle">Tareas de hoy</h2>
      <div className="grid">
        {subjects.map((s) => {
          const r = daily.subjects[s.id]
          const passed = r?.passed
          return (
            <button
              key={s.id}
              className={`card tile subject ${passed ? 'passed' : ''}`}
              style={{ '--accent': s.color }}
              disabled={passed}
              onClick={() => setActive(s)}
            >
              <span className="big">{passed ? '✅' : s.emoji}</span>
              <strong>{s.name}</strong>
              <span className="status">
                {passed
                  ? `${r.score}/${TASK_SIZE} · ¡hecha!`
                  : r
                    ? `Mejor: ${r.score}/${TASK_SIZE} · repetir`
                    : `${TASK_SIZE} preguntas`}
              </span>
              {r?.exhausted && <span className="status">📚 Faltan ejercicios nuevos</span>}
            </button>
          )
        })}
      </div>

      <Calendar state={state} subjectCount={subjects.length} />

      <p className="version">Versión {APP_VERSION}</p>

      {allDone && closed && (
        <p className="reopen">
          <button className="btn primary" onClick={() => setClosed(false)}>🎉 Ver mi cartel</button>
        </p>
      )}

      {allDone && !closed && <Reward name={state.name} stage={stage} onClose={() => setClosed(true)} />}
    </div>
  )
}
