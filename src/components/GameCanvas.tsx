import { Canvas } from '@react-three/fiber'
import AmeliaCharacter, { type AmeliaAnimation } from './scene/AmeliaCharacter'
import Environment from './scene/Environment'

interface GameCanvasProps {
  animation: AmeliaAnimation
  audioLevel?: number
}

export default function GameCanvas({ animation, audioLevel = 0 }: GameCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 3.2], fov: 50 }}
      dpr={[1, 2]}
      shadows
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 5, 12]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[-3, 6, 4]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[2, 2, 2]} intensity={0.4} color="#ff6b9d" />
      <pointLight position={[-2, 1, 2]} intensity={0.3} color="#667eea" />

      {/* Scene */}
      <AmeliaCharacter animation={animation} audioLevel={audioLevel} />
      <Environment showParticles={animation === 'celebrate'} />
    </Canvas>
  )
}
