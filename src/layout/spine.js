// ---------------------------------------------------------------------------
// The transport spine's centerline. In the reference the line is not perfectly
// straight — it bows gently and the far third drifts back. Everything (the
// two-lane track, the docking spurs and the station Z positions) is anchored to
// this curve so the whole layout reads as one connected, subtly curving line.
//
// X is the primary axis (Dynamic Inlet at low X → Stockyards at high X); this
// module returns the centerline Z (and heading) for any X.
// ---------------------------------------------------------------------------

export const SPINE = { startX: -6, endX: 277 };

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Centerline Z for a given X along the line.
export function spineZ(x) {
  const t = (x - SPINE.startX) / (SPINE.endX - SPINE.startX);
  const bow = Math.sin(t * Math.PI) * 2.2; // gentle forward bow in the middle
  const drift = smoothstep(0.6, 1, t) * -9; // far third curves back
  const wobble = Math.sin(t * Math.PI * 2.0) * 1.1; // subtle S
  return bow + drift + wobble;
}

// Heading (rotation about Y) of the centerline tangent at X.
export function spineHeading(x) {
  const d = 0.5;
  const dz = spineZ(x + d) - spineZ(x - d);
  const dx = 2 * d;
  return Math.atan2(dz, dx);
}

// Unit normal (perpendicular, pointing to +Z-ish / the near side) at X.
export function spineNormal(x) {
  const h = spineHeading(x);
  // tangent = (cos h, sin h) in (x, z); normal = (-sin h, cos h)
  return { nx: -Math.sin(h), nz: Math.cos(h) };
}

// Sample the centerline into n+1 points with position + heading.
export function sampleSpine(n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = SPINE.startX + (i / n) * (SPINE.endX - SPINE.startX);
    pts.push({ x, z: spineZ(x), heading: spineHeading(x) });
  }
  return pts;
}
