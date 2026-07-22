// Liquid-glass voice bubbles — layered construction that stays visible over
// a transparent canvas: a saturated morphing core inside a clear glass shell,
// with a camera-facing colour reflection + contact shadow beneath each.
// Lit by a procedural room environment (no network fetches, demo-safe).
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

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

// Shared soft radial alpha texture for glows/shadows.
let radialTex = null;
function getRadialTex() {
  if (radialTex) return radialTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  radialTex = new THREE.CanvasTexture(c);
  return radialTex;
}

function Bubble({ targetRef, seed, position, scale, distort, speed, levelRef }) {
  const group = useRef();
  const coreMat = useRef();
  const shellMat = useRef();
  const glowMat = useRef();
  const alphaTex = useMemo(getRadialTex, []);
  const cur = useRef({
    c: new THREE.Color(targetRef.current.c),
    a: new THREE.Color(targetRef.current.a),
    g: new THREE.Color(targetRef.current.g),
  });
  const tmp = useRef(new THREE.Color());

  useFrame((state) => {
    const t = targetRef.current;
    cur.current.c.lerp(tmp.current.set(t.c), 0.09);
    cur.current.a.lerp(tmp.current.set(t.a), 0.09);
    cur.current.g.lerp(tmp.current.set(t.g), 0.09);

    const amp = levelRef ? levelRef.current : 0;
    if (coreMat.current) {
      coreMat.current.color.copy(cur.current.c);
      coreMat.current.emissive.copy(cur.current.c);
      coreMat.current.distort = distort + amp * 0.3;
    }
    if (shellMat.current) shellMat.current.distort = distort * 0.8 + amp * 0.2;
    if (glowMat.current) glowMat.current.color.copy(cur.current.g);
    if (group.current) {
      const s = 1 + amp * 0.09;
      group.current.scale.setScalar(s);
      group.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.7 + seed) * 0.07;
    }
  });

  return (
    <group ref={group} position={position}>
      {/* saturated liquid core — bright, colour-forward.
          Geometry is radius 2.4 and the mesh scaled down so the distortion
          noise samples a wider domain => lumpier, multi-lobe wobble. */}
      <mesh scale={(scale * 0.9) / 2.4}>
        <sphereGeometry args={[2.4, 96, 96]} />
        <MeshDistortMaterial
          ref={coreMat}
          speed={speed}
          distort={distort}
          transparent
          opacity={0.96}
          roughness={0.12}
          metalness={0}
          emissiveIntensity={0.5}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* clear glass shell with a bright rim highlight */}
      <mesh scale={scale / 2.4}>
        <sphereGeometry args={[2.4, 96, 96]} />
        <MeshDistortMaterial
          ref={shellMat}
          speed={speed}
          distort={distort * 0.85}
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
      {/* tight saturated colour reflection, hugging the bubble base */}
      <mesh position={[0, -scale * 1.18, 0.15]}>
        <planeGeometry args={[scale * 1.25, scale * 0.4]} />
        <meshBasicMaterial
          ref={glowMat}
          transparent
          opacity={0.65}
          alphaMap={alphaTex}
          depthWrite={false}
        />
      </mesh>
      {/* faint neutral contact shadow, small */}
      <mesh position={[0, -scale * 1.16, 0.14]}>
        <planeGeometry args={[scale * 0.8, scale * 0.22]} />
        <meshBasicMaterial
          color="#30304a"
          transparent
          opacity={0.15}
          alphaMap={alphaTex}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function GlassBubbles({ centerRef, leftRef, rightRef, levelRef }) {
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
      <Bubble
        targetRef={centerRef}
        seed={0}
        position={[0, 0.25, 0]}
        scale={2.05}
        distort={0.47}
        speed={1.9}
        levelRef={levelRef}
      />
      <Bubble
        targetRef={leftRef}
        seed={2.1}
        position={[-3.2, -0.45, -0.8]}
        scale={1.1}
        distort={0.44}
        speed={1.5}
      />
      <Bubble
        targetRef={rightRef}
        seed={4.4}
        position={[3.2, -0.45, -0.8]}
        scale={1.0}
        distort={0.44}
        speed={1.6}
      />
    </Canvas>
  );
}
