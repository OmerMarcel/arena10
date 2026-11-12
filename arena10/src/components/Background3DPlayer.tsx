// ============================================================
// ARENA 10 — Joueur 3D en Arrière-Plan de Toutes les Pages
// ============================================================

import { useEffect, useRef, useState } from 'react'

export function Background3DPlayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)

  // Interpolation lissée (LERP) pour une fluidité à 60fps
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 })
  const [opacityLevel, setOpacityLevel] = useState<'normal' | 'focused' | 'subtle'>('normal')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Coordonnées normalisées (-1 à +1)
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      target.current.x = Math.max(-1, Math.min(1, nx))
      target.current.y = Math.max(-1, Math.min(1, ny))
    }

    let rafId: number
    const animate = () => {
      const cur = current.current
      const tgt = target.current

      // Lissage lerp (facteur 0.05 pour un mouvement cinématographique très doux)
      cur.x += (tgt.x - cur.x) * 0.05
      cur.y += (tgt.y - cur.y) * 0.05

      // Rotations 3D
      const targetRotY = cur.x * 12 // Rotation gauche/droite
      const targetRotX = -cur.y * 8  // Inclinaison haut/bas
      cur.rotY += (targetRotY - cur.rotY) * 0.05
      cur.rotX += (targetRotX - cur.rotX) * 0.05

      if (playerRef.current) {
        const transX = cur.x * 24
        const transY = cur.y * 14
        playerRef.current.style.transform = `
          translate3d(${transX}px, ${transY}px, 0px)
          rotateY(${cur.rotY}deg)
          rotateX(${cur.rotX}deg)
        `
      }

      if (lightRef.current) {
        const lx = 50 + cur.x * 25
        const ly = 35 + cur.y * 20
        lightRef.current.style.background = `radial-gradient(circle 500px at ${lx}% ${ly}%, rgba(217, 17, 43, 0.22) 0%, rgba(245, 154, 35, 0.10) 45%, transparent 75%)`
      }

      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`global-3d-bg-container ${opacityLevel}`}
      aria-hidden="true"
    >
      {/* ── Lumière dynamique de stade réactive à la souris ─── */}
      <div ref={lightRef} className="global-3d-light" />

      {/* ── Halos néon aux couleurs rouge et noir du maillot ─ */}
      <div className="global-3d-halo red" />
      <div className="global-3d-halo dark" />

      {/* ── Grille cyber-stade en perspective ───────────────── */}
      <div className="global-3d-perspective-grid" />

      {/* ── Numéro 10 holographique géant ───────────────────── */}
      <div className="global-3d-number">10</div>

      {/* ── Anneaux orbitaux 3D ─────────────────────────────── */}
      <div className="global-3d-ring outer" />
      <div className="global-3d-ring inner" />

      {/* ── Scène du Joueur 3D (T-Pose) ─────────────────────── */}
      <div className="global-3d-player-stage">
        <div ref={playerRef} className="global-3d-player-wrapper">
          {/* Ombre portée au sol sous le ballon et les crampons */}
          <div className="global-3d-ground-shadow" />

          {/* Halo d'aura autour du joueur */}
          <div className="global-3d-player-aura" />

          {/* Image du joueur 3D détourée haute qualité */}
          <img
            src="/player-3d.png"
            alt="Joueur ARENA 10 en 3D"
            className="global-3d-player-img"
            draggable={false}
          />

          {/* Reflet de sol lumineux */}
          <div className="global-3d-floor-reflection" />
        </div>
      </div>
    </div>
  )
}

