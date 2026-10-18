import React from 'react'
import Princess from './Princess.jsx'

// Cartel final: solo aparece cuando TODAS las tareas del día están superadas.
export default function Reward({ name, stage, onClose }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Tareas terminadas">
      <div className="sign">
        <div className="confetti" aria-hidden="true">🎉 ✨ 🎊 ✨ 🎉</div>
        <Princess stage={stage} size={150} sparkle />
        <h1>¡Ya puedes jugar, {name}!</h1>
        <p className="callmom">📣 Avisa a mamá</p>
        <button className="btn primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}
