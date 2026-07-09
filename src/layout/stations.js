// ---------------------------------------------------------------------------
// Master layout of the automation line — same left-to-right order as the
// reference: Dynamic Inlet → Centrifuges → Decapper → Aliquoter → Coagulation
// → Command Central (Hematology) → Hematology → SMS → Immunoassay → SMS →
// Chemistry → Command Central (Chemistry) → Outlet → Secondary Decapper →
// Recapper → Stockyards. The transport track runs the full length in front.
//
// Coordinate convention:
//   +X  = along the line (Dynamic Inlet at low X, Stockyards at high X)
//   z=0 = transport-track centerline; belt half-width ≈ 1.6
//   back-row instruments sit at -Z (front face just behind the belt)
//   command desks sit at +Z (operator side, in front of the belt)
// ---------------------------------------------------------------------------

const BELT_GAP = 1.9; // distance from belt centerline to an instrument's face

// Resolve footprint-center Z from which side of the belt a unit sits on.
function placeZ(depth, side) {
  return side === 'front' ? BELT_GAP + depth / 2 : -(BELT_GAP + depth / 2);
}

const RAW = [
  {
    id: 'inlet', name: 'Dynamic Inlet', short: 'Inlet', domain: 'preanalytic',
    type: 'inlet', x: 6, w: 9, d: 6, h: 3.4, side: 'back',
    desc: 'Entry point where racked tubes are loaded, barcode-read and released onto the transport track.',
    meta: ['Sample entry', 'Bulk loading', 'Barcode ID'],
  },
  {
    id: 'centrifuges', name: 'Centrifuges', short: 'Centrifuges', domain: 'centrifuge',
    type: 'centrifuge', x: 29, w: 24, d: 7, h: 3.3, side: 'back', units: 4,
    desc: 'Bank of automated centrifuges spinning samples to separate serum and plasma before processing.',
    meta: ['4 units', 'Serum / plasma', 'Balanced load'],
  },
  {
    id: 'decapper', name: 'Decapper', short: 'Decapper', domain: 'preanalytic',
    type: 'decapper', x: 49, w: 8, d: 6, h: 3.2, side: 'back',
    desc: 'Removes tube caps automatically so aliquoting and analyzers can aspirate sample.',
    meta: ['Cap removal', 'Preanalytic'],
  },
  {
    id: 'aliquoter', name: 'Aliquoter', short: 'Aliquoter', domain: 'preanalytic',
    type: 'aliquoter', x: 63, w: 11, d: 6.5, h: 3.3, side: 'back',
    desc: 'Creates secondary aliquot tubes, dividing a primary sample across downstream departments.',
    meta: ['Secondary tubes', 'Sample split', 'Labeling'],
  },
  {
    id: 'coagulation', name: 'Coagulation', short: 'Coagulation', domain: 'coagulation',
    type: 'analyzer', x: 84, w: 20, d: 8, h: 3.6, side: 'back', units: 2, hoods: true,
    models: ['STAGO', 'STAGO'],
    desc: 'Coagulation analyzers (STAGO) measuring clotting parameters such as PT, aPTT and fibrinogen.',
    meta: ['STAGO ×2', 'PT / aPTT', 'Hemostasis'],
  },
  {
    id: 'cmdHema', name: 'Command Central · Hematology', short: 'Cmd · Hematology', domain: 'command',
    type: 'command', x: 98, w: 11, d: 5, h: 2.6, side: 'front',
    desc: 'Operator control station overseeing the hematology and coagulation cells of the line.',
    meta: ['Control desk', 'Monitoring', 'Operator'],
  },
  {
    id: 'hematology', name: 'Hematology', short: 'Hematology', domain: 'hematology',
    type: 'analyzer', x: 115, w: 22, d: 8, h: 3.7, side: 'back', units: 2, hoods: true,
    models: ['DxH 3s', 'DxH 2s'],
    desc: 'Hematology analyzers (DxH 3s / DxH 2s) producing complete blood counts and differentials.',
    meta: ['DxH 3s', 'DxH 2s', 'CBC / Diff'],
  },
  {
    id: 'sms1', name: 'SMS', short: 'SMS', domain: 'sms',
    type: 'sms', x: 129, w: 6.5, d: 5, h: 2.9, side: 'back',
    desc: 'Sample Management System buffer — sorts, stages and reroutes tubes between departments.',
    meta: ['Sorting', 'Buffering', 'Routing'],
  },
  {
    id: 'immunoassay', name: 'Immunoassay', short: 'Immunoassay', domain: 'immunoassay',
    type: 'analyzer', x: 148, w: 27, d: 8.5, h: 3.8, side: 'back', units: 3, hoods: true,
    models: ['DxI 1 & 2', 'DxI 3'],
    desc: 'Immunoassay analyzers (DxI) running hormone, cardiac, tumor-marker and infectious-disease panels.',
    meta: ['DxI 1 & 2', 'DxI 3', 'Chemiluminescence'],
  },
  {
    id: 'sms2', name: 'SMS', short: 'SMS', domain: 'sms',
    type: 'sms', x: 165, w: 6.5, d: 5, h: 2.9, side: 'back',
    desc: 'Second Sample Management System node linking immunoassay and chemistry departments.',
    meta: ['Sorting', 'Buffering', 'Routing'],
  },
  {
    id: 'chemistry', name: 'Chemistry', short: 'Chemistry', domain: 'chemistry',
    type: 'analyzer', x: 184, w: 31, d: 9, h: 3.9, side: 'back', units: 3, hoods: true,
    models: ['AU 1', 'AU 2', 'Cobas'],
    desc: 'Clinical chemistry analyzers (AU 1, AU 2, Cobas) running high-volume metabolic and enzyme panels.',
    meta: ['AU ×2', 'Cobas', 'Photometry'],
  },
  {
    id: 'cmdChem', name: 'Command Central · Chemistry', short: 'Cmd · Chemistry', domain: 'command',
    type: 'command', x: 202, w: 11, d: 5, h: 2.6, side: 'front',
    desc: 'Operator control station overseeing the chemistry and immunoassay cells of the line.',
    meta: ['Control desk', 'Monitoring', 'Operator'],
  },
  {
    id: 'outlet', name: 'Outlet 2', short: 'Outlet', domain: 'outlet',
    type: 'outlet', x: 216, w: 10, d: 6, h: 3.2, side: 'back',
    desc: 'Output module where completed tubes exit the analytic path toward capping and storage.',
    meta: ['Sample exit', 'Post-analytic'],
  },
  {
    id: 'secDecapper', name: 'Secondary Decapper', short: 'Sec. Decapper', domain: 'preanalytic',
    type: 'decapper', x: 228, w: 8, d: 5.5, h: 3.1, side: 'back',
    desc: 'Removes caps again for tubes requiring re-processing before they are recapped for archive.',
    meta: ['Cap removal', 'Rework path'],
  },
  {
    id: 'recapper', name: 'Recapper', short: 'Recapper', domain: 'preanalytic',
    type: 'recapper', x: 240, w: 9, d: 6, h: 3.2, side: 'back',
    desc: 'Applies fresh caps to tubes to seal them safely before long-term refrigerated storage.',
    meta: ['Cap sealing', 'Archive prep'],
  },
  {
    id: 'stockyards', name: 'Stockyards', short: 'Stockyards', domain: 'outlet',
    type: 'stockyards', x: 258, w: 16, d: 8, h: 4.3, side: 'back',
    desc: 'Refrigerated storage & retrieval — a robotic archive that stores tubes and recalls them for add-on tests.',
    meta: ['Refrigerated', 'Robotic archive', 'Retrieval'],
  },
];

export const STATIONS = RAW.map((s) => ({
  ...s,
  z: placeZ(s.d, s.side),
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
