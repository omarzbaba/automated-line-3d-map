import * as THREE from 'three';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createWalk } from './core/walk.js';
import { createLabels } from './core/labels.js';
import { createInteraction } from './core/interaction.js';
import { createHud } from './core/hud.js';
import { buildInstruments } from './builders/instruments.js';
import { buildTrack } from './builders/track.js';

const canvas = document.getElementById('scene');
const app = document.getElementById('app');

// --- Scene graph ---
const { renderer, scene } = createScene(canvas);
const cam = createCamera(renderer);

const instruments = buildInstruments();
scene.add(instruments.group);

const track = buildTrack();
scene.add(track.group);

// --- HUD + labels + interaction ---
const hud = createHud(instruments.entries, selectStation);
const labels = createLabels(app, instruments.entries, selectStation);
const interaction = createInteraction(
  cam.camera, renderer.domElement, instruments.group, instruments.entries,
  { onHover: handleHover, onSelect: selectStation },
);

const walk = createWalk(cam.camera, renderer.domElement, () => setMode('orbit'));

// --- State ---
let selected = null;
let mode = 'orbit';
let flowOn = true;

function handleHover(station) {
  const s = station || selected;
  if (s) {
    hud.showCard(s);
    hud.setActive(s.id);
    labels.setHighlight(s.id);
  } else {
    hud.hideCard();
    hud.setActive(null);
    labels.setHighlight(null);
  }
}

function selectStation(station) {
  selected = station;
  stopTour();
  hud.showCard(station);
  hud.setActive(station.id);
  labels.setHighlight(station.id);
  if (mode === 'walk') setMode('orbit');
  cam.focus(station);
}

// --- Mode switching (orbit vs walk) ---
const btnOrbit = document.getElementById('btnOrbit');
const btnWalk = document.getElementById('btnWalk');
const walkhint = document.getElementById('walkhint');

function setMode(next) {
  mode = next;
  const isWalk = next === 'walk';
  cam.controls.enabled = !isWalk;
  interaction.setEnabled(!isWalk);
  btnWalk.classList.toggle('is-active', isWalk);
  btnOrbit.classList.toggle('is-active', !isWalk);
  walkhint.hidden = !isWalk;
  if (isWalk) {
    stopTour();
    walk.enable();
  } else {
    walk.disable();
  }
}

btnOrbit.addEventListener('click', () => setMode('orbit'));
btnWalk.addEventListener('click', () => setMode('walk'));

// --- Reset ---
document.getElementById('btnReset').addEventListener('click', () => {
  selected = null;
  stopTour();
  if (mode === 'walk') setMode('orbit');
  handleHover(null);
  cam.reset();
});

// --- Labels toggle ---
const btnLabels = document.getElementById('btnLabels');
btnLabels.addEventListener('click', () => {
  const next = !labels.visible;
  labels.setVisible(next);
  btnLabels.classList.toggle('is-active', next);
});

// --- Flow toggle ---
const btnFlow = document.getElementById('btnFlow');
btnFlow.addEventListener('click', () => {
  flowOn = !flowOn;
  btnFlow.classList.toggle('is-active', flowOn);
});

// --- Guided tour ---
const btnTour = document.getElementById('btnTour');
const tour = { active: false, i: 0, timer: 0, dwell: 3.0 };

function startTour() {
  tour.active = true;
  tour.i = 0;
  tour.timer = tour.dwell; // trigger first focus immediately
  btnTour.classList.add('is-active');
  if (mode === 'walk') setMode('orbit');
}
function stopTour() {
  if (!tour.active) return;
  tour.active = false;
  btnTour.classList.remove('is-active');
}
btnTour.addEventListener('click', () => (tour.active ? stopTour() : startTour()));

function updateTour(dt) {
  if (!tour.active) return;
  tour.timer += dt;
  if (tour.timer >= tour.dwell && !cam.isAnimating()) {
    const entry = instruments.entries[tour.i % instruments.entries.length];
    selected = entry.station;
    hud.showCard(entry.station);
    hud.setActive(entry.station.id);
    labels.setHighlight(entry.station.id);
    cam.focus(entry.station, 1.6);
    tour.i += 1;
    tour.timer = 0;
    if (tour.i > instruments.entries.length) stopTour();
  }
}

// Cancel tour when the user grabs the camera.
cam.controls.addEventListener('start', stopTour);

// --- Resize ---
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  cam.resize();
  labels.resize();
});

// --- Render loop ---
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode === 'walk') {
    walk.update(dt);
  } else {
    cam.update(dt);
    interaction.update();
  }
  interaction.animate(dt);
  updateTour(dt);
  track.update(dt, flowOn);
  renderer.render(scene, cam.camera);
  labels.render(scene, cam.camera);
}

// --- Intro ---
function intro() {
  const loader = document.getElementById('loader');
  loader.classList.add('is-hidden');
  setTimeout(() => (loader.style.display = 'none'), 700);
  // Gentle settle from a slightly wider pose into the overview.
  const startPos = cam.OVERVIEW.pos.clone().multiplyScalar(1.12);
  startPos.y += 18;
  cam.camera.position.copy(startPos);
  cam.tweenTo(cam.OVERVIEW.pos, cam.OVERVIEW.target, 2.0);
}

loop();
requestAnimationFrame(intro);

// Dev-only inspection handle (harmless in production).
if (import.meta.env?.DEV) {
  window.__map = {
    cam, scene, instruments, selectStation, setMode,
    // Drive the tween + repaint deterministically for headless QA (the preview
    // throttles rAF when idle; a focused browser runs the loop at 60fps).
    step(seconds = 2, frames = 60) {
      for (let i = 0; i < frames; i++) cam.update(seconds / frames);
      interaction.update();
      renderer.render(scene, cam.camera);
      labels.render(scene, cam.camera);
    },
  };
}
