import { DOMAINS, domainHex } from '../builders/materials.js';

// Builds and controls the DOM chrome: domain legend, station jump-list and the
// hover/selection info card.
export function createHud(entries, onSelect) {
  // --- Legend ---
  const legend = document.getElementById('legend');
  const order = [
    'preanalytic', 'centrifuge', 'coagulation', 'hematology',
    'immunoassay', 'chemistry', 'command', 'sms', 'outlet', 'track',
  ];
  for (const key of order) {
    const d = DOMAINS[key];
    if (!d) continue;
    const chip = document.createElement('span');
    chip.className = 'legend-chip';
    const dot = document.createElement('span');
    dot.className = 'legend-dot';
    dot.style.background = domainHex(key);
    chip.append(dot, document.createTextNode(d.label));
    legend.appendChild(chip);
  }

  // --- Station list ---
  const list = document.getElementById('stationlist');
  const buttons = new Map();
  entries.forEach(({ station }, i) => {
    const btn = document.createElement('button');
    btn.className = 'station-item';
    btn.dataset.id = station.id;

    const sw = document.createElement('span');
    sw.className = 'station-swatch';
    sw.style.background = domainHex(station.domain);

    const name = document.createElement('span');
    name.textContent = station.short || station.name;
    name.style.flex = '1';
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';
    name.style.whiteSpace = 'nowrap';

    const num = document.createElement('span');
    num.className = 'station-num';
    num.textContent = String(i + 1).padStart(2, '0');

    btn.append(sw, name, num);
    btn.addEventListener('click', () => onSelect(station));
    list.appendChild(btn);
    buttons.set(station.id, btn);
  });

  function setActive(stationId) {
    for (const [id, btn] of buttons) {
      btn.classList.toggle('is-active', id === stationId);
    }
  }

  // --- Info card ---
  const card = document.getElementById('infocard');
  const accent = document.getElementById('infoAccent');
  const domainEl = document.getElementById('infoDomain');
  const nameEl = document.getElementById('infoName');
  const descEl = document.getElementById('infoDesc');
  const statsEl = document.getElementById('infoStats');
  const metaEl = document.getElementById('infoMeta');

  function showCard(station) {
    const hex = domainHex(station.domain);
    accent.style.background = hex;
    domainEl.style.color = hex;
    domainEl.textContent = (DOMAINS[station.domain]?.label) || station.domain;
    nameEl.textContent = station.name;
    descEl.textContent = station.desc || '';

    statsEl.innerHTML = '';
    (station.stats || []).forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'stat';
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      dd.style.color = hex;
      row.append(dt, dd);
      statsEl.appendChild(row);
    });

    metaEl.innerHTML = '';
    (station.meta || []).forEach((m) => {
      const li = document.createElement('li');
      li.textContent = m;
      metaEl.appendChild(li);
    });
    card.hidden = false;
  }

  function hideCard() {
    card.hidden = true;
  }

  return { setActive, showCard, hideCard };
}
