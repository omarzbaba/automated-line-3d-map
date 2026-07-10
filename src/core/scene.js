import * as THREE from 'three';
import { LINE, lineCenterX, lineLength } from '../layout/stations.js';

// Scene, renderer, lighting and the ground. Tuned for a clean, soft product
// render on a light backdrop (the canvas is transparent; the page gradient
// shows through).
export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();

  const centerX = lineCenterX();
  const len = lineLength();

  // --- Lighting: soft studio setup for a clean product-render look ---
  const hemi = new THREE.HemisphereLight(0xffffff, 0xc4cedb, 1.0);
  scene.add(hemi);

  // Key light — high and to the front-right, soft shadows.
  const key = new THREE.DirectionalLight(0xfff6ec, 1.35);
  key.position.set(centerX + 55, 95, 70);
  key.target.position.set(centerX, 2, -3);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00035;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 5;
  const half = len * 0.62;
  const sc = key.shadow.camera;
  sc.left = -half;
  sc.right = half;
  sc.top = 70;
  sc.bottom = -45;
  sc.near = 1;
  sc.far = 320;
  scene.add(key);
  scene.add(key.target);

  // Cool fill from the opposite side to open up shadows.
  const fill = new THREE.DirectionalLight(0xe3ecf8, 0.6);
  fill.position.set(centerX - 70, 45, -55);
  scene.add(fill);

  // Gentle rim/back light for silhouette separation.
  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(centerX, 40, -80);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0xffffff, 0.32));

  // --- Ground ---
  const groundW = len + 80;
  const groundD = 90;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(groundW, groundD),
    new THREE.MeshStandardMaterial({
      color: 0xeef2f7, roughness: 0.98, metalness: 0, side: THREE.DoubleSide,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(centerX, 0, LINE.z - 4);
  ground.receiveShadow = true;
  scene.add(ground);

  // Subtle floor grid for scale reference.
  const grid = new THREE.GridHelper(groundW, Math.round(groundW / 6), 0xc2ccda, 0xdbe2ec);
  grid.position.set(centerX, 0.02, LINE.z - 4);
  grid.material.transparent = true;
  grid.material.opacity = 0.5;
  scene.add(grid);

  return { renderer, scene, lights: { key, fill, hemi, rim } };
}
