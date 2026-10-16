// Inspeksi struktur GLB: node tree, mesh, material, atribut.
const fs = require("fs");
const path = require("path");

const file = path.join(process.argv[2] || "public/models/train-low.glb");
const buf = fs.readFileSync(file);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));

console.log("=== FILE:", file, "===");
console.log("meshes:", json.meshes.length, "nodes:", json.nodes.length, "materials:", (json.materials || []).map((m) => m.name));
console.log("skins:", (json.skins || []).length, "animations:", (json.animations || []).length);

// attribute sanity
const attrSets = new Set();
for (const mesh of json.meshes) {
  for (const prim of mesh.primitives) {
    attrSets.add(Object.keys(prim.attributes).sort().join(","));
  }
}
console.log("attribute sets:", [...attrSets]);
const indexed = json.meshes.every((m) => m.primitives.every((p) => p.indices !== undefined));
console.log("all indexed:", indexed);

// node tree
const childrenOf = (i) => json.nodes[i].children || [];
function walk(i, depth, out) {
  const n = json.nodes[i];
  const t = n.translation || [0, 0, 0];
  const r = n.rotation || [0, 0, 0, 1];
  out.push(
    `${"  ".repeat(depth)}#${i} ${n.name || "?"} mesh=${n.mesh ?? "-"} t=[${t.map((v) => v.toFixed(2))}] r=[${r.map((v) => v.toFixed(2))}]`,
  );
  for (const c of childrenOf(i)) walk(c, depth + 1, out);
}
const out = [];
for (const s of json.scenes[json.scene || 0].nodes) walk(s, 0, out);
// print first 80 lines + any Door/Peron lines
console.log(out.slice(0, 60).join("\n"));
console.log("--- door/peron nodes ---");
console.log(out.filter((l) => /Door|Peron/i.test(l)).slice(0, 40).join("\n"));
const doorCount = out.filter((l) => /Door\./i.test(l)).length;
console.log("door-like nodes:", doorCount);
console.log(
  "top-level children of scene root:",
  (json.scenes[json.scene || 0].nodes || []).map((i) => json.nodes[i].name),
);
