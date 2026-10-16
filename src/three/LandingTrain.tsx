import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { buildTrainTemplate } from "@/three/trainTemplate";
import { MODEL_SCALE, MODEL_URLS } from "@/three/models";
import { SHADOW_TEXTURE } from "@/three/shadowTexture";

/** Tiga gerbong memakai GLB asli di /public/models — mewakili tiga kondisi density. */
const CARS = [
  { url: MODEL_URLS.LOW, color: "#16A34A", label: "Lengang", occ: 0.29 },
  { url: MODEL_URLS.MEDIUM, color: "#F59E0B", label: "Sedang", occ: 0.55 },
  { url: MODEL_URLS.HIGH, color: "#ED242B", label: "Padat", occ: 0.84 },
] as const;

const STRIDE = 5.7;

interface CarProps {
  url: string;
  color: string;
  label: string;
  occ: number;
  x: number;
}

function ShowcaseCarriage({ url, color, label, occ, x }: CarProps) {
  const { scene } = useGLTF(url);
  const template = useMemo(() => buildTrainTemplate(scene, url), [scene, url]);

  // Material penumpang di-clone agar bisa diberi emissive sesuai warna density.
  const skinMat = useMemo(() => {
    const src = template.skinMaterial;
    if (!src) return null;
    const m = src.clone() as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color(color);
    m.emissiveIntensity = 0.22;
    return m;
  }, [template, color]);
  useEffect(() => () => skinMat?.dispose(), [skinMat]);

  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, depthWrite: false }),
    [color],
  );
  useEffect(() => () => glowMat.dispose(), [glowMat]);

  return (
    <group position={[x, 0, 0]}>
      <group
        scale={MODEL_SCALE}
        position={[
          -template.center.x * MODEL_SCALE,
          -template.groundY * MODEL_SCALE,
          -template.center.z * MODEL_SCALE,
        ]}
      >
        {template.parts.map((part, i) => (
          <mesh key={i} geometry={part.geometry} material={part.isSkin && skinMat ? skinMat : part.material} />
        ))}
        {template.doors.map((d, i) => (
          <mesh
            key={`door-${i}`}
            geometry={d.geometry}
            material={d.material}
            position={d.position}
            quaternion={d.quaternion}
          />
        ))}
      </group>

      {/* Bayangan lembut (tanpa shadow map) */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.0, 1.9]} />
        <meshBasicMaterial map={SHADOW_TEXTURE} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* Glow density di bawah gerbong */}
      <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.3, 1.5]} />
        <primitive object={glowMat} attach="material" />
      </mesh>

      <Html
        position={[0, 1.5, 0]}
        center
        distanceFactor={22}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="whitespace-nowrap rounded-lg border border-white/70 bg-white/90 px-2.5 py-1 text-center font-mono text-[11px] font-semibold shadow-sm backdrop-blur">
          <span style={{ color }}>{label}</span>
          <span className="ml-1.5 text-slate-500">{Math.round(occ * 100)}%</span>
        </div>
      </Html>
    </group>
  );
}

export function LandingTrain() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [15, 8.5, 16], fov: 42 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#ffffff", "#c9d1e2", 0.7]} />
      <directionalLight position={[10, 14, 8]} intensity={1.15} />
      <directionalLight position={[-9, 7, -8]} intensity={0.35} color="#c7d2fe" />

      <Suspense fallback={null}>
        {CARS.map((c, i) => (
          <ShowcaseCarriage key={c.url} {...c} x={(i - 1) * STRIDE} />
        ))}
      </Suspense>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.45}
        enablePan={false}
        enableZoom
        zoomSpeed={0.7}
        minDistance={11}
        maxDistance={23.4}
        minPolarAngle={0.75}
        maxPolarAngle={1.35}
        target={[0, 0.5, 0]}
      />
    </Canvas>
  );
}
