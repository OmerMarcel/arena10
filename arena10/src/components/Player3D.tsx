// ============================================================
// ARENA 10 — Joueur 3D Humanöide animé
// Maillot blanc/rouge/orange · Animations : idle, jonglage, course, frappe, célébration
// ============================================================

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, ContactShadows, Environment, OrbitControls, Trail } from '@react-three/drei'
import * as THREE from 'three'

type AnimMode = 'idle' | 'juggle' | 'run' | 'kick' | 'celebrate'

// Groupe de refs pour faciliter l'animation
function usePlayerRefs() {
  return {
    root:         useRef<THREE.Group>(null),
    torso:        useRef<THREE.Mesh>(null),
    head:         useRef<THREE.Group>(null),
    lArm:         useRef<THREE.Group>(null),
    rArm:         useRef<THREE.Group>(null),
    lLeg:         useRef<THREE.Group>(null),
    rLeg:         useRef<THREE.Group>(null),
    lFoot:        useRef<THREE.Mesh>(null),
    rFoot:        useRef<THREE.Mesh>(null),
    ball:         useRef<THREE.Group>(null),
  }
}

// Lerp utilitaire
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

// ---- Corps du joueur -------------------------------------------
function PlayerBody({ refs, anim, t }: { refs: ReturnType<typeof usePlayerRefs>; anim: AnimMode; t: number }) {
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const r = refs

    if (!r.root.current) return

    const spd = delta * 6

    // === IDLE : légère respiration et oscillation ===
    if (anim === 'idle') {
      r.root.current.rotation.y = lerp(r.root.current.rotation.y, Math.sin(time * 0.3) * 0.15, spd)
      r.root.current.position.y = lerp(r.root.current.position.y, Math.sin(time * 1.5) * 0.025 - 0.5, spd)
      if (r.lArm.current) r.lArm.current.rotation.x = lerp(r.lArm.current.rotation.x, Math.sin(time * 1.5) * 0.08 - 0.1, spd)
      if (r.rArm.current) r.rArm.current.rotation.x = lerp(r.rArm.current.rotation.x, -Math.sin(time * 1.5) * 0.08 - 0.1, spd)
      if (r.lLeg.current) r.lLeg.current.rotation.x = lerp(r.lLeg.current.rotation.x, 0, spd)
      if (r.rLeg.current) r.rLeg.current.rotation.x = lerp(r.rLeg.current.rotation.x, 0, spd)
      if (r.head.current) r.head.current.rotation.y = lerp(r.head.current.rotation.y, Math.sin(time * 0.4) * 0.12, spd)
      if (r.ball.current) {
        r.ball.current.position.set(lerp(r.ball.current.position.x, 0.5, spd), lerp(r.ball.current.position.y, -0.95, spd), lerp(r.ball.current.position.z, 0.3, spd))
        r.ball.current.rotation.y += delta * 0.3
      }
    }

    // === JONGLAGE ===
    if (anim === 'juggle') {
      const phase = (time * 2.0) % (Math.PI * 2)
      const ballY = Math.abs(Math.sin(phase)) * 0.8 - 0.3
      const kickLeg = Math.sin(phase) > 0

      r.root.current.rotation.y = lerp(r.root.current.rotation.y, Math.sin(time * 0.5) * 0.2, spd)
      r.root.current.position.y = lerp(r.root.current.position.y, -0.5, spd)

      if (r.lLeg.current) {
        const lKick = kickLeg ? Math.max(0, Math.sin(phase) * 0.8) : 0
        r.lLeg.current.rotation.x = lerp(r.lLeg.current.rotation.x, lKick, spd * 1.5)
      }
      if (r.rLeg.current) {
        const rKick = !kickLeg ? Math.max(0, Math.sin(phase) * 0.8) : 0
        r.rLeg.current.rotation.x = lerp(r.rLeg.current.rotation.x, rKick, spd * 1.5)
      }
      if (r.lArm.current) r.lArm.current.rotation.z = lerp(r.lArm.current.rotation.z, 0.4 + Math.sin(time * 2) * 0.2, spd)
      if (r.rArm.current) r.rArm.current.rotation.z = lerp(r.rArm.current.rotation.z, -0.4 - Math.sin(time * 2) * 0.2, spd)
      if (r.head.current) r.head.current.rotation.x = lerp(r.head.current.rotation.x, -0.25, spd)
      if (r.ball.current) {
        r.ball.current.position.set(0, lerp(r.ball.current.position.y, ballY, spd * 2), 0.5)
        r.ball.current.rotation.x += delta * 4
        r.ball.current.rotation.z += delta * 2
      }
    }

    // === COURSE ===
    if (anim === 'run') {
      const phase = time * 3.5
      r.root.current.position.y = lerp(r.root.current.position.y, Math.abs(Math.sin(phase)) * 0.07 - 0.5, spd)
      r.root.current.rotation.y = lerp(r.root.current.rotation.y, 0, spd)
      if (r.lLeg.current) r.lLeg.current.rotation.x = lerp(r.lLeg.current.rotation.x, Math.sin(phase) * 0.95, spd)
      if (r.rLeg.current) r.rLeg.current.rotation.x = lerp(r.rLeg.current.rotation.x, -Math.sin(phase) * 0.95, spd)
      if (r.lArm.current) {
        r.lArm.current.rotation.x = lerp(r.lArm.current.rotation.x, -Math.sin(phase) * 0.7, spd)
        r.lArm.current.rotation.z = lerp(r.lArm.current.rotation.z, 0.15, spd)
      }
      if (r.rArm.current) {
        r.rArm.current.rotation.x = lerp(r.rArm.current.rotation.x, Math.sin(phase) * 0.7, spd)
        r.rArm.current.rotation.z = lerp(r.rArm.current.rotation.z, -0.15, spd)
      }
      if (r.torso.current) r.torso.current.rotation.x = lerp(r.torso.current.rotation.x, -0.15, spd)
      if (r.head.current) r.head.current.rotation.x = lerp(r.head.current.rotation.x, 0.1, spd)
      if (r.ball.current) {
        r.ball.current.position.set(0.8, -0.9, 0.5 + Math.sin(phase * 0.5) * 0.3)
        r.ball.current.rotation.x += delta * 6
      }
    }

    // === FRAPPE ===
    if (anim === 'kick') {
      const phase = (time * 1.8) % (Math.PI * 2)
      const swing = Math.sin(phase)
      r.root.current.position.y = lerp(r.root.current.position.y, -0.5, spd)
      r.root.current.rotation.y = lerp(r.root.current.rotation.y, -0.3, spd)
      if (r.rLeg.current) r.rLeg.current.rotation.x = lerp(r.rLeg.current.rotation.x, swing > 0 ? swing * 1.4 : 0.1, spd)
      if (r.lLeg.current) r.lLeg.current.rotation.x = lerp(r.lLeg.current.rotation.x, swing > 0 ? -0.15 : 0, spd)
      if (r.lArm.current) {
        r.lArm.current.rotation.x = lerp(r.lArm.current.rotation.x, -0.6, spd)
        r.lArm.current.rotation.z = lerp(r.lArm.current.rotation.z, 0.5, spd)
      }
      if (r.rArm.current) {
        r.rArm.current.rotation.x = lerp(r.rArm.current.rotation.x, 0.3, spd)
        r.rArm.current.rotation.z = lerp(r.rArm.current.rotation.z, -0.3, spd)
      }
      if (r.torso.current) r.torso.current.rotation.z = lerp(r.torso.current.rotation.z, swing * 0.15, spd)
      if (r.head.current) r.head.current.rotation.y = lerp(r.head.current.rotation.y, -0.2, spd)
      if (r.ball.current) {
        const bx = swing > 0.5 ? lerp(0, 1.5, (swing - 0.5) * 2) : 0
        r.ball.current.position.set(bx, -0.6 + Math.max(0, swing - 0.5) * 0.8, 0.6)
        r.ball.current.rotation.x += delta * (swing > 0.5 ? 10 : 2)
      }
    }

    // === CÉLÉBRATION ===
    if (anim === 'celebrate') {
      const phase = time * 2.5
      r.root.current.position.y = lerp(r.root.current.position.y, Math.abs(Math.sin(phase * 0.8)) * 0.15 - 0.4, spd)
      r.root.current.rotation.y += delta * 1.2
      if (r.lArm.current) {
        r.lArm.current.rotation.x = lerp(r.lArm.current.rotation.x, -2.0 + Math.sin(phase) * 0.3, spd)
        r.lArm.current.rotation.z = lerp(r.lArm.current.rotation.z, 0.4, spd)
      }
      if (r.rArm.current) {
        r.rArm.current.rotation.x = lerp(r.rArm.current.rotation.x, -2.0 + Math.sin(phase + 0.5) * 0.3, spd)
        r.rArm.current.rotation.z = lerp(r.rArm.current.rotation.z, -0.4, spd)
      }
      if (r.lLeg.current) r.lLeg.current.rotation.x = lerp(r.lLeg.current.rotation.x, Math.sin(phase) * 0.4, spd)
      if (r.rLeg.current) r.rLeg.current.rotation.x = lerp(r.rLeg.current.rotation.x, -Math.sin(phase) * 0.4, spd)
      if (r.head.current) {
        r.head.current.rotation.x = lerp(r.head.current.rotation.x, -0.4, spd)
        r.head.current.rotation.y = lerp(r.head.current.rotation.y, Math.sin(phase * 0.5) * 0.3, spd)
      }
      if (r.ball.current) {
        r.ball.current.position.y = lerp(r.ball.current.position.y, 1.2 + Math.sin(phase) * 0.3, spd)
        r.ball.current.rotation.x += delta * 3
      }
    }
  })

  return (
    <group ref={refs.root} position={[0, -0.5, 0]}>
      {/* Jambe gauche */}
      <group ref={refs.lLeg} position={[-0.19, 0.78, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.52, 6, 12]} />
          <meshStandardMaterial color="#f4f5f7" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.62, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.42, 6, 12]} />
          <meshStandardMaterial color="#c5b8a8" roughness={0.7} />
        </mesh>
        {/* Chaussure */}
        <mesh ref={refs.lFoot} position={[0, -0.9, 0.1]} castShadow>
          <boxGeometry args={[0.21, 0.1, 0.4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>

      {/* Jambe droite */}
      <group ref={refs.rLeg} position={[0.19, 0.78, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.52, 6, 12]} />
          <meshStandardMaterial color="#f4f5f7" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.62, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.42, 6, 12]} />
          <meshStandardMaterial color="#c5b8a8" roughness={0.7} />
        </mesh>
        <mesh ref={refs.rFoot} position={[0, -0.9, 0.1]} castShadow>
          <boxGeometry args={[0.21, 0.1, 0.4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>

      {/* Torse - maillot blanc */}
      <mesh ref={refs.torso} position={[0, 1.3, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.65, 8, 16]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
      </mesh>
      {/* Bande rouge horizontale */}
      <mesh position={[0, 1.28, 0.025]}>
        <boxGeometry args={[0.73, 0.14, 0.44]} />
        <meshStandardMaterial color="#d9112b" roughness={0.5} />
      </mesh>
      {/* Numéro 10 - bande orange */}
      <mesh position={[0, 1.08, 0.37]}>
        <planeGeometry args={[0.26, 0.28]} />
        <meshStandardMaterial color="#f59a23" roughness={0.5} />
      </mesh>
      {/* Sponsor - bande orange côté gauche */}
      <mesh position={[-0.26, 1.35, 0.3]}>
        <boxGeometry args={[0.11, 0.56, 0.02]} />
        <meshStandardMaterial color="#f59a23" roughness={0.5} />
      </mesh>
      {/* Sponsor rouge côté droit */}
      <mesh position={[0.26, 1.35, 0.3]}>
        <boxGeometry args={[0.11, 0.56, 0.02]} />
        <meshStandardMaterial color="#d9112b" roughness={0.5} />
      </mesh>

      {/* Short blanc */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.18, 6, 12]} />
        <meshStandardMaterial color="#efefef" roughness={0.65} />
      </mesh>
      {/* Liseré orange sur short */}
      <mesh position={[0, 0.82, 0]}>
        <torusGeometry args={[0.35, 0.025, 6, 32]} />
        <meshStandardMaterial color="#f59a23" roughness={0.4} />
      </mesh>

      {/* Bras gauche */}
      <group ref={refs.lArm} position={[-0.44, 1.5, 0]} rotation={[0, 0, 0.18]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.095, 0.5, 6, 12]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
        </mesh>
        {/* Bande rouge manchette */}
        <mesh position={[0, -0.52, 0]}>
          <capsuleGeometry args={[0.095, 0.3, 6, 12]} />
          <meshStandardMaterial color="#c5b8a8" roughness={0.7} />
        </mesh>
      </group>

      {/* Bras droit */}
      <group ref={refs.rArm} position={[0.44, 1.5, 0]} rotation={[0, 0, -0.18]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.095, 0.5, 6, 12]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.52, 0]}>
          <capsuleGeometry args={[0.095, 0.3, 6, 12]} />
          <meshStandardMaterial color="#c5b8a8" roughness={0.7} />
        </mesh>
      </group>

      {/* Tête */}
      <group ref={refs.head} position={[0, 2.4, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.26, 32, 32]} />
          <meshStandardMaterial color="#c5b8a8" roughness={0.65} />
        </mesh>
        {/* Cheveux courts */}
        <mesh position={[0, 0.14, -0.02]}>
          <sphereGeometry args={[0.265, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.46]} />
          <meshStandardMaterial color="#1a0e0a" roughness={1} />
        </mesh>
        {/* Yeux */}
        <mesh position={[-0.1, 0.02, 0.24]}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.1, 0.02, 0.24]}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </group>
  )
}

// ---- Ballon animé séparé ----------------------------------------
function AnimatedBall({ ballRef }: { ballRef: React.RefObject<THREE.Group> }) {
  return (
    <group ref={ballRef} position={[0.5, -0.95, 0.3]}>
      <Trail width={0.8} length={4} color="#f59a23" attenuation={(t) => t * t}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshStandardMaterial color="#f7f7f4" roughness={0.3} />
        </mesh>
      </Trail>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 1.256) * 0.09,
            Math.cos(i * 1.256) * 0.09,
            0.1,
          ]}
          rotation={[0, 0, i * 0.4]}
        >
          <circleGeometry args={[0.038, 5]} />
          <meshStandardMaterial color={i % 2 ? '#d9112b' : '#0b1b3a'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ---- Terrain minimal -------------------------------------------
function Pitch() {
  return (
    <>
      {/* Sol gazon */}
      <mesh position={[0, -1.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#173c31" roughness={0.95} />
      </mesh>
      {/* Lignes de terrain */}
      <mesh position={[0, -1.4, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.24, 48]} />
        <meshBasicMaterial color="#a5c9a0" opacity={0.4} transparent />
      </mesh>
      <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.5, 0.025]} />
        <meshBasicMaterial color="#a5c9a0" opacity={0.4} transparent />
      </mesh>
      {/* Lumières stade */}
      <mesh position={[-3, 1, -4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#fffde7" />
      </mesh>
      <mesh position={[3, 1, -4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#fffde7" />
      </mesh>
    </>
  )
}

// ---- Scene principale 3D ----------------------------------------
export function PlayerScene({ animMode }: { animMode?: AnimMode }) {
  const refs = usePlayerRefs()
  const [anim, setAnim] = useState<AnimMode>(animMode || 'idle')

  useEffect(() => {
    if (animMode) setAnim(animMode)
  }, [animMode])

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 7, 5]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-3, 3, 2]} intensity={1.8} color="#f59a23" />
      <pointLight position={[3, 2, -1]} intensity={0.8} color="#d9112b" />

      <Float speed={anim === 'idle' ? 1.0 : 0} rotationIntensity={anim === 'idle' ? 0.04 : 0} floatIntensity={anim === 'idle' ? 0.06 : 0}>
        <PlayerBody refs={refs} anim={anim} t={0} />
        <AnimatedBall ballRef={refs.ball as React.RefObject<THREE.Group>} />
      </Float>

      <Pitch />
      <ContactShadows position={[0, -1.4, 0]} opacity={0.55} scale={6} blur={2.5} />
      <Environment preset="city" />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.05} maxPolarAngle={1.75} />

      {/* Boutons animation */}
      {/* Rendu dans le DOM via le composant parent */}
    </>
  )
}

// ---- Contrôles animation (DOM) ---------------------------------
export function AnimControls({ current, onChange }: { current: AnimMode; onChange: (a: AnimMode) => void }) {
  const anims: { key: AnimMode; label: string; icon: string }[] = [
    { key: 'idle',      label: 'Repos',       icon: '🧍' },
    { key: 'juggle',    label: 'Jonglage',    icon: '⚽' },
    { key: 'run',       label: 'Course',      icon: '🏃' },
    { key: 'kick',      label: 'Frappe',      icon: '🦵' },
    { key: 'celebrate', label: 'Célébration', icon: '🎉' },
  ]
  return (
    <div className="anim-controls">
      {anims.map((a) => (
        <button
          key={a.key}
          className={`anim-btn${current === a.key ? ' active' : ''}`}
          onClick={() => onChange(a.key)}
          title={a.label}
        >
          <span>{a.icon}</span>
          <small>{a.label}</small>
        </button>
      ))}
    </div>
  )
}

export type { AnimMode }

