import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { domainHex, domainColor } from '../builders/materials.js';

// Label anchor heights rotate through these tiers so neighbouring tags stack at
// different levels instead of colliding — a thin leader stalk ties each tag to
// its machine (echoing the callout lines in the reference render).
const TIERS = [2.0, 3.3, 4.6];

// Floating labels: one domain-colored name tag above each instrument, plus
// small model-name sub-tags at each analyzer unit (e.g. DxH 3s, AU 1, Cobas).
// Clicking a label focuses that station; entries carry back-references so the
// interaction layer can highlight the matching tag on hover.
export function createLabels(container, entries, onSelect) {
  const renderer2d = new CSS2DRenderer();
  renderer2d.setSize(window.innerWidth, window.innerHeight);
  const el = renderer2d.domElement;
  el.style.position = 'absolute';
  el.style.inset = '0';
  el.style.pointerEvents = 'none';
  el.style.zIndex = '10';
  container.appendChild(el);

  const byStation = new Map();

  entries.forEach(({ station, group }, idx) => {
    const hex = domainHex(station.domain);
    const tier = TIERS[idx % TIERS.length];
    const anchorY = station.h + tier;

    // Leader stalk tying the tag to the machine top.
    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, tier, 8),
      new THREE.MeshBasicMaterial({ color: domainColor(station.domain), transparent: true, opacity: 0.7 }),
    );
    stalk.position.set(0, station.h + tier / 2, 0.5);
    group.add(stalk);

    // Main domain label above the instrument.
    const main = document.createElement('div');
    main.className = 'label3d';
    main.style.setProperty('--lc', hex);
    main.textContent = station.name;
    main.style.pointerEvents = 'auto';
    main.addEventListener('click', () => onSelect(station));

    const mainObj = new CSS2DObject(main);
    mainObj.position.set(0, anchorY, 0.5);
    group.add(mainObj);

    const subEls = [];
    // Model sub-labels at each unit centre.
    if (station.models && station.models.length) {
      const centers = group.userData.unitCenters
        || station.models.map((_, i) => (i - (station.models.length - 1) / 2) * (station.w / station.models.length));
      station.models.forEach((model, i) => {
        const sub = document.createElement('div');
        sub.className = 'label3d is-sub';
        sub.style.setProperty('--lc', hex);
        sub.textContent = model;
        sub.style.pointerEvents = 'auto';
        sub.addEventListener('click', () => onSelect(station));
        const subObj = new CSS2DObject(sub);
        subObj.position.set(centers[i] ?? 0, station.h + 1.3, station.d / 2 + 0.2);
        group.add(subObj);
        subEls.push(sub);
      });
    }

    byStation.set(station.id, { main, subEls });
  });

  let visible = true;
  function setVisible(v) {
    visible = v;
    container.classList.toggle('labels-off', !v);
  }

  function setHighlight(stationId) {
    for (const [id, refs] of byStation) {
      const dim = stationId && id !== stationId;
      refs.main.classList.toggle('is-dim', !!dim && visible);
      refs.subEls.forEach((s) => s.classList.toggle('is-dim', !!dim && visible));
    }
  }

  function render(scene, camera) {
    renderer2d.render(scene, camera);
  }

  function resize() {
    renderer2d.setSize(window.innerWidth, window.innerHeight);
  }

  return { setVisible, setHighlight, render, resize, get visible() { return visible; } };
}
