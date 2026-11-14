import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PlayerScene, AnimControls, AnimMode } from './Player3D'

export function HeroPlayer() {
  const [animMode, setAnimMode] = useState<AnimMode>('idle')

  return (
    <>
      <div className="player-stage-v2">
        <Canvas camera={{ position: [0, 0.8, 4.2], fov: 42 }} shadows dpr={[1, 1.8]}>
          <PlayerScene animMode={animMode} />
        </Canvas>
      </div>
      <AnimControls current={animMode} onChange={setAnimMode} />
    </>
  )
}
