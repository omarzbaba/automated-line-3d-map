import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { lineCenterX, lineLength } from '../layout/stations.js';

// Perspective camera + OrbitControls, with smooth (tweened) focus and reset.
export function createCamera(renderer) {
  const centerX = lineCenterX();
  const len = lineLength();

  const camera = new THREE.PerspectiveCamera(
    32, window.innerWidth / window.innerHeight, 0.5, 1200,
  );

  const OVERVIEW = {
    pos: new THREE.Vector3(centerX - 130, 158, 214),
    target: new THREE.Vector3(centerX, 4, -9),
  };
  camera.position.copy(OVERVIEW.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.target.copy(OVERVIEW.target);
  controls.minDistance = 6;
  controls.maxDistance = 620;
  // Full azimuth (360°) is unrestricted; allow a very wide vertical arc so the
  // line can be viewed from almost overhead down to near ground level.
  controls.minPolarAngle = 0.04 * Math.PI;
  controls.maxPolarAngle = 0.92 * Math.PI;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.panSpeed = 1.0;
  controls.rotateSpeed = 0.9;
  controls.zoomSpeed = 1.0;
  controls.zoomToCursor = true;

  // --- Tween state for focus / reset ---
  const anim = {
    active: false, t: 0, dur: 1,
    fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(), toTarget: new THREE.Vector3(),
  };

  // Any manual interaction (drag / wheel / touch) instantly cancels a running
  // fly-to so the camera never fights the user — the #1 source of "glitchiness".
  function cancelTween() {
    anim.active = false;
  }
  controls.addEventListener('start', cancelTween);
  renderer.domElement.addEventListener('wheel', cancelTween, { passive: true });
  renderer.domElement.addEventListener('pointerdown', cancelTween);

  function tweenTo(pos, target, dur = 1.1) {
    anim.fromPos.copy(camera.position);
    anim.toPos.copy(pos);
    anim.fromTarget.copy(controls.target);
    anim.toTarget.copy(target);
    anim.t = 0;
    anim.dur = dur;
    anim.active = true;
  }

  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  function update(dt) {
    if (anim.active) {
      anim.t = Math.min(1, anim.t + dt / anim.dur);
      const e = easeInOut(anim.t);
      camera.position.lerpVectors(anim.fromPos, anim.toPos, e);
      controls.target.lerpVectors(anim.fromTarget, anim.toTarget, e);
      if (anim.t >= 1) anim.active = false;
    }
    controls.update();
  }

  function reset() {
    tweenTo(OVERVIEW.pos, OVERVIEW.target, 1.2);
  }

  // Frame a single station from a pleasing front-right-above angle.
  function focus(station, dur = 1.1) {
    const target = new THREE.Vector3(station.x, (station.h || 3) * 0.62, station.z);
    const reach = Math.max(station.w, station.d) * 1.5 + 14;
    const pos = new THREE.Vector3(
      station.x + reach * 0.55,
      (station.h || 3) + reach * 0.5,
      station.z + reach * 0.95,
    );
    tweenTo(pos, target, dur);
  }

  function isAnimating() {
    return anim.active;
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  return { camera, controls, update, reset, focus, tweenTo, isAnimating, resize, OVERVIEW };
}
