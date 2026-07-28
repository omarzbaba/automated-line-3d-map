import * as THREE from 'three';
import { STATIONS } from '../layout/stations.js';
import { buildInlet } from './modules/inlet.js';
import { buildCentrifuges } from './modules/centrifuge.js';
import { buildDecapper } from './modules/decapper.js';
import { buildAliquoter } from './modules/aliquoter.js';
import { buildAnalyzer } from './modules/analyzer.js';
import { buildCommand } from './modules/command.js';
import { buildSms } from './modules/sms.js';
import { buildOutlet } from './modules/outlet.js';
import { buildRecapper } from './modules/recapper.js';
import { buildStockyards } from './modules/stockyards.js';

const BUILDERS = {
  inlet: buildInlet,
  centrifuge: buildCentrifuges,
  decapper: buildDecapper,
  aliquoter: buildAliquoter,
  analyzer: buildAnalyzer,
  command: buildCommand,
  sms: buildSms,
  outlet: buildOutlet,
  recapper: buildRecapper,
  stockyards: buildStockyards,
};

// Build every station, place it on the line, and tag it for raycasting.
// Returns { group, entries } where entries[i] = { station, group }.
export function buildInstruments() {
  const root = new THREE.Group();
  root.name = 'instruments';
  const entries = [];

  for (const station of STATIONS) {
    const build = BUILDERS[station.type];
    if (!build) continue;
    const g = build(station);
    g.position.set(station.x, 0, station.z);
    if (station.rot) g.rotation.y = station.rot;
    g.name = station.id;

    // Tag every descendant so raycasting can resolve the owning station.
    g.traverse((o) => {
      o.userData.stationId = station.id;
    });
    g.userData.station = station;

    root.add(g);
    entries.push({ station, group: g });
  }

  return { group: root, entries };
}
