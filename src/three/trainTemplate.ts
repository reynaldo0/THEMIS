import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Template statis per varian GLB.
 *
 * Semua mesh penumpang & badan digabung (merge) per material sehingga tiap
 * gerbong hanya butuh beberapa draw call statis + pintu (bila ada) — jauh
 * lebih ringan daripada render ratusan mesh penumpang satu per satu.
 *
 * Catatan penting:
 * - Hierarki GLB flat (semua node anak root), jadi transform lokal = relatif root.
 * - Mesh single-material digabung; mesh multi-material (badan) dibiarkan utuh
 *   karena geometrinya punya groups → material HARUS berupa array. Jika array
 *   material dikirim ke geometry tanpa groups, three.js tidak merender apa pun.
 * - Nama material dari Blender bisa bersuffix (mis. "Skin.002"), jadi deteksi
 *   Skin memakai awalan nama.
 */

export interface DoorInstance {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  dir: number; // arah geser: +1 / -1 di sumbu X
}

export interface StaticPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  isSkin: boolean;
}

export interface TrainTemplate {
  parts: StaticPart[];
  doors: DoorInstance[];
  skinMaterial: THREE.MeshStandardMaterial | null;
  /** Titik tengah model (unit lokal, sebelum skala) untuk auto-centering. */
  center: THREE.Vector3;
  /** Y terendah model (unit lokal) agar alas gerbong pas di lantai. */
  groundY: number;
}

const cache = new Map<string, TrainTemplate>();

const DOOR_SLIDE = 0.32;

const isSkinName = (name: string | undefined) => !!name && name.startsWith("Skin");
const isSkinMaterial = (m: THREE.Material | undefined): m is THREE.MeshStandardMaterial =>
  !!m && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial && isSkinName(m.name);

export function buildTrainTemplate(root: THREE.Object3D, cacheKey: string): TrainTemplate {
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  root.updateMatrixWorld(true);
  const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();

  const parts: StaticPart[] = [];
  const doors: DoorInstance[] = [];
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  let skinMaterial: THREE.MeshStandardMaterial | null = null;

  root.traverse((obj) => {
    const name = obj.name ?? "";
    // Bukti peron tidak pernah jadi bagian kereta.
    if (name.startsWith("Peron")) return;
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    if (name.startsWith("Door.")) {
      const geo = mesh.geometry.clone();
      if (mesh.scale.x !== 1 || mesh.scale.y !== 1 || mesh.scale.z !== 1) {
        geo.applyMatrix4(new THREE.Matrix4().makeScale(mesh.scale.x, mesh.scale.y, mesh.scale.z));
      }
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      doors.push({
        geometry: geo,
        material: mat,
        position: mesh.position.clone(),
        quaternion: mesh.quaternion.clone(),
        dir: 1,
      });
      return;
    }

    const rel = new THREE.Matrix4().multiplyMatrices(rootInv, mesh.matrixWorld);

    if (Array.isArray(mesh.material)) {
      const geo = mesh.geometry.clone();
      geo.applyMatrix4(rel);
      parts.push({ geometry: geo, material: mesh.material, isSkin: false });
      for (const m of mesh.material) {
        if (isSkinMaterial(m)) skinMaterial = m;
      }
      return;
    }

    if (!mesh.material) return;

    if (isSkinMaterial(mesh.material)) skinMaterial = mesh.material;

    const geo = mesh.geometry.clone();
    geo.applyMatrix4(rel);
    const bucket = buckets.get(mesh.material);
    if (bucket) bucket.push(geo);
    else buckets.set(mesh.material, [geo]);
  });

  for (const [material, geoms] of buckets) {
    const merged = geoms.length === 1 ? geoms[0] : mergeGeometries(geoms, false);
    if (!merged) {
      for (const g of geoms) g.dispose();
      continue;
    }
    if (merged !== geoms[0]) for (const g of geoms) g.dispose();
    // material tunggal (bukan array) — geometry hasil merge tidak punya groups.
    parts.push({ geometry: merged, material, isSkin: isSkinMaterial(material) });
  }

  // Arah geser pintu: per sisi (z), bergantian — konsisten dengan export Blender.
  const sides = [doors.filter((d) => d.position.z >= 0), doors.filter((d) => d.position.z < 0)];
  for (const side of sides) {
    side.sort((a, b) => b.position.x - a.position.x);
    side.forEach((d, i) => {
      d.dir = i % 2 === 0 ? 1 : -1;
    });
  }

  // Auto-centering dari bounding box bagian statis (badan + penumpang).
  const box = new THREE.Box3();
  for (const p of parts) {
    p.geometry.computeBoundingBox();
    if (p.geometry.boundingBox) box.union(p.geometry.boundingBox);
  }
  const center = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
  const groundY = box.isEmpty() ? 0 : box.min.y;

  const template: TrainTemplate = { parts, doors, skinMaterial, center, groundY };
  cache.set(cacheKey, template);
  return template;
}

export { DOOR_SLIDE };
