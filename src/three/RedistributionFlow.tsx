import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { useThemisStore } from "@/store/useThemisStore";
import { carX } from "@/three/models";

const ROOF_Y = 1.12;
const ARC_Y = 3.0;
const RING_Y = 1.02;
const DOTS = 9;
const DUR = 1.6;

const FROM_COLOR = new THREE.Color("#ED242B");
const TO_COLOR = new THREE.Color("#16A34A");

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 1024;

/**
 * Visualisasi "Pindah Penumpang": busur beranimasi dari gerbong sumber
 * (Penuh) ke gerbong tujuan (lebih sepi) di atas atap kereta.
 */
export function RedistributionFlow() {
  const redistribution = useThemisStore((s) => s.redistribution);
  const selectedCarId = useThemisStore((s) => s.selectedCarId);

  const from = redistribution?.fromCarId;
  const to = redistribution?.toCarId;

  const lineRef = useRef<{ material: { dashOffset?: number } } | null>(null);
  const dotRefs = useRef<Array<THREE.Mesh | null>>([]);
  const arrowRef = useRef<THREE.Mesh>(null);
  const ringFromRef = useRef<THREE.Mesh>(null);
  const ringToRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    if (from == null || to == null) return null;
    const x1 = carX(from);
    const x2 = carX(to);
    const mid = (x1 + x2) / 2;
    const span = Math.abs(x2 - x1);
    const lift = ARC_Y + Math.min(1.2, span * 0.06);
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x1, ROOF_Y, 0),
      new THREE.Vector3(mid, lift, 0),
      new THREE.Vector3(x2, ROOF_Y, 0),
    );
  }, [from, to]);

  const points = useMemo(() => (curve ? curve.getPoints(48).map((p) => [p.x, p.y, p.z] as [number, number, number]) : []), [curve]);

  const apex = useMemo(() => (curve ? curve.getPointAt(0.5) : null), [curve]);

  useFrame((state) => {
    if (!curve || from == null || to == null) return;
    const t = state.clock.elapsedTime;

    // garis putus-putus bergeser (arus penumpang)
    const mat = lineRef.current?.material;
    if (mat && typeof mat.dashOffset === "number") {
      mat.dashOffset = -t * 1.6;
    }

    // titik-titik penumpang bergerak di sepanjang kurva
    for (let i = 0; i < DOTS; i++) {
      const mesh = dotRefs.current[i];
      if (!mesh) continue;
      const phase = ((t / DUR + i / DOTS) % 1 + 1) % 1;
      const p = curve.getPointAt(phase);
      mesh.position.copy(p);
      mesh.position.y += Math.sin(t * 4 + i) * 0.04;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.copy(FROM_COLOR).lerp(TO_COLOR, phase);
      const s = 0.055 + Math.sin(phase * Math.PI) * 0.03;
      mesh.scale.setScalar(s);
    }

    // panah di ujung tujuan, berdenyut
    if (arrowRef.current) {
      const end = curve.getPointAt(1);
      arrowRef.current.position.set(end.x, end.y - 0.18, end.z);
      const pulse = 1 + Math.sin(t * 5) * 0.12;
      arrowRef.current.scale.setScalar(pulse);
      (arrowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.75 + Math.sin(t * 5) * 0.2;
    }

    // cincin denyut di atap sumber & tujuan
    if (ringFromRef.current) {
      const x1 = carX(from);
      ringFromRef.current.position.set(x1, RING_Y, 0);
      const s = 1 + ((t * 0.9) % 1) * 0.8;
      ringFromRef.current.scale.setScalar(s);
      (ringFromRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - ((t * 0.9) % 1));
    }
    if (ringToRef.current) {
      const x2 = carX(to);
      ringToRef.current.position.set(x2, RING_Y, 0);
      const s = 1 + (((t * 0.9) + 0.5) % 1) * 0.8;
      ringToRef.current.scale.setScalar(s);
      (ringToRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - (((t * 0.9) + 0.5) % 1));
    }
  });

  if (!curve || from == null || to == null || points.length === 0) return null;

  const emphasized = selectedCarId === from || selectedCarId === to;

  return (
    <group>
      <Line
        ref={lineRef as never}
        points={points}
        color="#EC6C25"
        lineWidth={emphasized ? 3.2 : 2.2}
        dashed
        dashSize={0.24}
        gapSize={0.16}
        transparent
        opacity={0.9}
      />

      {Array.from({ length: DOTS }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial color="#ED242B" toneMapped={false} />
        </mesh>
      ))}

      <mesh ref={arrowRef} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 0.34, 12]} />
        <meshBasicMaterial color="#16A34A" transparent opacity={0.85} toneMapped={false} />
      </mesh>

      <mesh ref={ringFromRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.68, 40]} />
        <meshBasicMaterial color="#ED242B" transparent opacity={0.5} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringToRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.68, 40]} />
        <meshBasicMaterial color="#16A34A" transparent opacity={0.5} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {apex && (
        <Html
          position={[apex.x, apex.y + 0.3, 0]}
          center
          distanceFactor={IS_SMALL ? 14 : 22}
          zIndexRange={[25, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-full border border-secondary/30 bg-white/95 px-2 py-0.5 text-center shadow-sm backdrop-blur sm:px-3 sm:py-1">
            <div className="text-[9px] font-bold uppercase tracking-wider text-secondary sm:text-[10.5px]">
              Pindah<span className="hidden sm:inline"> Penumpang</span>
            </div>
            <div className="font-mono text-[8.5px] text-slate-600 sm:text-[9.5px]">
              G{String(from).padStart(2, "0")} → G{String(to).padStart(2, "0")}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
