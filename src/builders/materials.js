import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Design tokens — domain colors drive labels, legend, accent stripes & lights.
// Machine bodies stay in a disciplined white / cool-grey lab palette so the
// colored accents read clearly, matching the clean product-render reference.
// ---------------------------------------------------------------------------

export const DOMAINS = {
  preanalytic: { label: 'Pre-analytic', color: 0x17b0a4 },
  centrifuge: { label: 'Centrifuge', color: 0x5b6b82 },
  coagulation: { label: 'Coagulation', color: 0xe8933a },
  hematology: { label: 'Hematology', color: 0xe0455f },
  immunoassay: { label: 'Immunoassay', color: 0x8b5cf6 },
  chemistry: { label: 'Chemistry', color: 0x2f6df6 },
  command: { label: 'Command Central', color: 0x3a4a63 },
  sms: { label: 'Sample Mgmt (SMS)', color: 0x7c8ba1 },
  outlet: { label: 'Outlet / Stockyards', color: 0x4f7fb3 },
  track: { label: 'Transport track', color: 0x36a86a },
};

export function domainColor(key) {
  return DOMAINS[key] ? DOMAINS[key].color : 0x2f6df6;
}

export function domainHex(key) {
  return '#' + new THREE.Color(domainColor(key)).getHexString();
}

// Body / structural palette (shared, reused instances for performance).
const PALETTE = {
  bodyWhite: 0xf3f6fa,
  bodyLight: 0xe7edf4,
  bodyMid: 0xd4dce6,
  panelGrey: 0xc3cddb,
  darkTrim: 0x2b3444,
  screen: 0x121a29,
  screenGlow: 0x2bd4c8,
  metal: 0xaab4c2,
  metalDark: 0x8a94a3,
  glass: 0xbfe0ea,
  rubber: 0x2f3640,
  floor: 0xe9eef4,
  belt: 0x3f8f5f,
  beltDark: 0x2f7a4c,
};

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.62,
    metalness: opts.metalness ?? 0.06,
    ...opts,
  });
}

// Cache — built once, shared across every instrument.
let cache = null;

export function materials() {
  if (cache) return cache;
  cache = {
    bodyWhite: std(PALETTE.bodyWhite, { roughness: 0.55 }),
    bodyLight: std(PALETTE.bodyLight, { roughness: 0.6 }),
    bodyMid: std(PALETTE.bodyMid, { roughness: 0.62 }),
    panel: std(PALETTE.panelGrey, { roughness: 0.5, metalness: 0.15 }),
    darkTrim: std(PALETTE.darkTrim, { roughness: 0.5, metalness: 0.2 }),
    metal: std(PALETTE.metal, { roughness: 0.35, metalness: 0.75 }),
    metalDark: std(PALETTE.metalDark, { roughness: 0.4, metalness: 0.7 }),
    rubber: std(PALETTE.rubber, { roughness: 0.9, metalness: 0.0 }),
    floor: std(PALETTE.floor, { roughness: 0.95, metalness: 0.0 }),
    belt: std(PALETTE.belt, { roughness: 0.7 }),
    beltDark: std(PALETTE.beltDark, { roughness: 0.7 }),
    glass: new THREE.MeshStandardMaterial({
      color: PALETTE.glass,
      roughness: 0.12,
      metalness: 0.0,
      transparent: true,
      opacity: 0.34,
    }),
    screen: new THREE.MeshStandardMaterial({
      color: PALETTE.screen,
      roughness: 0.25,
      metalness: 0.1,
      emissive: 0x0c3a55,
      emissiveIntensity: 0.5,
    }),
    screenGlow: new THREE.MeshStandardMaterial({
      color: PALETTE.screenGlow,
      roughness: 0.3,
      emissive: PALETTE.screenGlow,
      emissiveIntensity: 0.85,
    }),
  };
  return cache;
}

// Accent material per domain — cached per color so stripes/lights glow.
const accentCache = new Map();
export function accentMaterial(domainKey) {
  const color = domainColor(domainKey);
  if (accentCache.has(color)) return accentCache.get(color);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0.1,
    emissive: color,
    emissiveIntensity: 0.35,
  });
  accentCache.set(color, m);
  return m;
}

export { PALETTE };
