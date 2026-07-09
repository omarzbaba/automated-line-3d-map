import * as THREE from 'three';
import { domainColor } from '../builders/materials.js';

// Pointer interaction: hover highlight + click selection over the instruments.
// Highlighting is non-destructive (shared materials are never mutated): a
// reusable wireframe box and floor ring are resized around the hovered unit.
export function createInteraction(camera, domElement, instrumentsRoot, entries, handlers) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hasPointer = false;
  let hovered = null;
  let enabled = true;

  const stationById = new Map(entries.map((e) => [e.station.id, e]));

  // --- Reusable highlight rig ---
  const highlight = new THREE.Group();
  highlight.visible = false;

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
    new THREE.LineBasicMaterial({ color: 0x2f6df6, transparent: true, opacity: 0.9 }),
  );
  highlight.add(edges);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.72, 48),
    new THREE.MeshBasicMaterial({
      color: 0x2f6df6, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  highlight.add(ring);
  instrumentsRoot.parent.add(highlight);

  function positionHighlight(station) {
    const color = domainColor(station.domain);
    edges.material.color.setHex(color);
    ring.material.color.setHex(color);

    edges.scale.set(station.w + 0.6, station.h + 0.4, station.d + 0.6);
    edges.position.set(station.x, (station.h + 0.4) / 2, station.z);

    const rr = Math.max(station.w, station.d) * 0.62;
    ring.scale.set(rr, rr, 1);
    ring.position.set(station.x, 0.05, station.z);
    highlight.visible = true;
  }

  function setHovered(stationId) {
    if (hovered === stationId) return;
    hovered = stationId;
    if (stationId) {
      const entry = stationById.get(stationId);
      positionHighlight(entry.station);
      domElement.style.cursor = 'pointer';
      handlers.onHover?.(entry.station);
    } else {
      highlight.visible = false;
      domElement.style.cursor = 'default';
      handlers.onHover?.(null);
    }
  }

  function onMove(e) {
    const rect = domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    hasPointer = true;
  }

  function onLeave() {
    hasPointer = false;
    setHovered(null);
  }

  function onClick() {
    if (!enabled || !hovered) return;
    const entry = stationById.get(hovered);
    handlers.onSelect?.(entry.station);
  }

  domElement.addEventListener('pointermove', onMove);
  domElement.addEventListener('pointerleave', onLeave);
  domElement.addEventListener('click', onClick);

  function update() {
    if (!enabled || !hasPointer) return;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(instrumentsRoot.children, true);
    let sid = null;
    for (const h of hits) {
      if (h.object.userData && h.object.userData.stationId) {
        sid = h.object.userData.stationId;
        break;
      }
    }
    setHovered(sid);
  }

  function setEnabled(v) {
    enabled = v;
    if (!v) setHovered(null);
  }

  // Pulse the ring gently for life.
  let t = 0;
  function animate(dt) {
    if (!highlight.visible) return;
    t += dt;
    ring.material.opacity = 0.4 + Math.sin(t * 4) * 0.2;
  }

  return { update, animate, setEnabled, get hovered() { return hovered; } };
}
