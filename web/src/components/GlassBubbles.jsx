// Liquid-glass voice carousel — the orbs live on a horizontal track and
// physically slide when you navigate: the neighbour orb travels into the
// centre (growing + rising) while the current one slides out to a peek.
// Colours ride with each orb, so it reads as the orbs *moving*, not just
// swapping colour. Lit by a procedural room env (no network fetches).
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SLIDES } from "../data/slides.js";

const N = SLIDES.length;
const SPACING = 3.5;          // world gap between adjacent orbs
const SLOTS = [-2, -1, 0, 1, 2]; // orb pool: 2 off-screen each side feed the entry

// Body colour for a given (wrapping) slide counter.
const colorFor = (k) => SLIDES[((k % N) + N) % N].stops[3];

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

// Smoothly eases the animated track position toward the target counter.
function TrackDriver({ posRef, countRef }) {
  useFrame(() => {
    posRef.current += (countRef.current - posRef.current) * 0.13;
  });
  return null;
}

function Orb({ slot, posRef, countRef, levelRef, seed }) {
  const group = useRef();
  const coreMat = useRef();
  const shellMat = useRef();
  const kRef = useRef(null);                 // which slide-counter this orb shows
  const curC = useRef(new THREE.Color("#ffffff"));
  const tmp = useRef(new THREE.Color());

  useFrame((state) => {
    // First frame: seat this orb around the current counter and set its colour.
    if (kRef.current === null) {
      kRef.current = Math.round(countRef.current) + slot;
      curC.current.set(colorFor(kRef.current));
    }

    const pos = posRef.current;
    let offset = kRef.current - pos;

    // Recycle an orb that has drifted off one side to the far other side while
    // it's hidden, so the track feels infinite. Snap its colour (it's off-screen).
    if (offset > 2.6) { kRef.current -= SLOTS.length; curC.current.set(colorFor(kRef.current)); offset = kRef.current - pos; }
    else if (offset < -2.6) { kRef.current += SLOTS.length; curC.current.set(colorFor(kRef.current)); offset = kRef.current - pos; }

    const a = Math.abs(offset);
    const near = Math.max(0, 1 - a);                 // 1 at centre, 0 for peeks+
    const amp = (levelRef ? levelRef.current : 0) * near;

    // Bell-shaped size: big in the centre, small at the peeks/edges.
    const scale = 0.6 + 1.3 * Math.exp(-1.8 * offset * offset);
    const x = offset * SPACING;
    const y = 0.2 - 0.72 * Math.min(a, 1) + Math.sin(state.clock.elapsedTime * 0.7 + seed) * 0.06;
    const z = -1.45 * Math.min(a, 1);

    // Colour eases toward this orb's own slide (rides along with the motion).
    curC.current.lerp(tmp.current.set(colorFor(kRef.current)), 0.12);

    if (coreMat.current) {
      coreMat.current.color.copy(curC.current);
      coreMat.current.emissive.copy(curC.current);
      coreMat.current.distort = 0.45 + amp * 0.3;
    }
    if (shellMat.current) shellMat.current.distort = 0.38 + amp * 0.2;
    if (group.current) {
      group.current.visible = a < 2.5;
      group.current.position.set(x, y, z);
      group.current.scale.setScalar(scale * (1 + amp * 0.08));
    }
  });

  return (
    <group ref={group}>
      {/* saturated liquid core */}
      <mesh scale={0.9 / 2.4}>
        <sphereGeometry args={[2.4, 96, 96]} />
        <MeshDistortMaterial
          ref={coreMat}
          speed={1.9}
          distort={0.45}
          transparent
          opacity={0.96}
          roughness={0.12}
          metalness={0}
          emissiveIntensity={0.5}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* clear glass shell */}
      <mesh scale={1 / 2.4}>
        <sphereGeometry args={[2.4, 96, 96]} />
        <MeshDistortMaterial
          ref={shellMat}
          speed={1.9}
          distort={0.38}
          transparent
          opacity={0.22}
          color="#ffffff"
          roughness={0.02}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={2.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function GlassBubbles({ count, levelRef }) {
  const countRef = useRef(count);
  const posRef = useRef(count);
  useEffect(() => { countRef.current = count; }, [count]);

  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ fov: 40, position: [0, 0.2, 8.4] }}
      style={{ width: "100%", height: "100%" }}
    >
      <Env />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.0} />
      <pointLight position={[-3, 2, 4]} intensity={40} color="#ffffff" />
      <TrackDriver posRef={posRef} countRef={countRef} />
      {SLOTS.map((slot) => (
        <Orb
          key={slot}
          slot={slot}
          posRef={posRef}
          countRef={countRef}
          levelRef={levelRef}
          seed={slot * 1.7 + 0.5}
        />
      ))}
    </Canvas>
  );
}
