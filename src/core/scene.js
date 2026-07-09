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
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();

  const centerX = lineCenterX();
  const len = lineLength();

  // --- Lighting ---
  const hemi = new THREE.HemisphereLight(0xffffff, 0xb9c4d2, 0.85);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.55);
  key.position.set(centerX + 40, 70, 55);
  key.target.position.set(centerX, 2, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  const half = len * 0.6;
  const sc = key.shadow.camera;
  sc.left = -half;
  sc.right = half;
  sc.top = 60;
  sc.bottom = -30;
  sc.near = 1;
  sc.far = 260;
  scene.add(key);
  scene.add(key.target);

  const fill = new THREE.DirectionalLight(0xdfe8f5, 0.5);
  fill.position.set(centerX - 50, 35, -40);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.35);
  rim.position.set(centerX, 30, -60);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0xffffff, 0.28));

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
