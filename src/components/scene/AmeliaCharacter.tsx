import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type AmeliaAnimation = 'idle' | 'chant' | 'celebrate' | 'error'

interface AmeliaCharacterProps {
  animation: AmeliaAnimation
  audioLevel?: number // 0-1, for lip sync during chant
}

export default function AmeliaCharacter({ animation, audioLevel = 0 }: AmeliaCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const mouthRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const leftEyeRef = useRef<THREE.Mesh>(null)
  const rightEyeRef = useRef<THREE.Mesh>(null)

  // Animation state
  const stateRef = useRef({
    blinkTimer: 0,
    celebrateTimer: 0,
    errorTimer: 0,
    isBlinking: false,
  })

  // Materials
  const skinMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffd9b3', roughness: 0.6 }),
    []
  )
  const hairMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.8 }),
    []
  )
  const dressMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ff6b9d', roughness: 0.5 }),
    []
  )
  const eyeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2c1810' }),
    []
  )
  const mouthMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#c44569' }),
    []
  )

  useFrame((_, delta) => {
    const s = stateRef.current
    const group = groupRef.current
    const head = headRef.current
    const mouth = mouthRef.current
    const leftArm = leftArmRef.current
    const rightArm = rightArmRef.current
    if (!group || !head) return

    const t = performance.now() / 1000

    // --- IDLE: breathing + head bob + blink ---
    if (animation === 'idle' || animation === 'chant') {
      // Breathing
      group.scale.y = 1 + Math.sin(t * 1.5) * 0.02
      // Head bob
      head.position.y = 1.05 + Math.sin(t * 1.5) * 0.02
      // Subtle sway
      group.rotation.z = Math.sin(t * 0.8) * 0.02
    }

    // --- Blink ---
    s.blinkTimer += delta
    if (s.blinkTimer > 3 + Math.random() * 2) {
      s.isBlinking = true
      s.blinkTimer = 0
    }
    if (s.isBlinking) {
      const blinkScale = Math.max(0.1, 1 - (0.15 - (s.blinkTimer % 0.15)) / 0.15)
      if (leftEyeRef.current) leftEyeRef.current.scale.y = blinkScale
      if (rightEyeRef.current) rightEyeRef.current.scale.y = blinkScale
      if (s.blinkTimer > 0.15) {
        s.isBlinking = false
        if (leftEyeRef.current) leftEyeRef.current.scale.y = 1
        if (rightEyeRef.current) rightEyeRef.current.scale.y = 1
      }
    }

    // --- CHANT: mouth movement synced to audio ---
    if (animation === 'chant' && mouth) {
      const mouthOpen = 0.3 + audioLevel * 0.7
      mouth.scale.y = mouthOpen
      mouth.scale.x = 1 + audioLevel * 0.3
    } else if (mouth) {
      mouth.scale.y = THREE.MathUtils.lerp(mouth.scale.y, 0.3, 0.2)
      mouth.scale.x = THREE.MathUtils.lerp(mouth.scale.x, 1, 0.2)
    }

    // --- CELEBRATE: jump + spin + arms up ---
    if (animation === 'celebrate') {
      s.celebrateTimer += delta
      const progress = Math.min(s.celebrateTimer / 1.5, 1)
      // Jump (parabolic)
      const jumpHeight = Math.sin(progress * Math.PI) * 0.5
      group.position.y = jumpHeight
      // Spin
      group.rotation.y = progress * Math.PI * 2
      // Arms up
      if (leftArm) leftArm.rotation.z = THREE.MathUtils.lerp(0.3, 2.5, Math.sin(progress * Math.PI))
      if (rightArm) rightArm.rotation.z = THREE.MathUtils.lerp(-0.3, -2.5, Math.sin(progress * Math.PI))
    } else {
      s.celebrateTimer = 0
      group.position.y = THREE.MathUtils.lerp(group.position.y, 0, 0.15)
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, 0, 0.1)
      if (leftArm) leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0.3, 0.1)
      if (rightArm) rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.3, 0.1)
    }

    // --- ERROR: head shake ---
    if (animation === 'error') {
      s.errorTimer += delta
      head.rotation.z = Math.sin(s.errorTimer * 18) * 0.25
      if (s.errorTimer > 0.9) s.errorTimer = 0
    } else {
      s.errorTimer = 0
      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, 0.2)
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.05, 0]} material={skinMaterial}>
        <sphereGeometry args={[0.35, 32, 32]} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.25, -0.02]} material={hairMaterial}>
        <sphereGeometry args={[0.38, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      </mesh>

      {/* Hair side buns */}
      <mesh position={[-0.32, 1.1, 0]} material={hairMaterial}>
        <sphereGeometry args={[0.12, 16, 16]} />
      </mesh>
      <mesh position={[0.32, 1.1, 0]} material={hairMaterial}>
        <sphereGeometry args={[0.12, 16, 16]} />
      </mesh>

      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.12, 1.08, 0.3]} material={eyeMaterial}>
        <sphereGeometry args={[0.05, 16, 16]} />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.12, 1.08, 0.3]} material={eyeMaterial}>
        <sphereGeometry args={[0.05, 16, 16]} />
      </mesh>

      {/* Cheeks (blush) */}
      <mesh position={[-0.2, 0.98, 0.28]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff9eb5" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.2, 0.98, 0.28]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff9eb5" transparent opacity={0.6} />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, 0.92, 0.32]} material={mouthMaterial}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </mesh>

      {/* Body (dress) */}
      <mesh position={[0, 0.45, 0]} material={dressMaterial}>
        <coneGeometry args={[0.4, 0.8, 32]} />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.3, 0.6, 0]} rotation={[0, 0, 0.3]} material={skinMaterial}>
        <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.3, 0.6, 0]} rotation={[0, 0, -0.3]} material={skinMaterial}>
        <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.12, 0.0, 0]} material={skinMaterial}>
        <capsuleGeometry args={[0.07, 0.3, 8, 16]} />
      </mesh>
      <mesh position={[0.12, 0.0, 0]} material={skinMaterial}>
        <capsuleGeometry args={[0.07, 0.3, 8, 16]} />
      </mesh>
    </group>
  )
}
