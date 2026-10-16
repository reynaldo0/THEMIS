import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { buildTrainTemplate, DOOR_SLIDE } from "@/three/trainTemplate";
import { SHADOW_TEXTURE } from "@/three/shadowTexture";
import { DENSITY_HEX_INT, DENSITY_LABEL, percent } from "@/lib/format";
import { WOMEN_CARS } from "@/lib/constants";
import {
  MODEL_SCALE,
  MODEL_URL_BY_VARIANT,
  variantFor,
  type OccupancyVariant,
} from "@/three/models";
import { useThemisStore } from "@/store/useThemisStore";
import type { CarOccupancy, DoorState } from "@/types";

const DOOR_LERP = 0.14;
const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 1024;

interface GlbCarriageProps {
  car: CarOccupancy;
  door: DoorState | undefined;
  position: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
}

interface DoorRef {
  el: THREE.Mesh;
  baseX: number;
  dir: number;
}

export function GlbCarriage({
  car,
  door,
  position,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: GlbCarriageProps) {
  const redistribution = useThemisStore((s) => s.redistribution);
  const [variant, setVariant] = useState<OccupancyVariant>(() => variantFor(car.densityIndicator));
  const flashAt = useRef(0);

  const outerRef = useRef<THREE.Group>(null);
  const popRef = useRef<THREE.Group>(null);
  const doorRefs = useRef<DoorRef[]>([]);
  const doorProgress = useRef(0);

  const { scene } = useGLTF(MODEL_URL_BY_VARIANT[variant]);
  const template = useMemo(
    () => buildTrainTemplate(scene, MODEL_URL_BY_VARIANT[variant]),
    [scene, variant],
  );

  const accent = DENSITY_HEX_INT[car.densityIndicator];

  // Material Skin di-clone per gerbong agar emissive-nya independen.
  const skinMat = useMemo(() => {
    const src = template.skinMaterial;
    if (!src) return null;
    return src.clone() as THREE.MeshStandardMaterial;
  }, [template]);

  useEffect(() => {
    return () => skinMat?.dispose();
  }, [skinMat]);

  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.13, depthWrite: false }),
    [accent],
  );
  useEffect(() => () => glowMat.dispose(), [glowMat]);

  // Ganti varian saat density melewati threshold.
  const nextVariant = variantFor(car.densityIndicator);
  if (nextVariant !== variant) {
    setVariant(nextVariant);
    flashAt.current = performance.now();
  }

  const doorOpen = door?.doorAction === "OPEN_MIDDLE";

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (outerRef.current) {
      const targetY = position[1] + (isHovered ? 0.09 : 0) + (isSelected ? 0.06 : 0);
      outerRef.current.position.y = THREE.MathUtils.lerp(outerRef.current.position.y, targetY, 0.12);
    }

    // Flash emissive saat varian berganti.
    const flash = Math.max(0, 1 - (performance.now() - flashAt.current) / 600);
    if (skinMat) {
      const pulse = car.densityIndicator === "RED" ? (Math.sin(t * 3 + car.carId) + 1) * 0.5 : 0;
      const base = car.densityIndicator === "RED" ? 0.32 : car.densityIndicator === "YELLOW" ? 0.16 : 0.06;
      skinMat.emissive.setHex(accent);
      skinMat.emissiveIntensity = base + pulse * 0.22 + flash * 0.9;
    }

    // Pintu geser.
    doorProgress.current = THREE.MathUtils.lerp(doorProgress.current, doorOpen ? 1 : 0, DOOR_LERP);
    if (Math.abs(doorProgress.current) > 0.001 || doorOpen) {
      for (const d of doorRefs.current) {
        if (!d) continue;
        d.el.position.x = d.baseX + d.dir * DOOR_SLIDE * doorProgress.current;
      }
    }

    // Glow dekal mengikuti density.
    glowMat.opacity = 0.07 + car.occupancyRatio * 0.12 + flash * 0.15;
  });

  // Label ringkas di mobile: hanya gerbong terpilih / fokus redistribusi.
  const isSource = redistribution?.fromCarId === car.carId;
  const isTarget = redistribution?.toCarId === car.carId;
  const showLabel = !IS_SMALL || isSelected || isHovered || isSource || isTarget;

  doorRefs.current.length = template.doors.length;

  return (
    <group ref={outerRef} position={position}>
      <group
        ref={popRef}
        scale={MODEL_SCALE}
        position={[
          -template.center.x * MODEL_SCALE,
          -template.groundY * MODEL_SCALE - 0.012,
          -template.center.z * MODEL_SCALE,
        ]}
      >
        {template.parts.map((part, i) => (
          <mesh key={i} geometry={part.geometry} material={part.isSkin && skinMat ? skinMat : part.material} />
        ))}
        {template.doors.map((d, i) => (
          <mesh
            key={`door-${i}`}
            ref={(el) => {
              if (el) doorRefs.current[i] = { el, baseX: d.position.x, dir: d.dir };
            }}
            geometry={d.geometry}
            material={d.material}
            position={d.position}
            quaternion={d.quaternion}
          />
        ))}
      </group>

      {/* Bayangan lembut (tanpa shadow map) */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[6.0, 1.9]} />
        <meshBasicMaterial map={SHADOW_TEXTURE} transparent opacity={0.5} depthWrite={false} />
      </mesh>

      {/* Glow density di bahsu kereta */}
      <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.3, 1.5]} />
        <primitive object={glowMat} attach="material" />
      </mesh>

      {/* Hitbox klik/hover */}
      <mesh
        position={[0, 0.65, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(car.carId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(car.carId);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[5.5, 1.5, 1.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.9, 3.1, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0.65} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}

      {showLabel && (
        <Html position={[0, 1.5, 0]} center distanceFactor={24} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div
            className="whitespace-nowrap rounded-lg border bg-white/90 px-2.5 py-1 text-center font-mono shadow-sm backdrop-blur"
            style={{
              borderColor: isSource
                ? "rgba(237,36,43,.5)"
                : isTarget
                  ? "rgba(22,163,74,.5)"
                  : car.densityIndicator === "RED"
                    ? "rgba(237,36,43,.4)"
                    : "rgba(45,42,112,.15)",
            }}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold tracking-wide text-slate-800">
              G{String(car.carId).padStart(2, "0")} · {percent(car.occupancyRatio)}
              {WOMEN_CARS.has(car.carId) && <span className="text-[10px] text-pink-500">♀</span>}
            </div>
            <div
              className="text-[9px] uppercase tracking-widest"
              style={{ color: `#${new THREE.Color(accent).getHexString()}` }}
            >
              {isSource ? "Penuh →" : isTarget ? "← Tujuan" : DENSITY_LABEL[car.densityIndicator]}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
