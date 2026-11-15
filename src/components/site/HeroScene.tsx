'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import * as THREE from 'three';

/** Colors taken from the welcome screen: blue glow on #050a18 (dark), indigo on #f1f5f9 (light). */
const PALETTE = {
  dark: { main: '#3b82f6', deep: '#2563eb', soft: '#96c8ff', particles: '#64b4ff' },
  // Lighter sphere in the light theme, so the dark text on top stays readable.
  light: { main: '#a5b4fc', deep: '#818cf8', soft: '#c7d2fe', particles: '#6366f1' },
} as const;

type Palette = (typeof PALETTE)[keyof typeof PALETTE];

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function useIsDark() {
  return useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains('dark'),
    () => true,
  );
}

const PARTICLE_COUNT = 1000;

/** Deterministic pseudo-random (mulberry32), so the particle field is pure and identical on every render. */
function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function AnimatedShape({ colors }: { colors: Palette }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const random = seededRandom(20261115);
    for (let i = 0; i < positions.length; i++) positions[i] = (random() - 0.5) * 10;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useEffect(() => () => particles.dispose(), [particles]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
    if (particlesRef.current) particlesRef.current.rotation.y = time * 0.05;
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={meshRef} args={[1.5, 100, 100]} scale={1.5}>
          <MeshDistortMaterial
            color={colors.main}
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive={colors.main}
            emissiveIntensity={0.5}
          />
        </Sphere>
      </Float>

      <points ref={particlesRef} geometry={particles}>
        <pointsMaterial size={0.015} color={colors.particles} transparent opacity={0.6} sizeAttenuation />
      </points>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[0, 0, -2]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2, 0.05, 16, 100]} />
          <meshStandardMaterial color={colors.deep} emissive={colors.deep} emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.7}>
        <mesh position={[0, 0, -1]} rotation={[0, Math.PI / 3, 0]}>
          <torusGeometry args={[2.5, 0.03, 16, 100]} />
          <meshStandardMaterial color={colors.soft} emissive={colors.soft} emissiveIntensity={0.2} metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={colors.main} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
      <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={1} color={colors.main} />
    </group>
  );
}

/** Tilts the whole scene toward the cursor (up to 0.3 rad), like the reference. */
function MouseTilt({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = state.pointer.y * 0.3;
    groupRef.current.rotation.y = state.pointer.x * 0.3;
  });
  return <group ref={groupRef}>{children}</group>;
}

/**
 * Fixed 3D background for the hero. The parent section clips it (clip-path), so it stays still while
 * the hero scrolls away and the next section covers it. Rendering pauses while the hero is off screen.
 */
export default function HeroScene({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const isDark = useIsDark();
  const [visible, setVisible] = useState(true);
  const [eventSource, setEventSource] = useState<HTMLElement | undefined>(undefined);

  useEffect(() => {
    // Track the pointer over the whole page (the canvas itself ignores pointer events).
    const frame = requestAnimationFrame(() => setEventSource(document.body));
    const el = containerRef.current;
    if (!el) return () => cancelAnimationFrame(frame);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [containerRef]);

  if (!eventSource) return null;

  return (
    <div className="pointer-events-none fixed inset-0 h-screen w-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        frameloop={visible ? 'always' : 'never'}
        eventSource={eventSource}
        eventPrefix="client"
      >
        <MouseTilt>
          <AnimatedShape colors={isDark ? PALETTE.dark : PALETTE.light} />
        </MouseTilt>
      </Canvas>
    </div>
  );
}
