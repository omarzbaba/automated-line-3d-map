import * as THREE from 'three';

// First-person "walk through" controls: pointer-lock mouse-look + WASD/QE.
// Kept deliberately simple and robust; the camera stays above the floor.
export function createWalk(camera, domElement, onExit) {
  const state = {
    active: false,
    yaw: 0,
    pitch: 0,
    keys: new Set(),
  };
  const move = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();

  const SPEED = 22;
  const SPRINT = 2.2;
  const EYE_MIN = 1.6;

  function onMouseMove(e) {
    if (!state.active) return;
    state.yaw -= e.movementX * 0.0022;
    state.pitch -= e.movementY * 0.0022;
    const lim = Math.PI / 2 - 0.05;
    state.pitch = Math.max(-lim, Math.min(lim, state.pitch));
  }

  function applyLook() {
    const euler = new THREE.Euler(state.pitch, state.yaw, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
  }

  function onKeyDown(e) {
    if (!state.active) return;
    state.keys.add(e.code);
    if (e.code === 'Escape') disable();
  }
  function onKeyUp(e) {
    state.keys.delete(e.code);
  }

  function onLockChange() {
    if (document.pointerLockElement !== domElement && state.active) {
      disable();
    }
  }

  function enable() {
    if (state.active) return;
    // Seed yaw/pitch from current view direction.
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    state.yaw = Math.atan2(-dir.x, -dir.z);
    state.pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));
    if (camera.position.y < EYE_MIN + 0.4) camera.position.y = 6;
    state.active = true;
    domElement.requestPointerLock?.();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onLockChange);
  }

  function disable() {
    if (!state.active) return;
    state.active = false;
    state.keys.clear();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('pointerlockchange', onLockChange);
    if (document.pointerLockElement === domElement) document.exitPointerLock?.();
    onExit?.();
  }

  function update(dt) {
    if (!state.active) return;
    applyLook();

    forward.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
    right.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
    move.set(0, 0, 0);
    const k = state.keys;
    if (k.has('KeyW') || k.has('ArrowUp')) move.add(forward);
    if (k.has('KeyS') || k.has('ArrowDown')) move.sub(forward);
    if (k.has('KeyD') || k.has('ArrowRight')) move.add(right);
    if (k.has('KeyA') || k.has('ArrowLeft')) move.sub(right);
    if (k.has('KeyE') || k.has('Space')) move.y += 1;
    if (k.has('KeyQ')) move.y -= 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      const speed = SPEED * (k.has('ShiftLeft') || k.has('ShiftRight') ? SPRINT : 1);
      camera.position.addScaledVector(move, speed * dt);
      if (camera.position.y < EYE_MIN) camera.position.y = EYE_MIN;
    }
  }

  return {
    enable,
    disable,
    update,
    get active() {
      return state.active;
    },
  };
}
