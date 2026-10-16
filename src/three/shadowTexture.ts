import * as THREE from "three";

/** Tekstur bayangan lembut (radial gradient) — murah, dipakai semua gerbong. */
function createShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 32, 4, 64, 32, 60);
  gradient.addColorStop(0, "rgba(15,23,42,0.55)");
  gradient.addColorStop(0.55, "rgba(15,23,42,0.18)");
  gradient.addColorStop(1, "rgba(15,23,42,0)");
  ctx.scale(1, 0.5);
  ctx.translate(0, 32);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const SHADOW_TEXTURE = createShadowTexture();
