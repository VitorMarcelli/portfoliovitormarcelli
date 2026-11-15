'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { usePathname } from 'next/navigation';
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

/**
 * Where the sphere should be for the section in view. Sections declare it with
 * data-scene-x (-1 left … 1 right), data-scene-y (-1 bottom … 1 top) and data-scene-scale.
 */
interface SceneTarget {
  x: number;
  y: number;
  scale: number;
}

const DEFAULT_TARGET: SceneTarget = { x: 0.62, y: 0, scale: 0.42 };

function readTarget(): SceneTarget {
  // While the welcome screen is on, it decides where the sphere is (small, at the center).
  const intro = document.querySelector<HTMLElement>('.welcome-loader[data-scene-scale]');
  if (intro) {
    return {
      x: Number(intro.dataset.sceneX ?? 0),
      y: Number(intro.dataset.sceneY ?? 0),
      scale: Number(intro.dataset.sceneScale ?? 0.3),
    };
  }
  const sections = document.querySelectorAll<HTMLElement>('[data-scene-scale]');
  const probe = window.innerHeight * 0.45;
  let current: HTMLElement | null = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= probe) current = section;
  }
  current ??= sections[0] ?? null;
  if (!current) return DEFAULT_TARGET;
  return {
    x: Number(current.dataset.sceneX ?? 0),
    y: Number(current.dataset.sceneY ?? 0),
    scale: Number(current.dataset.sceneScale ?? 1),
  };
}

function Sculpture({ colors, target }: { colors: Palette; target: React.RefObject<SceneTarget> }) {
  const holderRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
    const holder = holderRef.current;
    if (!holder) return;
    // Narrow screens: keep the sphere closer to the center and smaller.
    const narrow = size.width < 768;
    const t = target.current;
    const goalX = t.x * (viewport.width / 2) * (narrow ? 0.45 : 0.72);
    const goalY = t.y * (viewport.height / 2) * 0.6;
    const goalScale = t.scale * (narrow ? 0.75 : 1);
    // Frame-rate independent easing toward the section's spot.
    const k = 1 - Math.exp(-delta * 2.2);
    holder.position.x += (goalX - holder.position.x) * k;
    holder.position.y += (goalY - holder.position.y) * k;
    const s = holder.scale.x + (goalScale - holder.scale.x) * k;
    holder.scale.setScalar(s);
  });

  return (
    <group ref={holderRef} scale={0.05}>
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
    </group>
  );
}

function Particles({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const random = seededRandom(20261115);
    for (let i = 0; i < positions.length; i++) positions[i] = (random() - 0.5) * 10;
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.015} color={color} transparent opacity={0.6} sizeAttenuation />
    </points>
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
 * One fixed 3D scene behind the whole public site ("a continuous night"): particles everywhere,
 * and the sphere glides to the spot each section asks for as the visitor scrolls.
 */
export default function NightScene() {
  const isDark = useIsDark();
  const pathname = usePathname();
  const target = useRef<SceneTarget>(DEFAULT_TARGET);
  const [eventSource, setEventSource] = useState<HTMLElement | undefined>(undefined);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Track the pointer over the whole page (the canvas itself ignores pointer events).
    const frame = requestAnimationFrame(() => setEventSource(document.body));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        target.current = readTarget();
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // The welcome screen leaving (or switching phase) moves the sphere too.
    window.addEventListener('welcome:done', update);
    window.addEventListener('welcome:phase', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('welcome:done', update);
      window.removeEventListener('welcome:phase', update);
    };
  }, [pathname]);

  if (!eventSource) return null;
  const colors = isDark ? PALETTE.dark : PALETTE.light;

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 h-screen w-full transition-opacity duration-[1600ms] ease-out ${shown ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      <Canvas
        onCreated={() => requestAnimationFrame(() => setShown(true))}
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
        eventSource={eventSource}
        eventPrefix="client"
      >
        <MouseTilt>
          <Particles color={colors.particles} />
          <Sculpture colors={colors} target={target} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color={colors.main} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
          <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={1} color={colors.main} />
        </MouseTilt>
      </Canvas>
    </div>
  );
}
