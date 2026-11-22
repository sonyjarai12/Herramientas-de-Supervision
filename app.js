/* ═══════════════════════════════════════════════════════════════════
   OSI-SCRCM · Supervisión y Contraste de Medidores de Energía
   Versión demo local · Osinergmin
═══════════════════════════════════════════════════════════════════ */

'use strict';

// ─── Application state ───────────────────────────────────────────
let state = {
  rawData:         [],          // All rows from Excel
  weeks:           {},          // { weekKey: [rows] }
  selectedWeek:    null,
  selectedMeter:   null,        // row index in week
  locationVerified: false,
  attended:        {},          // { weekKey: { meterKey: actaData } }
  signatures:      null,        // { empresaSig, supervisorSig, ... }
  ranges:          {},          // { weekKey: { C, R, CM } }  next acta numbers
  formData:        {},          // { weekKey: { empresa, codSupervisor, anio, semestre } }
  weekStatus:      {},          // { weekKey: 'Pendiente'|'En progreso'|'Concluida'|'Finalizada' }
  supervisores:    [],          // [ { name, code, id } ]
  actasF7:         {},          // { weekKey: [ { nro, medidores:[keys], emitidaEn } ] }
  datosReemplazo:  {},          // { weekKey: { meterKey: datos de la base } }
  semanasVisibles: [],          // semanas en pantalla; vacío = todas
  filtroGeo:       { departamento: '', provincia: '', distrito: '' },
  filtroEstado:    'all',       // all | pending | done
};

// Máximo de medidores que caben en un acta F7 (columnas D..H del formato)
const MAX_MEDIDORES_POR_ACTA = 5;

// Concesionaria supervisada: es la misma para todas las actas.
const CONCESIONARIA_POR_DEFECTO = 'ELECTRO ORIENTE S.A.';

let map = null;
let mapMarkers = {};

// ─── Datos precargados (muestra_medidores.xlsx) ──────────────────

// ─── DOM helpers ─────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const show = id => $(id).classList.remove('hidden');
const hide = id => $(id).classList.add('hidden');
function showToast(msg, ms = 2800) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.style.opacity = 1;
  setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.classList.add('hidden'), 300); }, ms);
}
function closeModal(id) { $(id).classList.add('hidden'); }

// ─── Excel Load ───────────────────────────────────────────────────
$('excelInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  $('fileLabel').textContent = file.name;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb = XLSX.read(ev.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      parseExcel(rows);
      $('modalExcelMsg').textContent = `${file.name} — ${state.rawData.length} registros cargados.`;
      show('modalExcel');
    } catch (err) {
      showToast('Error al leer el Excel. Verifica el formato.', 3500);
    }
  };
  reader.readAsArrayBuffer(file);
});

// UTM a Lat/Lng (algoritmo estándar Snyder, verificado con puntos de referencia)
function utmToLatLng(easting, northing, zone = 18, hemisphere = 'S') {
  const a = 6378137;                 // semi-eje mayor (WGS84)
  const f = 1 / 298.257223563;       // achatamiento
  const k0 = 0.9996;
  const e = Math.sqrt(f * (2 - f));  // primera excentricidad
  const e2 = e * e;
  const ep2 = e2 / (1 - e2);         // segunda excentricidad al cuadrado

  const x = easting - 500000;
  let y = northing;
  if (hemisphere === 'S') y -= 10000000;

  const M = y / k0;
  const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const phi1 = mu
    + (3*e1/2 - 27*e1*e1*e1/32) * Math.sin(2*mu)
    + (21*e1*e1/16 - 55*e1*e1*e1*e1/32) * Math.sin(4*mu)
    + (151*e1*e1*e1/96) * Math.sin(6*mu)
    + (1097*e1*e1*e1*e1/512) * Math.sin(8*mu);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1)**2);
  const T1 = Math.tan(phi1)**2;
  const C1 = ep2 * Math.cos(phi1)**2;
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(phi1)**2, 1.5);
  const D = x / (N1 * k0);

  const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (
      D*D/2
    - (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*ep2) * D*D*D*D/24
    + (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*ep2 - 3*C1*C1) * D*D*D*D*D*D/720
  );

  const lng = (
      D
    - (1 + 2*T1 + C1) * D*D*D/6
    + (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*ep2 + 24*T1*T1) * D*D*D*D*D/120
  ) / Math.cos(phi1);

  const lonOrigin = (zone - 1) * 6 - 180 + 3;
  return {
    lat: lat * 180 / Math.PI,
    lng: lonOrigin + lng * 180 / Math.PI
  };
}

function parseExcel(rows) {
  if (rows.length < 2) { showToast('El archivo Excel está vacío.'); return; }
  const headers = rows[0];
  const colMap = {};
  headers.forEach((h, i) => {
    if (h) {
      const clean = String(h).trim().toUpperCase();
      colMap[clean] = i;
    }
  });

  const COL = {
    SEMANA: colMap['SEMANA'] ?? 0,
    EMPRESA: colMap['EMPRESA'] ?? 1,
    UBIGEO: colMap['UBIGEO'] ?? 2,
    SED: colMap['SED'] ?? 3,
    SUMINISTRO: colMap['SUMINISTRO'] ?? 4,
    DIRECCION: colMap['DIRECCION'] ?? 5,
    USUARIO: colMap['USUARIO'] ?? 6,
    EDAD_MEDIDOR: colMap['EDAD MEDIDOR'] ?? 7,
    MARCA_MODELO: colMap['MARCA MODELO'] ?? 8,
    NRO_SERIE: colMap['NRO SERIE'] ?? 9,
    TIPO_MEDIDOR: colMap['TIPO DE MEDIDOR'] ?? 10,
    NRO_FASES: colMap['NRO DE FASES'] ?? 11,
    CONTRASTADORA: colMap['CONTRASTADORA'] ?? 12,
    TIPO_ACTIVIDAD: colMap['TIPO ACTIVIDAD'] ?? 13,
    FECHA: colMap['FECHA'] ?? 14,
    CONSUMO: colMap['CONSUMO PROMEDIO'] ?? 15,
    COORD_X: colMap['COORDENADA X'] ?? 16,
    COORD_Y: colMap['COORDENADA Y'] ?? 17,
    DEPARTAMENTO: colMap['DEPARTAMENTO'] ?? 18,
    PROVINCIA: colMap['PROVINCIA'] ?? 19,
    DISTRITO: colMap['DISTRITO'] ?? 20,
  };

  state.rawData = [];
  state.weeks   = {};

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[COL.SEMANA]) continue;

    const easting  = parseFloat(r[COL.COORD_X] ?? 0);
    const northing = parseFloat(r[COL.COORD_Y] ?? 0);
    const coordsLatLng = (easting && northing) ? utmToLatLng(easting, northing, 18, 'S') : null;
    const suministro = String(r[COL.SUMINISTRO] ?? '').trim();

    const row = {
      semana:         String(r[COL.SEMANA] ?? '').trim(),
      empresa:        String(r[COL.EMPRESA] ?? '').trim(),
      ubigeo:         String(r[COL.UBIGEO] ?? '').trim(),
      sed:            String(r[COL.SED] ?? '').trim(),
      suministro:     suministro,
      medidor:        suministro,
      direccion:      String(r[COL.DIRECCION] ?? '').trim(),
      usuario:        String(r[COL.USUARIO] ?? '').trim(),
      edadMedidor:    String(r[COL.EDAD_MEDIDOR] ?? '').trim(),
      marcaModelo:    String(r[COL.MARCA_MODELO] ?? '').trim(),
      nroSerie:       String(r[COL.NRO_SERIE] ?? '').trim(),
      tipoMedidor:    String(r[COL.TIPO_MEDIDOR] ?? '').trim(),
      nroFases:       String(r[COL.NRO_FASES] ?? '').trim(),
      contrastadora:  String(r[COL.CONTRASTADORA] ?? '').trim(),
      tipoActividad:  normalizaTipo(r[COL.TIPO_ACTIVIDAD]),
      fecha:          String(r[COL.FECHA] ?? '').trim(),
      consumo:        String(r[COL.CONSUMO] ?? '').trim(),
      coordX:         easting,
      coordY:         northing,
      coordenadas:    coordsLatLng ? `${coordsLatLng.lat},${coordsLatLng.lng}` : '',
      departamento:   String(r[COL.DEPARTAMENTO] ?? '').trim(),
      provincia:      String(r[COL.PROVINCIA] ?? '').trim(),
      distrito:       String(r[COL.DISTRITO] ?? '').trim(),
      _rowIdx:        i,
    };
    state.rawData.push(row);
    if (!state.weeks[row.semana]) state.weeks[row.semana] = [];
    state.weeks[row.semana].push(row);
  }

  populateWeekDropdown();
  // Con la muestra recién cargada se ven todas las semanas: KPIs, chips,
  // agenda y mapa quedan listos sin tener que elegir semana primero.
  state.semanasVisibles = [];
  if (!state.selectedWeek) {
    const prim = Object.keys(state.weeks).sort((a, b) => Number(a) - Number(b))[0];
    if (prim) state.selectedWeek = prim;
  }
  if (Object.keys(state.weeks).length) {
    show('kpiSection'); show('actionsSection'); show('mapSection');
    try { initMap(state.selectedWeek); } catch (e) { console.error('initMap:', e); }
  }
  state.filtroGeo = { departamento: '', provincia: '', distrito: '' };
  state.filtroEstado = 'all';
  renderFiltrosGeo();
  updateKPIs();
  renderChipsSemanas();
  renderResumenFiltro();
  agendaAbiertas.clear();
  renderAgenda();
  updateActionButtons();
  persistState();
}

function populateWeekDropdown() {
  const sel = $('weekSelect');
  sel.innerHTML = '<option value="">— Selecciona semana —</option>';
  Object.keys(state.weeks).sort().forEach(w => {
    const status = getWeekStatus(w);
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = `Semana ${w} — ${status}`;
    sel.appendChild(opt);
  });
  sel.disabled = false;
}

function getWeekStatus(w) {
  if (!state.weeks[w]) return 'Pendiente';
  const total   = state.weeks[w].length;
  const done    = Object.keys((state.attended[w] || {})).length;
  const hasSig  = !!state.signatures;
  if (done === 0)             return 'Pendiente';
  if (done < total)           return 'En progreso';
  if (done === total && !hasSig) return 'Concluida';
  return 'Finalizada';
}

// ─── Week selection ───────────────────────────────────────────────
$('weekSelect').addEventListener('change', function () {
  const w = this.value;
  if (!w) return;
  state.selectedWeek    = w;
  state.selectedMeter   = null;

  // Iniciar seguimiento GPS automático (punto azul en vivo)
  startGPSTracking();

  const rows = state.weeks[w] || [];
  const counts = { C:0, R:0 };
  rows.forEach(r => { if (counts[r.tipoActividad] !== undefined) counts[r.tipoActividad]++; });

  // Default ranges if not set
  if (!state.ranges[w]) {
    state.ranges[w] = { C: 1, R: 1 };
  }

  // Build week summary modal
  let html = `<div class="text-xs font-semibold text-navy mb-2">Semana ${w} · ${rows.length} medidores</div>`;
  html += `<div class="grid grid-cols-2 gap-2">`;
  const types = [
    { key:'C',  label:'Contraste',                   color:'bg-blue-50 border-blue-200' },
    { key:'R',  label:'Reemplazo / Cambio Medidor',  color:'bg-yellow-50 border-yellow-200' },
  ];
  types.forEach(t => {
    const done = Object.values(state.attended[w] || {}).filter(a => a.tipoActividad === t.key).length;
    html += `<div class="border rounded-lg p-2 text-center ${t.color}">
               <div class="font-bold text-lg text-gray-800">${counts[t.key]}</div>
               <div class="text-xs text-muted">${t.label}</div>
               <div class="text-xs text-success font-medium">${done} atendidos</div>
             </div>`;
  });
  html += `</div>`;

  // Acta ranges
  html += `<div class="mt-3 text-xs text-muted"><span class="font-semibold">Rangos de actas:</span>`;
  if (counts.C  > 0) html += ` C: desde ${state.ranges[w].C}`;
  if (counts.R  > 0) html += ` · R: desde ${state.ranges[w].R}`;
  html += `</div>`;

  $('modalWeekContent').innerHTML = html;
  show('modalWeek');

  populateMeterDropdown(w);
  updateKPIs(w);
  show('kpiSection');
  show('actionsSection');
  show('mapSection');
  initMap(w);
  updateActionButtons();
  agendaAbiertas.clear();        // al cambiar de semana se recalculan las jornadas
  renderAgenda();
  persistState();
});

// ─── Meter dropdown ───────────────────────────────────────────────
function populateMeterDropdown(w) {
  const sel = $('meterSelect');
  const filter = $('meterFilter') ? $('meterFilter').value : 'all';
  sel.innerHTML = '<option value="">— Selecciona medidor —</option>';
  const rows = state.weeks[w] || [];
  let shown = 0;
  rows.forEach((r, i) => {
    const done = isAttended(w, meterKey(r));
    // Aplicar filtro
    if (filter === 'pending' && done) return;
    if (filter === 'done' && !done)  return;
    const opt  = document.createElement('option');
    opt.value  = i;
    opt.textContent = `[${r.medidor}] ${r.tipoMedidor} · ${activityLabel(r.tipoActividad)} ${done ? '✓' : ''}`;
    if (done) opt.style.color = '#2E7D32';
    sel.appendChild(opt);
    shown++;
  });
  if (shown === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = filter === 'done' ? '(ningún medidor realizado)' : '(ningún medidor pendiente)';
    sel.appendChild(opt);
  }
  sel.disabled = false;
}

// Reaplica el filtro sobre el dropdown de medidores
function applyMeterFilter() { aplicarFiltroEstado(); }

$('meterSelect').addEventListener('change', function () {
  const idx = parseInt(this.value);
  if (isNaN(idx)) return;
  const w    = state.selectedWeek;
  const row  = state.weeks[w][idx];
  state.selectedMeter   = idx;

  // Location segment
  $('locAddress').textContent  = row.direccion || '—';
  $('locDistrict').textContent = [row.distrito, row.provincia, row.departamento].filter(Boolean).join(', ') || '—';
  show('locationSection');

  // Center map on the point
  const coords = parseCoords(row.coordenadas);
  if (coords && map) {
    map.invalidateSize();
    map.setView([coords.lat, coords.lng], 17);
    if (mapMarkers[meterKey(row)]) {
      mapMarkers[meterKey(row)].openPopup();
    }
  }

  updateDistanceDisplay();   // refresca distancia si ya tenemos GPS
  updateActionButtons();
  persistState();
});

// ─── GPS en vivo (watchPosition) ──────────────────────────────────
let myLocation = null;        // { lat, lng, accuracy }
let myMarker   = null;
let myAccuracyCircle = null;
let gpsWatchId = null;

function startGPSTracking() {
  if (!navigator.geolocation) {
    showToast('Este dispositivo no tiene geolocalización.');
    return;
  }
  if (gpsWatchId !== null) return;  // ya activo

  gpsWatchId = navigator.geolocation.watchPosition(
    pos => {
      myLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy || 0,
      };
      drawMyLocation();
      updateDistanceDisplay();
    },
    err => {
      // 1=permiso denegado, 2=no disponible, 3=timeout
      if (err.code === 1) {
        showToast('Permiso de ubicación denegado. Actívalo para ver tu posición.', 4000);
      } else {
        showToast('Buscando señal GPS…', 2500);
      }
    },
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
  );
}

function drawMyLocation() {
  if (!map || !myLocation) return;
  const ll = [myLocation.lat, myLocation.lng];

  // Punto azul "yo"
  if (!myMarker) {
    myMarker = L.marker(ll, {
      icon: L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#1E5AA8;border:3px solid white;box-shadow:0 0 0 2px #1E5AA8,0 2px 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [18,18], iconAnchor: [9,9],
      }),
      zIndexOffset: 1000,
    }).addTo(map).bindPopup('📍 Tu ubicación actual');
  } else {
    myMarker.setLatLng(ll);
  }

  // Círculo de precisión
  if (!myAccuracyCircle) {
    myAccuracyCircle = L.circle(ll, {
      radius: myLocation.accuracy, color:'#1E5AA8', fillColor:'#1E5AA8',
      fillOpacity: 0.08, weight: 1,
    }).addTo(map);
  } else {
    myAccuracyCircle.setLatLng(ll).setRadius(myLocation.accuracy);
  }
}

// Botón "Mi ubicación": inicia GPS y centra el mapa en mí
function centerOnMe() {
  startGPSTracking();
  if (myLocation && map) {
    map.setView([myLocation.lat, myLocation.lng], 17);
    if (myMarker) myMarker.openPopup();
  } else {
    showToast('Obteniendo tu ubicación GPS…', 3000);
    // Un intento inmediato para no esperar al primer watch
    navigator.geolocation.getCurrentPosition(
      pos => {
        myLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy||0 };
        drawMyLocation();
        updateDistanceDisplay();
        if (map) map.setView([myLocation.lat, myLocation.lng], 17);
      },
      err => showToast('No se pudo obtener tu ubicación.', 3000),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
}

// Muestra la distancia entre yo y el punto seleccionado
function updateDistanceDisplay() {
  const el = $('locDistance');
  if (!el) return;
  const w = state.selectedWeek, idx = state.selectedMeter;
  if (w === null || idx === null || !myLocation) { el.textContent = ''; return; }
  const row = state.weeks[w][idx];
  const c = parseCoords(row.coordenadas);
  if (!c) { el.textContent = ''; return; }
  const dist = haversine(myLocation.lat, myLocation.lng, c.lat, c.lng);
  if (dist <= 10) {
    el.textContent = `📍 Estás dentro del punto (${dist.toFixed(0)} m)`;
    el.style.color = '#2E7D32';
  } else if (dist < 1000) {
    el.textContent = `📍 A ${dist.toFixed(0)} m del punto`;
    el.style.color = dist <= 50 ? '#F57C00' : '#616161';
  } else {
    el.textContent = `📍 A ${(dist/1000).toFixed(1)} km del punto`;
    el.style.color = '#616161';
  }
}

// Google Maps con indicaciones (Cómo llegar) desde mi ubicación al punto
function openGoogleMaps() {
  const w   = state.selectedWeek;
  const idx = state.selectedMeter;
  if (w === null || idx === null) return;
  const row  = state.weeks[w][idx];
  const c    = parseCoords(row.coordenadas);
  if (!c) { showToast('Coordenadas no disponibles.'); return; }
  // Si tenemos la ubicación del usuario, damos indicaciones (dir); si no, solo el punto
  if (myLocation) {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${myLocation.lat},${myLocation.lng}&destination=${c.lat},${c.lng}&travelmode=driving`, '_blank');
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=driving`, '_blank');
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function parseCoords(str) {
  if (!str) return null;
  const parts = String(str).split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
}

// ─── KPI update ───────────────────────────────────────────────────
function updateKPIs() {
  // Suma de todas las semanas visibles, no solo de la del medidor activo.
  let total = 0, done = 0;
  semanasActivas().forEach(w => {
    (state.weeks[w] || []).forEach(row => {
      if (!pasaFiltros(w, row)) return;
      total++;
      if (isAttended(w, meterKey(row))) done++;
    });
  });
  if ($('kpiTotal'))   $('kpiTotal').textContent   = total;
  if ($('kpiPending')) $('kpiPending').textContent = total - done;
  if ($('kpiDone'))    $('kpiDone').textContent    = done;
  renderChipsSemanas();
  actualizarBotonSemanas();
}

// ─── Action button state ──────────────────────────────────────────
// Helper defensivo: si un botón no existe en el HTML, no revienta la función.
// (Un fallo aquí antes abortaba quickSetStatus() ANTES de persistState(),
//  por eso "no guardaba".)
function setBtn(id, disabled) {
  const el = $(id);
  if (el) el.disabled = disabled;
  return el;
}

function updateActionButtons() {
  const w   = state.selectedWeek;
  const idx = state.selectedMeter;
  const meterSelected = w !== null && idx !== null;

  const total = w ? (state.weeks[w] || []).length : 0;
  const done  = w ? Object.keys(state.attended[w] || {}).length : 0;
  const allDone  = total > 0 && done === total;
  const hasSig   = !!state.signatures;

  // Botones rápidos de estado: solo requieren un medidor seleccionado
  setBtn('btnStatusDone',    !meterSelected);
  setBtn('btnStatusPending', !meterSelected);

  // Estado actual del medidor seleccionado (para el hint)
  let isMeterAttended = false, currentResult = '';
  if (meterSelected) {
    const row = state.weeks[w][idx];
    const att = (state.attended[w] || {})[meterKey(row)];
    isMeterAttended = !!att;
    currentResult = att ? (att.resultado || 'Realizado') : '';
  }
  const hint = $('quickStatusHint');
  if (hint) {
    if (!meterSelected) {
      hint.textContent = 'Selecciona un medidor para marcar su estado.';
      hint.style.color = '#616161';
    } else if (isMeterAttended) {
      hint.textContent = `Estado actual: ${currentResult}. Puedes cambiarlo.`;
      hint.style.color = '#2E7D32';
    } else {
      hint.textContent = 'Este medidor está pendiente. Marca su estado.';
      hint.style.color = '#D32F2F';
    }
  }

  // Formulario opcional: solo requiere medidor seleccionado (ya no exige GPS)
  setBtn('btnForm', !meterSelected);

  // Botón Actas F7: se habilita cuando hay al menos un medidor Realizado.
  // El acta agrupa hasta 5 realizados, así que NO depende del medidor seleccionado.
  // Cuenta sobre todas las semanas visibles: el acta abarca el avance completo
  const doneTotal = semanasActivas()
    .reduce((a, sem) => a + Object.keys(state.attended[sem] || {}).length, 0);
  const btnActa = setBtn('btnActa', doneTotal === 0);
  if (btnActa) {
    const nActas = Math.ceil(doneTotal / MAX_MEDIDORES_POR_ACTA);
    btnActa.title = doneTotal === 0
      ? 'Marca medidores como Realizado para poder emitir actas F7'
      : `${doneTotal} realizados → ${nActas} acta(s) F7 de hasta ${MAX_MEDIDORES_POR_ACTA} medidores`;
  }

  // Botón desmarcar: visible si el medidor está atendido
  const btnUnmark = setBtn('btnUnmark', !isMeterAttended);
  if (btnUnmark) btnUnmark.classList.toggle('hidden', !isMeterAttended);

  // Firmar: requiere todos atendidos
  setBtn('btnSign', !allDone);

  // Generar: requiere firma
  setBtn('btnGenerate', !(allDone && hasSig));
}

// ─── Botones rápidos de estado ────────────────────────────────────
// tipo: 'done' (Realizado), 'pending' (No realizado)
function quickSetStatus(tipo) {
  const w   = state.selectedWeek;
  const idx = state.selectedMeter;
  if (w === null || idx === null) { showToast('Selecciona un medidor primero.'); return; }
  const row = state.weeks[w][idx];

  // Aviso de distancia (no bloquea)
  if (myLocation) {
    const c = parseCoords(row.coordenadas);
    if (c) {
      const dist = haversine(myLocation.lat, myLocation.lng, c.lat, c.lng);
      if (dist > 10 && tipo !== 'pending') {
        const ok = confirm(`Estás a ${dist < 1000 ? dist.toFixed(0)+' m' : (dist/1000).toFixed(1)+' km'} del punto (más de 10 m).\n\n¿Marcar de todas formas?`);
        if (!ok) return;
      }
    }
  }

  if (tipo === 'pending') {
    // Quitar de atendidos
    const key = meterKey(row);
    if (state.attended[w] && state.attended[w][key]) delete state.attended[w][key];
    showToast(`"${row.suministro}" marcado como NO realizado.`, 2500);
  } else {
    // Realizado
    const resultado = 'Realizado';

    if (!state.attended[w]) state.attended[w] = {};
    const key = meterKey(row);
    const prev = state.attended[w][key] || {};
    // Datos que dejó cargados la base de reemplazos: se vuelcan ahora,
    // así en campo solo queda marcar el control de sticker.
    const base = datosPrecargados(w, key) || {};
    state.attended[w][key] = Object.assign({}, base, prev, {
      resultado,
      tipoActividad: row.tipoActividad,
      medidor: row.medidor, suministro: row.suministro,
      usuario: row.usuario, direccion: row.direccion,
      distrito: row.distrito, provincia: row.provincia,
      departamento: row.departamento, sed: row.sed,
      nroSerie: row.nroSerie, tipoMedidor: row.tipoMedidor,
      nroFases: row.nroFases, marcaModelo: row.marcaModelo,
      edadMedidor: row.edadMedidor, contrastadora: row.contrastadora,
      consumo: row.consumo, fecha: row.fecha, ubigeo: row.ubigeo,
      empresa: (state.formData[w] && state.formData[w].empresa) || row.empresa,
      // ubicación real donde se marcó (útil para auditoría)
      gpsLat: myLocation ? myLocation.lat : null,
      gpsLng: myLocation ? myLocation.lng : null,
      semana: w, savedAt: new Date().toISOString(),
    });
    showToast(`"${row.suministro}" marcado como ${resultado}.`, 2500);
  }

  // ORDEN CRÍTICO: se guarda PRIMERO y el refresco de UI va aislado.
  // Antes la UI corría antes de persistState() y cualquier excepción
  // (p. ej. un botón inexistente) hacía que el dato no se guardara nunca.
  persistState();
  refrescarUI(w, meterKey(row));
  try { checkWeekComplete(); } catch (e) { console.error('checkWeekComplete:', e); }

  // Al marcar Realizado se piden en el acto el control de sticker, la
  // conclusión y las observaciones: es cuando el supervisor tiene el
  // medidor delante. Los datos del reemplazante se completan después.
  if (tipo !== 'pending') {
    try { abrirModalChecks(w, idx); } catch (e) { console.error('abrirModalChecks:', e); }
  }
}

// Refresco de interfaz tolerante a fallos: nunca debe abortar un guardado.
function refrescarUI(w, key) {
  try { updateKPIs(w); }               catch (e) { console.error('updateKPIs:', e); }
  try { if (key) refreshMapMarker(w, key); } catch (e) { console.error('refreshMapMarker:', e); }
  try { populateMeterDropdown(w); }    catch (e) { console.error('populateMeterDropdown:', e); }
  try { updateActionButtons(); }       catch (e) { console.error('updateActionButtons:', e); }
  try { renderAgenda(); }              catch (e) { console.error('renderAgenda:', e); }
}


// ═══════════════════════════════════════════════════════════════════
//  FORMULARIO DE CHECKS
//  Se abre al marcar un suministro como Realizado: control de sticker,
//  conclusión y observaciones. Los datos del medidor reemplazante se
//  completan después, en el modal de actas, antes de generar el PDF.
// ═══════════════════════════════════════════════════════════════════
function abrirModalChecks(w, idx) {
  const row = (state.weeks[w] || [])[idx];
  if (!row) return;
  const key = meterKey(row);
  const reg = (state.attended[w] || {})[key];
  if (!reg) return;

  const sel = (id, val, etiqueta) => `
    <div class="flex items-center gap-3 p-2.5 bg-white rounded border border-gray-200">
      <label class="flex-1 text-sm text-gray-800">${etiqueta}</label>
      <div class="flex gap-1.5">
        <button type="button" onclick="marcarCheck('${id}','SI')" id="${id}_SI"
          class="chk-btn ${val === 'SI' ? 'chk-on-si' : ''}">SÍ</button>
        <button type="button" onclick="marcarCheck('${id}','NO')" id="${id}_NO"
          class="chk-btn ${val === 'NO' ? 'chk-on-no' : ''}">NO</button>
      </div>
      <input type="hidden" id="${id}" value="${val || ''}" />
    </div>`;

  let html = `<div class="space-y-4">`;

  // Referencia del suministro
  html += `<div class="bg-blue-50 border-l-4 border-blue rounded p-3 text-xs space-y-0.5">
    <div class="font-semibold text-navy text-sm mb-1">${escapeHtml(String(row.suministro))} · ${activityLabel(row.tipoActividad)}</div>
    <div><span class="text-muted">Titular:</span> ${escapeHtml(row.usuario || '')}</div>
    <div><span class="text-muted">Dirección:</span> ${escapeHtml(row.direccion || '')}</div>
    <div><span class="text-muted">Medidor retirado:</span> serie ${escapeHtml(row.nroSerie || '')} · ${escapeHtml(row.marcaModelo || '')} · año ${escapeHtml(anioFabricacion(reg))}</div>
  </div>`;

  // Lo que ya trajo la base: el supervisor solo lo confirma de un vistazo.
  const pre = Object.assign({}, datosPrecargados(w, key) || {}, reg);
  if (pre.nuevoSerie || pre.numVerificacion) {
    html += `<div class="form-section">Datos ya cargados (de la base de reemplazos)</div>`;
    html += `<div class="bg-green-50 border-l-4 border-green-600 rounded p-3 text-xs space-y-1">
      ${pre.nuevoSerie ? `<div><span class="text-muted">Medidor nuevo:</span> <b>${escapeHtml(pre.nuevoSerie)}</b> · ${escapeHtml(pre.nuevaMarca || '')} ${escapeHtml(pre.nuevoAnio || '')}</div>` : ''}
      ${pre.numHomologacion ? `<div><span class="text-muted">Homologación:</span> ${escapeHtml(pre.numHomologacion)} · <span class="text-muted">Certificado:</span> ${escapeHtml(pre.numCertificado || '—')}</div>` : ''}
      ${pre.nroActaReemplazo ? `<div><span class="text-muted">Acta de reemplazo:</span> N° ${escapeHtml(pre.nroActaReemplazo)} del ${escapeHtml(pre.fechaReemplazo || '—')}</div>` : ''}
      ${pre.numVerificacion ? `<div><span class="text-muted">Aferición:</span> ${escapeHtml(pre.numVerificacion)} · ${escapeHtml(pre.fechaVerificacion || '')} · ${escapeHtml(pre.empresaVerificacion || '')}</div>` : ''}
      <div class="text-muted pt-1">Solo falta el control de sticker. Si algo no coincide, corrígelo luego en Actas F7.</div>
    </div>`;
  }

  // Supervisor que levanta el acta: su código es el prefijo del
  // N° de Acta de Inspección y puede cambiar de un suministro a otro.
  const sups = state.supervisores || [];
  // Se preselecciona para no repetir el paso en cada medidor: el que ya
  // tenía el registro, si no el último usado, si no el único que haya.
  const supSel = reg.supervisorCodigo
    || state.ultimoSupervisor
    || (sups.length === 1 ? sups[0].code : '');
  html += `<div class="form-section">Supervisor a cargo</div>`;
  if (sups.length === 0) {
    html += `<div class="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 text-xs mb-1">
      No hay supervisores registrados. Agrégalos en la pestaña
      <span class="font-medium">Supervisores</span>: su código es el que numera cada acta.
    </div>`;
  } else {
    html += `<div class="form-group">
      <label class="form-label">Supervisor (su código numera el acta de inspección)</label>
      <select id="chk_sup" class="input-select">
        <option value="">-- Seleccionar --</option>
        ${sups.map(s => `<option value="${escapeHtml(s.code)}" ${supSel === s.code ? 'selected' : ''}>${escapeHtml(s.code)} · ${escapeHtml(s.name)}</option>`).join('')}
      </select>
    </div>`;
  }

  // Control de sticker
  html += `<div class="form-section">Control de Sticker</div>`;
  html += `<div class="space-y-2">
    ${sel('chk_s1', reg.sticker1, '¿Se colocó Sticker?')}
    ${sel('chk_s2', reg.sticker2, '¿El color corresponde?')}
    ${sel('chk_s3', reg.sticker3, '¿Son visibles los datos?')}
    ${sel('chk_s4', reg.sticker4, '¿Registro de datos es correcto?')}
  </div>`;

  // Conclusión
  html += `<div class="form-section">Conclusión</div>`;
  html += `<div class="space-y-2">
    ${sel('chk_concl', reg.conclusion, '¿Cumplió con reemplazar el medidor?')}
  </div>`;

  // Observaciones
  html += `<div class="form-group">
    <label class="form-label">Observaciones del Supervisor</label>
    <textarea id="chk_obs" class="input-field" rows="3"
      placeholder="Lo observado en campo...">${escapeHtml(reg.observaciones || '')}</textarea>
  </div>`;

  html += `<div class="bg-gray-50 border border-gray-200 rounded p-2.5 text-xs text-muted">
    Los datos del medidor reemplazante (serie, marca y año) se completan en
    <span class="font-medium text-gray-700">Actas F7</span>, antes de generar el PDF.
  </div>`;

  html += `<div class="flex gap-2 pt-2 border-t border-gray-200">
    <button onclick="closeModal('modalChecks')"
      class="py-2 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Completar después</button>
    <button onclick="guardarChecks('${w}','${idx}')"
      class="btn-blue py-2 px-5 rounded-lg text-sm font-medium flex-1">Guardar datos ✓</button>
  </div>`;

  html += `</div>`;

  $('checksContent').innerHTML = html;
  $('checksTitle').textContent = `Inspección · Suministro ${row.suministro}`;
  show('modalChecks');
}

// Alterna un check SÍ/NO (volver a pulsar la misma opción la deselecciona).
function marcarCheck(id, valor) {
  const campo = $(id);
  if (!campo) return;
  const nuevo = campo.value === valor ? '' : valor;
  campo.value = nuevo;
  const bSi = $(id + '_SI'), bNo = $(id + '_NO');
  if (bSi) bSi.className = 'chk-btn' + (nuevo === 'SI' ? ' chk-on-si' : '');
  if (bNo) bNo.className = 'chk-btn' + (nuevo === 'NO' ? ' chk-on-no' : '');
}

function guardarChecks(w, idx) {
  w = isNaN(Number(w)) ? w : Number(w);
  idx = parseInt(idx);
  const row = (state.weeks[w] || [])[idx];
  if (!row) return;
  const reg = (state.attended[w] || {})[meterKey(row)];
  if (!reg) { showToast('El medidor ya no figura como realizado.'); return; }

  const v = id => { const el = $(id); return el ? String(el.value).trim() : ''; };

  const supCod = v('chk_sup');
  const sup    = (state.supervisores || []).find(s => s.code === supCod);

  Object.assign(reg, {
    sticker1:      v('chk_s1'),
    sticker2:      v('chk_s2'),
    sticker3:      v('chk_s3'),
    sticker4:      v('chk_s4'),
    conclusion:    v('chk_concl'),
    observaciones: v('chk_obs'),
    anioRetirado:  anioFabricacion(reg),   // viene de EDAD MEDIDOR (la muestra)
    supervisorCodigo: supCod,
    supervisorNombre: sup ? sup.name : '',
  });
  if (supCod) state.ultimoSupervisor = supCod;   // se propone en el siguiente

  persistState();
  refrescarUI(w, meterKey(row));
  closeModal('modalChecks');
  showToast(`Datos de inspección guardados para ${row.suministro}.`, 2500);
}

// Desmarcar un medidor (quitar del estado "attended")
function unmarkMeter() {
  const w   = state.selectedWeek;
  const idx = state.selectedMeter;
  if (w === null || idx === null) return;

  const row = state.weeks[w][idx];
  const key = meterKey(row);

  if (confirm(`¿Desmarcar "${row.suministro}" como completado?\n\nSe eliminará el formulario guardado para este medidor.`)) {
    // Remove from attended
    if (state.attended[w] && state.attended[w][key]) {
      delete state.attended[w][key];
    }

    persistState();          // guardar primero
    refrescarUI(w, key);     // refresco aislado

    showToast(`Medidor "${row.suministro}" desmarcado como no completado.`, 3000);
  }
}

// ─── Map init ─────────────────────────────────────────────────────
function initMap(w) {
  if (!map) {
    // Iconos de Leaflet servidos localmente (sin internet siguen apareciendo)
    if (L.Icon && L.Icon.Default) L.Icon.Default.imagePath = 'vendor/images/';
    map = L.map('map', { zoomControl: true }).setView([-9.19, -75.0], 5);

    // Capas base disponibles (ninguna requiere API key)
    const baseLayers = {
      'Calles (Esri)': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri', maxZoom: 19 }
      ),
      'Satélite (Esri)': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri', maxZoom: 19 }
      ),
      'Topográfico (Esri)': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri', maxZoom: 19 }
      ),
      'OpenStreetMap': L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '© OpenStreetMap contributors', maxZoom: 19 }
      )
    };

    // Capa por defecto: Esri Calles (más confiable, sin API key)
    baseLayers['Calles (Esri)'].addTo(map);

    // Control para cambiar de capa manualmente (arriba a la derecha)
    L.control.layers(baseLayers, null, { position: 'topright', collapsed: false }).addTo(map);

    // Arreglar tamaño del mapa (necesario cuando el contenedor se muestra después)
    setTimeout(() => { if (map) map.invalidateSize(); }, 200);
  } else {
    Object.values(mapMarkers).forEach(m => map.removeLayer(m));
    mapMarkers = {};
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
  }

  // Se pintan los puntos de TODAS las semanas visibles: en campo se avanza
  // en varias a la vez y conviene verlas juntas en el mapa.
  const rows = [];
  semanasActivas().forEach(sem => {
    (state.weeks[sem] || []).forEach((row, rowIdx) => {
      if (pasaFiltros(sem, row)) rows.push({ sem, row, rowIdx });
    });
  });

  rows.forEach(({ sem, row, rowIdx }) => {
    const c = parseCoords(row.coordenadas);
    if (!c) return;
    const key    = meterKey(row);
    const att    = (state.attended[sem] || {})[key];
    const color  = markerColor(att);
    const icon   = L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [14,14], iconAnchor: [7,7],
    });
    const estadoTxt = att ? (att.resultado || 'Realizado') : 'Pendiente';
    const marker = L.marker([c.lat, c.lng], { icon })
      .addTo(map)
      .bindPopup(`<b>${row.suministro}</b> <span style="color:#616161">· Sem ${sem}</span><br>${activityLabel(row.tipoActividad)} · ${row.tipoMedidor}<br>${row.direccion}<br><span style="color:${color};font-weight:600">${estadoTxt}</span>`);
    // Clic en marcador → seleccionar ese medidor, aunque sea de otra semana
    marker.on('click', () => seleccionarDesdeAgenda(sem, rowIdx));
    mapMarkers[key] = marker;
  });

  if (rows.length > 0) {
    const coords = rows.map(r => parseCoords(r.row.coordenadas)).filter(Boolean);
    if (coords.length > 0) {
      map.fitBounds(coords.map(c => [c.lat, c.lng]), { padding: [30,30] });
    }
  }
}

// Color del marcador según estado
function markerColor(att) {
  if (!att) return '#D32F2F';    // rojo: pendiente
  return '#2E7D32';              // verde: realizado
}

function refreshMapMarker(w, key) {
  if (!map || !mapMarkers[key]) return;
  const row  = (state.weeks[w] || []).find(r => meterKey(r) === key);
  if (!row) return;
  const att  = (state.attended[w] || {})[key];
  const color = markerColor(att);
  mapMarkers[key].setIcon(L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14,14], iconAnchor: [7,7],
  }));
  const estadoTxt = att ? (att.resultado || 'Realizado') : 'Pendiente';
  mapMarkers[key].setPopupContent(`<b>${row.suministro}</b><br>${activityLabel(row.tipoActividad)} · ${row.tipoMedidor}<br>${row.direccion}<br><span style="color:${color};font-weight:600">${estadoTxt}</span>`);
}

// ─── FORM MODAL ───────────────────────────────────────────────────
let formStep = 0; // 0=config, 1..N=acta per meter

function openFormModal() {
  const w   = state.selectedWeek;
  const idx = state.selectedMeter;
  if (w === null || idx === null) return;
  const row  = state.weeks[w][idx];
  formStep   = 0;
  renderFormStep0(w, idx, row);
  show('modalForm');
}

function renderFormStep0(w, idx, row) {
  // Accept being called with no args — use current state
  if (w === undefined)   w   = state.selectedWeek;
  if (idx === undefined) idx = state.selectedMeter;
  if (!row && w !== null && idx !== null) row = state.weeks[w][idx];
  if (!row) return;
  const fd  = state.formData[w] || {};
  const rng = state.ranges[w]   || { C:1, R:1 };
  const rows = state.weeks[w];
  const counts = { C:0, R:0 };
  rows.forEach(r => { if (counts[r.tipoActividad] !== undefined) counts[r.tipoActividad]++; });

  const empresas = ['ELECTRO ORIENTE S.A.', 'ELECTRO SUR ESTE', 'SEAL', 'EDELNOR', 'LUZ DEL SUR', 'HIDRANDINA', 'ELECTROCENTRO', 'ELECTRONOROESTE'];

  let html = `<div class="space-y-4">`;
  html += `<div class="form-section">Datos Generales</div>`;
  html += `<div class="grid grid-cols-2 gap-3">
    <div class="form-group col-span-2">
      <label class="form-label">Empresa Eléctrica</label>
      <select id="fEmpresa" class="input-select">
        ${empresas.map(e => `<option ${fd.empresa===e?'selected':''}>${e}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Código Supervisor</label>
      <input id="fCodSup" class="input-field" value="${fd.codSupervisor||''}" placeholder="Ej: 012" />
    </div>
    <div class="form-group">
      <label class="form-label">Año</label>
      <input id="fAnio" class="input-field" value="${fd.anio||new Date().getFullYear()}" placeholder="2026" />
    </div>
    <div class="form-group col-span-2">
      <label class="form-label">Semestre</label>
      <select id="fSemestre" class="input-select">
        <option value="1" ${fd.semestre==='1'?'selected':''}>1er Semestre</option>
        <option value="2" ${fd.semestre==='2'?'selected':''}>2do Semestre</option>
      </select>
    </div>
  </div>`;

  html += `<div class="form-section">Rangos de Actas</div>`;
  html += `<table class="range-table">
    <thead><tr><th>Tipo</th><th>Descripción</th><th>Cantidad</th><th>Siguiente N°</th></tr></thead>
    <tbody>`;
  const typeLabels = { C:'Contraste', R:'Reemplazo / Cambio de Medidor' };
  ['C','R'].forEach(t => {
    html += `<tr>
      <td class="font-bold">${t}</td>
      <td>${typeLabels[t]}</td>
      <td>${counts[t]}</td>
      <td><input id="rng_${t}" type="number" class="input-field text-center w-20" value="${rng[t]}" min="1" /></td>
    </tr>`;
  });
  html += `</tbody></table>`;

  html += `<div class="form-section">Medidor Actual</div>`;
  html += renderMeterInfo(row);

  html += `<div class="flex justify-end gap-2 pt-2">
    <button onclick="closeModal('modalForm')" class="py-2 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Cancelar</button>
    <button onclick="saveFormStep0()" class="btn-blue py-2 px-5 rounded-lg text-sm">Guardar y Continuar →</button>
  </div>`;
  html += `</div>`;
  $('formContent').innerHTML = html;
}

function renderMeterInfo(row) {
  return `<div class="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
    <div class="grid grid-cols-2 gap-1">
      <span class="text-muted">Suministro:</span> <span class="font-medium">${row.suministro}</span>
      <span class="text-muted">Titular:</span>    <span class="font-medium">${row.usuario}</span>
      <span class="text-muted">Dirección:</span>  <span class="font-medium">${row.direccion}</span>
      <span class="text-muted">Distrito:</span>   <span class="font-medium">${row.distrito}</span>
      <span class="text-muted">SED:</span>        <span class="font-medium">${row.sed}</span>
      <span class="text-muted">Suministro:</span> <span class="font-medium">${row.suministro}</span>
      <span class="text-muted">Tipo Medidor:</span> <span class="font-medium">${row.tipoMedidor}</span>
      <span class="text-muted">Serie:</span>      <span class="font-medium">${row.nroSerie}</span>
      <span class="text-muted">Marca/Modelo:</span><span class="font-medium">${row.marcaModelo}</span>
      <span class="text-muted">Año fabricación:</span><span class="font-medium">${row.edadMedidor}</span>
      <span class="text-muted">Nro Fases:</span> <span class="font-medium">${row.nroFases}</span>
      <span class="text-muted">Actividad:</span>  <span class="font-medium">${activityLabel(row.tipoActividad)}</span>
      <span class="text-muted">Contrastadora:</span><span class="font-medium">${row.contrastadora}</span>
      <span class="text-muted">Consumo:</span>    <span class="font-medium">${row.consumo} kWh</span>
      <span class="text-muted">Fecha:</span>      <span class="font-medium">${row.fecha}</span>
    </div>
  </div>`;
}

function saveFormStep0() {
  const w  = state.selectedWeek;
  const fd = {
    empresa:       $('fEmpresa').value,
    codSupervisor: $('fCodSup').value.trim(),
    anio:          $('fAnio').value.trim(),
    semestre:      $('fSemestre').value,
  };
  if (!fd.codSupervisor || !fd.anio) { showToast('Completa todos los campos requeridos.'); return; }
  state.formData[w] = fd;

  const rng = {
    C:  parseInt($('rng_C').value)  || 1,
    R:  parseInt($('rng_R').value)  || 1,
  };
  state.ranges[w] = rng;

  formStep = 1;
  renderFormActaPaso1();
  persistState();
}

function renderFormActaPaso1() {
  const w   = state.selectedWeek;
  const idx = state.selectedMeter;
  const row  = state.weeks[w][idx];
  const fd  = state.formData[w];
  const rng = state.ranges[w];

  const actaNum  = buildActaNumber(row.tipoActividad, rng, fd, w, row);
  const existing = (state.attended[w] || {})[meterKey(row)] || {};

  let html = `<div class="space-y-4">`;

  // Acta header strip
  html += `<div class="bg-navy text-white rounded-lg px-4 py-2 flex items-center justify-between">
    <span class="text-xs font-semibold uppercase">${activityLabel(row.tipoActividad)}</span>
    <span class="text-xs font-mono bg-white/10 px-2 py-0.5 rounded">${actaNum}</span>
  </div>`;

  // Acta data
  html += `<div class="form-section">N° de Acta</div>`;
  html += `<div class="form-group">
    <label class="form-label">Número de Acta (autogenerado)</label>
    <input id="actaNumInput" class="input-field bg-gray-50" value="${existing.nroActa || actaNum}" readonly />
  </div>`;

  html += `<div class="form-section">Datos del Suministro</div>`;
  html += `<div class="grid grid-cols-2 gap-3">
    <div class="form-group">
      <label class="form-label">Suministro</label>
      <input class="input-field" value="${row.suministro}" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">Titular</label>
      <input class="input-field" value="${row.usuario}" readonly />
    </div>
    <div class="form-group col-span-2">
      <label class="form-label">Dirección</label>
      <input class="input-field" value="${row.direccion}" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">Distrito</label>
      <input class="input-field" value="${row.distrito}" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">SED</label>
      <input class="input-field" value="${row.sed}" readonly />
    </div>
  </div>`;

  html += `<div class="form-section">Datos del Medidor</div>`;
  html += `<div class="grid grid-cols-2 gap-3">
    <div class="form-group">
      <label class="form-label">N° Medidor</label>
      <input class="input-field" value="${row.medidor}" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">N° Serie</label>
      <input class="input-field" value="${row.nroSerie}" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">Tipo</label>
      <input class="input-field" value="${row.tipoMedidor}" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">Fases</label>
      <input class="input-field" value="${row.nroFases}" readonly />
    </div>
    <div class="form-group col-span-2">
      <label class="form-label">Marca / Modelo</label>
      <input class="input-field" value="${row.marcaModelo}" readonly />
    </div>
    <div class="form-group col-span-2">
      <label class="form-label">Empresa Contrastadora</label>
      <input class="input-field" value="${row.contrastadora}" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">Consumo Prom.</label>
      <input class="input-field" value="${row.consumo} kWh" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">Fecha Actividad</label>
      <input class="input-field" value="${row.fecha}" readonly />
    </div>
  </div>`;

  html += `<div class="form-section">Actividad Realizada</div>`;
  const tiposActividad = [
    { v:'C',  t:'Contraste' },
    { v:'R',  t:'Reemplazo / Cambio de Medidor' },
  ];
  const currentTipo = existing.tipoActividad || row.tipoActividad;
  html += `<div class="form-group">
    <label class="form-label">Tipo de actividad ejecutada</label>
    <select id="actaTipo" class="input-select">
      ${tiposActividad.map(o => `<option value="${o.v}" ${currentTipo===o.v?'selected':''}>${o.t} (${o.v})</option>`).join('')}
    </select>
    <span class="text-xs text-muted mt-0.5">Programado: ${activityLabel(row.tipoActividad)} (${row.tipoActividad}). Cámbialo si en campo se ejecutó otra actividad.</span>
  </div>`;

  html += `<div class="form-section">Resultado de la Visita</div>`;
  const resultados = ['Contrastado - Conforme', 'Contrastado - No Conforme', 'Medidor Cambiado', 'Medidor Reemplazado', 'No se pudo realizar', 'Pendiente'];
  html += `<div class="form-group">
    <label class="form-label">Resultado</label>
    <select id="actaResult" class="input-select">
      ${resultados.map(r => `<option ${(existing.resultado||'Contrastado - Conforme')===r?'selected':''}>${r}</option>`).join('')}
    </select>
  </div>`;

  // Mostrar campos específicos para Reemplazo
  if (currentTipo === 'R') {
    html += `<div class="form-section bg-green-50 border-l-4 border-green-600 p-3 rounded">Datos de Reemplazo</div>`;
    html += `<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="form-group">
        <label class="form-label">N° Serie Nuevo *</label>
        <input id="actaNuevoSerie" class="input-field" value="${existing.nuevoSerie||''}" placeholder="Serie del medidor nuevo" />
      </div>
      <div class="form-group">
        <label class="form-label">Marca/Modelo Nuevo *</label>
        <input id="actaNuevaMarca" class="input-field" value="${existing.nuevaMarca||''}" placeholder="Marca del nuevo medidor" />
      </div>
      <div class="form-group">
        <label class="form-label">Año Nuevo *</label>
        <input id="actaNuevoAnio" class="input-field" value="${existing.nuevoAnio||''}" placeholder="Año" />
      </div>
    </div>`;

    html += `<div class="form-section">Control de Sticker</div>`;
    html += `<div class="space-y-2">
      <div class="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
        <label class="flex-1 text-sm">¿Se colocó Sticker?</label>
        <select id="actaSticker1" class="input-select w-24">
          <option value="">--</option>
          <option value="SI" ${existing.sticker1==='SI'?'selected':''}>Sí</option>
          <option value="NO" ${existing.sticker1==='NO'?'selected':''}>No</option>
        </select>
      </div>
      <div class="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
        <label class="flex-1 text-sm">¿El color corresponde?</label>
        <select id="actaSticker2" class="input-select w-24">
          <option value="">--</option>
          <option value="SI" ${existing.sticker2==='SI'?'selected':''}>Sí</option>
          <option value="NO" ${existing.sticker2==='NO'?'selected':''}>No</option>
        </select>
      </div>
      <div class="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
        <label class="flex-1 text-sm">¿Son visibles los datos?</label>
        <select id="actaSticker3" class="input-select w-24">
          <option value="">--</option>
          <option value="SI" ${existing.sticker3==='SI'?'selected':''}>Sí</option>
          <option value="NO" ${existing.sticker3==='NO'?'selected':''}>No</option>
        </select>
      </div>
      <div class="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
        <label class="flex-1 text-sm">¿Registro de datos es correcto?</label>
        <select id="actaSticker4" class="input-select w-24">
          <option value="">--</option>
          <option value="SI" ${existing.sticker4==='SI'?'selected':''}>Sí</option>
          <option value="NO" ${existing.sticker4==='NO'?'selected':''}>No</option>
        </select>
      </div>
    </div>`;
  }

  html += `<div class="form-section">Observaciones</div>`;
  html += `<div class="form-group">
    <label class="form-label">Observaciones del Supervisor</label>
    <textarea id="actaObs" class="input-field" rows="3" placeholder="Ingresa observaciones del supervisor...">${existing.observaciones||''}</textarea>
  </div>`;

  html += `<div class="flex justify-between gap-2 pt-2">
    <button onclick="renderFormStep0()"
      class="py-2 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">← Anterior</button>
    <button onclick="saveActa()" class="btn-blue py-2 px-5 rounded-lg text-sm font-medium">Guardar Atención ✓</button>
  </div>`;

  html += `</div>`;
  $('formContent').innerHTML = html;
}

function buildActaNumber(tipo, rng, fd, w, row) {
  const prefixes = { C:'ARM-C', R:'ARM-R' };
  const prefix   = prefixes[tipo] || 'ARM-X';
  const empresa  = (fd.empresa || 'EOR').replace(/[^A-Z]/gi,'').slice(0,3).toUpperCase();
  const sem      = fd.semestre || '1';
  const anio     = fd.anio    || new Date().getFullYear();
  const num      = String(rng[tipo] || 1).padStart(3,'0');
  // Format: ARM-EOR-05-2026-4-001
  return `${prefix}-${empresa}-${String(w).padStart(2,'0')}-${anio}-${sem}-${num}`;
}

function saveActa() {
  const w   = state.selectedWeek;
  const idx = state.selectedMeter;
  const row  = state.weeks[w][idx];
  const fd  = state.formData[w];
  const rng = state.ranges[w];

  const nroActa     = $('actaNumInput').value;
  const observ      = $('actaObs').value.trim();
  const resultado   = $('actaResult').value;
  const nuevoTipo   = $('actaTipo') ? $('actaTipo').value : row.tipoActividad;

  // Si cambió el tipo de actividad en campo, actualizar la fila.
  // meterKey depende del tipo, así que primero limpiamos cualquier
  // registro previo con el tipo anterior para no duplicar.
  const oldKey = meterKey(row);
  if (nuevoTipo !== row.tipoActividad) {
    if (state.attended[w] && state.attended[w][oldKey]) {
      delete state.attended[w][oldKey];
    }
    row.tipoActividad = nuevoTipo;
  }

  if (!state.attended[w]) state.attended[w] = {};
  const key = meterKey(row);

  const actaData = {
    nroActa, observaciones: observ, resultado,
    tipoActividad: row.tipoActividad,
    medidor: row.medidor, suministro: row.suministro,
    usuario: row.usuario, direccion: row.direccion,
    distrito: row.distrito, provincia: row.provincia,
    departamento: row.departamento, sed: row.sed,
    nroSerie: row.nroSerie, tipoMedidor: row.tipoMedidor,
    nroFases: row.nroFases, marcaModelo: row.marcaModelo,
    edadMedidor: row.edadMedidor,
    contrastadora: row.contrastadora, consumo: row.consumo,
    fecha: row.fecha, empresa: fd.empresa, ubigeo: row.ubigeo,
    semana: w, savedAt: new Date().toISOString(),
  };

  // Si es Reemplazo, guardar datos específicos
  if (nuevoTipo === 'R') {
    const nuevoSerie = $('actaNuevoSerie') ? $('actaNuevoSerie').value.trim() : '';
    const nuevaMarca = $('actaNuevaMarca') ? $('actaNuevaMarca').value.trim() : '';
    const nuevoAnio = $('actaNuevoAnio') ? $('actaNuevoAnio').value.trim() : '';
    const sticker1 = $('actaSticker1') ? $('actaSticker1').value : '';
    const sticker2 = $('actaSticker2') ? $('actaSticker2').value : '';
    const sticker3 = $('actaSticker3') ? $('actaSticker3').value : '';
    const sticker4 = $('actaSticker4') ? $('actaSticker4').value : '';

    Object.assign(actaData, {
      nuevoSerie, nuevaMarca, nuevoAnio,
      sticker1, sticker2, sticker3, sticker4,
    });
  }

  state.attended[w][key] = actaData;

  // Advance range counter for the executed activity type
  if (rng[row.tipoActividad] !== undefined) rng[row.tipoActividad]++;
  state.ranges[w] = rng;

  persistState();          // guardar primero
  refrescarUI(w, key);     // refresco aislado

  closeModal('modalForm');
  show('modalAttention');
}

// ─── SIGN MODAL ───────────────────────────────────────────────────
let sigCanvases = {};
let sigDrawing  = {};

function openSignModal() {
  const w = state.selectedWeek;
  const total = (state.weeks[w]||[]).length;
  const done  = Object.keys(state.attended[w]||{}).length;
  if (done < total) { showToast('Debes atender todos los medidores primero.'); return; }

  const existing = state.signatures || {};
  const date = existing.fechaActa || new Date().toISOString().slice(0,10);

  let html = `<div class="space-y-5">`;

  // Sig1
  html += buildSigBlock('sig1', 'Firma Empresa Eléctrica', existing.empresaSig);
  html += `<div class="form-group">
    <label class="form-label">Ingeniero de la Concesionaria</label>
    <input id="ingEmpresa" class="input-field" value="${existing.ingEmpresa||''}" placeholder="Nombre completo" />
  </div>`;

  html += `<div class="border-t border-gray-200 pt-4"></div>`;

  // Sig2
  html += buildSigBlock('sig2', 'Firma Osinergmin', existing.osiSig);
  html += `<div class="form-group">
    <label class="form-label">Ingeniero Supervisor Osinergmin</label>
    <input id="ingOsi" class="input-field" value="${existing.ingOsi||''}" placeholder="Nombre completo" />
  </div>`;

  html += `<div class="form-group">
    <label class="form-label">Empresa Supervisora</label>
    <input id="empSupervisora" class="input-field" value="${existing.empSupervisora||''}" placeholder="Nombre de la empresa supervisora" />
  </div>`;

  html += `<div class="grid grid-cols-2 gap-3">
    <div class="form-group">
      <label class="form-label">Ciudad</label>
      <input id="ciudad" class="input-field" value="${existing.ciudad||'Iquitos'}" />
    </div>
    <div class="form-group">
      <label class="form-label">Fecha del Acta</label>
      <input id="fechaActa" type="date" class="input-field" value="${date}" />
    </div>
  </div>`;

  html += `<button onclick="confirmSignatures()" class="btn-blue w-full py-2.5 rounded-lg text-sm font-medium">Confirmar Firmas ✓</button>`;
  html += `</div>`;

  $('signContent').innerHTML = html;
  show('modalSign');

  // Init canvases
  initSigCanvas('sig1', existing.empresaSig);
  initSigCanvas('sig2', existing.osiSig);
}

function buildSigBlock(id, label, existingSrc) {
  return `<div class="form-group">
    <label class="form-label">${label}</label>
    <canvas id="${id}" class="sig-canvas" width="460" height="120"></canvas>
    <button onclick="clearSig('${id}')" class="mt-1.5 text-xs text-muted hover:text-danger border border-gray-200 rounded px-2 py-1">Limpiar</button>
  </div>`;
}

function initSigCanvas(id, dataUrl) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (dataUrl) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img,0,0,canvas.width,canvas.height);
    img.src = dataUrl;
  }

  let drawing = false;
  let lastX = 0, lastY = 0;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left)*scaleX, y: (src.clientY - rect.top)*scaleY };
  }

  function start(e) { e.preventDefault(); drawing = true; const p = getPos(e); lastX=p.x; lastY=p.y; }
  function move(e)  { e.preventDefault(); if(!drawing) return; const p=getPos(e);
    ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(p.x,p.y);
    ctx.strokeStyle='#0B2A4A'; ctx.lineWidth=1.8; ctx.lineCap='round'; ctx.stroke();
    lastX=p.x; lastY=p.y; }
  function end()    { drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup',   end);
  canvas.addEventListener('mouseleave',end);
  canvas.addEventListener('touchstart',start,{passive:false});
  canvas.addEventListener('touchmove', move, {passive:false});
  canvas.addEventListener('touchend',  end);
}

function clearSig(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
}

function confirmSignatures() {
  const c1 = document.getElementById('sig1');
  const c2 = document.getElementById('sig2');
  const ingEmpresa   = $('ingEmpresa').value.trim();
  const ingOsi       = $('ingOsi').value.trim();
  const empSup       = $('empSupervisora').value.trim();
  const ciudad       = $('ciudad').value.trim();
  const fechaActa    = $('fechaActa').value;

  if (!ingEmpresa || !ingOsi) { showToast('Ingresa los nombres de los ingenieros.'); return; }

  state.signatures = {
    empresaSig:   c1.toDataURL(),
    osiSig:       c2.toDataURL(),
    ingEmpresa, ingOsi, empSupervisora: empSup,
    ciudad, fechaActa,
  };

  persistState();
  closeModal('modalSign');
  updateActionButtons();
  showToast('Firmas guardadas correctamente.', 3000);
}

// ─── GENERATE ACTAS ───────────────────────────────────────────────
function openGenerateModal() {
  const w    = state.selectedWeek;
  const rows = state.weeks[w] || [];
  const att  = state.attended[w] || {};
  const counts = { C:0, R:0 };
  rows.forEach(r => { if (counts[r.tipoActividad] !== undefined) counts[r.tipoActividad]++; });
  const doneC  = Object.values(att).filter(a => a.tipoActividad==='C').length;
  const doneR  = Object.values(att).filter(a => a.tipoActividad==='R').length;

  let html = `<div class="text-xs font-semibold text-navy mb-3">Semana ${w}</div>`;
  html += `<div class="space-y-2">`;
  if (counts.C  > 0) html += summaryRow('Contraste',       doneC,  counts.C);
  if (counts.R  > 0) html += summaryRow('Reemplazo / Cambio Medidor', doneR, counts.R);
  html += `</div>`;
  html += `<p class="text-xs text-muted mt-3">Se generará un PDF por cada acta registrada.</p>`;
  $('generateContent').innerHTML = html;
  show('modalGenerate');
}

function summaryRow(label, done, total) {
  const ok = done === total;
  return `<div class="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
    <span>${label}</span>
    <span class="${ok?'text-success':'text-danger'} font-medium">${done} de ${total} ${ok?'✓ completo':'⚠ incompleto'}</span>
  </div>`;
}

async function generatePDFs() {
  closeModal('modalGenerate');
  const w   = state.selectedWeek;
  const att = Object.values(state.attended[w] || {});
  if (att.length === 0) { showToast('No hay actas para generar.'); return; }
  showToast(`Generando ${att.length} PDF(s)…`, att.length * 3000);

  const sig = state.signatures || {};

  for (let i = 0; i < att.length; i++) {
    const acta = att[i];
    await buildAndDownloadPDF(acta, sig, i);
    await sleep(400);
  }
  showToast('PDFs generados y descargados.', 4000);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function buildAndDownloadPDF(acta, sig, idx) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'mm', format:'a4', orientation:'portrait' });
  const W = 210, H = 297;
  const margin = 18;
  let y = margin;

  // Header band
  doc.setFillColor(11,42,74);
  doc.rect(0,0,W,22,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(13);
  doc.setFont('helvetica','bold');
  doc.text('OSINERGMIN', margin, 10);
  doc.setFontSize(8);
  doc.setFont('helvetica','normal');
  doc.text('Supervisión y Contraste de Medidores de Energía Eléctrica', margin, 16);

  // Acta number
  doc.setTextColor(255,255,255);
  doc.setFontSize(9);
  doc.setFont('helvetica','bold');
  doc.text(acta.nroActa, W-margin, 13, {align:'right'});
  y = 30;

  // Title
  doc.setTextColor(11,42,74);
  doc.setFontSize(11);
  doc.setFont('helvetica','bold');
  doc.text(`ACTA DE ${activityLabel(acta.tipoActividad).toUpperCase()}`, W/2, y, {align:'center'});
  y += 8;

  // Line
  doc.setDrawColor(11,42,74);
  doc.setLineWidth(0.6);
  doc.line(margin, y, W-margin, y);
  y += 6;

  // Section helper
  function section(title) {
    doc.setFillColor(232,238,247);
    doc.rect(margin, y-4, W-2*margin, 7, 'F');
    doc.setTextColor(11,42,74);
    doc.setFontSize(8);
    doc.setFont('helvetica','bold');
    doc.text(title.toUpperCase(), margin+2, y+0.5);
    y += 7;
  }

  function row2col(a,b,c,d) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica','bold'); doc.setTextColor(80,80,80); doc.text(a+':', margin, y);
    doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0); doc.text(String(b), margin+40, y);
    if (c) { doc.setFont('helvetica','bold'); doc.setTextColor(80,80,80); doc.text(c+':', W/2+2, y); }
    if (d) { doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0); doc.text(String(d), W/2+42, y); }
    y += 5.5;
  }

  section('Datos del Suministro');
  row2col('Suministro', acta.suministro, 'Titular', acta.usuario);
  row2col('Dirección', acta.direccion, 'Distrito', acta.distrito);
  row2col('SED', acta.sed, 'Empresa', acta.empresa);

  y += 2;
  section('Datos del Medidor');
  row2col('N° Medidor', acta.medidor, 'N° Serie', acta.nroSerie);
  row2col('Tipo', acta.tipoMedidor, 'Fases', acta.nroFases);
  row2col('Marca/Modelo', acta.marcaModelo, 'Consumo Prom.', acta.consumo+' kWh');
  row2col('Contrastadora', acta.contrastadora, 'Fecha', acta.fecha);

  y += 2;
  section('Resultado');
  doc.setFontSize(9);
  doc.setFont('helvetica','bold');
  const col = acta.resultado === 'Conforme' ? [46,125,50] : [211,47,47];
  doc.setTextColor(...col);
  doc.text('Resultado: ' + (acta.resultado||'—'), margin, y+1);
  y += 6;
  doc.setTextColor(0,0,0);
  doc.setFont('helvetica','normal');
  doc.setFontSize(8.5);
  doc.text('Observaciones: ' + (acta.observaciones||'Sin observaciones.'), margin, y, { maxWidth: W-2*margin });
  y += 16;

  // Signatures
  const sigY = H - 60;
  doc.setDrawColor(200,200,200);
  doc.setLineWidth(0.3);
  doc.line(margin, sigY, 85, sigY);
  doc.line(W/2+5, sigY, W-margin, sigY);

  doc.setFontSize(8);
  doc.setFont('helvetica','bold');
  doc.setTextColor(0,0,0);
  doc.text(sig.ingEmpresa||'', 45, sigY+5, {align:'center'});
  doc.setFont('helvetica','normal');
  doc.text('Empresa Eléctrica', 45, sigY+10, {align:'center'});

  doc.setFont('helvetica','bold');
  doc.text(sig.ingOsi||'', W/2+50, sigY+5, {align:'center'});
  doc.setFont('helvetica','normal');
  doc.text('Ing. Supervisor OSINERGMIN', W/2+50, sigY+10, {align:'center'});

  // Footer
  doc.setFillColor(11,42,74);
  doc.rect(0, H-10, W, 10, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(7);
  doc.text(`OSINERGMIN · ${sig.ciudad||''} · ${sig.fechaActa||new Date().toISOString().slice(0,10)}`, W/2, H-4.5, {align:'center'});

  // Signature images
  function addSigImg(dataUrl, x, maxW, y2) {
    if (!dataUrl || dataUrl === 'data:,') return;
    try { doc.addImage(dataUrl,'PNG',x, y2-22, maxW, 18); } catch(e) {}
  }
  addSigImg(sig.empresaSig, margin, 65, sigY);
  addSigImg(sig.osiSig, W/2+5, 65, sigY);

  doc.save(`${acta.nroActa}.pdf`);
}

// ─── BACKUP ───────────────────────────────────────────────────────
function downloadBackup() {
  const data = JSON.stringify({
    version: '1.0',
    savedAt: new Date().toISOString(),
    state: {
      rawData:    state.rawData,
      weeks:      state.weeks,
      attended:   state.attended,
      signatures: state.signatures,
      ranges:     state.ranges,
      formData:   state.formData,
      weekStatus: state.weekStatus,
      selectedWeek: state.selectedWeek,
    }
  }, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `osi-scrcm-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup descargado correctamente.', 3000);
}

// ─── EXPORTAR EXCEL DE ESTADO (Realizado / No realizado) ──────────
function exportEstadoExcel() {
  if (!state.selectedWeek || Object.keys(state.weeks).length === 0) {
    showToast('Carga un Excel y selecciona una semana primero.');
    return;
  }
  const w = state.selectedWeek;
  const totalW = (state.weeks[w] || []).length;
  const doneW  = Object.keys(state.attended[w] || {}).length;
  const totalAll = Object.values(state.weeks).reduce((s, r) => s + r.length, 0);
  const doneAll  = Object.values(state.attended).reduce((s, o) => s + Object.keys(o).length, 0);

  $('exportContent').innerHTML = `
    <div class="text-xs bg-gray-50 rounded-lg p-3 space-y-1">
      <div class="flex justify-between"><span class="text-muted">Semana ${w}:</span>
        <span><span class="text-success font-semibold">${doneW}</span> / ${totalW} realizados</span></div>
      <div class="flex justify-between"><span class="text-muted">Todas las semanas:</span>
        <span><span class="text-success font-semibold">${doneAll}</span> / ${totalAll} realizados</span></div>
    </div>`;
  show('modalExport');
}

function doExportExcel(scope) {
  closeModal('modalExport');
  const rowsOut = [];
  const weeksToExport = scope === 'all'
    ? Object.keys(state.weeks).sort()
    : [state.selectedWeek];

  weeksToExport.forEach(w => {
    (state.weeks[w] || []).forEach(row => {
      const key = meterKey(row);
      const att = (state.attended[w] || {})[key];
      const realizado = !!att;
      rowsOut.push({
        'SEMANA':          w,
        'EMPRESA':         row.empresa,
        'SED':             row.sed,
        'SUMINISTRO':      row.suministro,
        'DIRECCION':       row.direccion,
        'USUARIO':         row.usuario,
        'NRO SERIE':       row.nroSerie,
        'TIPO MEDIDOR':    row.tipoMedidor,
        'TIPO ACTIVIDAD':  row.tipoActividad,
        'ACTIVIDAD (desc)': activityLabel(row.tipoActividad),
        'DISTRITO':        row.distrito,
        'PROVINCIA':       row.provincia,
        'DEPARTAMENTO':    row.departamento,
        'COORDENADA X':    row.coordX,
        'COORDENADA Y':    row.coordY,
        'ESTADO':          realizado ? 'REALIZADO' : 'NO REALIZADO',
        'RESULTADO':       realizado ? (att.resultado || '') : '',
        'N° ACTA':         realizado ? (att.nroActa || '') : '',
        'OBSERVACIONES':   realizado ? (att.observaciones || '') : '',
        'FECHA REGISTRO':  realizado && att.savedAt ? new Date(att.savedAt).toLocaleString() : '',
      });
    });
  });

  if (rowsOut.length === 0) { showToast('No hay medidores para exportar.'); return; }

  const ws = XLSX.utils.json_to_sheet(rowsOut);

  // Anchos de columna
  ws['!cols'] = [
    {wch:8},{wch:10},{wch:10},{wch:14},{wch:30},{wch:26},{wch:14},{wch:12},
    {wch:8},{wch:16},{wch:18},{wch:16},{wch:14},{wch:13},{wch:13},{wch:14},
    {wch:14},{wch:22},{wch:28},{wch:20}
  ];

  const wb = XLSX.utils.book_new();
  const sheetName = scope === 'all' ? 'Estado_Todas' : `Estado_Sem${state.selectedWeek}`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

  const suffix = scope === 'all' ? 'todas-semanas' : `semana-${state.selectedWeek}`;
  XLSX.writeFile(wb, `estado-medidores-${suffix}-${Date.now()}.xlsx`);

  const realizados = rowsOut.filter(r => r.ESTADO === 'REALIZADO').length;
  showToast(`Excel exportado: ${realizados} realizados, ${rowsOut.length - realizados} no realizados.`, 4000);
}

$('backupInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!parsed.state) throw new Error('Formato inválido');
      const s = parsed.state;
      state.rawData    = s.rawData    || [];
      state.weeks      = rederiveCoords(s.weeks || {});
      state.attended   = s.attended   || {};
      state.signatures = s.signatures || null;
      state.ranges     = s.ranges     || {};
      state.formData   = s.formData   || {};
      state.weekStatus = s.weekStatus || {};
      state.selectedWeek = s.selectedWeek || null;
      state.selectedMeter  = null;
      state.locationVerified = false;

      populateWeekDropdown();
      if (state.selectedWeek) {
        $('weekSelect').value = state.selectedWeek;
        populateMeterDropdown(state.selectedWeek);
        updateKPIs(state.selectedWeek);
        show('kpiSection');
        show('actionsSection');
        show('mapSection');
        initMap(state.selectedWeek);
      }
      updateActionButtons();
      renderAgenda();
      persistState();
      showToast(`Backup restaurado · ${new Date(parsed.savedAt).toLocaleString()}`, 4000);
    } catch (err) {
      showToast('Error al importar el backup: ' + err.message, 4000);
    }
  };
  reader.readAsText(file);
  this.value = '';
});

// ─── RESUME MODAL ─────────────────────────────────────────────────
function openResumeModal() {
  const w = state.selectedWeek;
  if (!w) { showToast('Selecciona una semana primero.'); return; }
  const rng = state.ranges[w] || { C:1, R:1 };

  let html = `<div class="space-y-3">
    <p class="text-xs text-muted">Edita los contadores de actas para retomar donde dejaste.</p>
    <div class="grid grid-cols-3 gap-2">
      ${['C','R'].map(t => `
        <div class="form-group">
          <label class="form-label">${t === 'C' ? 'Contraste' : 'Reemplazo / Cambio Med.'}</label>
          <input id="res_${t}" type="number" class="input-field text-center" value="${rng[t]}" min="1" />
        </div>
      `).join('')}
    </div>
    <button onclick="saveResume()" class="btn-blue w-full py-2 rounded-lg text-sm">Guardar</button>
  </div>`;

  $('resumeContent').innerHTML = html;
  show('modalResume');
}

function saveResume() {
  const w = state.selectedWeek;
  if (!w) return;
  state.ranges[w] = {
    C:  parseInt($('res_C').value)  || 1,
    R:  parseInt($('res_R').value)  || 1,
  };
  persistState();
  closeModal('modalResume');
  showToast('Rangos actualizados.', 2500);
}

// ─── WEEK COMPLETE CHECK ──────────────────────────────────────────
function checkWeekComplete() {
  const w = state.selectedWeek;
  if (!w) return;
  const total = (state.weeks[w]||[]).length;
  const done  = Object.keys(state.attended[w]||{}).length;
  if (done >= total && total > 0) {
    // Update week dropdown
    populateWeekDropdown();
    $('weekSelect').value = w;
    show('modalWeekComplete');
  }
}

// ─── UTILS ───────────────────────────────────────────────────────
// Normaliza el tipo de actividad leído del Excel.
// REEMPLAZO y CAMBIO DE MEDIDOR son la MISMA actividad -> siempre 'R'.
function normalizaTipo(v) {
  const t = String(v ?? '').trim().toUpperCase();
  if (t === 'CM' || t === 'C.M.' || t === 'CAMBIO' || t === 'CAMBIO DE MEDIDOR' ||
      t === 'REEMPLAZO' || t === 'R') return 'R';
  if (t === 'C' || t === 'CONTRASTE') return 'C';
  return t || 'C';
}

// CLAVE ESTABLE del medidor.
// IMPORTANTE: no incluye tipoActividad. Si lo incluyera, al cambiar el tipo
// en el formulario la clave cambiaría y el registro guardado se perdería
// (ése era el bug de "no guarda").
function meterKey(row) {
  return `${row.suministro}_${row.medidor}`;
}
function isAttended(w, key) {
  return !!(state.attended[w] && state.attended[w][key]);
}
function activityLabel(tipo) {
  const m = { C:'Contraste', R:'Reemplazo / Cambio de Medidor' };
  return m[tipo] || tipo;
}

// ─── PERSIST ─────────────────────────────────────────────────────
// Clave de versión: si cambia, se descarta estado viejo incompatible
const STORAGE_KEY = 'osi_scrcm_state_v2';
const OLD_STORAGE_KEYS = ['osi_scrcm_state'];  // versiones previas a limpiar

function persistState() {
  try {
    const toStore = {
      version:      3,
      weeks:        state.weeks,
      attended:     state.attended,
      signatures:   state.signatures,
      ranges:       state.ranges,
      formData:     state.formData,
      weekStatus:   state.weekStatus,
      supervisores: state.supervisores,   // FIX: antes se perdían al recargar
      actasF7:      state.actasF7,        // actas F7 ya emitidas
      f7Base:       state.f7Base,         // actividad, empresa, año, semestre, firmantes
      datosReemplazo: state.datosReemplazo,  // datos de la base a la espera de campo
      ultimoSupervisor: state.ultimoSupervisor,
      semanasVisibles: state.semanasVisibles,
      filtroGeo:    state.filtroGeo,
      filtroEstado: state.filtroEstado,
      f7Ciudad:     state.f7Ciudad,
      actasF7Com:   state.actasF7Com,
      selectedWeek: state.selectedWeek,
      selectedMeter: state.selectedMeter,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    return true;
  } catch(e) {
    // FIX: antes fallaba en silencio y el usuario creía que había guardado
    console.error('persistState falló:', e);
    showToast('No se pudo guardar en este navegador. Descarga un respaldo.', 4000);
    return false;
  }
}

// Re-deriva coordenadas lat/lng desde coordX/coordY (UTM) por si el
// estado guardado trae coordenadas convertidas con una fórmula vieja.
function rederiveCoords(weeks) {
  Object.values(weeks || {}).forEach(rows => {
    (rows || []).forEach(row => {
      const x = parseFloat(row.coordX), y = parseFloat(row.coordY);
      if (x && y) {
        const c = utmToLatLng(x, y, 18, 'S');
        row.coordenadas = `${c.lat},${c.lng}`;
      }
    });
  });
  return weeks;
}


// Migra estado guardado por versiones anteriores:
//  1) tipoActividad 'CM' -> 'R'  (son la misma actividad)
//  2) claves de attended 'suministro_medidor_TIPO' -> 'suministro_medidor'
//  3) rangos: elimina el contador CM sumándolo a R
function migrarEstado() {
  // 1) normalizar tipo en las filas de la muestra
  Object.values(state.weeks || {}).forEach(rows => {
    (rows || []).forEach(r => { r.tipoActividad = normalizaTipo(r.tipoActividad); });
  });

  // 2) re-keyear attended
  Object.keys(state.attended || {}).forEach(w => {
    const bucket = state.attended[w] || {};
    const nuevo  = {};
    Object.keys(bucket).forEach(k => {
      const reg = bucket[k] || {};
      reg.tipoActividad = normalizaTipo(reg.tipoActividad);
      // clave nueva a partir de los datos del propio registro
      const nk = (reg.suministro !== undefined && reg.medidor !== undefined)
        ? `${reg.suministro}_${reg.medidor}`
        : k.split('_').slice(0, 2).join('_');
      nuevo[nk] = Object.assign({}, nuevo[nk] || {}, reg);
    });
    state.attended[w] = nuevo;
  });

  // 3) rangos sin CM
  Object.keys(state.ranges || {}).forEach(w => {
    const r = state.ranges[w] || {};
    if (r.CM !== undefined) {
      r.R = Math.max(parseInt(r.R) || 1, parseInt(r.CM) || 1);
      delete r.CM;
    }
    state.ranges[w] = { C: parseInt(r.C) || 1, R: parseInt(r.R) || 1 };
  });
}

function loadPersistedState() {
  try {
    // Limpiar claves viejas (estado con coordenadas incorrectas)
    OLD_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      state.weeks      = rederiveCoords(s.weeks || {});
      state.attended   = s.attended   || {};
      state.signatures = s.signatures || null;
      state.ranges     = s.ranges     || {};
      state.formData   = s.formData   || {};
      state.weekStatus = s.weekStatus || {};
      state.supervisores = s.supervisores || [];
      state.actasF7    = s.actasF7    || {};
      state.f7Base     = s.f7Base     || null;
      state.datosReemplazo = s.datosReemplazo || {};
      state.ultimoSupervisor = s.ultimoSupervisor || '';
      state.semanasVisibles = s.semanasVisibles || [];
      state.filtroGeo    = s.filtroGeo    || { departamento: '', provincia: '', distrito: '' };
      state.filtroEstado = s.filtroEstado || 'all';
      state.f7Ciudad   = s.f7Ciudad   || '';
      state.actasF7Com = s.actasF7Com || {};
      state.selectedWeek = s.selectedWeek || null;

      migrarEstado();   // CM->R y claves viejas sum_med_tipo -> sum_med

      if (Object.keys(state.weeks).length > 0) {
        populateWeekDropdown();
        if (state.selectedWeek && state.weeks[state.selectedWeek]) {
          $('weekSelect').value = state.selectedWeek;
          populateMeterDropdown(state.selectedWeek);
          updateKPIs(state.selectedWeek);
          show('kpiSection');
          show('actionsSection');
          show('mapSection');
          initMap(state.selectedWeek);
          $('fileLabel').textContent = 'Estado restaurado desde sesión';
        }
      }
      updateActionButtons();
    }
    // Sin estado guardado la app arranca VACÍA: el usuario sube su muestra
    // o agrega medidores a mano. Los supervisores sí se conservan.
  } catch(e) {
    console.error('loadPersistedState:', e);
    showToast('No se pudo leer la sesión guardada. Se empieza en limpio.', 4000);
  }
}

// Borra la muestra y el avance, PERO conserva los supervisores:
// son datos de plantilla que no deberían reescribirse cada vez.
function clearSession() {
  const sups = (state.supervisores || []).length;
  const msg = '¿Borrar la muestra y el avance guardados en este navegador?\n\n'
    + 'Se eliminarán los medidores cargados, los estados y las actas de la sesión.\n'
    + (sups ? `Los ${sups} supervisor(es) registrados SE CONSERVAN.\n` : '')
    + '\nEsto NO afecta tus archivos de backup .json descargados.';
  if (confirm(msg)) {
    const supervisores = state.supervisores || [];
    try {
      localStorage.removeItem(STORAGE_KEY);
      OLD_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
      // volver a guardar solo los supervisores
      if (supervisores.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, supervisores }));
      }
    } catch(e) { console.error('clearSession:', e); }
    location.reload();
  }
}

// ─── TAB SWITCHING ────────────────────────────────────────────────
function switchTab(tabName) {
  const tabOperacionBtn = $('tabOperacion');
  const tabSupervisoresBtn = $('tabSupervisores');
  const tabOperacionContent = $('tabOperacionContent');
  const tabSupervisoresContent = $('tabSupervisoresContent');

  if (tabName === 'operacion') {
    tabOperacionBtn.classList.add('border-blue', 'text-blue');
    tabOperacionBtn.classList.remove('border-transparent', 'text-muted');
    tabSupervisoresBtn.classList.remove('border-blue', 'text-blue');
    tabSupervisoresBtn.classList.add('border-transparent', 'text-muted');
    tabOperacionContent.classList.remove('hidden');
    tabSupervisoresContent.classList.add('hidden');
  } else {
    tabSupervisoresBtn.classList.add('border-blue', 'text-blue');
    tabSupervisoresBtn.classList.remove('border-transparent', 'text-muted');
    tabOperacionBtn.classList.remove('border-blue', 'text-blue');
    tabOperacionBtn.classList.add('border-transparent', 'text-muted');
    tabSupervisoresContent.classList.remove('hidden');
    tabOperacionContent.classList.add('hidden');
    loadSupervisorsList();
  }
}

// ─── SUPERVISORS MANAGEMENT ───────────────────────────────────────
function addSupervisor() {
  const name = $('supervisorName').value.trim();
  const code = $('supervisorCode').value.trim();

  if (!name || !code) {
    showToast('Completa nombre y código del supervisor', 3000);
    return;
  }

  if (!state.supervisores) state.supervisores = [];

  if (state.supervisores.some(s => s.code === code)) {
    showToast('Este código ya existe', 3000);
    return;
  }

  state.supervisores.push({ name, code, id: Date.now() });
  persistState();
  showToast(`Supervisor "${name}" agregado correctamente`, 3000);

  $('supervisorName').value = '';
  $('supervisorCode').value = '';
  loadSupervisorsList();
}

function removeSupervisor(id) {
  if (confirm('¿Eliminar este supervisor?')) {
    state.supervisores = (state.supervisores || []).filter(s => s.id !== id);
    persistState();
    loadSupervisorsList();
    showToast('Supervisor eliminado', 2500);
  }
}

function loadSupervisorsList() {
  const container = $('supervisorsList');
  const supervisores = state.supervisores || [];

  if (supervisores.length === 0) {
    container.innerHTML = '<p class="text-xs text-muted">No hay supervisores registrados aún.</p>';
    return;
  }

  container.innerHTML = supervisores.map(s => `
    <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div>
        <p class="text-sm font-medium text-gray-800">${escapeHtml(s.name)}</p>
        <p class="text-xs text-muted">${escapeHtml(s.code)}</p>
      </div>
      <button onclick="removeSupervisor(${s.id})" class="text-danger hover:text-red-700 text-sm px-2">×</button>
    </div>
  `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── ACTA GENERATION ───────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════
//  ACTAS F7-PO241-PE-01-GO7 · AGRUPADAS
//  El formato F7 tiene 5 columnas de datos (D..H): caben 5 medidores
//  por acta. 20 realizados => 4 actas.
// ═══════════════════════════════════════════════════════════════════

// Medidores REALIZADOS de la semana, en el orden de la muestra.
// Medidores realizados, recorriendo TODAS las semanas visibles.
// Con filtroFecha (clave "2026-08-24") solo los de esa jornada.
// Cada item lleva su semana: un acta puede mezclar semanas si se
// avanzó en varias el mismo día.
function realizadosDeSemana(w, filtroFecha) {
  const semanas = (w === null || w === undefined || w === '') ? semanasActivas() : [w];
  const out = [];
  semanas.forEach(sem => {
    const att = state.attended[sem] || {};
    (state.weeks[sem] || []).forEach((row, idx) => {
      if (filtroFecha && fechaClave(row.fecha) !== filtroFecha) return;
      const key = meterKey(row);
      const reg = att[key];
      if (reg) out.push({ semana: sem, idx, key, row, reg });
    });
  });
  // orden estable: por fecha programada y luego por suministro
  return out.sort((a, b) => (fechaClave(a.row.fecha).localeCompare(fechaClave(b.row.fecha)))
                         || String(a.row.suministro).localeCompare(String(b.row.suministro)));
}

// Parte una lista en grupos de MAX_MEDIDORES_POR_ACTA.
function agruparEnActas(lista) {
  const grupos = [];
  for (let i = 0; i < lista.length; i += MAX_MEDIDORES_POR_ACTA) {
    grupos.push(lista.slice(i, i + MAX_MEDIDORES_POR_ACTA));
  }
  return grupos;
}

// Año de fabricación estimado a partir de la edad del medidor.
// Año de fabricación del MEDIDOR INSTALADO (el que se retira).
// La columna "EDAD MEDIDOR" de la muestra YA CONTIENE el año de fabricación
// (2014, 2018, ...): se toma tal cual, sin calcular nada.
// El año del medidor REEMPLAZANTE sí se captura a mano.
function anioFabricacion(reg) {
  // Si el supervisor lo corrigió en Actas F7, manda lo corregido;
  // si no, se usa el de la muestra.
  const editado = String(reg.anioRetirado ?? '').trim();
  if (editado) return editado;
  return String(reg.edadMedidor ?? '').trim();
}



// <input type="date"> solo entiende aaaa-mm-dd. La base y el acta usan
// dd/mm/aaaa, así que hay que convertir en los dos sentidos: si no, el
// campo aparecía vacío y al guardar borraba la fecha importada.
function aIsoFecha(v) {
  const f = parseFechaProgramada(v);
  return f ? `${f.y}-${dosDig(f.m)}-${dosDig(f.d)}` : '';
}
function deIsoFecha(v) {
  if (!v) return '';
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v).trim();
}

// ─── N° de Acta de Inspección ─────────────────────────────────────
// Formato del procedimiento:  ARM-EOR-CONO05-2026-II-E-001
//   ARM     actividad (Acta de Reemplazo de Medidores)
//   EOR     empresa concesionaria
//   CONO05  código del supervisor que levanta el acta
//   2026    año
//   II-E    semestre
//   001     correlativo de 3 dígitos
function datosBaseActa() {
  const g = state.f7Base || {};
  const hoy = new Date();
  const w = state.selectedWeek;
  return {
    actividad:    g.actividad    ?? 'ARM',
    empresa:      g.empresa      ?? 'EOR',
    codSupervisor: g.codSupervisor ?? ((state.supervisores || [])[0] || {}).code ?? '',
    anio:         g.anio         ?? String(hoy.getFullYear()),
    semestre:     g.semestre     ?? (hoy.getMonth() < 6 ? 'I-E' : 'II-E'),
    correlativo:  g.correlativo  ?? ((state.ranges[w] && state.ranges[w].R) || 1),
    firmaConcNombre: g.firmaConcNombre ?? '',
    firmaConcDni:    g.firmaConcDni    ?? '',
    firmaOsiNombre:  g.firmaOsiNombre  ?? '',
    firmaOsiDni:     g.firmaOsiDni     ?? '',
  };
}

// Arma el número. codSup sustituye al de la base cuando el suministro
// tiene su propio supervisor asignado.
function armarNroActa(base, n, codSup) {
  const cod = (codSup || base.codSupervisor || '').trim();
  return [base.actividad, base.empresa, cod, base.anio, base.semestre,
          String(n).padStart(3, '0')]
         .filter(x => String(x).trim() !== '').join('-');
}

// Lee la cabecera del modal y la guarda para la próxima vez.
function leerBaseDesdeModal() {
  const v = (id, alt) => { const e = $(id); return e ? String(e.value).trim() : alt; };
  const b = datosBaseActa();
  const base = {
    actividad:    v('f7Actividad', b.actividad),
    empresa:      v('f7Empresa', b.empresa),
    codSupervisor:v('f7CodSup', b.codSupervisor),
    anio:         v('f7Anio', b.anio),
    semestre:     v('f7Semestre', b.semestre),
    correlativo:  parseInt(v('f7Correlativo', b.correlativo)) || 1,
    firmaConcNombre: v('f7FirmaConcNombre', b.firmaConcNombre),
    firmaConcDni:    v('f7FirmaConcDni', b.firmaConcDni),
    firmaOsiNombre:  v('f7FirmaOsiNombre', b.firmaOsiNombre),
    firmaOsiDni:     v('f7FirmaOsiDni', b.firmaOsiDni),
  };
  state.f7Base = base;
  return base;
}

// ─── Modal de captura ─────────────────────────────────────────────
function abrirModalActasF7(filtroFecha) {
  const w = state.selectedWeek;
  if (w === null || w === undefined) { showToast('Selecciona una semana primero.'); return; }

  // Jornada elegida desde la agenda; vacío = todos los realizados de la semana
  state.f7Jornada = filtroFecha || null;

  const lista = realizadosDeSemana(null, state.f7Jornada);
  if (lista.length === 0) {
    showToast(state.f7Jornada
      ? 'Esa jornada no tiene medidores marcados como Realizado.'
      : 'No hay medidores marcados como Realizado en esta semana.', 3500);
    return;
  }

  const grupos = agruparEnActas(lista);
  const fd = state.formData[w] || {};
  const hoy = new Date().toISOString().slice(0, 10);

  let html = `<div class="space-y-4">`;

  // Resumen
  const sems = semanasActivas();
  const tituloJornada = state.f7Jornada
    ? `Jornada ${fechaEtiqueta(state.f7Jornada)}`
    : `Todo el avance · semana${sems.length > 1 ? 's' : ''} ${sems.join(', ')}`;
  html += `<div class="bg-blue-50 border-l-4 border-blue rounded p-3">
    <div class="text-xs text-muted mb-0.5">${escapeHtml(tituloJornada)}</div>
    <div class="text-sm font-semibold text-navy">${lista.length} medidores realizados → ${grupos.length} acta${grupos.length > 1 ? 's' : ''} F7</div>
    <div class="text-xs text-muted mt-1">Cada acta admite hasta ${MAX_MEDIDORES_POR_ACTA} medidores (columnas D a H del formato).</div>
  </div>`;

  // Cabecera del acta: se completa ANTES de imprimir.
  // El N° de acta sigue el formato del procedimiento:
  //   ARM-EOR-CONO05-2026-II-E-001
  //   actividad-empresa-códSupervisor-año-semestre-correlativo
  const b = datosBaseActa();
  html += `<div class="form-section">Cabecera del acta (se imprime arriba)</div>`;
  html += `<div class="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 mb-3 space-y-3">
    <div>
      <label class="form-label">Formato del N° de Acta de Inspección</label>
      <div class="flex flex-wrap items-end gap-1.5">
        <div><span class="block text-xs text-muted mb-0.5">Actividad</span>
          <input id="f7Actividad" class="input-field text-center" style="width:62px" value="${escapeHtml(b.actividad)}" /></div>
        <span class="pb-2 text-gray-400">-</span>
        <div><span class="block text-xs text-muted mb-0.5">Empresa</span>
          <input id="f7Empresa" class="input-field text-center" style="width:62px" value="${escapeHtml(b.empresa)}" /></div>
        <span class="pb-2 text-gray-400">-</span>
        <div><span class="block text-xs text-muted mb-0.5">Cód. supervisor</span>
          <input id="f7CodSup" class="input-field text-center" style="width:92px" value="${escapeHtml(b.codSupervisor)}" placeholder="CONO05" /></div>
        <span class="pb-2 text-gray-400">-</span>
        <div><span class="block text-xs text-muted mb-0.5">Año</span>
          <input id="f7Anio" class="input-field text-center" style="width:62px" value="${escapeHtml(b.anio)}" /></div>
        <span class="pb-2 text-gray-400">-</span>
        <div><span class="block text-xs text-muted mb-0.5">Semestre</span>
          <input id="f7Semestre" class="input-field text-center" style="width:68px" value="${escapeHtml(b.semestre)}" placeholder="II-E" /></div>
        <span class="pb-2 text-gray-400">-</span>
        <div><span class="block text-xs text-muted mb-0.5">Desde N°</span>
          <input id="f7Correlativo" type="number" min="1" class="input-field text-center" style="width:76px" value="${b.correlativo}" /></div>
        <button type="button" onclick="aplicarCorrelativoF7()"
          class="py-1.5 px-3 rounded-lg border border-blue text-blue text-xs hover:bg-blue-50 whitespace-nowrap">Numerar</button>
      </div>
      <div class="text-xs text-muted mt-1">Queda: <b class="text-navy" id="f7Ejemplo">${escapeHtml(armarNroActa(b, b.correlativo))}</b>
        · si el suministro tiene supervisor asignado se usa <b>su</b> código.</div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="form-group">
        <label class="form-label">Concesionaria</label>
        <input id="f7Concesionaria" class="input-field" value="${escapeHtml(fd.empresa || CONCESIONARIA_POR_DEFECTO)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Ciudad</label>
        <input id="f7Ciudad" class="input-field" value="${escapeHtml(state.f7Ciudad || 'Yurimaguas')}" />
      </div>
      <div class="form-group">
        <label class="form-label">Fecha del acta</label>
        <input id="f7Fecha" type="date" class="input-field" value="${state.f7Fecha || hoy}" />
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-yellow-200">
      <div>
        <span class="block text-xs font-semibold text-gray-700 mb-1">Firma por la concesionaria</span>
        <input id="f7FirmaConcNombre" class="input-field mb-1" value="${escapeHtml(b.firmaConcNombre)}" placeholder="Ing. Nombre Apellidos" />
        <input id="f7FirmaConcDni" class="input-field" value="${escapeHtml(b.firmaConcDni)}" placeholder="DNI N° 00000000" />
      </div>
      <div>
        <span class="block text-xs font-semibold text-gray-700 mb-1">Firma por OSINERGMIN</span>
        <input id="f7FirmaOsiNombre" class="input-field mb-1" value="${escapeHtml(b.firmaOsiNombre)}" placeholder="Ing. Nombre Apellidos" />
        <input id="f7FirmaOsiDni" class="input-field" value="${escapeHtml(b.firmaOsiDni)}" placeholder="DNI N° 00000000" />
      </div>
      <div class="sm:col-span-2 text-xs text-muted">Déjalos vacíos si prefieres firmar las actas a mano.</div>
    </div>
  </div>`;

  // Tabla editable por medidor
  html += `<div class="form-section">Datos por medidor (se guardan al generar)</div>`;
  html += `<p class="text-xs text-muted mb-2">Los campos en gris vienen de la muestra. Completa los datos del medidor reemplazante y el control de sticker.</p>`;
  html += `<div class="overflow-x-auto border border-gray-200 rounded-lg">
    <table class="w-full text-xs" style="min-width:1050px">
      <thead class="bg-gray-100 text-gray-700">
        <tr>
          <th class="p-2 text-left sticky left-0 bg-gray-100">Acta</th>
          <th class="p-2 text-left">Supervisor</th>
          <th class="p-2 text-left">N° Acta Inspección</th>
          <th class="p-2 text-left">Suministro</th>
          <th class="p-2 text-left">Serie retirado</th>
          <th class="p-2 text-center" title="Viene de EDAD MEDIDOR de la muestra; se puede corregir">Año fab.<br><span class="font-normal text-gray-500">(editable)</span></th>
          <th class="p-2 text-left">N° acta reempl.</th>
          <th class="p-2 text-left">Fecha reempl.</th>
          <th class="p-2 text-left">Serie nuevo *</th>
          <th class="p-2 text-left">Marca/Modelo nuevo *</th>
          <th class="p-2 text-left">Año nuevo *</th>
          <th class="p-2 text-left">Homologación</th>
          <th class="p-2 text-left">Certificado</th>
          <th class="p-2 text-left bg-blue-50">Cert. Aferición</th>
          <th class="p-2 text-left bg-blue-50">Fecha Aferición</th>
          <th class="p-2 text-left bg-blue-50">Empresa que afiere</th>
          <th class="p-2 text-center">Stk 1</th>
          <th class="p-2 text-center">Stk 2</th>
          <th class="p-2 text-center">Stk 3</th>
          <th class="p-2 text-center">Stk 4</th>
          <th class="p-2 text-center">Cumplió</th>
          <th class="p-2 text-left">Observaciones del Supervisor</th>
        </tr>
      </thead>
      <tbody>`;

  // Empresas que ya aparecen en los registros: se ofrecen al escribir
  const empresas = [...new Set(Object.values(state.attended).flatMap(o =>
    Object.values(o || {}).map(r => (r.empresaVerificacion || '').trim())).filter(Boolean))].sort();
  html += `<datalist id="empresasAferidoras">${empresas.map(e => `<option value="${escapeHtml(e)}">`).join('')}</datalist>`;

  const selSiNo = (id, val) => `<select id="${id}" class="input-select text-xs py-1 px-1" style="min-width:56px">
      <option value=""   ${!val ? 'selected' : ''}>--</option>
      <option value="SI" ${val === 'SI' ? 'selected' : ''}>SÍ</option>
      <option value="NO" ${val === 'NO' ? 'selected' : ''}>NO</option>
    </select>`;

  const sups   = state.supervisores || [];
  const baseN  = datosBaseActa();
  let   nCorr  = baseN.correlativo;

  grupos.forEach((grupo, gi) => {
    grupo.forEach(item => {
      const r = item.reg;
      const k = item.key.replace(/[^A-Za-z0-9]/g, '_');
      // El prefijo del N° de acta es el código del supervisor del suministro.
      const cod = r.supervisorCodigo || baseN.codSupervisor || '';
      const nroInsp = r.nroActaInspeccion ||
        (cod ? armarNroActa(baseN, nCorr, cod) : '');
      nCorr++;
      html += `<tr class="border-t border-gray-200 ${gi % 2 ? 'bg-gray-50' : ''}" data-key="${escapeHtml(item.key)}" data-fid="${k}">
        <td class="p-1 font-semibold text-navy sticky left-0 ${gi % 2 ? 'bg-gray-50' : 'bg-white'}">${gi + 1}</td>
        <td class="p-1">
          <select id="f7_sup_${k}" class="input-select text-xs py-1 px-1" style="min-width:104px">
            <option value="">-- Supervisor --</option>
            ${sups.map(s => `<option value="${escapeHtml(s.code)}" ${cod === s.code ? 'selected' : ''}>${escapeHtml(s.code)} · ${escapeHtml(s.name)}</option>`).join('')}
          </select>
        </td>
        <td class="p-1"><input id="f7_nroInsp_${k}" class="input-field text-xs py-1 px-1 font-semibold" style="width:196px" value="${escapeHtml(nroInsp)}" placeholder="ARM-EOR-COD-2026-II-E-001" /></td>
        <td class="p-1 text-gray-600">${escapeHtml(String(r.suministro || ''))}</td>
        <td class="p-1 text-gray-600">${escapeHtml(String(r.nroSerie || ''))}</td>
        <td class="p-1"><input id="f7_anioRet_${k}" class="input-field text-xs py-1 px-1 text-center" style="width:62px" inputmode="numeric" value="${escapeHtml(anioFabricacion(r))}" /></td>
        <td class="p-1"><input id="f7_nroReemp_${k}" class="input-field text-xs py-1 px-1" style="width:92px" value="${escapeHtml(r.nroActaReemplazo || '')}" /></td>
        <td class="p-1"><input id="f7_fechaReemp_${k}" type="date" class="input-field text-xs py-1 px-1" style="width:120px" value="${aIsoFecha(r.fechaReemplazo)}" /></td>
        <td class="p-1"><input id="f7_serie_${k}" class="input-field text-xs py-1 px-1" style="width:100px" value="${escapeHtml(r.nuevoSerie || '')}" /></td>
        <td class="p-1"><input id="f7_marca_${k}" class="input-field text-xs py-1 px-1" style="width:120px" value="${escapeHtml(r.nuevaMarca || '')}" /></td>
        <td class="p-1"><input id="f7_anio_${k}" class="input-field text-xs py-1 px-1" style="width:62px" value="${escapeHtml(r.nuevoAnio || '')}" /></td>
        <td class="p-1"><input id="f7_homol_${k}" class="input-field text-xs py-1 px-1" style="width:92px" value="${escapeHtml(r.numHomologacion || '')}" /></td>
        <td class="p-1"><input id="f7_cert_${k}" class="input-field text-xs py-1 px-1" style="width:92px" value="${escapeHtml(r.numCertificado || '')}" /></td>
        <td class="p-1"><input id="f7_verifNum_${k}" class="input-field text-xs py-1 px-1" style="width:104px" value="${escapeHtml(r.numVerificacion || '')}" placeholder="007851-SX0203" /></td>
        <td class="p-1"><input id="f7_verifFecha_${k}" type="date" class="input-field text-xs py-1 px-1" style="width:120px" value="${aIsoFecha(r.fechaVerificacion)}" /></td>
        <td class="p-1"><input id="f7_verifEmpresa_${k}" class="input-field text-xs py-1 px-1" style="width:170px" value="${escapeHtml(r.empresaVerificacion || '')}" list="empresasAferidoras" placeholder="Empresa que afiere" /></td>
        <td class="p-1 text-center">${selSiNo('f7_s1_' + k, r.sticker1)}</td>
        <td class="p-1 text-center">${selSiNo('f7_s2_' + k, r.sticker2)}</td>
        <td class="p-1 text-center">${selSiNo('f7_s3_' + k, r.sticker3)}</td>
        <td class="p-1 text-center">${selSiNo('f7_s4_' + k, r.sticker4)}</td>
        <td class="p-1 text-center">${selSiNo('f7_concl_' + k, r.conclusion)}</td>
        <td class="p-1"><input id="f7_obs_${k}" class="input-field text-xs py-1 px-1" style="width:190px" value="${escapeHtml(r.observaciones || '')}" placeholder="Observación del supervisor" /></td>
      </tr>`;
    });
  });

  html += `</tbody></table></div>`;

  // Comentarios de la concesionaria: uno por acta (en el formato es una
  // franja de ancho completo, no una celda por medidor).
  html += `<div class="form-section">Comentarios de la concesionaria</div>`;
  grupos.forEach((grupo, gi) => {
    html += `<div class="border border-gray-200 rounded-lg p-3 mb-2">
      <div class="text-xs font-semibold text-navy mb-2">Acta ${gi + 1} · ${grupo.length} medidor${grupo.length > 1 ? 'es' : ''} (${grupo.map(x => x.reg.suministro).join(', ')})</div>
      <textarea id="f7Com_${gi}" class="input-field text-xs" rows="2" placeholder="Comentarios de la concesionaria para esta acta...">${escapeHtml((state.actasF7Com || {})['s' + w + '_' + gi] || '')}</textarea>
    </div>`;
  });

  html += `<div class="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-muted">
    Las firmas se imprimen en blanco: el acta se firma a mano en campo.
  </div>`;

  // Con menú de compartir disponible se ofrecen las dos cosas para cada
  // formato: enviarlo (WhatsApp, correo…) o solo guardarlo en el equipo.
  const compartible = sePuedeCompartir('acta.pdf', 'application/pdf');
  const nAct = `${grupos.length} acta${grupos.length > 1 ? 's' : ''}`;

  html += `<div class="pt-2 border-t border-gray-200 space-y-2">`;
  if (compartible) {
    html += `<div class="grid grid-cols-2 gap-2">
      <button onclick="generarActasF7PDF('compartir')" class="btn-blue py-2.5 px-3 rounded-lg text-sm font-medium">Compartir PDF</button>
      <button onclick="generarActasF7PDF('descargar')" class="py-2.5 px-3 rounded-lg border border-blue text-blue text-sm font-medium hover:bg-blue-50">Descargar PDF</button>
      <button onclick="generarActasF7Excel('compartir')" class="py-2.5 px-3 rounded-lg text-sm font-medium text-white" style="background:#2E7D32">Compartir Excel</button>
      <button onclick="generarActasF7Excel('descargar')" class="py-2.5 px-3 rounded-lg border border-green-600 text-success text-sm font-medium hover:bg-green-50">Descargar Excel</button>
    </div>
    <div class="text-xs text-muted">${nAct}. <b>Compartir</b> abre el menú del teléfono (WhatsApp, correo…); <b>Descargar</b> solo lo guarda.</div>`;
  } else {
    html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button onclick="generarActasF7PDF('descargar')" class="btn-blue py-2.5 px-3 rounded-lg text-sm font-medium">Descargar PDF (${nAct})</button>
      <button onclick="generarActasF7Excel('descargar')" class="py-2.5 px-3 rounded-lg border border-green-600 text-success text-sm font-medium hover:bg-green-50">Descargar Excel</button>
    </div>`;
  }
  html += `<div class="grid grid-cols-2 gap-2">
      <button onclick="guardarDatosActasF7()" class="py-2 px-3 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">Guardar sin generar</button>
      <button onclick="closeModal('modalActasF7')" class="py-2 px-3 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Cancelar</button>
    </div>
  </div>`;

  html += `</div>`;

  $('actasF7Content').innerHTML = html;
  $('actasF7Title').textContent = state.f7Jornada
    ? `Actas F7 · ${fechaEtiqueta(state.f7Jornada)}`
    : `Actas F7 · semana${sems.length > 1 ? 's' : ''} ${sems.join(', ')}`;
  show('modalActasF7');
}

// Lee la tabla del modal y guarda todo en state.attended.
function recolectarDatosActasF7() {
  const w = state.selectedWeek;
  const lista = realizadosDeSemana(null, state.f7Jornada);
  const val = id => {
    const el = $(id);
    if (!el) return '';
    // Campos calculados (celdas de solo lectura) llevan el valor en data-valor
    if (el.value === undefined) return String(el.dataset.valor || el.textContent || '').trim();
    return String(el.value).trim();
  };

  lista.forEach(item => {
    const k = item.key.replace(/[^A-Za-z0-9]/g, '_');
    const reg = (state.attended[item.semana] || {})[item.key];
    if (!reg) return;
    Object.assign(reg, {
      anioRetirado:     val('f7_anioRet_'    + k),
      nroActaReemplazo: val('f7_nroReemp_'   + k),
      fechaReemplazo:   deIsoFecha(val('f7_fechaReemp_' + k)),
      nuevoSerie:       val('f7_serie_'      + k),
      nuevaMarca:       val('f7_marca_'      + k),
      nuevoAnio:        val('f7_anio_'       + k),
      numHomologacion:  val('f7_homol_'      + k),
      numCertificado:   val('f7_cert_'       + k),
      numVerificacion:    val('f7_verifNum_'   + k),
      fechaVerificacion:  deIsoFecha(val('f7_verifFecha_' + k)),
      empresaVerificacion: val('f7_verifEmpresa_' + k),
      sticker1:         val('f7_s1_'         + k),
      sticker2:         val('f7_s2_'         + k),
      sticker3:         val('f7_s3_'         + k),
      sticker4:         val('f7_s4_'         + k),
      conclusion:       val('f7_concl_'      + k),
      observaciones:    val('f7_obs_'        + k),
      nroActaInspeccion: val('f7_nroInsp_'   + k),
      supervisorCodigo:  val('f7_sup_'       + k),
    });
    const sup = (state.supervisores || []).find(s => s.code === reg.supervisorCodigo);
    if (sup) reg.supervisorNombre = sup.name;
  });

  // Datos comunes
  state.f7Ciudad  = val('f7Ciudad');
  state.f7Fecha   = val('f7Fecha');
  leerBaseDesdeModal();   // guarda actividad, empresa, año, semestre y firmantes
  const conces   = val('f7Concesionaria');
  if (!state.formData[w]) state.formData[w] = {};
  if (conces) state.formData[w].empresa = conces;

  // Comentarios de la concesionaria, uno por acta
  if (!state.actasF7Com) state.actasF7Com = {};
  const grupos = agruparEnActas(lista);
  grupos.forEach((g, gi) => {
    state.actasF7Com['s' + w + '_' + gi] = val('f7Com_' + gi);
  });

  return { lista, grupos, concesionaria: conces, correlativo: parseInt(val('f7Correlativo')) || 1 };
}

// Numera las actas con el formato del procedimiento.
// El código del supervisor sale del propio suministro cuando lo tiene;
// si no, del valor general de la cabecera.
function aplicarCorrelativoF7() {
  const base = leerBaseDesdeModal();
  let n = base.correlativo, hechos = 0, sinCod = 0;

  document.querySelectorAll('#actasF7Content tbody tr').forEach(tr => {
    const fid    = tr.dataset.fid;
    const campo  = $('f7_nroInsp_' + fid);
    const selSup = $('f7_sup_' + fid);
    if (!campo) return;
    const cod = (selSup && selSup.value.trim()) || base.codSupervisor;
    if (!cod) { sinCod++; return; }
    campo.value = armarNroActa(base, n, cod);
    n++; hechos++;
  });

  const ej = $('f7Ejemplo');
  if (ej) ej.textContent = armarNroActa(base, base.correlativo);

  let msg = `${hechos} acta(s) numeradas desde ${String(base.correlativo).padStart(3, '0')}.`;
  if (sinCod) msg += ` ${sinCod} sin código de supervisor: complétalo arriba o en su fila.`;
  showToast(msg, sinCod ? 4500 : 2800);
  persistState();
}

function guardarDatosActasF7() {
  recolectarDatosActasF7();
  const ok = persistState();
  updateKPIs(state.selectedWeek);
  if (ok) showToast('Datos de las actas guardados.', 2500);
}

// ─── Generación del PDF ───────────────────────────────────────────

// ─── Descarga de las actas en Excel ───────────────────────────────
// Igual que el PDF: se parte del formato oficial y solo se escriben los
// datos en sus celdas, así el Excel conserva bordes, combinaciones y
// estilos del F7. Una hoja por acta, más un consolidado tabular.

// Dónde va cada dato en la plantilla. Las columnas D..H (4..8) son los
// cinco medidores; la fila es la del campo.
const F7_XLSX_FILAS = {
  nroActaInspeccion: 2,
  concesionaria:     3,
  suministro:        4,
  usuario:           5,
  direccion:         6,
  distrito:          7,
  nroSerie:          8,
  marcaModelo:       9,
  anioRetirado:     10,
  nroActaReemplazo: 11,
  fechaReemplazo:   12,
  nuevoSerie:       13,
  nuevaMarca:       14,
  nuevoAnio:        15,
  numHomologacion:  16,
  numCertificado:   17,
  numVerificacion:  18,
  fechaVerificacion:19,
  empresaVerificacion: 20,
  sticker1:         21,
  sticker2:         22,
  sticker3:         23,
  sticker4:         24,
  conclusion:       25,
  observaciones:    26,
};
const F7_XLSX_COL0 = 4;        // columna D: primer medidor
const F7_XLSX_CELDAS = {
  comentarios: 'B28',          // franja libre bajo "Comentarios de la concesionaria:"
  ciudadFecha: 'C39',
  porConces:   'E39',
  nomConces:   'E40',
  porOsi:      'G39',
  nomOsi:      'G40',
  dniConces:   'E41',
  dniOsi:      'G41',
};

async function generarActasF7Excel(modo) {
  const { lista, grupos, concesionaria } = recolectarDatosActasF7();
  if (!lista.length) { showToast('No hay medidores realizados.', 3000); return; }

  if (typeof ExcelJS === 'undefined' || typeof F7_PLANTILLA_XLSX_B64 === 'undefined') {
    showToast('No se encontró la plantilla Excel del formato F7 (carpeta vendor/).', 5000);
    return;
  }

  persistState();
  showToast('Generando el Excel sobre el formato oficial…', 2000);

  try {
    const base = state.f7Base || datosBaseActa();
    const reg = it => (state.attended[it.semana] || {})[it.key] || {};
    const d = (it, campo) => {
      const v = reg(it)[campo];
      return (v === null || v === undefined) ? '' : String(v);
    };

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(base64ABytes(F7_PLANTILLA_XLSX_B64).buffer);
    const plantilla = wb.worksheets[0];
    const modeloPlantilla = plantilla.model;

    const ciudadFecha = `${state.f7Ciudad || ''}, ${formatoFechaLarga(state.f7Fecha || new Date().toISOString().slice(0, 10))}`;

    grupos.forEach((grupo, gi) => {
      // La primera acta usa la hoja de la plantilla; las demás son copias
      // de su modelo, que es lo que arrastra el formato completo.
      let ws;
      if (gi === 0) {
        ws = plantilla;
        ws.name = `Acta ${gi + 1}`;
      } else {
        ws = wb.addWorksheet(`Acta ${gi + 1}`);
        ws.model = Object.assign({}, modeloPlantilla, { name: `Acta ${gi + 1}` });
        // Copiar el modelo arrastra bordes, anchos y fuentes, pero NO las
        // celdas combinadas: hay que volver a aplicarlas o el acta sale
        // con las etiquetas de sección partidas.
        (modeloPlantilla.merges || []).forEach(m => {
          try { ws.mergeCells(m); } catch (e) { console.warn('merge', m, e.message); }
        });
        // Ajuste de impresión: una página A4 horizontal por acta
        ws.pageSetup = Object.assign({}, plantilla.pageSetup);
      }

      // ExcelJS escribe <pageSetUpPr> antes que <outlinePr> y Excel exige
      // el orden contrario: con ambos presentes rechaza el archivo ("hemos
      // encontrado un problema con el contenido"). Se quita outlinePr, que
      // solo sirve para esquemas agrupados y el acta no usa.
      if (ws.properties) delete ws.properties.outlineProperties;

      // Columna por medidor
      grupo.forEach((it, i) => {
        const col = F7_XLSX_COL0 + i;
        const poner = (campo, valor) => {
          if (valor === '' || valor === undefined) return;
          ws.getRow(F7_XLSX_FILAS[campo]).getCell(col).value = valor;
        };

        poner('nroActaInspeccion', d(it, 'nroActaInspeccion'));
        poner('concesionaria', concesionaria || '');
        poner('suministro', it.row.suministro || '');
        poner('usuario', it.row.usuario || '');
        poner('direccion', it.row.direccion || '');
        poner('distrito', it.row.distrito || '');
        poner('nroSerie', it.row.nroSerie || '');
        poner('marcaModelo', it.row.marcaModelo || '');
        poner('anioRetirado', d(it, 'anioRetirado'));
        const nroR = d(it, 'nroActaReemplazo');
        poner('nroActaReemplazo', /^\d+$/.test(nroR) ? nroR.padStart(6, '0') : nroR);
        poner('fechaReemplazo', d(it, 'fechaReemplazo'));
        poner('nuevoSerie', d(it, 'nuevoSerie'));
        poner('nuevaMarca', d(it, 'nuevaMarca'));
        poner('nuevoAnio', d(it, 'nuevoAnio'));
        poner('numHomologacion', d(it, 'numHomologacion'));
        poner('numCertificado', d(it, 'numCertificado'));
        poner('numVerificacion', d(it, 'numVerificacion'));
        poner('fechaVerificacion', d(it, 'fechaVerificacion'));
        poner('empresaVerificacion', d(it, 'empresaVerificacion'));
        ['sticker1','sticker2','sticker3','sticker4','conclusion'].forEach(c => {
          const v = d(it, c);
          if (v) poner(c, v === 'SI' ? 'SÍ' : 'NO');
        });
        poner('observaciones', d(it, 'observaciones'));
      });

      // Columnas sin medidor: se borra el marcador "ARM-……." que trae
      // impreso la plantilla, igual que se cubre en el PDF.
      for (let i = grupo.length; i < MAX_MEDIDORES_POR_ACTA; i++) {
        ws.getRow(F7_XLSX_FILAS.nroActaInspeccion).getCell(F7_XLSX_COL0 + i).value = null;
      }

      // Pie: comentarios, ciudad y firmantes
      const C = F7_XLSX_CELDAS;
      const com = (state.actasF7Com || {})['s' + state.selectedWeek + '_' + gi] || '';
      if (com) ws.getCell(C.comentarios).value = com;
      ws.getCell(C.ciudadFecha).value = ciudadFecha;
      if (concesionaria) ws.getCell(C.porConces).value = `Por ${concesionaria}`;
      if (base.firmaConcNombre) ws.getCell(C.nomConces).value = base.firmaConcNombre;
      if (base.firmaOsiNombre)  ws.getCell(C.nomOsi).value    = base.firmaOsiNombre;
      if (base.firmaConcDni)    ws.getCell(C.dniConces).value = base.firmaConcDni;
      if (base.firmaOsiDni)     ws.getCell(C.dniOsi).value    = base.firmaOsiDni;
    });

    // ── Consolidado: una fila por medidor ────────────────────────
    const cab = ['N° Acta de Inspección', 'Semana', 'Fecha programada', 'Suministro', 'Titular',
                 'Dirección', 'Distrito', 'Serie retirado', 'Marca/Modelo retirado', 'Año retirado',
                 'Serie nuevo', 'Marca/Modelo nuevo', 'Año nuevo', 'N° Homologación',
                 'Certificado de Aprobación', 'N° Documento de reemplazo', 'Fecha de reemplazo',
                 'N° Certificado de Aferición', 'Fecha de Aferición', 'Empresa que afiere',
                 '¿Se colocó Sticker?', '¿El color corresponde?', '¿Son visibles los datos?',
                 '¿Registro de datos es correcto?', '¿Cumplió con reemplazar?', 'Supervisor',
                 'Observaciones'];

    const wsC = wb.addWorksheet('Consolidado');
    wsC.addRow(cab);
    const hdr = wsC.getRow(1);
    hdr.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    hdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2A4A' } };
    hdr.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
    hdr.height = 30;
    wsC.views = [{ state: 'frozen', ySplit: 1 }];
    wsC.columns = cab.map((c, i) => ({ width: [26, 8, 15, 13, 30, 28, 16][i] || 19 }));

    lista.forEach(it => {
      const r = reg(it);
      wsC.addRow([d(it, 'nroActaInspeccion'), it.semana, valorFecha(it.row.fecha), it.row.suministro,
                  it.row.usuario || '', it.row.direccion || '', it.row.distrito || '',
                  it.row.nroSerie || '', it.row.marcaModelo || '', d(it, 'anioRetirado'),
                  d(it, 'nuevoSerie'), d(it, 'nuevaMarca'), d(it, 'nuevoAnio'),
                  d(it, 'numHomologacion'), d(it, 'numCertificado'),
                  d(it, 'nroActaReemplazo'), d(it, 'fechaReemplazo'),
                  d(it, 'numVerificacion'), d(it, 'fechaVerificacion'), d(it, 'empresaVerificacion'),
                  d(it, 'sticker1'), d(it, 'sticker2'), d(it, 'sticker3'), d(it, 'sticker4'),
                  d(it, 'conclusion'), r.supervisorNombre || r.supervisorCodigo || '',
                  d(it, 'observaciones')]);
    });

    const buf = await wb.xlsx.writeBuffer();
    const sems = semanasActivas();
    const nombre = state.f7Jornada
      ? `Actas-F7-${state.f7Jornada}.xlsx`
      : `Actas-F7-Sem${sems.join('-')}-${grupos.length}actas.xlsx`;
    await entregarArchivo(buf, nombre,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `Actas de inspección F7 · ${grupos.length} acta${grupos.length > 1 ? 's' : ''}`, modo);

    showToast(`Excel generado sobre el formato F7: ${nombre}`, 4000);
  } catch (e) {
    console.error('generarActasF7Excel:', e);
    showToast('Error al generar el Excel: ' + e.message, 6000);
  }
}

// ─── Generación del PDF sobre la PLANTILLA OFICIAL ────────────────
// El acta F7 es un formato estandarizado: NO se redibuja. Se toma el PDF
// del formato original y se escriben únicamente los datos en sus celdas.

// Geometría del formato F7 en puntos PDF (origen abajo-izquierda, A4 horizontal).
// Medida directamente sobre el archivo original F7-PO241-PE-01-GO7.xls.
const F7_GEO = {
  colCentros: [269.76, 393.89, 518.03, 642.16, 766.29],  // centro de cada columna de medidor
  colAncho:   124.13,      // ensanchada un 39% respecto del formato base
  xCampos:    70.0,        // inicio de la columna de nombres de campo
  xDatos:     207.7,       // inicio del área de datos
  filaTop:    511.70,      // primera fila de datos (N° de Suministro)
  filaPaso:   13.70,       // separación entre filas
  yActa:      541.90,      // fila "Acta de Inspección N°"
  yConces:    526.30,      // fila "Concesionaria"
  yObs:       205.0,       // área "Observaciones del Supervisor" (5 celdas)
  yCom:       153.5,       // primera franja libre BAJO "Comentarios de la concesionaria"
  yCiudad:    44.10,       // "Ciudad, dd de mm de aaaa"
  xCiudad:    121.6,
  xPorConces: 393.9,       // centro de "Por <<Nombre de Concesionaria>>"
  xPorOsi:    642.1,       // centro de "Por OSINERGMIN"
  // Marcadores impresos en el formato que se cubren al rellenar: [x, y, ancho, alto]
  tapar: {
    arm:    [252.4, 538.0, 531.2, 12.3],   // "ARM-……." de las 5 columnas
    ciudad: [119.6, 39.8,   87.8, 12.3],   // "Ciudad, dd de mm de aaaa"
    conces: [328.5, 40.2,  130.7, 11.5],   // "Por <<Nombre de Concesionaria>>"
    nomConc:[357.9, 30.5,   71.9, 11.5],   // "Nombre y Apellidos" (concesionaria)
    nomOsi: [606.2, 30.5,   71.9, 11.5],   // "Nombre y Apellidos" (OSINERGMIN)
  },
};

// Índice de fila de cada campo, en el orden del formato.
const F7_FILAS = {
  suministro: 0,  titular: 1,  direccion: 2,  distrito: 3,
  serieRet:   4,  marcaRet: 5, anioRet:   6,
  nroReemp:   7,  fechaReemp: 8,
  serieNue:   9,  marcaNue: 10, anioNue:  11,
  homologacion: 12, certificado: 13,
  verifNum:  14,  verifFecha: 15, verifEmpresa: 16,
  stk1:      17,  stk2: 18, stk3: 19, stk4: 20,
  conclusion: 21,
};

const f7FilaY = i => F7_GEO.filaTop - F7_GEO.filaPaso * i;

function base64ABytes(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function generarActasF7PDF(modo) {
  const w = state.selectedWeek;
  const { lista, grupos, concesionaria, correlativo } = recolectarDatosActasF7();

  // Validación: serie / marca / año del reemplazante son obligatorios
  const faltantes = lista.filter(it => {
    const r = (state.attended[it.semana] || {})[it.key] || {};
    return !r.nuevoSerie || !r.nuevaMarca || !r.nuevoAnio;
  });
  if (faltantes.length) {
    showToast(`Faltan datos del medidor reemplazante en ${faltantes.length} registro(s): serie, marca y año.`, 5000);
    return;
  }

  if (typeof PDFLib === 'undefined' || typeof F7_PLANTILLA_PDF_B64 === 'undefined') {
    showToast('No se encontró la plantilla del formato F7 (carpeta vendor/).', 5000);
    return;
  }

  persistState();
  showToast('Generando actas sobre el formato oficial…', 2000);

  try {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;

    const plantilla = await PDFDocument.load(base64ABytes(F7_PLANTILLA_PDF_B64));
    const salida    = await PDFDocument.create();
    const font      = await salida.embedFont(StandardFonts.Helvetica);
    const fontBold  = await salida.embedFont(StandardFonts.HelveticaBold);

    const comunes = {
      concesionaria: concesionaria || CONCESIONARIA_POR_DEFECTO,
      ciudad:        state.f7Ciudad || '',
      fecha:         state.f7Fecha  || new Date().toISOString().slice(0, 10),
      semana:        w,
    };

    let nro = correlativo;
    for (let gi = 0; gi < grupos.length; gi++) {
      // Se copia la página del formato original tal cual
      const [pagina] = await salida.copyPages(plantilla, [0]);
      salida.addPage(pagina);

      // Las observaciones van por medidor (dentro de cada registro);
      // los comentarios de la concesionaria son uno por acta.
      const com = (state.actasF7Com || {})['s' + w + '_' + gi] || '';
      const bse = state.f7Base || {};
      completarActaF7(pagina, grupos[gi], comunes, {
        com, desde: nro, font, fontBold, rgb,
        firmaConcNombre: bse.firmaConcNombre || '',
        firmaConcDni:    bse.firmaConcDni    || '',
        firmaOsiNombre:  bse.firmaOsiNombre  || '',
        firmaOsiDni:     bse.firmaOsiDni     || '',
      });
      nro += grupos[gi].length;
    }

    const bytes = await salida.save();
    const sems = semanasActivas();
  const nombre = state.f7Jornada
    ? `Actas-F7-${state.f7Jornada}.pdf`
    : `Actas-F7-Sem${sems.join('-')}-${grupos.length}actas.pdf`;
    await entregarArchivo(bytes, nombre, 'application/pdf',
      `Actas de inspección F7 · ${grupos.length} acta${grupos.length > 1 ? 's' : ''}`, modo);

    // Registrar actas emitidas
    if (!state.actasF7) state.actasF7 = {};
    state.actasF7[w] = grupos.map((g, gi) => ({
      nro: gi + 1,
      medidores: g.map(it => it.key),
      emitidaEn: new Date().toISOString(),
    }));
    if (!state.ranges[w]) state.ranges[w] = { C: 1, R: 1 };
    state.ranges[w].R = nro;
    persistState();

    showToast(`${grupos.length} acta(s) generada(s) sobre el formato F7: ${nombre}`, 4000);
    closeModal('modalActasF7');
  } catch (e) {
    console.error('generarActasF7PDF:', e);
    showToast('Error al generar las actas: ' + e.message, 6000);
  }
}

// ¿El equipo puede compartir archivos? (celulares con navegador moderno).
// Requiere abrir la app por http(s); desde un archivo local no está.
function sePuedeCompartir(nombre, tipo) {
  try {
    if (!navigator.canShare || !navigator.share) return false;
    const f = new File([new Blob([''], { type: tipo })], nombre, { type: tipo });
    return navigator.canShare({ files: [f] });
  } catch (e) { return false; }
}

// Entrega el acta: en celular abre el menú de compartir del teléfono
// (WhatsApp, correo, Drive) y, si no está disponible, la descarga.
async function entregarArchivo(bytes, nombre, tipo, titulo, modo) {
  // modo 'descargar' salta el menú de compartir aunque el equipo lo tenga
  if (modo !== 'descargar' && sePuedeCompartir(nombre, tipo)) {
    try {
      const file = new File([new Blob([bytes], { type: tipo })], nombre, { type: tipo });
      await navigator.share({ files: [file], title: titulo || nombre, text: titulo || nombre });
      showToast('Acta compartida.', 2500);
      return 'compartido';
    } catch (e) {
      if (e && e.name === 'AbortError') {
        descargarBytes(bytes, nombre, tipo);
        showToast('Envío cancelado. El acta quedó descargada.', 3500);
        return 'cancelado';
      }
      console.warn('navigator.share:', e);
    }
  }
  descargarBytes(bytes, nombre, tipo);
  return 'descargado';
}

function descargarBytes(bytes, nombre, tipo) {
  const blob = new Blob([bytes], { type: tipo });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Escribe los datos de hasta 5 medidores sobre una página del formato F7.
function completarActaF7(pagina, grupo, comunes, o) {
  const { font, fontBold, rgb } = o;
  const NEGRO = rgb(0, 0, 0);
  const VERDE = rgb(0.11, 0.37, 0.13);
  const ROJO  = rgb(0.72, 0.11, 0.11);

  // Texto centrado en una columna de medidor, recortado al ancho disponible.
  const escribirEnColumna = (col, y, txt, opts = {}) => {
    if (txt === '' || txt === null || txt === undefined) return;
    const o2 = Object.assign({ size: 6.5, bold: false, color: NEGRO }, opts);
    const f  = o2.bold ? fontBold : font;
    let s = String(txt);
    let size = o2.size;
    const maxW = F7_GEO.colAncho - 5;
    // reducir tamaño antes de recortar, para no perder información
    while (size > 4.6 && f.widthOfTextAtSize(s, size) > maxW) size -= 0.3;
    if (f.widthOfTextAtSize(s, size) > maxW) {
      while (s.length > 1 && f.widthOfTextAtSize(s + '…', size) > maxW) s = s.slice(0, -1);
      s += '…';
    }
    const ancho = f.widthOfTextAtSize(s, size);
    pagina.drawText(s, {
      x: F7_GEO.colCentros[col] - ancho / 2,
      y, size, font: f, color: o2.color,
    });
  };

  // Texto libre con salto de línea dentro de un ancho dado.
  const escribirParrafo = (x, y, ancho, txt, size, maxLineas) => {
    if (!txt) return;
    const palabras = String(txt).split(/\s+/);
    const lineas = [];
    let actual = '';
    palabras.forEach(p => {
      const prueba = actual ? actual + ' ' + p : p;
      if (font.widthOfTextAtSize(prueba, size) > ancho && actual) { lineas.push(actual); actual = p; }
      else actual = prueba;
    });
    if (actual) lineas.push(actual);
    lineas.slice(0, maxLineas).forEach((ln, i) => {
      pagina.drawText(ln, { x, y: y - i * (size + 1.6), size, font, color: NEGRO });
    });
  };

  const dato = (reg, campo) => {
    const v = reg ? reg[campo] : '';
    return (v === null || v === undefined) ? '' : String(v);
  };

  // Cubre un marcador impreso del formato para escribir el valor real encima.
  const BLANCO = rgb(1, 1, 1);
  const tapar = ([x, y, w, h]) =>
    pagina.drawRectangle({ x, y, width: w, height: h, color: BLANCO });

  // ── Cabecera ──────────────────────────────────────────────────
  // N° de Acta de Inspección por medidor (columnas D..H del formato).
  // El "ARM-……." impreso es solo un ejemplo: el prefijo real es el código
  // del supervisor de cada suministro. Se cubre el marcador y se escribe el
  // número capturado; si no hay, la celda queda en blanco para llenarla a mano.
  tapar(F7_GEO.tapar.arm);
  grupo.forEach((it, i) => {
    const reg = (state.attended[it.semana] || {})[it.key] || {};
    if (reg.nroActaInspeccion) {
      escribirEnColumna(i, F7_GEO.yActa, reg.nroActaInspeccion, { bold: true, size: 7 });
    }
  });

  // Concesionaria: se repite en LAS CINCO columnas, porque es la misma
  // empresa para todos los suministros del acta.
  if (comunes.concesionaria) {
    for (let i = 0; i < MAX_MEDIDORES_POR_ACTA; i++) {
      escribirEnColumna(i, F7_GEO.yConces, comunes.concesionaria, { size: 7 });
    }
  }

  // ── Datos por medidor ─────────────────────────────────────────
  const campos = [
    ['suministro',   r => dato(r, 'suministro')],
    ['titular',      r => dato(r, 'usuario')],
    ['direccion',    r => dato(r, 'direccion')],
    ['distrito',     r => dato(r, 'distrito')],
    ['serieRet',     r => dato(r, 'nroSerie')],
    ['marcaRet',     r => dato(r, 'marcaModelo')],
    ['anioRet',      r => dato(r, 'anioRetirado')],
    ['nroReemp',     r => {
      const t = dato(r, 'nroActaReemplazo');
      return /^\d+$/.test(t) ? t.padStart(6, '0') : t;   // 5610 -> 005610
    }],
    ['fechaReemp',   r => dato(r, 'fechaReemplazo')],
    ['serieNue',     r => dato(r, 'nuevoSerie')],
    ['marcaNue',     r => dato(r, 'nuevaMarca')],
    ['anioNue',      r => dato(r, 'nuevoAnio')],
    ['homologacion', r => dato(r, 'numHomologacion')],
    ['certificado',  r => dato(r, 'numCertificado')],
    ['verifNum',     r => dato(r, 'numVerificacion')],
    ['verifFecha',   r => dato(r, 'fechaVerificacion')],
    ['verifEmpresa', r => dato(r, 'empresaVerificacion')],
  ];

  grupo.forEach((it, col) => {
    const reg = (state.attended[it.semana] || {})[it.key] || {};
    campos.forEach(([clave, getter]) => {
      escribirEnColumna(col, f7FilaY(F7_FILAS[clave]), getter(reg));
    });

    // Sticker y conclusión: SÍ en verde, NO en rojo
    [['stk1', 'sticker1'], ['stk2', 'sticker2'], ['stk3', 'sticker3'],
     ['stk4', 'sticker4'], ['conclusion', 'conclusion']].forEach(([fila, campo]) => {
      const v = dato(reg, campo);
      if (!v) return;
      escribirEnColumna(col, f7FilaY(F7_FILAS[fila]), v === 'SI' ? 'SÍ' : 'NO', {
        bold: true, size: 7, color: v === 'SI' ? VERDE : ROJO,
      });
    });
  });

  // ── Observaciones del Supervisor ──────────────────────────────
  // En el formato son 5 celdas (una por medidor), no una franja continua.
  grupo.forEach((it, col) => {
    const reg = (state.attended[it.semana] || {})[it.key] || {};
    escribirParrafo(
      F7_GEO.colCentros[col] - F7_GEO.colAncho / 2 + 3,
      F7_GEO.yObs, F7_GEO.colAncho - 6,
      dato(reg, 'observaciones'), 5.4, 4
    );
  });

  // ── Comentarios de la concesionaria: franja de ancho completo ─
  escribirParrafo(F7_GEO.xCampos - 54, F7_GEO.yCom, 760, o.com, 7, 5);

  // ── Ciudad y fecha (cubre el marcador del formato) ────────────
  tapar(F7_GEO.tapar.ciudad);
  pagina.drawText(`${comunes.ciudad || 'Ciudad'}, ${formatoFechaLarga(comunes.fecha)}`, {
    x: F7_GEO.xCiudad, y: F7_GEO.yCiudad, size: 7.5, font, color: NEGRO,
  });

  // ── "Por <<Nombre de Concesionaria>>" → nombre real ───────────
  if (comunes.concesionaria) {
    tapar(F7_GEO.tapar.conces);
    const t = `Por ${comunes.concesionaria}`;
    const anchoT = fontBold.widthOfTextAtSize(t, 7.5);
    pagina.drawText(t, {
      x: F7_GEO.xPorConces - anchoT / 2, y: F7_GEO.yCiudad, size: 7.5, font: fontBold, color: NEGRO,
    });
  }

  // ── Firmantes: nombre y DNI bajo cada línea de firma ──────────
  // Si no se cargaron, el espacio queda en blanco para firmar a mano.
  // La plantilla ya trae impreso "Nombre y Apellidos": se cubre antes de
  // escribir el firmante real, si no los textos quedan uno encima del otro.
  const firmante = (cx, marcador, nombre, dni) => {
    if (!nombre && !dni) return;          // sin datos, se firma a mano
    tapar(marcador);
    if (nombre) {
      let size = 7;
      const maxW = marcador[2] + 54;
      while (size > 5 && font.widthOfTextAtSize(nombre, size) > maxW) size -= 0.25;
      const a = font.widthOfTextAtSize(nombre, size);
      pagina.drawText(nombre, { x: cx - a / 2, y: 34.0, size, font, color: NEGRO });
    }
    if (dni) {
      const a = font.widthOfTextAtSize(dni, 6.5);
      pagina.drawText(dni, { x: cx - a / 2, y: 25.0, size: 6.5, font, color: NEGRO });
    }
  };
  firmante(F7_GEO.xPorConces, F7_GEO.tapar.nomConc, o.firmaConcNombre, o.firmaConcDni);
  firmante(F7_GEO.xPorOsi,    F7_GEO.tapar.nomOsi,  o.firmaOsiNombre,  o.firmaOsiDni);
}

function formatoFechaLarga(iso) {
  if (!iso) return 'dd de mm de aaaa';
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                 'agosto','septiembre','octubre','noviembre','diciembre'];
  const p = String(iso).split('-');
  if (p.length !== 3) return iso;
  const d = parseInt(p[2]), m = parseInt(p[1]) - 1, a = p[0];
  if (isNaN(d) || isNaN(m) || !meses[m]) return iso;
  return `${d} de ${meses[m]} de ${a}`;
}



// ═══════════════════════════════════════════════════════════════════
//  SEMANAS VISIBLES
//  La muestra puede avanzar en varias semanas el mismo día, así que la
//  agenda, el mapa, los KPIs y las actas trabajan sobre un CONJUNTO de
//  semanas, no sobre una sola. state.selectedWeek sigue señalando la
//  del medidor activo, que es lo que usan los formularios.
// ═══════════════════════════════════════════════════════════════════

// Semanas en juego ahora mismo. Vacío = todas.
function semanasActivas() {
  const todas = Object.keys(state.weeks).sort((a, b) => Number(a) - Number(b));
  const vis = (state.semanasVisibles || []).filter(w => state.weeks[w]);
  return vis.length ? vis.sort((a, b) => Number(a) - Number(b)) : todas;
}

function esVisible(w) {
  const vis = state.semanasVisibles || [];
  return vis.length === 0 || vis.includes(String(w));
}

function alternarSemana(w) {
  w = String(w);
  const vis = (state.semanasVisibles || []).slice();
  const i = vis.indexOf(w);
  if (i >= 0) vis.splice(i, 1); else vis.push(w);
  state.semanasVisibles = vis;
  aplicarSemanasVisibles();
}

function verTodasLasSemanas() {
  state.semanasVisibles = [];
  aplicarSemanasVisibles();
}

function aplicarSemanasVisibles() {
  const activas = semanasActivas();
  // El medidor activo debe pertenecer a alguna semana visible
  if (state.selectedWeek && !esVisible(state.selectedWeek)) {
    state.selectedWeek = activas[0] || null;
    state.selectedMeter = null;
  }
  if (!state.selectedWeek && activas.length) state.selectedWeek = activas[0];

  if (state.selectedWeek) {
    populateMeterDropdown(state.selectedWeek);
    show('kpiSection'); show('actionsSection'); show('mapSection');
    initMap(state.selectedWeek);
  }
  renderFiltrosGeo();
  actualizarBotonSemanas();
  updateKPIs();
  renderResumenFiltro();
  agendaAbiertas.clear();
  renderAgenda();
  updateActionButtons();
  persistState();
}

function renderChipsSemanas() {
  const cont = $('chipsSemanas');
  if (!cont) return;
  const todas = Object.keys(state.weeks).sort((a, b) => Number(a) - Number(b));
  if (!todas.length) { cont.innerHTML = ''; return; }

  const vis = state.semanasVisibles || [];
  const esTodas = vis.length === 0;

  let html = `<span class="text-xs text-muted mr-1">Semanas:</span>`;
  html += `<button onclick="verTodasLasSemanas()" class="chip-sem ${esTodas ? 'chip-on' : ''}">Todas</button>`;
  todas.forEach(w => {
    const n = (state.weeks[w] || []).length;
    const hechos = Object.keys(state.attended[w] || {}).length;
    const activa = vis.includes(String(w));
    html += `<button onclick="alternarSemana('${w}')" class="chip-sem ${activa ? 'chip-on' : ''}"
      title="${hechos} de ${n} realizados">${w}<span class="chip-num">${hechos}/${n}</span></button>`;
  });
  cont.innerHTML = html;
}


// ═══════════════════════════════════════════════════════════════════
//  FILTROS DE LA BARRA SUPERIOR
//  Semanas (una o varias) y ubicación (departamento, provincia,
//  distrito). Todo pensado para usarse con el pulgar en un celular.
// ═══════════════════════════════════════════════════════════════════

function togglePanelSemanas() {
  const p = $('panelSemanas');
  if (!p) return;
  const abierto = !p.classList.contains('hidden');
  if (abierto) { p.classList.add('hidden'); return; }
  renderListaSemanas();
  p.classList.remove('hidden');
}

// Cerrar el panel al tocar fuera
document.addEventListener('click', e => {
  const p = $('panelSemanas'), b = $('btnSemanas');
  if (!p || p.classList.contains('hidden')) return;
  if (!p.contains(e.target) && b && !b.contains(e.target)) p.classList.add('hidden');
});

function renderListaSemanas() {
  const cont = $('listaSemanas');
  if (!cont) return;
  const todas = Object.keys(state.weeks).sort((a, b) => Number(a) - Number(b));
  if (!todas.length) { cont.innerHTML = '<div class="text-xs text-muted p-2">Carga una muestra primero.</div>'; return; }

  const vis = state.semanasVisibles || [];
  const fila = (valor, etiqueta, detalle, activa, onclick) => `
    <label onclick="${onclick}" class="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-50 cursor-pointer">
      <input type="checkbox" class="w-4 h-4 pointer-events-none" ${activa ? 'checked' : ''} />
      <span class="text-sm flex-1">${etiqueta}</span>
      <span class="text-xs text-muted">${detalle}</span>
    </label>`;

  let html = fila('', '<b>Todas</b>', '', vis.length === 0, 'verTodasLasSemanas();event.preventDefault()');
  html += '<div class="border-t border-gray-200 my-1"></div>';
  todas.forEach(w => {
    const n = (state.weeks[w] || []).length;
    const hechos = Object.keys(state.attended[w] || {}).length;
    html += fila(w, `Semana ${w}`, `${hechos}/${n}`, vis.includes(String(w)),
                 `alternarSemana('${w}');event.preventDefault()`);
  });
  cont.innerHTML = html;
}

function actualizarBotonSemanas() {
  const t = $('btnSemanasTxt');
  if (!t) return;
  const vis = state.semanasVisibles || [];
  t.textContent = vis.length === 0 ? 'Todas'
    : (vis.length <= 3 ? vis.slice().sort((a, b) => Number(a) - Number(b)).join(', ')
                       : `${vis.length} semanas`);
}

// ─── Filtro por ubicación ─────────────────────────────────────────
// Los desplegables se encadenan: al elegir departamento se acotan las
// provincias, y al elegir provincia se acotan los distritos.
function filasDeSemanasActivas() {
  const out = [];
  semanasActivas().forEach(w => (state.weeks[w] || []).forEach((row, idx) => out.push({ w, idx, row })));
  return out;
}

function renderFiltrosGeo() {
  const f = state.filtroGeo || {};
  const filas = filasDeSemanasActivas().map(x => x.row);
  if (!filas.length) { ['filtroDepartamento','filtroProvincia','filtroDistrito'].forEach(id => {
    const e = $(id); if (e) e.disabled = true; }); return; }

  const unicos = (campo, cond) => [...new Set(filas
    .filter(cond || (() => true))
    .map(r => (r[campo] || '').trim())
    .filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));

  const pintar = (id, etiquetaTodos, valores, sel) => {
    const e = $(id);
    if (!e) return;
    e.disabled = false;
    e.innerHTML = `<option value="">${etiquetaTodos}</option>` +
      valores.map(v => `<option value="${escapeHtml(v)}" ${sel === v ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('');
  };

  pintar('filtroDepartamento', 'Todo departamento', unicos('departamento'), f.departamento || '');
  pintar('filtroProvincia', 'Toda provincia',
         unicos('provincia', r => !f.departamento || (r.departamento || '').trim() === f.departamento),
         f.provincia || '');
  pintar('filtroDistrito', 'Todo distrito',
         unicos('distrito', r => (!f.departamento || (r.departamento || '').trim() === f.departamento)
                              && (!f.provincia || (r.provincia || '').trim() === f.provincia)),
         f.distrito || '');
}

function cambiarFiltroGeo(nivel) {
  const v = id => { const e = $(id); return e ? e.value : ''; };
  const f = state.filtroGeo || {};

  if (nivel === 'departamento') {
    // cambiar el nivel de arriba invalida los de abajo
    state.filtroGeo = { departamento: v('filtroDepartamento'), provincia: '', distrito: '' };
  } else if (nivel === 'provincia') {
    state.filtroGeo = { departamento: f.departamento || '', provincia: v('filtroProvincia'), distrito: '' };
  } else {
    state.filtroGeo = { departamento: f.departamento || '', provincia: f.provincia || '', distrito: v('filtroDistrito') };
  }

  renderFiltrosGeo();
  aplicarFiltros();
}

function aplicarFiltroEstado() {
  state.filtroEstado = ($('meterFilter') && $('meterFilter').value) || 'all';
  aplicarFiltros();
}

// ¿Esta fila pasa los filtros de ubicación y estado?
function pasaFiltros(w, row) {
  const f = state.filtroGeo || {};
  if (f.departamento && (row.departamento || '').trim() !== f.departamento) return false;
  if (f.provincia    && (row.provincia    || '').trim() !== f.provincia)    return false;
  if (f.distrito     && (row.distrito     || '').trim() !== f.distrito)     return false;

  const est = state.filtroEstado || 'all';
  if (est !== 'all') {
    const hecho = isAttended(w, meterKey(row));
    if (est === 'pending' && hecho) return false;
    if (est === 'done'   && !hecho) return false;
  }
  return true;
}

function hayFiltroActivo() {
  const f = state.filtroGeo || {};
  return !!(f.departamento || f.provincia || f.distrito || (state.filtroEstado && state.filtroEstado !== 'all'));
}

function limpiarFiltros() {
  state.filtroGeo = { departamento: '', provincia: '', distrito: '' };
  state.filtroEstado = 'all';
  if ($('meterFilter')) $('meterFilter').value = 'all';
  renderFiltrosGeo();
  aplicarFiltros();
}

function renderResumenFiltro() {
  const cont = $('resumenFiltro');
  if (!cont) return;
  if (!hayFiltroActivo()) { cont.classList.add('hidden'); return; }

  const todas = filasDeSemanasActivas();
  const visibles = todas.filter(x => pasaFiltros(x.w, x.row)).length;
  const f = state.filtroGeo || {};
  const partes = [f.distrito, f.provincia, f.departamento].filter(Boolean);
  const est = { pending: 'pendientes', done: 'realizados' }[state.filtroEstado] || '';

  cont.innerHTML = `<div class="flex items-center justify-between gap-2 bg-blue-50 border border-blue-200 rounded px-2.5 py-1.5">
    <span><b class="text-navy">${visibles}</b> de ${todas.length} medidores${partes.length ? ' · ' + escapeHtml(partes.join(', ')) : ''}${est ? ' · ' + est : ''}</span>
    <button onclick="limpiarFiltros()" class="text-blue font-medium shrink-0">Quitar filtros</button>
  </div>`;
  cont.classList.remove('hidden');
}

// Repinta todo lo que depende de los filtros.
function aplicarFiltros() {
  if (state.selectedWeek) {
    try { initMap(state.selectedWeek); } catch (e) { console.error('initMap:', e); }
  }
  updateKPIs();
  renderResumenFiltro();
  renderAgenda();
  persistState();
}

// ═══════════════════════════════════════════════════════════════════
//  AGENDA POR FECHA PROGRAMADA
//  La muestra se ve como jornadas: cada fecha agrupa los medidores
//  programados para ese día. El promedio real ronda los 5 por fecha,
//  que es justo lo que cabe en un acta F7.
// ═══════════════════════════════════════════════════════════════════

const DIAS_SEM  = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const MESES_COR = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

// Normaliza la columna FECHA, que puede venir como "12/08/2026 00:00:00",
// "2026-08-12", un objeto Date o el número de serie de Excel.
function parseFechaProgramada(v) {
  if (v === null || v === undefined || v === '') return null;

  if (v instanceof Date && !isNaN(v)) {
    return { y: v.getFullYear(), m: v.getMonth() + 1, d: v.getDate() };
  }

  const s = String(v).trim();

  // Número de serie de Excel (días desde 1899-12-30)
  if (/^\d+(\.\d+)?$/.test(s) && Number(s) > 20000 && Number(s) < 80000) {
    const base = new Date(Date.UTC(1899, 11, 30));
    base.setUTCDate(base.getUTCDate() + Math.floor(Number(s)));
    return { y: base.getUTCFullYear(), m: base.getUTCMonth() + 1, d: base.getUTCDate() };
  }

  let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);      // dd/mm/yyyy
  if (m) return { d: +m[1], m: +m[2], y: +m[3] };

  m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);          // yyyy-mm-dd
  if (m) return { y: +m[1], m: +m[2], d: +m[3] };

  return null;
}

const dosDig = n => String(n).padStart(2, '0');

// Clave ordenable: "2026-08-24". Los registros sin fecha van al final.
function fechaClave(v) {
  const f = parseFechaProgramada(v);
  return f ? `${f.y}-${dosDig(f.m)}-${dosDig(f.d)}` : 'zzzz-sin-fecha';
}

// Etiqueta visible: "LUN 24/08/2026"
function fechaEtiqueta(clave) {
  if (clave === 'zzzz-sin-fecha') return 'SIN FECHA PROGRAMADA';
  const [y, m, d] = clave.split('-').map(Number);
  const dia = DIAS_SEM[new Date(y, m - 1, d).getDay()];
  return `${dia} ${dosDig(d)}/${dosDig(m)}/${y}`;
}

// Agrupa los medidores de una semana (o de todas) por fecha programada.
function agruparPorFecha(w) {
  // Sin argumento se usan las semanas visibles; con uno, solo esa.
  const semanas = (w === null || w === undefined || w === '')
    ? semanasActivas()
    : [w];

  const grupos = {};
  semanas.forEach(sem => {
    (state.weeks[sem] || []).forEach((row, idx) => {
      if (!pasaFiltros(sem, row)) return;     // filtros de ubicación y estado
      const clave = fechaClave(row.fecha);
      if (!grupos[clave]) grupos[clave] = { clave, semanas: new Set(), medidores: [] };
      grupos[clave].semanas.add(String(sem));
      grupos[clave].medidores.push({ semana: sem, idx, row });
    });
  });

  return Object.values(grupos).sort((a, b) => a.clave.localeCompare(b.clave));
}

// Jornadas desplegadas (no se persiste: es estado de pantalla)
const agendaAbiertas = new Set();

function toggleJornada(clave) {
  if (agendaAbiertas.has(clave)) agendaAbiertas.delete(clave);
  else agendaAbiertas.add(clave);
  renderAgenda();
}

function expandirTodasJornadas(abrir) {
  agendaAbiertas.clear();
  if (abrir) agruparPorFecha().forEach(g => agendaAbiertas.add(g.clave));
  renderAgenda();
}

function renderAgenda() {
  const cont = $('agendaContent');
  if (!cont) return;

  const hayMuestra = Object.keys(state.weeks).length > 0;

  // ── Estado vacío: la app arranca así ──────────────────────────
  if (!hayMuestra) {
    cont.innerHTML = `
      <div class="text-center py-8 px-4">
        <div class="text-4xl mb-3">📋</div>
        <div class="text-sm font-semibold text-gray-800 mb-1">Todavía no hay muestra cargada</div>
        <div class="text-xs text-muted mb-4 max-w-md mx-auto">
          Sube el Excel de la semana con el botón <b>Seleccionar archivo</b> de arriba,
          o agrega los medidores uno por uno.
        </div>
        <button onclick="abrirModalAltaMedidor()" class="btn-blue py-2 px-4 rounded-lg text-sm font-medium">
          + Agregar medidor a mano
        </button>
      </div>`;
    hide('agendaSection');
    show('agendaSection');
    return;
  }

  const grupos = agruparPorFecha();
  const totMed = grupos.reduce((a, g) => a + g.medidores.length, 0);
  const totDone = grupos.reduce((a, g) =>
    a + g.medidores.filter(m => isAttended(m.semana, meterKey(m.row))).length, 0);
  // pendientes que ya tienen los datos de la base esperando
  const totConDatos = grupos.reduce((a, g) => a + g.medidores.filter(m =>
    !isAttended(m.semana, meterKey(m.row)) && datosPrecargados(m.semana, meterKey(m.row))).length, 0);

  // Al abrir por primera vez, se despliega la jornada con pendientes más próxima
  if (agendaAbiertas.size === 0 && grupos.length) {
    const pend = grupos.find(g =>
      g.medidores.some(m => !isAttended(m.semana, meterKey(m.row))));
    agendaAbiertas.add((pend || grupos[0]).clave);
  }

  let html = `
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <div class="text-xs text-muted">
        <b class="text-gray-800">${grupos.length}</b> jornada${grupos.length === 1 ? '' : 's'} ·
        <b class="text-gray-800">${totMed}</b> medidores ·
        <b class="text-success">${totDone}</b> realizado${totDone === 1 ? '' : 's'}${
          totConDatos ? ` · <b class="text-blue">${totConDatos}</b> con datos cargados` : ''}
      </div>
      <div class="flex gap-2">
        <button onclick="expandirTodasJornadas(true)" class="text-xs py-1 px-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">Abrir todas</button>
        <button onclick="expandirTodasJornadas(false)" class="text-xs py-1 px-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">Cerrar todas</button>
        <button onclick="abrirModalAltaMedidor()" class="text-xs py-1 px-2 rounded border border-blue text-blue hover:bg-blue-50">+ Agregar medidor</button>
      </div>
    </div>
    <div class="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">`;

  grupos.forEach(g => {
    const hechos = g.medidores.filter(m => isAttended(m.semana, meterKey(m.row))).length;
    const total  = g.medidores.length;
    const pct    = total ? Math.round(hechos / total * 100) : 0;
    const completa = hechos === total;
    const abierta  = agendaAbiertas.has(g.clave);
    const sems     = [...g.semanas].sort().join(', ');
    const distritos = [...new Set(g.medidores.map(m => (m.row.distrito || '').trim()).filter(Boolean))];

    html += `
      <div>
        <button onclick="toggleJornada('${g.clave}')"
          class="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 ${completa ? 'bg-green-50' : ''}">
          <span class="text-muted text-xs w-3">${abierta ? '▼' : '▶'}</span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-navy">${fechaEtiqueta(g.clave)}
              <span class="font-normal text-xs text-muted">· Semana ${sems}</span>
            </div>
            <div class="text-xs text-muted truncate">${escapeHtml(distritos.slice(0, 3).join(', '))}${distritos.length > 3 ? ` +${distritos.length - 3}` : ''}</div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <div class="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div class="h-full rounded-full" style="width:${pct}%;background:${completa ? '#2E7D32' : '#1E5AA8'}"></div>
            </div>
            <span class="text-xs font-semibold ${completa ? 'text-success' : 'text-gray-700'} w-10 text-right">${hechos}/${total}</span>
          </div>
        </button>`;

    if (abierta) {
      html += `<div class="bg-gray-50 border-t border-gray-200">`;
      g.medidores.forEach(m => {
        const done = isAttended(m.semana, meterKey(m.row));
        const sel  = String(state.selectedWeek) === String(m.semana) && state.selectedMeter === m.idx;
        html += `
          <button onclick="seleccionarDesdeAgenda('${m.semana}', ${m.idx})"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-left border-b border-gray-200 last:border-0
                   ${sel ? 'bg-blue-50 border-l-4 border-l-blue' : 'hover:bg-white'}">
            <span class="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style="background:${done ? '#2E7D32' : '#D32F2F'}"></span>
            <span class="text-xs font-semibold text-gray-800 w-24 shrink-0">${escapeHtml(String(m.row.suministro || ''))}</span>
            <span class="text-xs text-muted w-28 shrink-0 truncate">${escapeHtml(m.row.distrito || '')}</span>
            <span class="text-xs text-gray-600 flex-1 truncate">${escapeHtml(m.row.usuario || '')}</span>
            ${!done && datosPrecargados(m.semana, meterKey(m.row))
              ? '<span class="text-xs text-blue shrink-0" title="Datos de la base ya cargados: solo falta el control de sticker">📥</span>' : ''}
            ${done ? '<span class="text-xs text-success font-semibold shrink-0">✓</span>' : ''}
          </button>`;
      });

      if (hechos > 0) {
        html += `
          <div class="px-3 py-2 bg-white border-t border-gray-200">
            <button onclick="abrirModalActasF7('${g.clave}')"
              class="w-full py-1.5 px-3 rounded-lg border border-blue text-blue text-xs font-medium hover:bg-blue-50">
              📝 Generar acta F7 de esta jornada (${hechos} realizado${hechos === 1 ? '' : 's'})
            </button>
          </div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  });

  html += `</div>`;
  cont.innerHTML = html;
  show('agendaSection');
}

// Selecciona un medidor desde la agenda: deja la app igual que si se
// hubiera elegido en el desplegable (mapa centrado, botones activos).
function seleccionarDesdeAgenda(semana, idx) {
  const w = state.weeks[semana] ? semana : (isNaN(Number(semana)) ? semana : Number(semana));
  if (!state.weeks[w]) return;

  if (String(state.selectedWeek) !== String(w)) {
    state.selectedWeek = w;
    if ($('weekSelect')) $('weekSelect').value = w;
    populateMeterDropdown(w);
    updateKPIs(w);
    show('kpiSection'); show('actionsSection'); show('mapSection');
    initMap(w);
  }

  state.selectedMeter = idx;
  if ($('meterSelect')) $('meterSelect').value = idx;

  const row = state.weeks[w][idx];

  if ($('locAddress'))  $('locAddress').textContent  = row.direccion || '—';
  if ($('locDistrict')) $('locDistrict').textContent =
    [row.distrito, row.provincia, row.departamento].filter(Boolean).join(', ') || '—';
  show('locationSection');

  const coords = parseCoords(row.coordenadas);
  if (coords && map) {
    map.invalidateSize();
    map.setView([coords.lat, coords.lng], 17);
    const mk = mapMarkers[meterKey(row)];
    if (mk) mk.openPopup();
  }

  try { updateDistanceDisplay(); } catch (e) {}
  updateActionButtons();
  persistState();
  renderAgenda();
}

// ═══════════════════════════════════════════════════════════════════
//  ALTA MANUAL DE MEDIDOR
// ═══════════════════════════════════════════════════════════════════
function abrirModalAltaMedidor() {
  const hoy = new Date().toISOString().slice(0, 10);
  const semanas = Object.keys(state.weeks).sort((a, b) => Number(a) - Number(b));
  const distritos = [...new Set(
    Object.values(state.weeks).flat().map(r => (r.distrito || '').trim()).filter(Boolean)
  )].sort();

  $('altaContent').innerHTML = `
    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="form-group">
          <label class="form-label">Fecha programada *</label>
          <input id="altaFecha" type="date" class="input-field" value="${hoy}" />
        </div>
        <div class="form-group">
          <label class="form-label">Semana *</label>
          <input id="altaSemana" type="number" min="1" class="input-field"
                 value="${state.selectedWeek || semanas[0] || 1}" list="altaSemanas" />
          <datalist id="altaSemanas">${semanas.map(s => `<option value="${s}">`).join('')}</datalist>
        </div>
      </div>

      <div class="form-section">Suministro</div>
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group">
          <label class="form-label">N° de Suministro *</label>
          <input id="altaSuministro" class="input-field" placeholder="200319332" />
        </div>
        <div class="form-group">
          <label class="form-label">Titular</label>
          <input id="altaUsuario" class="input-field" placeholder="Apellidos y nombres" />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Dirección</label>
          <input id="altaDireccion" class="input-field" placeholder="JR CUZCO 745" />
        </div>
        <div class="form-group">
          <label class="form-label">Distrito</label>
          <input id="altaDistrito" class="input-field" list="altaDistritos" placeholder="Tarapoto" />
          <datalist id="altaDistritos">${distritos.map(d => `<option value="${escapeHtml(d)}">`).join('')}</datalist>
        </div>
        <div class="form-group">
          <label class="form-label">Provincia / Departamento</label>
          <div class="flex gap-2">
            <input id="altaProvincia" class="input-field" placeholder="Provincia" />
            <input id="altaDepartamento" class="input-field" placeholder="Depto." />
          </div>
        </div>
      </div>

      <div class="form-section">Medidor instalado (el que se retira)</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="form-group">
          <label class="form-label">N° de Serie</label>
          <input id="altaSerie" class="input-field" placeholder="607900614" />
        </div>
        <div class="form-group">
          <label class="form-label">Marca / Modelo</label>
          <input id="altaMarca" class="input-field" placeholder="STR DDS26B" />
        </div>
        <div class="form-group">
          <label class="form-label">Año fabricación</label>
          <input id="altaAnio" class="input-field" placeholder="2016" />
        </div>
      </div>

      <div class="form-section">Ubicación (opcional)</div>
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group">
          <label class="form-label">Coordenada X (UTM Este)</label>
          <input id="altaCoordX" class="input-field" placeholder="350135.13" />
        </div>
        <div class="form-group">
          <label class="form-label">Coordenada Y (UTM Norte)</label>
          <input id="altaCoordY" class="input-field" placeholder="9281482.89" />
        </div>
      </div>
      <p class="text-xs text-muted">Sin coordenadas el medidor no aparece en el mapa, pero sí en la agenda y en el acta.</p>

      <div class="flex gap-2 pt-2 border-t border-gray-200">
        <button onclick="closeModal('modalAlta')"
          class="py-2 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="guardarMedidorManual(true)"
          class="py-2 px-4 rounded-lg border border-blue text-blue text-sm hover:bg-blue-50 flex-1">Agregar y seguir</button>
        <button onclick="guardarMedidorManual(false)"
          class="btn-blue py-2 px-5 rounded-lg text-sm font-medium flex-1">Agregar ✓</button>
      </div>
    </div>`;

  show('modalAlta');
  setTimeout(() => { const e = $('altaSuministro'); if (e) e.focus(); }, 100);
}

function guardarMedidorManual(seguir) {
  const v = id => { const e = $(id); return e ? String(e.value).trim() : ''; };

  const suministro = v('altaSuministro');
  const fechaIso   = v('altaFecha');
  const semana     = v('altaSemana');

  if (!suministro) { showToast('El N° de Suministro es obligatorio.', 3000); return; }
  if (!fechaIso)   { showToast('La fecha programada es obligatoria.', 3000); return; }
  if (!semana)     { showToast('Indica la semana.', 3000); return; }

  if (!state.weeks[semana]) state.weeks[semana] = [];

  // Evitar duplicados dentro de la misma semana
  if (state.weeks[semana].some(r => String(r.suministro) === suministro)) {
    showToast(`El suministro ${suministro} ya está en la semana ${semana}.`, 4000);
    return;
  }

  // La columna FECHA de la muestra usa dd/mm/yyyy: se guarda igual
  const [y, m, d] = fechaIso.split('-');
  const fechaTxt = `${d}/${m}/${y}`;

  const cx = parseFloat(v('altaCoordX'));
  const cy = parseFloat(v('altaCoordY'));
  // coordenadas se guarda como cadena "lat,lng"; coordX/coordY permiten
  // recalcularla al restaurar la sesión (rederiveCoords).
  let coordenadas = '';
  if (!isNaN(cx) && !isNaN(cy)) {
    try {
      const c = utmToLatLng(cx, cy, 18, 'S');
      coordenadas = `${c.lat},${c.lng}`;
    } catch (e) { coordenadas = ''; }
  }

  const row = {
    semana, medidor: suministro, suministro,
    usuario:      v('altaUsuario'),
    direccion:    v('altaDireccion'),
    distrito:     v('altaDistrito'),
    provincia:    v('altaProvincia'),
    departamento: v('altaDepartamento'),
    nroSerie:     v('altaSerie'),
    marcaModelo:  v('altaMarca'),
    edadMedidor:  v('altaAnio'),
    tipoActividad: 'R',          // la muestra es siempre reemplazo
    tipoMedidor: '', nroFases: '', contrastadora: '', consumo: '',
    sed: '', empresa: '', ubigeo: '',
    fecha: fechaTxt,
    coordX: isNaN(cx) ? '' : cx,
    coordY: isNaN(cy) ? '' : cy,
    coordenadas,
    origenManual: true,
  };

  state.weeks[semana].push(row);

  if (!state.ranges[semana]) state.ranges[semana] = { C: 1, R: 1 };
  if (!state.selectedWeek) {
    state.selectedWeek = semana;
    populateWeekDropdown();
    if ($('weekSelect')) $('weekSelect').value = semana;
    show('kpiSection'); show('actionsSection'); show('mapSection');
    initMap(semana);
  }

  persistState();
  try { populateWeekDropdown(); } catch (e) {}
  refrescarUI(state.selectedWeek, null);
  agendaAbiertas.add(fechaClave(fechaTxt));
  renderAgenda();

  showToast(`Medidor ${suministro} agregado a la semana ${semana}.`, 3000);

  if (seguir) {
    ['altaSuministro','altaUsuario','altaDireccion','altaSerie','altaMarca','altaCoordX','altaCoordY']
      .forEach(id => { const e = $(id); if (e) e.value = ''; });
    const e = $('altaSuministro'); if (e) e.focus();
  } else {
    closeModal('modalAlta');
  }
}


// ═══════════════════════════════════════════════════════════════════
//  IMPORTAR BASE DE REEMPLAZOS
//  Excel con los datos del medidor reemplazante, la aferición y el
//  control de sticker. Se cruza por N° de suministro con la muestra,
//  así no hay que escribir nada a mano antes de generar las actas.
// ═══════════════════════════════════════════════════════════════════

// Sinónimos aceptados por campo. Se comparan sin tildes, en minúscula
// y sin signos, para que sirva igual la hoja de la macro que una tabla
// armada a mano.
const BASE_COLS = {
  suministro:          ['suministro', 'n suministro', 'nro suministro', 'numero de suministro', 'nº suministro'],
  nroActaInspeccion:   ['n acta', 'nº acta', 'nro acta', 'acta de inspeccion', 'n de acta de inspeccion'],
  nuevoSerie:          ['n de serie', 'nro de serie', 'numero de serie', 'serie',
                      'n de serie nuevo', 'serie nuevo', 'serie del medidor nuevo',
                      'n de serie reemplazante', 'serie reemplazante'],
  nuevaMarca:          ['marca/modelo', 'marca modelo', 'marca / modelo',
                      'marca/modelo nuevo', 'marca modelo nuevo', 'marca del medidor nuevo'],
  nuevoAnio:           ['ano de fabricacion', 'anio de fabricacion', 'ano fabricacion',
                      'ano de fabricacion nuevo', 'ano fabricacion nuevo', 'ano del medidor nuevo'],
  numHomologacion:     ['numero de homologacion del medidor', 'numero de homologacion', 'homologacion'],
  numCertificado:      ['certificado de aprobacion de modelo', 'certificado de aprobacion', 'certificado'],
  nroActaReemplazo:    ['n documento que acredita el reemplazo del medidor', 'n documento que acredita',
                        'documento que acredita', 'n doc que acredita'],
  fechaReemplazo:      ['fecha del reemplazo', 'fecha de reemplazo'],
  numVerificacion:     ['n de certificado de afericion', 'nº de certificado de afericion',
                        'certificado de afericion', 'n certificado afericion'],
  fechaVerificacion:   ['fecha de afericion', 'fecha afericion', 'fecha de contraste'],
  empresaVerificacion: ['empresa que afiere', 'empresa que afiera', 'empresa afericion'],
  sticker1:            ['colo sticker en medidor', 'coloco sticker en medidor', 'coloco sticker',
                        'se coloco sticker'],
  sticker2:            ['el color corresponde'],
  sticker3:            ['son visibles los datos'],
  sticker4:            ['registro de datos es correcto'],
  observaciones:       ['observaciones', 'consolidado de observaciones', 'obs'],
};

// Campos que existen por duplicado (medidor retirado y reemplazante).
// De haber dos, se toma la del grupo "reemplazante"; si no hay grupos,
// la segunda aparición.
const BASE_DUPLICADOS = ['nuevoSerie', 'nuevaMarca', 'nuevoAnio'];

const normTxt = v => String(v ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[°º]/g, '').replace(/[^a-z0-9\/ ]/g, ' ')
  .replace(/\s+/g, ' ').trim();

// Un número de serie largo no debe quedar en notación científica.
function valorTexto(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return v.toFixed(0);
    return String(v);
  }
  return String(v).trim();
}

// Las fechas llegan como serial de Excel, Date o texto: salen dd/mm/aaaa.
function valorFecha(v) {
  if (v === null || v === undefined || v === '') return '';
  if (v instanceof Date && !isNaN(v)) {
    return `${dosDig(v.getDate())}/${dosDig(v.getMonth() + 1)}/${v.getFullYear()}`;
  }
  const n = Number(v);
  if (!isNaN(n) && n > 20000 && n < 80000) {
    const b = new Date(Date.UTC(1899, 11, 30));
    b.setUTCDate(b.getUTCDate() + Math.floor(n));
    return `${dosDig(b.getUTCDate())}/${dosDig(b.getUTCMonth() + 1)}/${b.getUTCFullYear()}`;
  }
  const f = parseFechaProgramada(v);
  return f ? `${dosDig(f.d)}/${dosDig(f.m)}/${f.y}` : String(v).trim();
}

const siNo = v => {
  const t = normTxt(v);
  if (['si', 'sí', 'x', '1', 'true', 'verdadero'].includes(t)) return 'SI';
  if (['no', '0', 'false', 'falso'].includes(t)) return 'NO';
  return '';
};

// Localiza la fila de encabezados y arma el mapa columna → campo.
function mapearColumnasBase(filas) {
  let hdr = -1;
  for (let i = 0; i < Math.min(filas.length, 80); i++) {
    const celdas = (filas[i] || []).map(normTxt);
    if (celdas.some(c => BASE_COLS.suministro.includes(c))) { hdr = i; break; }
  }
  if (hdr < 0) return null;

  // Grupos ("Medidor retirado" / "Medidor Reemplazante"), que en la hoja
  // de la macro están combinados en las filas de arriba.
  const grupos = [];
  for (let up = 1; up <= 3; up++) {
    const f = filas[hdr - up];
    if (!f) continue;
    let actual = '';
    for (let c = 0; c < f.length; c++) {
      const t = normTxt(f[c]);
      if (t) actual = t;
      if (/reemplazante/.test(actual)) grupos[c] = 'nuevo';
      else if (/retirado/.test(actual)) grupos[c] = grupos[c] || 'viejo';
    }
  }

  // Qué campo nombra cada columna (sin decidir todavía cuál se usa)
  const porColumna = [];
  (filas[hdr] || []).forEach((celda, c) => {
    const t = normTxt(celda);
    if (!t) return;
    for (const [campo, nombres] of Object.entries(BASE_COLS)) {
      if (nombres.includes(t)) { porColumna[c] = campo; return; }
    }
  });

  // Cuántas veces aparece cada campo: hace falta para resolver los que
  // existen por duplicado (N° de Serie, Marca/Modelo y Año figuran tanto
  // para el medidor retirado como para el reemplazante).
  const veces = {};
  porColumna.forEach(campo => { if (campo) veces[campo] = (veces[campo] || 0) + 1; });

  const mapa = {};
  const vistos = {};
  porColumna.forEach((campo, c) => {
    if (!campo) return;
    if (BASE_DUPLICADOS.includes(campo)) {
      if (grupos[c] === 'viejo') return;                 // dice "retirado": no es
      if (grupos[c] !== 'nuevo' && veces[campo] > 1 && !vistos[campo]) {
        vistos[campo] = true;                            // sin grupos, la 1ª es la del retirado
        return;
      }
      // Si la columna aparece una sola vez se toma como del reemplazante:
      // una tabla simple no repite esos nombres.
    }
    if (mapa[campo] === undefined) mapa[campo] = c;
  });

  return (mapa.suministro === undefined) ? null : { hdr, mapa };
}

let baseImportada = null;   // { registros, cruzan, faltan }

function importarBaseReemplazos(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = e => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });

      // Se prueba hoja por hoja hasta encontrar una con columna de suministro
      let filas = null, mapeo = null, hoja = '';
      for (const nombre of wb.SheetNames) {
        const f = XLSX.utils.sheet_to_json(wb.Sheets[nombre], { header: 1, defval: '', raw: true });
        const m = mapearColumnasBase(f);
        if (m) { filas = f; mapeo = m; hoja = nombre; break; }
      }

      if (!mapeo) {
        showToast('No se encontró una columna "SUMINISTRO" en ninguna hoja del archivo.', 5000);
        input.value = '';
        return;
      }

      const { hdr, mapa } = mapeo;
      const leer = (fila, campo) => mapa[campo] === undefined ? '' : fila[mapa[campo]];

      const registros = [];
      for (let i = hdr + 1; i < filas.length; i++) {
        const f = filas[i] || [];
        const sum = valorTexto(leer(f, 'suministro'));
        if (!sum || !/\d/.test(sum)) continue;
        registros.push({
          suministro:          sum,
          nroActaInspeccion:   valorTexto(leer(f, 'nroActaInspeccion')),
          nuevoSerie:          valorTexto(leer(f, 'nuevoSerie')),
          nuevaMarca:          valorTexto(leer(f, 'nuevaMarca')),
          nuevoAnio:           valorTexto(leer(f, 'nuevoAnio')),
          numHomologacion:     valorTexto(leer(f, 'numHomologacion')),
          numCertificado:      valorTexto(leer(f, 'numCertificado')),
          nroActaReemplazo:    valorTexto(leer(f, 'nroActaReemplazo')),
          fechaReemplazo:      valorFecha(leer(f, 'fechaReemplazo')),
          numVerificacion:     valorTexto(leer(f, 'numVerificacion')),
          fechaVerificacion:   valorFecha(leer(f, 'fechaVerificacion')),
          empresaVerificacion: valorTexto(leer(f, 'empresaVerificacion')),
          sticker1:            siNo(leer(f, 'sticker1')),
          sticker2:            siNo(leer(f, 'sticker2')),
          sticker3:            siNo(leer(f, 'sticker3')),
          sticker4:            siNo(leer(f, 'sticker4')),
          observaciones:       valorTexto(leer(f, 'observaciones')),
        });
      }

      // Índice de la muestra por suministro
      const indice = {};
      Object.keys(state.weeks).forEach(w => {
        (state.weeks[w] || []).forEach((row, idx) => {
          indice[String(row.suministro)] = { w, idx, row };
        });
      });

      const cruzan = registros.filter(r => indice[r.suministro]);
      const faltan = registros.filter(r => !indice[r.suministro]);

      baseImportada = { registros, cruzan, faltan, indice, hoja,
                        campos: Object.keys(mapa).filter(k => k !== 'suministro') };
      mostrarResumenBase(file.name);
    } catch (err) {
      console.error('importarBaseReemplazos:', err);
      showToast('No se pudo leer el archivo: ' + err.message, 5000);
    }
    input.value = '';
  };

  reader.readAsArrayBuffer(file);
}

function mostrarResumenBase(nombreArchivo) {
  const b = baseImportada;
  if (!b) return;

  const etiquetas = {
    nroActaInspeccion: 'N° de acta', nuevoSerie: 'Serie del nuevo', nuevaMarca: 'Marca/Modelo',
    nuevoAnio: 'Año', numHomologacion: 'Homologación', numCertificado: 'Certificado',
    nroActaReemplazo: 'Doc. de reemplazo', fechaReemplazo: 'Fecha de reemplazo',
    numVerificacion: 'Cert. de aferición', fechaVerificacion: 'Fecha de aferición',
    empresaVerificacion: 'Empresa que afiere', sticker1: 'Sticker 1', sticker2: 'Sticker 2',
    sticker3: 'Sticker 3', sticker4: 'Sticker 4', observaciones: 'Observaciones',
  };

  let html = `<div class="space-y-4">
    <div class="text-xs text-muted">Archivo: <b class="text-gray-800">${escapeHtml(nombreArchivo)}</b> · hoja <b class="text-gray-800">${escapeHtml(b.hoja)}</b></div>

    <div class="grid grid-cols-3 gap-3">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-navy">${b.registros.length}</div>
        <div class="text-xs text-muted">registros leídos</div>
      </div>
      <div class="bg-green-50 border border-green-600 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-success">${b.cruzan.length}</div>
        <div class="text-xs text-muted">cruzan con la muestra</div>
      </div>
      <div class="bg-yellow-50 border border-yellow-400 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-gray-700">${b.faltan.length}</div>
        <div class="text-xs text-muted">no están en la muestra</div>
      </div>
    </div>

    <div>
      <div class="text-xs font-semibold text-gray-700 mb-1.5">Datos reconocidos en el archivo</div>
      <div class="flex flex-wrap gap-1.5">
        ${b.campos.map(c => `<span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue border border-blue-200">${escapeHtml(etiquetas[c] || c)}</span>`).join('')}
      </div>
    </div>`;

  if (b.cruzan.length) {
    html += `<div>
      <div class="text-xs font-semibold text-gray-700 mb-1.5">Muestra de lo que se va a aplicar</div>
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="w-full text-xs" style="min-width:720px">
          <thead class="bg-gray-100 text-gray-700">
            <tr><th class="p-2 text-left">Suministro</th><th class="p-2 text-left">Serie nuevo</th>
            <th class="p-2 text-left">Marca</th><th class="p-2 text-left">Cert. aferición</th>
            <th class="p-2 text-left">Fecha afer.</th><th class="p-2 text-left">Empresa</th></tr>
          </thead>
          <tbody>
            ${b.cruzan.slice(0, 5).map(r => `<tr class="border-t border-gray-200">
              <td class="p-1.5 font-semibold">${escapeHtml(r.suministro)}</td>
              <td class="p-1.5">${escapeHtml(r.nuevoSerie)}</td>
              <td class="p-1.5">${escapeHtml(r.nuevaMarca)}</td>
              <td class="p-1.5">${escapeHtml(r.numVerificacion)}</td>
              <td class="p-1.5">${escapeHtml(r.fechaVerificacion)}</td>
              <td class="p-1.5 truncate" style="max-width:170px">${escapeHtml(r.empresaVerificacion)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${b.cruzan.length > 5 ? `<div class="text-xs text-muted mt-1">… y ${b.cruzan.length - 5} más.</div>` : ''}
    </div>`;
  }

  if (b.faltan.length) {
    html += `<div class="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 text-xs">
      <b>${b.faltan.length} suministro(s) del archivo no están en la muestra cargada</b> y se omitirán:
      ${escapeHtml(b.faltan.slice(0, 8).map(r => r.suministro).join(', '))}${b.faltan.length > 8 ? ', …' : ''}
    </div>`;
  }

  html += `
    <div class="space-y-2">
      <label class="flex items-start gap-2 text-sm bg-gray-50 border border-gray-200 rounded p-3 cursor-pointer">
        <input type="checkbox" id="baseTraerChecks" class="w-4 h-4 mt-0.5" />
        <span>Traer también el <b>control de sticker</b> del archivo<br>
          <span class="text-xs text-muted">Déjalo sin marcar si el sticker se verifica en campo: es lo normal.</span>
        </span>
      </label>
      <label class="flex items-start gap-2 text-sm bg-gray-50 border border-gray-200 rounded p-3 cursor-pointer">
        <input type="checkbox" id="baseMarcarRealizado" class="w-4 h-4 mt-0.5" />
        <span>Marcar estos medidores como <b>Realizado</b> ahora<br>
          <span class="text-xs text-muted">Solo si ya fueron verificados. Sin marcar siguen pendientes y los atiendes en campo.</span>
        </span>
      </label>
    </div>

    <div class="bg-blue-50 border-l-4 border-blue rounded p-3 text-xs">
      <b class="text-navy">Cómo sigue:</b> los datos quedan guardados para cada suministro.
      En campo eliges el medidor, pulsas <b>Realizado</b> y el formulario aparece
      con todo lleno: solo marcas los Sí/No del sticker y generas el acta.
    </div>

    <div class="flex gap-2 pt-2 border-t border-gray-200">
      <button onclick="closeModal('modalBase')"
        class="py-2 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Cancelar</button>
      <button onclick="aplicarBaseReemplazos()" class="btn-blue py-2 px-5 rounded-lg text-sm font-medium flex-1"
        ${b.cruzan.length ? '' : 'disabled style="opacity:.4"'}>
        Aplicar a ${b.cruzan.length} medidor${b.cruzan.length === 1 ? '' : 'es'} ✓
      </button>
    </div>
  </div>`;

  $('baseContent').innerHTML = html;
  show('modalBase');
}

// Campos técnicos que trae la base (todo menos el estado y los checks).
const CAMPOS_BASE = ['nuevoSerie','nuevaMarca','nuevoAnio','numHomologacion','numCertificado',
                     'nroActaReemplazo','fechaReemplazo','numVerificacion','fechaVerificacion',
                     'empresaVerificacion','nroActaInspeccion','observaciones'];
const CAMPOS_STICKER = ['sticker1','sticker2','sticker3','sticker4'];

function aplicarBaseReemplazos() {
  const b = baseImportada;
  if (!b || !b.cruzan.length) return;

  const marcar = $('baseMarcarRealizado') && $('baseMarcarRealizado').checked;
  const traerChecks = $('baseTraerChecks') && $('baseTraerChecks').checked;

  if (!state.datosReemplazo) state.datosReemplazo = {};
  let precargados = 0, marcados = 0, actualizados = 0;

  b.cruzan.forEach(r => {
    const dest = b.indice[r.suministro];
    if (!dest) return;
    const { w, row } = dest;
    const key = meterKey(row);

    // Los datos técnicos se guardan aparte: el medidor sigue PENDIENTE
    // hasta que en campo se marque Realizado. Ahí se vuelcan al registro.
    if (!state.datosReemplazo[w]) state.datosReemplazo[w] = {};
    const paquete = {};
    CAMPOS_BASE.forEach(c => { if (r[c]) paquete[c] = r[c]; });
    if (traerChecks) CAMPOS_STICKER.forEach(c => { if (r[c]) paquete[c] = r[c]; });
    state.datosReemplazo[w][key] = Object.assign(state.datosReemplazo[w][key] || {}, paquete);
    precargados++;

    // Si ya estaba atendido, se actualiza en el acto
    const reg = (state.attended[w] || {})[key];
    if (reg) {
      Object.assign(reg, paquete);
      reg.anioRetirado = anioFabricacion(reg);
      actualizados++;
      return;
    }

    // Marcar como Realizado solo si se pidió expresamente
    if (marcar) {
      if (!state.attended[w]) state.attended[w] = {};
      state.attended[w][key] = Object.assign({
        resultado: 'Realizado', tipoActividad: 'R',
        medidor: row.medidor, suministro: row.suministro, usuario: row.usuario,
        direccion: row.direccion, distrito: row.distrito, provincia: row.provincia,
        departamento: row.departamento, sed: row.sed, nroSerie: row.nroSerie,
        tipoMedidor: row.tipoMedidor, nroFases: row.nroFases, marcaModelo: row.marcaModelo,
        edadMedidor: row.edadMedidor, contrastadora: row.contrastadora, consumo: row.consumo,
        fecha: row.fecha, ubigeo: row.ubigeo, semana: w,
        savedAt: new Date().toISOString(), origenBase: true,
      }, paquete);
      state.attended[w][key].anioRetirado = anioFabricacion(state.attended[w][key]);
      marcados++;
    }
  });

  persistState();
  refrescarUI(state.selectedWeek, null);
  closeModal('modalBase');

  let msg = `Datos cargados para ${precargados} medidor(es).`;
  if (marcados)     msg += ` ${marcados} marcados como Realizado.`;
  else if (!actualizados) msg += ' Márcalos en campo y solo completa el sticker.';
  showToast(msg, 5000);
  baseImportada = null;
}

// Datos de la base que esperan a que el medidor se marque en campo.
function datosPrecargados(w, key) {
  return ((state.datosReemplazo || {})[w] || {})[key] || null;
}

// ─── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadPersistedState();
  loadSupervisorsList();   // los supervisores se conservan aunque no haya muestra
  renderChipsSemanas();    // chips de semanas junto a la agenda
  renderFiltrosGeo();      // desplegables de departamento / provincia / distrito
  actualizarBotonSemanas();
  renderResumenFiltro();
  renderAgenda();          // agenda por fecha programada (o estado vacío)
  updateActionButtons();   // sin muestra, los botones arrancan deshabilitados
});
