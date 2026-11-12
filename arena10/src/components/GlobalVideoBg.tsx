// ============================================================
// ARENA 10 — Vidéo d'Arrière-Plan Globale (Faible Opacité)
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Eye } from '@phosphor-icons/react'

export function GlobalVideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [opacity, setOpacity] = useState<number>(0.20) // Faible opacité par défaut (20%)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.9 // Légèrement ralenti pour un rendu cinématique élégant
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      })
    }
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="global-video-bg-container" aria-hidden="true">
      {/* ── Balise Vidéo en boucle et silencieuse ──────────────── */}
      <video
        ref={videoRef}
        className="global-video-element"
        style={{ opacity }}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* ── Masque d'ambiance sombre pour garantir la lisibilité ── */}
      <div className="global-video-overlay" />

      {/* ── Vignette radiale & lueur de stade ───────────────────── */}
      <div className="global-video-vignette" />
    </div>
  )
}

