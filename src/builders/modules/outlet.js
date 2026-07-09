import * as THREE from 'three';
import { materials } from '../materials.js';
import {
  bodyBlock, box, facePanel, screen, statusStrip, accentStripe,
  casters, contactShadow,
} from '../primitives.js';

// Outlet — post-analytic exit module. A body with a sloped output bay where
// finished racks collect as they leave the analytic path.
export function buildOutlet(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));
  g.add(bodyBlock(w, h, d, 'bodyWhite', { r: 0.22 }));
  g.add(accentStripe(w - 0.4, domain, { y: 0.42, z: frontZ + 0.02 }));
  g.add(facePanel(w - 2, h * 0.3, { y: h * 0.32, z: frontZ - 0.02 }));
  g.add(screen(1.2, 0.85, { x: -w * 0.28, y: h + 0.5, z: frontZ - 0.4, tilt: -0.5 }));
  g.add(statusStrip(4, domain, { x: w * 0.26, y: h * 0.62, z: frontZ + 0.01 }));

  // Sloped output collection bay with finished racks.
  const bay = new THREE.Mesh(
    new THREE.BoxGeometry(w - 1.2, 0.2, d - 1.4), m.bodyLight,
  );
  bay.position.set(0, h + 0.35, -0.2);
  bay.rotation.x = -0.2;
  bay.castShadow = true;
  g.add(bay);

  const capColors = [0x2f6df6, 0x17b0a4, 0x8b5cf6];
  const tubeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8);
  const rackGeo = new THREE.BoxGeometry(w - 2, 0.16, 0.6);
  for (let r = 0; r < 2; r++) {
    const rz = -0.6 + r * 0.8;
    const ry = h + 0.5 - r * 0.14;
    const rack = new THREE.Mesh(rackGeo, m.darkTrim);
    rack.position.set(0, ry, rz);
    g.add(rack);
    for (let t = 0; t < 8; t++) {
      const tube = new THREE.Mesh(
        tubeGeo,
        new THREE.MeshStandardMaterial({
          color: capColors[(r + t) % capColors.length], roughness: 0.55,
        }),
      );
      tube.position.set(-w / 2 + 1.2 + t * ((w - 2.4) / 7), ry + 0.3, rz);
      g.add(tube);
    }
  }

  g.add(casters(w, d, { inset: 0.6 }));
  return g;
}
