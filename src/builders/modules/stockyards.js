import * as THREE from 'three';
import { materials, accentMaterial } from '../materials.js';
import {
  bodyBlock, box, statusStrip, accentStripe, casters, contactShadow,
} from '../primitives.js';

// Stockyards — refrigerated robotic archive. A tall cabinet with a glass front
// revealing shelved racks, plus an overhead gantry robot that files & recalls
// tubes for add-on testing.
export function buildStockyards(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));

  // Main refrigerated cabinet.
  g.add(bodyBlock(w, h, d, 'bodyWhite', { r: 0.24 }));
  g.add(accentStripe(w - 0.5, domain, { y: 0.5, z: frontZ + 0.02 }));

  // Glass viewing door on the front.
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(w - 1.6, h - 1.6, 0.14), m.glass,
  );
  door.position.set(0, h * 0.55, frontZ - 0.05);
  g.add(door);
  const doorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(w - 1.3, h - 1.3, 0.1), m.metal,
  );
  doorFrame.position.set(0, h * 0.55, frontZ - 0.12);
  g.add(doorFrame);

  // Internal shelves of colored racks behind the glass.
  const rackGeo = new THREE.BoxGeometry(0.8, 0.5, 1.2);
  const shelfCols = 5;
  const shelfRows = 3;
  for (let r = 0; r < shelfRows; r++) {
    // Shelf plate.
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(w - 1.8, 0.08, d - 1.4), m.bodyMid,
    );
    shelf.position.set(0, h * 0.28 + r * (h * 0.24), 0);
    g.add(shelf);
    for (let c = 0; c < shelfCols; c++) {
      const rack = new THREE.Mesh(
        rackGeo,
        new THREE.MeshStandardMaterial({
          color: [0xe0455f, 0x2f6df6, 0x8b5cf6, 0xe8933a, 0x17b0a4][(r + c) % 5],
          roughness: 0.6,
        }),
      );
      rack.position.set(-w / 2 + 1.4 + c * ((w - 2.8) / (shelfCols - 1)), h * 0.28 + r * (h * 0.24) + 0.3, 0.1);
      g.add(rack);
    }
  }

  // Status column on the side.
  g.add(statusStrip(6, domain, {
    x: w / 2 - 0.5, y: h * 0.55, z: frontZ + 0.01, axis: 'y', spacing: 0.5,
  }));

  // Overhead gantry robot on top.
  const railGeo = new THREE.BoxGeometry(w - 1, 0.3, 0.4);
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(railGeo, m.metalDark);
    rail.position.set(0, h + 0.4, s * (d * 0.28));
    rail.castShadow = true;
    g.add(rail);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, d - 1.2), m.metal);
  bridge.position.set(w * 0.1, h + 0.6, 0);
  bridge.castShadow = true;
  g.add(bridge);
  // Robot picker head hanging from the bridge.
  const picker = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.5), accentMaterial(domain));
  picker.position.set(w * 0.1, h + 0.1, 0);
  picker.castShadow = true;
  g.add(picker);

  g.add(casters(w, d, { inset: 0.8 }));
  return g;
}
