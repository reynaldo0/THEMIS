import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Train } from "@/three/Train";
import { Platform } from "@/three/Platform";
import { RedistributionFlow } from "@/three/RedistributionFlow";
import { IntroCamera } from "@/three/IntroCamera";
import { useThemisStore } from "@/store/useThemisStore";

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 1024;

const CAM_POS: [number, number, number] = IS_SMALL ? [27, 15, 44] : [23, 12.5, 33];
const CAM_TARGET: [number, number, number] = [0, 1.05, 0];

export function Scene() {
  const selectCar = useThemisStore((s) => s.selectCar);

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: !IS_SMALL, powerPreference: "high-performance" }}
      onPointerMissed={() => selectCar(null)}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#eaeef7"]} />
      <fog attach="fog" args={["#eaeef7", 78, 200]} />

      <PerspectiveCamera makeDefault position={CAM_POS} fov={IS_SMALL ? 46 : 42} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        target={CAM_TARGET}
        minDistance={14}
        maxDistance={95}
        minPolarAngle={0.32}
        maxPolarAngle={Math.PI / 2 - 0.05}
        autoRotate={!IS_SMALL}
        autoRotateSpeed={0.14}
        enablePan={false}
      />

      <IntroCamera cam={CAM_POS} target={CAM_TARGET} autoRotate={!IS_SMALL} />

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
