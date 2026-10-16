import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Template statis per varian GLB.
 *
 * Semua mesh penumpang & badan digabung (merge) per material sehingga tiap
 * gerbong hanya butuh ~3 draw call statis + 16 pintu kecil — jauh lebih
 * ringan daripada render ratusan mesh penumpang satu per satu.
 * Hierarki GLB flat (semua node anak root), jadi transform lokal = relatif root.
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
  materials: THREE.Material[];
  isSkin: boolean;
}

export interface TrainTemplate {
  parts: StaticPart[];
  doors: DoorInstance[];
  skinMaterial: THREE.MeshStandardMaterial | null;
}

const cache = new Map<string, TrainTemplate>();

const DOOR_SLIDE = 0.32;

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
      parts.push({ geometry: geo, materials: mesh.material, isSkin: false });
      // Jika salah satu material di array adalah Skin, catat referensinya.
      for (const m of mesh.material) {
        if (m && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial && m.name === "Skin") {
          skinMaterial = m as THREE.MeshStandardMaterial;
        }
      }
      return;
    }

    if (!mesh.material) return; // lewati mesh tanpa material

    const geo = mesh.geometry.clone();
    geo.applyMatrix4(rel);
    const bucket = buckets.get(mesh.material);
    if (bucket) bucket.push(geo);
    else buckets.set(mesh.material, [geo]);
    if ((mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial && mesh.material.name === "Skin") {
      skinMaterial = mesh.material as THREE.MeshStandardMaterial;
    }
  });

  for (const [material, geoms] of buckets) {
    const merged = geoms.length === 1 ? geoms[0] : mergeGeometries(geoms, false);
    if (!merged) {
      for (const g of geoms) g.dispose();
      continue;
    }
    if (merged !== geoms[0]) for (const g of geoms) g.dispose();
    parts.push({ geometry: merged, materials: [material], isSkin: material.name === "Skin" });
  }

  // Arah geser pintu: per sisi (z), bergantian — konsisten dengan export Blender.
  const sides = [
    doors.filter((d) => d.position.z >= 0),
    doors.filter((d) => d.position.z < 0),
  ];
  for (const side of sides) {
    side.sort((a, b) => b.position.x - a.position.x);
    side.forEach((d, i) => {
      d.dir = i % 2 === 0 ? 1 : -1;
    });
  }

  const template: TrainTemplate = { parts, doors, skinMaterial };
  cache.set(cacheKey, template);
  return template;
}

export { DOOR_SLIDE };
