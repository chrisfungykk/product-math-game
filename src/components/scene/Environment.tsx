import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface EnvironmentProps {
  showParticles: boolean
}

const PARTICLE_COUNT = 60

export default function Environment({ showParticles }: EnvironmentProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const lifeRef = useRef(0)

  // Generate particle positions and velocities
  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const palette = [
      [1.0, 0.42, 0.62], // pink
      [1.0, 0.84, 0.0], // gold
      [0.4, 0.78, 1.0], // sky
      [0.66, 0.55, 0.98], // purple
    ]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.4
      positions[i * 3 + 1] = 0.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4

      velocities[i * 3] = (Math.random() - 0.5) * 2
      velocities[i * 3 + 1] = Math.random() * 3 + 1
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = c[0]
      colors[i * 3 + 1] = c[1]
      colors[i * 3 + 2] = c[2]
    }

    return { positions, velocities, colors }
  }, [])

  useFrame((_, delta) => {
    const points = particlesRef.current
    if (!points) return

    if (showParticles) {
      lifeRef.current += delta
      const posAttr = points.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        arr[i * 3] += velocities[i * 3] * delta
        arr[i * 3 + 1] += (velocities[i * 3 + 1] - lifeRef.current * 2) * delta
        arr[i * 3 + 2] += velocities[i * 3 + 2] * delta
      }
      posAttr.needsUpdate = true
      points.visible = lifeRef.current < 2
    } else {
      // Reset particles
      lifeRef.current = 0
      const posAttr = points.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 0.4
        arr[i * 3 + 1] = 0.5
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.4
      }
      posAttr.needsUpdate = true
      points.visible = false
    }
  })

  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#2d2d44" roughness={0.8} />
      </mesh>

      {/* Floor ring accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
        <ringGeometry args={[1.0, 1.1, 64]} />
        <meshStandardMaterial color="#667eea" emissive="#667eea" emissiveIntensity={0.3} />
      </mesh>

      {/* Celebration particles */}
      <points ref={particlesRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={PARTICLE_COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} />
      </points>
    </>
  )
}
