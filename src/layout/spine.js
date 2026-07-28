// ---------------------------------------------------------------------------
// The transport spine's centerline, which the reference renders as a single
// straight run. Everything (the four-sublane track, the docking spurs and station Z
// positions) is anchored to this centerline, so the layout reads as one
// connected line and a bend introduced here propagates to the whole build.
//
// X is the primary axis (Dynamic Inlet at low X → Stockyards at high X); this
// module returns the centerline Z (and heading) for any X.
// ---------------------------------------------------------------------------

export const SPINE = { startX: -4, endX: 237 };

// Centerline Z for a given X along the line. The reference line is a single
// straight run, so the centerline is flat; the helpers below still resolve
// heading/normal generically in case a bend is reintroduced later.
export function spineZ() {
  return 0;
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
