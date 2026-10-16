import { useLayoutEffect, useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useStation } from "@/store/useThemisStore";

const TRACK_LENGTH = 58;
const SLEEPER_SPACING = 1.15;
const SLEEPER_COUNT = Math.floor(TRACK_LENGTH / SLEEPER_SPACING);

export function Platform() {
  const station = useStation();

  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#e4e9f4" roughness={1} metalness={0} />
      </mesh>

      {/* track bed */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[TRACK_LENGTH, 0.08, 2.6]} />
        <meshStandardMaterial color="#cdd5e4" roughness={0.95} />
      </mesh>

      {/* rails */}
      {[-0.62, 0.62].map((z) => (
        <mesh key={z} position={[0, 0.1, z]}>
          <boxGeometry args={[TRACK_LENGTH, 0.06, 0.08]} />
          <meshStandardMaterial color="#8b97ad" metalness={0.75} roughness={0.35} />
        </mesh>
      ))}

      {/* sleepers — instanced, satu draw call */}
      <Sleepers />

      {/* island platform behind the train */}
      <group position={[0, 0, -3.4]}>
        <mesh position={[0, 0.22, -1.6]}>
          <boxGeometry args={[TRACK_LENGTH, 0.44, 4.6]} />
          <meshStandardMaterial color="#f4f6fb" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.45, 0.55]}>
          <boxGeometry args={[TRACK_LENGTH, 0.02, 0.35]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.32, 0.78]}>
          <boxGeometry args={[TRACK_LENGTH, 0.28, 0.22]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>

        {/* pillars + lamp */}
        {[-22, -15, -8, 0, 8, 15, 22].map((x) => (
          <group key={x}>
            <mesh position={[x, 2.3, -2.6]}>
              <cylinderGeometry args={[0.1, 0.13, 3.7, 10]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.5} />
            </mesh>
            <mesh position={[x, 3.62, -1.8]}>
              <boxGeometry args={[0.5, 0.08, 0.22]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 4.15, -2.2]}>
          <boxGeometry args={[TRACK_LENGTH - 2, 0.16, 5.4]} />
          <meshStandardMaterial color="#dbe2ef" metalness={0.15} roughness={0.6} />
        </mesh>

        {/* station sign */}
        <group position={[0, 3.1, -0.6]}>
          <mesh>
            <boxGeometry args={[3.6, 0.7, 0.08]} />
            <meshStandardMaterial color="#2d2a70" metalness={0.2} roughness={0.5} />
          </mesh>
          <Html center position={[0, 0, 0.06]} distanceFactor={16} style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap rounded bg-[#2d2a70] px-3 py-1 text-center font-display">
              <div className="text-[13px] font-bold tracking-[0.2em] text-white">{station.name.toUpperCase()}</div>
              <div className="text-[8px] tracking-[0.35em] text-white/70">STASIUN · {station.code}</div>
            </div>
          </Html>
        </group>
      </group>

      {/* opposite minor platform */}
      <group position={[0, 0, 4.6]}>
        <mesh position={[0, 0.18, 1.2]}>
          <boxGeometry args={[TRACK_LENGTH, 0.36, 2.6]} />
          <meshStandardMaterial color="#e8ecf5" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.37, 0.05]}>
          <boxGeometry args={[TRACK_LENGTH, 0.02, 0.3]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.7} />
        </mesh>
      </group>

      {/* soft city silhouettes far side */}
      <mesh position={[0, 6, -20]}>
        <boxGeometry args={[140, 14, 1]} />
        <meshStandardMaterial color="#d7deec" roughness={1} />
      </mesh>
      <mesh position={[-34, 4.5, -17]} rotation={[0, 0.28, 0]}>
        <boxGeometry args={[12, 9, 3]} />
        <meshStandardMaterial color="#d0d9ea" roughness={1} />
      </mesh>
      <mesh position={[32, 5.5, -18]} rotation={[0, -0.22, 0]}>
        <boxGeometry args={[16, 11, 3]} />
        <meshStandardMaterial color="#d3dbeb" roughness={1} />
      </mesh>
    </group>
  );
}

function Sleepers() {
  const ref = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(() => {
    const arr: THREE.Matrix4[] = [];
    for (let i = 0; i < SLEEPER_COUNT; i++) {
      const x = -TRACK_LENGTH / 2 + 0.6 + i * SLEEPER_SPACING;
      arr.push(new THREE.Matrix4().setPosition(x, 0.05, 0));
    }
    return arr;
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    positions.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, SLEEPER_COUNT]}>
      <boxGeometry args={[0.22, 0.05, 1.7]} />
      <meshStandardMaterial color="#b6c0d4" roughness={0.9} />
    </instancedMesh>
  );
}
