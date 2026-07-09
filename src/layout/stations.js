// ---------------------------------------------------------------------------
// Master layout of the automation line — same left-to-right order as the
// reference. The line is NOT a single straight conveyor: it is a main transport
// SPINE with analyzer cells that branch off it at 90° via perpendicular spur
// tracks (the reference shows this clearly around the DxI / AU / Cobas cells).
//
// Coordinate convention:
//   +X   = along the line (Dynamic Inlet at low X, Stockyards at high X)
//   z=0  = main-spine transport-track centerline; belt half-width ≈ 1.6
//
//   mount: 'spine' → inline module, front face just behind the belt
//   mount: 'spur'  → analyzer cell set BACK from the spine, reached by a
//                    perpendicular 90° spur track (built in builders/branches.js)
//   mount: 'desk'  → operator control desk on the near (+Z) side of the spine
// ---------------------------------------------------------------------------

const SPINE_GAP = 1.9; // belt centerline → inline module face
const DESK_GAP = 2.2; // belt centerline → command desk (near side)
const SPUR_LEN = 7.5; // default length of a perpendicular spur branch

// Resolve footprint-center Z from the mount type + spur length.
function placeZ(depth, mount, spur) {
  if (mount === 'desk') return DESK_GAP + depth / 2;
  if (mount === 'spur') return -(SPINE_GAP + (spur || SPUR_LEN) + depth / 2);
  return -(SPINE_GAP + depth / 2);
}

const RAW = [
  {
    id: 'inlet', name: 'Dynamic Inlet', short: 'Inlet', domain: 'preanalytic',
    type: 'inlet', x: 6, w: 9, d: 6, h: 3.4, mount: 'spine',
    desc: 'Entry point where racked tubes are loaded, barcode-read and released onto the transport track.',
    meta: ['Sample entry', 'Bulk loading', 'Barcode ID'],
  },
  {
    id: 'centrifuges', name: 'Centrifuges', short: 'Centrifuges', domain: 'centrifuge',
    type: 'centrifuge', x: 29, w: 24, d: 7, h: 3.3, mount: 'spur', spur: 5.5, units: 4,
    desc: 'Bank of automated centrifuges spinning samples to separate serum and plasma before processing.',
    meta: ['4 units', 'Serum / plasma', 'Balanced load'],
  },
  {
    id: 'decapper', name: 'Decapper', short: 'Decapper', domain: 'preanalytic',
    type: 'decapper', x: 49, w: 8, d: 6, h: 3.2, mount: 'spine',
    desc: 'Removes tube caps automatically so aliquoting and analyzers can aspirate sample.',
    meta: ['Cap removal', 'Preanalytic'],
  },
  {
    id: 'aliquoter', name: 'Aliquoter', short: 'Aliquoter', domain: 'preanalytic',
    type: 'aliquoter', x: 63, w: 11, d: 6.5, h: 3.3, mount: 'spine',
    desc: 'Creates secondary aliquot tubes, dividing a primary sample across downstream departments.',
    meta: ['Secondary tubes', 'Sample split', 'Labeling'],
  },
  {
    id: 'coagulation', name: 'Coagulation', short: 'Coagulation', domain: 'coagulation',
    type: 'analyzer', x: 84, w: 20, d: 8, h: 3.6, mount: 'spur', spur: 7, units: 2, hoods: true,
    models: ['STAGO', 'STAGO'],
    desc: 'Coagulation analyzers (STAGO) measuring clotting parameters such as PT, aPTT and fibrinogen. Fed from the spine by a 90° spur.',
    meta: ['STAGO ×2', 'PT / aPTT', 'Hemostasis'],
  },
  {
    id: 'cmdHema', name: 'Command Central · Hematology', short: 'Cmd · Hematology', domain: 'command',
    type: 'command', x: 100, w: 11, d: 5, h: 2.6, mount: 'desk',
    desc: 'Operator control station overseeing the hematology and coagulation cells of the line.',
    meta: ['Control desk', 'Monitoring', 'Operator'],
  },
  {
    id: 'hematology', name: 'Hematology', short: 'Hematology', domain: 'hematology',
    type: 'analyzer', x: 116, w: 22, d: 8, h: 3.7, mount: 'spur', spur: 8, units: 2, hoods: true,
    models: ['DxH 3s', 'DxH 2s'],
    desc: 'Hematology analyzers (DxH 3s / DxH 2s) producing complete blood counts and differentials. Reached by a 90° spur off the spine.',
    meta: ['DxH 3s', 'DxH 2s', 'CBC / Diff'],
  },
  {
    id: 'sms1', name: 'SMS', short: 'SMS', domain: 'sms',
    type: 'sms', x: 131, w: 6.5, d: 5, h: 2.9, mount: 'spine',
    desc: 'Sample Management System buffer — sorts, stages and reroutes tubes between departments on the spine.',
    meta: ['Sorting', 'Buffering', 'Routing'],
  },
  {
    id: 'immunoassay', name: 'Immunoassay', short: 'Immunoassay', domain: 'immunoassay',
    type: 'analyzer', x: 150, w: 27, d: 8.5, h: 3.8, mount: 'spur', spur: 8.5, units: 3, hoods: true,
    models: ['DxI 1 & 2', 'DxI 3'],
    desc: 'Immunoassay analyzers (DxI) running hormone, cardiac, tumor-marker and infectious-disease panels. Branches off the spine at 90°.',
    meta: ['DxI 1 & 2', 'DxI 3', 'Chemiluminescence'],
  },
  {
    id: 'sms2', name: 'SMS', short: 'SMS', domain: 'sms',
    type: 'sms', x: 167, w: 6.5, d: 5, h: 2.9, mount: 'spine',
    desc: 'Second Sample Management System node linking the immunoassay and chemistry departments.',
    meta: ['Sorting', 'Buffering', 'Routing'],
  },
  {
    id: 'chemistry', name: 'Chemistry', short: 'Chemistry', domain: 'chemistry',
    type: 'analyzer', x: 187, w: 31, d: 9, h: 3.9, mount: 'spur', spur: 9.5, units: 3, hoods: true,
    models: ['AU 1', 'AU 2', 'Cobas'],
    desc: 'Clinical chemistry analyzers (AU 1, AU 2, Cobas) on a prominent perpendicular wing branching off the spine — the deepest 90° cell on the line.',
    meta: ['AU ×2', 'Cobas', 'Photometry'],
  },
  {
    id: 'cmdChem', name: 'Command Central · Chemistry', short: 'Cmd · Chemistry', domain: 'command',
    type: 'command', x: 205, w: 11, d: 5, h: 2.6, mount: 'desk',
    desc: 'Operator control station overseeing the chemistry and immunoassay cells of the line.',
    meta: ['Control desk', 'Monitoring', 'Operator'],
  },
  {
    id: 'outlet', name: 'Outlet 2', short: 'Outlet', domain: 'outlet',
    type: 'outlet', x: 219, w: 10, d: 6, h: 3.2, mount: 'spine',
    desc: 'Output module where completed tubes exit the analytic path toward capping and storage.',
    meta: ['Sample exit', 'Post-analytic'],
  },
  {
    id: 'secDecapper', name: 'Secondary Decapper', short: 'Sec. Decapper', domain: 'preanalytic',
    type: 'decapper', x: 231, w: 8, d: 5.5, h: 3.1, mount: 'spine',
    desc: 'Removes caps again for tubes requiring re-processing before they are recapped for archive.',
    meta: ['Cap removal', 'Rework path'],
  },
  {
    id: 'recapper', name: 'Recapper', short: 'Recapper', domain: 'preanalytic',
    type: 'recapper', x: 243, w: 9, d: 6, h: 3.2, mount: 'spine',
    desc: 'Applies fresh caps to tubes to seal them safely before long-term refrigerated storage.',
    meta: ['Cap sealing', 'Archive prep'],
  },
  {
    id: 'stockyards', name: 'Stockyards', short: 'Stockyards', domain: 'outlet',
    type: 'stockyards', x: 261, w: 16, d: 8, h: 4.3, mount: 'spur', spur: 6, units: 1,
    desc: 'Refrigerated storage & retrieval — a robotic archive on a 90° spur that stores tubes and recalls them for add-on tests.',
    meta: ['Refrigerated', 'Robotic archive', 'Retrieval'],
  },
];

export const STATIONS = RAW.map((s) => ({
  ...s,
  z: placeZ(s.d, s.mount, s.spur),
}));

// Track spans a little beyond the first and last station.
export const LINE = {
  startX: -6,
  endX: STATIONS[STATIONS.length - 1].x + 12,
  z: 0,
  beltHalf: 1.6,
};

export function lineCenterX() {
  return (LINE.startX + LINE.endX) / 2;
}

export function lineLength() {
  return LINE.endX - LINE.startX;
}

// Spur stations that need a perpendicular 90° branch drawn to the spine.
export const SPUR_STATIONS = STATIONS.filter((s) => s.mount === 'spur');
