import React, { useState } from 'react'
import { SUBJECTS } from '../engine/subjects.js'
import Results from './Results.jsx'
import TopicsPanel from './TopicsPanel.jsx'
import { APP_VERSION, checkForUpdate } from '../pwa.js'
import { parsePack, extrasFor, BASE_PACK } from '../engine/packs.js'
import PdfImport from './PdfImport.jsx'

// Panel de padres: PIN sencillo (evita curiosear, no es seguridad fuerte),
// importación de ejercicios desde archivo JSON, nombre y reinicio.
export default function ParentPanel({ state, setState, onReset, onResetToday, onResetSeen, onClose }) {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [msg, setMsg] = useState(null)
  const packs = state.packs ?? []
  const creating = !state.pin

  const submitPin = (e) => {
    e.preventDefault()
    if (creating) {
      if (!/^\d{4}$/.test(pin)) return setMsg({ bad: true, text: 'El PIN debe tener 4 cifras.' })
      if (pin !== pin2) return setMsg({ bad: true, text: 'Los dos PIN no coinciden.' })
      setState((s) => ({ ...s, pin }))
      setUnlocked(true)
      setMsg(null)
    } else if (pin === state.pin) {
      setUnlocked(true)
      setMsg(null)
    } else {
      setMsg({ bad: true, text: 'PIN incorrecto.' })
      setPin('')
    }
  }

  const importFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 2_000_000) return setMsg({ bad: true, text: 'El archivo es demasiado grande (máximo 2 MB).' })
    const res = parsePack(await file.text())
    if (res.error) return setMsg({ bad: true, text: res.error })
    setState((s) => ({
      ...s,
      // Un paquete con el mismo nombre sustituye al anterior.
      packs: [...(s.packs ?? []).filter((p) => p.name !== res.pack.name), res.pack]
    }))
    setMsg({
      bad: false,
      text: `Añadidas ${res.pack.questions.length} preguntas de «${res.pack.name}».` +
        (res.skipped ? ` Se ignoraron ${res.skipped} inválidas o repetidas.` : '')
    })
  }

  const removePack = (id) => {
    if (window.confirm('¿Quitar este paquete de ejercicios?')) {
      setState((s) => ({ ...s, packs: (s.packs ?? []).filter((p) => p.id !== id) }))
    }
  }

  const rename = () => {
    const n = window.prompt('¿Cómo se llama la alumna?', state.name)
    if (n && n.trim()) setState((s) => ({ ...s, name: n.trim().slice(0, 20) }))
  }

  const [upd, setUpd] = useState(null)
  const searchUpdate = async () => {
    setUpd('Buscando…')
    const r = await checkForUpdate()
    setUpd(
      r === 'offline' ? 'Sin conexión: conéctate a internet para buscar.'
        : r === 'nueva' ? 'Hay una versión nueva. Se instalará al volver al inicio.'
          : 'Ya tienes la última versión.'
    )
  }

  const clearHistory = () => {
    if (window.confirm('¿Borrar todo el historial de resultados? No se puede deshacer.')) {
      setState((s) => ({ ...s, history: [], completions: {} }))
    }
  }

  const changePin = () => {
    const n = window.prompt('Nuevo PIN de 4 cifras')
    if (n && /^\d{4}$/.test(n)) setState((s) => ({ ...s, pin: n }))
    else if (n) setMsg({ bad: true, text: 'El PIN debe tener 4 cifras.' })
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="btn ghost" onClick={onClose}>← Volver</button>
        <div className="title">🔒 Zona de padres</div>
        <span />
      </header>

      {!unlocked ? (
        <form className="card panel" onSubmit={submitPin}>
          <p>{creating ? 'Crea un PIN de 4 cifras para esta zona.' : 'Introduce el PIN.'}</p>
          <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="PIN" aria-label="PIN" autoFocus />
          {creating && (
            <input type="password" inputMode="numeric" maxLength={4} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} placeholder="Repite el PIN" aria-label="Repite el PIN" />
          )}
          <button className="btn primary" type="submit">Entrar</button>
          {msg && <p className="msg bad">{msg.text}</p>}
        </form>
      ) : (
        <>
          <Results state={state} />

          <TopicsPanel state={state} setState={setState} />

          <section className="card panel">
            <h2>Añadir ejercicios</h2>
            <p>Elige un archivo <strong>.json</strong> con ejercicios nuevos (no hace falta internet). El formato está en el README.</p>
            <label className="btn primary filebtn">
              📂 Importar archivo
              <input type="file" accept=".json,application/json" onChange={importFile} hidden />
            </label>
            {msg && <p className={`msg ${msg.bad ? 'bad' : 'ok'}`}>{msg.text}</p>}

            <h3>Paquetes importados</h3>
            <p className="small-note">Incluido en la app: «{BASE_PACK.name}» · {BASE_PACK.questions.length} preguntas.</p>
            {packs.length === 0 && <p className="small-note">Todavía no has importado ninguno.</p>}
            <ul className="packs">
              {packs.map((p) => (
                <li key={p.id}>
                  <span>{p.name} · {p.questions.length} preguntas</span>
                  <button className="btn ghost" onClick={() => removePack(p.id)}>Quitar</button>
                </li>
              ))}
            </ul>

            <h3>Ejercicios extra por asignatura</h3>
            <ul className="packs">
              {SUBJECTS.map((s) => (
                <li key={s.id}>
                  <span>{s.emoji} {s.name}</span>
                  <strong>{extrasFor([BASE_PACK, ...packs], s.id).length}</strong>
                </li>
              ))}
            </ul>
          </section>

          <PdfImport state={state} setState={setState} />

          <section className="card panel">
            <h2>Reiniciar ejercicios</h2>
            <div className="actions">
              <button className="btn" onClick={onResetToday}>🔁 Reiniciar las tareas de hoy</button>
              <button className="btn" onClick={onResetSeen}>🧹 Olvidar preguntas ya acertadas</button>
            </div>
            <p className="small-note">
              «Reiniciar las tareas de hoy» deja las 5 tareas como nuevas para que las repita (los resultados de hoy se conservan en el historial,
              marcados como reiniciados). «Olvidar preguntas ya acertadas» permite que vuelvan a salir preguntas que ya acertó.
            </p>
          </section>

          <section className="card panel">
            <h2>Ajustes</h2>
            <div className="actions">
              <button className="btn" onClick={rename}>✏️ Cambiar nombre ({state.name})</button>
              <button className="btn" onClick={changePin}>🔑 Cambiar PIN</button>
              <button className="btn" onClick={clearHistory}>🗑️ Borrar historial</button>
              <button className="btn" onClick={onReset}>🔄 Reiniciar progreso</button>
              <button className="btn" onClick={searchUpdate}>⬇️ Buscar actualización</button>
            </div>
            {upd && <p className="msg ok">{upd}</p>}
            <p className="small-note">Versión de la app: {APP_VERSION}</p>
          </section>
        </>
      )}
    </div>
  )
}
