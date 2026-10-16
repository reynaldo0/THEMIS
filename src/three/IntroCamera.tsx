import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import { carX } from "@/three/models";
import { useThemisStore } from "@/store/useThemisStore";

/**
 * Animasi masuk kamera:
 *   - Pertama kali: gerbong depan → gerbong belakang → posisi kamera tetap.
 *   - Tiap ganti skenario: DARI posisi kamera saat ini → gerbong depan →
 *     gerbong belakang → posisi kamera tetap.
 * Hanya dijalankan setelah model selesai dimuat agar tidak terbuang di balik
 * overlay loading. Ringan: interpolasi lerp vektor tanpa alokasi per frame.
 */

let introPlayed = false;

interface Key {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  dur: number;
}
interface Run {
  keys: Key[];
  total: number;
  start: number;
}
interface ControlsLike {
  target: THREE.Vector3;
  autoRotate: boolean;
  enabled: boolean;
  update: () => void;
}
interface Waypoints {
  front: THREE.Vector3;
  frontT: THREE.Vector3;
  back: THREE.Vector3;
  backT: THREE.Vector3;
  def: THREE.Vector3;
  defT: THREE.Vector3;
}
type From = "front" | "current";

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface IntroCameraProps {
  cam: [number, number, number];
  target: [number, number, number];
  autoRotate: boolean;
}

export function IntroCamera({ cam, target, autoRotate }: IntroCameraProps) {
  const controls = useThree((s) => s.controls) as unknown as ControlsLike | null;
  const camera = useThree((s) => s.camera);
  const scenario = useThemisStore((s) => s.scenario);

  // Titik tetap: gerbong depan, gerbong belakang, dan kamera default.
  const wp = useMemo(() => {
    const front = carX(1);
    const back = carX(10);
    return {
      front: new THREE.Vector3(front, 4.2, 16),
      frontT: new THREE.Vector3(front, 1, 0),
      back: new THREE.Vector3(back, 4.2, 16),
      backT: new THREE.Vector3(back, 1, 0),
      def: new THREE.Vector3(...cam),
      defT: new THREE.Vector3(...target),
    };
  }, [cam, target]);

  const pendingRef = useRef<From | null>(introPlayed ? null : "front");
  const runRef = useRef<Run | null>(null);
  const mountRef = useRef<number | null>(null);
  const pos = useRef(new THREE.Vector3());
  const tgt = useRef(new THREE.Vector3());

  // Ganti skenario → mainkan ulang, masuk dari posisi kamera saat ini.
  const prevScenario = useRef(scenario);
  useEffect(() => {
    if (prevScenario.current === scenario) return;
    prevScenario.current = scenario;
    pendingRef.current = "current";
  }, [scenario]);

  useFrame((state) => {
    if (!controls) return;
    if (mountRef.current == null) mountRef.current = state.clock.elapsedTime;

    // 1) Mulai run baru bila ada permintaan & tidak sedang berjalan.
    if (!runRef.current) {
      if (!pendingRef.current) return;
      const loading = useProgress.getState().active;
      const waited = state.clock.elapsedTime - mountRef.current;
      if (loading && waited < 9) return;

      const from = pendingRef.current;
      pendingRef.current = null;
      runRef.current = buildRun(from, wp, camera, controls, state.clock.elapsedTime);
      return;
    }

    const run = runRef.current;
    const t = state.clock.elapsedTime - run.start;

    // 2) Selesai → serahkan kembali ke OrbitControls.
    if (t >= run.total) {
      const last = run.keys[run.keys.length - 1];
      camera.position.copy(last.pos);
      controls.target.copy(last.target);
      controls.autoRotate = autoRotate;
      controls.enabled = true;
      controls.update();
      runRef.current = null;
      introPlayed = true;
      return;
    }

    // 3) Interpolasi segmen aktif dengan easing.
    let acc = 0;
    for (let i = 1; i < run.keys.length; i++) {
      const seg = run.keys[i].dur;
      if (t < acc + seg || i === run.keys.length - 1) {
        const local = seg > 0 ? Math.min(1, Math.max(0, (t - acc) / seg)) : 1;
        const e = easeInOutCubic(local);
        pos.current.copy(run.keys[i - 1].pos).lerp(run.keys[i].pos, e);
        tgt.current.copy(run.keys[i - 1].target).lerp(run.keys[i].target, e);
        camera.position.copy(pos.current);
        controls.target.copy(tgt.current);
        controls.update();
        break;
      }
      acc += seg;
    }
  });

  return null;
}

function buildRun(
  from: From,
  wp: Waypoints,
  camera: THREE.Camera,
  controls: ControlsLike,
  now: number,
): Run {
  const keys: Key[] =
    from === "current"
      ? [
          { pos: camera.position.clone(), target: controls.target.clone(), dur: 0 },
          { pos: wp.front, target: wp.frontT, dur: 1.4 },
          { pos: wp.back, target: wp.backT, dur: 2.6 },
          { pos: wp.def, target: wp.defT, dur: 1.9 },
        ]
      : [
          { pos: wp.front, target: wp.frontT, dur: 0 },
          { pos: wp.back, target: wp.backT, dur: 2.8 },
          { pos: wp.def, target: wp.defT, dur: 2 },
        ];

  camera.position.copy(keys[0].pos);
  controls.target.copy(keys[0].target);
  controls.autoRotate = false;
  controls.enabled = false;
  controls.update();

  return { keys, total: keys.reduce((s, k) => s + k.dur, 0), start: now };
}
