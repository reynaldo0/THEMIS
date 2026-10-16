import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Train } from "@/three/Train";
import { Platform } from "@/three/Platform";
import { RedistributionFlow } from "@/three/RedistributionFlow";
import { useThemisStore } from "@/store/useThemisStore";

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 1024;

export function Scene() {
  const selectCar = useThemisStore((s) => s.selectCar);

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: !IS_SMALL, powerPreference: "high-performance" }}
      onPointerMissed={() => selectCar(null)}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#e9edf7"]} />
      <fog attach="fog" args={["#e9edf7", 70, 190]} />

      <PerspectiveCamera makeDefault position={IS_SMALL ? [26, 17, 46] : [22, 15, 38]} fov={45} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        target={[0, 0.8, 0]}
        minDistance={12}
        maxDistance={90}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2 - 0.06}
        autoRotate={!IS_SMALL}
        autoRotateSpeed={0.16}
        enablePan={false}
      />

      <Suspense fallback={null}>
        <Lights />
        <Platform />
        <Train />
        <RedistributionFlow />
      </Suspense>
    </Canvas>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} color="#ffffff" />
      <hemisphereLight args={["#ffffff", "#c8d0e0", 0.6]} />
      <directionalLight position={[30, 34, 16]} intensity={1.05} color="#ffffff" />
      <directionalLight position={[-26, 14, -20]} intensity={0.35} color="#c7d2fe" />
    </>
  );
}
