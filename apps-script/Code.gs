/**
 * Tablero Financiero · Servicio de sincronización con Google Sheets
 * Proyecto independiente de Apps Script: no modifica las pestañas ni el código existentes.
 *
 * Instalación:
 *  1. script.google.com → Nuevo proyecto → pega este archivo completo → Guardar.
 *  2. Elige la función "configurar" → Ejecutar → autoriza los permisos.
 *  3. Implementar → Nueva implementación → Tipo: Aplicación web
 *     Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario → Implementar.
 *  4. Copia la URL de la aplicación web y la clave que muestra el registro de ejecución.
 */

const CFG = {
  SHEET_ID: '1ggJdlmDgeIXk0o0W41a9pRzUtoiHNmZOvs5IT0KSpTk',
  FOLDER_ID: '1pk6m_2pQ6HL6RBlJjWK2bNVr6sAiChGH',
  APP_FOLDER: 'APP Tablero Financiero',
  REPORT_TAB: 'INFORME CONTADOR'
};

const MODS = {"personal":{"name":"Gastos personales","subs":{"familiar":"Gastos familiares","servicios":"Pago de servicios","dian":"Obligaciones fiscales (DIAN)","cassias":"CASSIAS GOLD SAS","vehiculos":"Activos fijos: vehículos"}},"parcela":{"name":"Parcela Las Colinas","subs":{"caballos":"Caballos","nomina":"Nómina","obligaciones":"Pagos y obligaciones","servicios":"Pago de servicios","alimentos":"Compra de alimentos"}},"inm":{"name":"Inmuebles","subs":{"materiales":"Ferretería y materiales","nomina":"Nómina de obra","servicios":"Pago de servicios","obligaciones":"Pagos y obligaciones"}},"mina":{"name":"Mina La Fe","subs":{"herramientas":"Herramientas y repuestos","alimentos":"Alimentos y aseo","combustible":"Combustibles","activos":"Activos fijos","nomina":"Nómina","otros":"Otros costos"}}};
const NATL = {gasto: 'Gasto', costo: 'Costo', inversion: 'Inversión', anticipo: 'Anticipo'};
const OBL_ASSET = {veh: 'Vehículo', cab: 'Caballo', inm: 'Inmueble', eq: 'Equipo de la mina'};

// [encabezado, campo, tipo, editable]   tipos: d fecha · n número · t texto · m mes · proj · sub · nat · ref · calc · link · bool · sc
const SCHEMA = {
  mov: {tab: 'APP Movimientos', req: ['fecha', 'valor', 'p', 's'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Proyecto', 'p', 'proj', 1], ['Rubro', 's', 'sub', 1], ['Clasificación', 'nat', 'nat', 1],
    ['Categoría', 'cat', 't', 1], ['Concepto', 'concepto', 't', 1], ['Proveedor / beneficiario', 'tercero', 't', 1],
    ['Cédula / NIT', 'cedula', 't', 1], ['Valor', 'valor', 'n', 1], ['Forma de pago', 'pago', 't', 1], ['Responsable', 'resp', 't', 1],
    ['Asociado a', '_ref', 'ref', 1], ['Detalle', '_det', 'calc', 0], ['Observaciones', 'nota', 't', 1], ['Soporte', 'fotoUrl', 'link', 0]]},
  prest: {tab: 'APP Préstamos', req: ['fecha', 'nombre', 'valor'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Nombre', 'nombre', 't', 1], ['Cédula', 'cedula', 't', 1], ['Celular', 'tel', 't', 1],
    ['Valor prestado', 'valor', 'n', 1], ['Abonos', '_ab', 'calc', 0], ['Saldo', '_saldo', 'calc', 0], ['Interés mensual %', 'interes', 'n', 1],
    ['Fecha acordada de pago', 'plazo', 'd', 1], ['Forma de entrega', 'pago', 't', 1], ['Nota', 'nota', 't', 1], ['Soporte', 'fotoUrl', 'link', 0]]},
  abonos: {tab: 'APP Abonos', req: ['fecha', 'valor', 'prest'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Préstamo', '_ref', 'ref', 1], ['Valor recibido', 'valor', 'n', 1], ['Forma de pago', 'pago', 't', 1],
    ['Nota', 'nota', 't', 1], ['Soporte', 'fotoUrl', 'link', 0]]},
  per: {tab: 'APP Personas', req: ['nombre', 'sc'], cols: [
    ['Nombre', 'nombre', 't', 1], ['Cédula', 'cedula', 't', 1], ['Cargo', 'rol', 't', 1], ['Celular', 'tel', 't', 1],
    ['Ámbito', 'sc', 'sc', 1], ['Pago mensual', 'salario', 'n', 1], ['Valor acordado', 'acordado', 'n', 1], ['Retirado', 'inactivo', 'bool', 1]]},
  cortes: {tab: 'APP Cortes de oro', req: null, cols: [
    ['Fecha', 'fecha', 'd', 0], ['Oro (g)', 'gramos', 'n', 0], ['Precio por gramo', 'precio', 'n', 0], ['Valor total', 'total', 'n', 0],
    ['Dueño de la mina', 'invCop', 'n', 0], ['Abono a costos', 'abono', 'n', 0], ['Reparto', '_rep', 'calc', 0], ['Observaciones', 'obs', 't', 1]]},
  rh: {tab: 'APP Retro horas', req: ['fecha', 'hi', 'hf'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Horómetro inicio', 'hi', 'n', 1], ['Horómetro final', 'hf', 'n', 1], ['Horas', 'horas', 'n', 0],
    ['Operador', 'operador', 't', 1], ['Novedad', 'obs', 't', 1], ['Foto', 'fotoUrl', 'link', 0]]},
  rs: {tab: 'APP Retro repuestos', req: ['fecha', 'concepto', 'valor'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Tipo', 'tipo', 't', 1], ['Concepto', 'concepto', 't', 1], ['Valor', 'valor', 'n', 1],
    ['Lo asume', 'asume', 't', 1], ['Soporte', 'fotoUrl', 'link', 0]]},
  rc: {tab: 'APP Retro combustible', req: ['fecha', 'valor'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Tipo', 'tipo', 't', 1], ['Cantidad', 'cant', 'n', 1], ['Unidad', 'und', 't', 1],
    ['Valor', 'valor', 'n', 1], ['Horómetro', 'horo', 'n', 1], ['Soporte', 'fotoUrl', 'link', 0]]},
  rcort: {tab: 'APP Retro liquidaciones', req: null, cols: [['Fecha de corte', 'fecha', 'd', 1], ['Observaciones', 'obs', 't', 1]]},
  veh: {tab: 'APP Vehículos', req: ['placa'], cols: [
    ['Placa', 'placa', 't', 1], ['Tipo', 'tipoV', 't', 1], ['Marca y modelo', 'desc', 't', 1], ['Año', 'anio', 't', 1],
    ['Servicio', 'servicio', 't', 1], ['Matrícula', 'matricula', 'd', 1], ['Foto', 'fotoUrl', 'link', 0]]},
  cab: {tab: 'APP Caballos', req: ['nombre'], cols: [
    ['Nombre', 'nombre', 't', 1], ['Raza', 'raza', 't', 1], ['Nacimiento', 'nac', 'd', 1], ['Jinete', 'jinete', 't', 1],
    ['Observaciones', 'nota', 't', 1], ['Foto', 'fotoUrl', 'link', 0]]},
  inm: {tab: 'APP Inmuebles', req: ['nombre'], cols: [
    ['Nombre', 'nombre', 't', 1], ['Tipo', 'tipo', 't', 1], ['Ubicación', 'dir', 't', 1], ['Presupuesto', 'pres', 'n', 1], ['Foto', 'fotoUrl', 'link', 0]]},
  eq: {tab: 'APP Equipos mina', req: ['nombre'], cols: [
    ['Nombre', 'nombre', 't', 1], ['Tipo', 'tipo', 't', 1], ['Marca y modelo', 'marca', 't', 1], ['Serie', 'serie', 't', 1],
    ['Fecha de compra', 'fcompra', 'd', 1], ['Valor de compra', 'valor', 'n', 1], ['Proveedor', 'prov', 't', 1], ['Foto', 'fotoUrl', 'link', 0]]},
  obl: {tab: 'APP Obligaciones', req: null, cols: [
    ['Activo', '_act', 'calc', 0], ['Obligación', '_obl', 'calc', 0], ['Vence', 'fecha', 'd', 1], ['Cada (meses)', 'meses', 'n', 1],
    ['Estado', '_est', 'calc', 0], ['Nota', 'nota', 't', 1]]},
  cats: {tab: 'APP Categorías', req: null, cols: [['Rubro', '_rub', 'calc', 0], ['Categoría', 'name', 't', 0], ['Clasificación', 'nat', 'nat', 0]]},
  cfgx: {tab: 'APP Configuración', req: null, cols: [['Parámetro', 'id', 't', 0], ['Resumen', '_res', 'calc', 0]]}
};
const COLLS = Object.keys(SCHEMA);
const TECH = ['Borrado', 'ID', 'Actualizado', 'Servidor', 'Datos'];
const RETRO_COLLS = ['rh', 'rs', 'rc', 'rcort', 'cfgx'];
const ROLES = {
  admin: {scope: 'full', write: true, read: function () { return true; }},
  aux: {scope: 'full', write: true, read: function () { return true; }},
  conta: {scope: 'read', write: false, read: function () { return true; }},
  dueno: {scope: 'retro', write: false, read: function (c) { return RETRO_COLLS.indexOf(c) >= 0; }}
};
const ROLE_NAMES = {admin: 'ADMINISTRADOR', aux: 'AUXILIAR', conta: 'CONTADOR', dueno: 'DUEÑO MÁQUINA'};

/* ===================== Instalación ===================== */
function configurar() {
  const ss = SpreadsheetApp.openById(CFG.SHEET_ID);
  COLLS.forEach(function (c) { tab_(ss, c); });
  const props = PropertiesService.getScriptProperties();
  Object.keys(ROLES).forEach(function (r) {
    if (!props.getProperty('TOKEN_' + r)) props.setProperty('TOKEN_' + r, r.slice(0, 3).toUpperCase() + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 12));
  });
  const has = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'alEditar'; });
  if (!has) ScriptApp.newTrigger('alEditar').forSpreadsheet(ss).onEdit().create();
  appFolder_();
  if (!ss.getSheetByName(CFG.REPORT_TAB)) {
    const sh = ss.insertSheet(CFG.REPORT_TAB, 0);
    sh.getRange('B2').setValue('El informe aparece aquí después de la primera sincronización desde la app.');
  }
  Logger.log('Listo. Claves de acceso para la app (Ajustes → Sincronización):');
  Object.keys(ROLES).forEach(function (r) { Logger.log(ROLE_NAMES[r] + ': ' + props.getProperty('TOKEN_' + r)); });
  Logger.log('Ahora: Implementar → Nueva implementación → Aplicación web → Ejecutar como: Yo · Acceso: Cualquier usuario.');
}

function verClaves() {
  const props = PropertiesService.getScriptProperties();
  Object.keys(ROLES).forEach(function (r) { Logger.log(ROLE_NAMES[r] + ': ' + props.getProperty('TOKEN_' + r)); });
}

function cambiarClaves() {
  const props = PropertiesService.getScriptProperties();
  Object.keys(ROLES).forEach(function (r) { props.deleteProperty('TOKEN_' + r); });
  configurar();
}

function tab_(ss, c) {
  const sc = SCHEMA[c];
  let sh = ss.getSheetByName(sc.tab);
  const headers = sc.cols.map(function (x) { return x[0]; }).concat(TECH);
  if (!sh) {
    sh = ss.insertSheet(sc.tab);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#131b4d').setFontColor('#ffffff');
    sh.setTabColor(c === 'mov' ? '#2ee6f0' : RETRO_COLLS.indexOf(c) >= 0 ? '#f2c75c' : '#7b6dff');
    const maxR = sh.getMaxRows();
    sc.cols.forEach(function (col, i) {
      const r = sh.getRange(2, i + 1, Math.max(1, maxR - 1), 1);
      if (col[2] === 'd') r.setNumberFormat('dd/mm/yyyy');
      if (col[2] === 'n' && /valor|saldo|abono|precio|presupuesto|pago mensual|acordado|dueño de la mina/i.test(col[0])) r.setNumberFormat('$#,##0');
      if (col[2] === 'calc' && /abonos|saldo/i.test(col[0])) r.setNumberFormat('$#,##0');
      sh.setColumnWidth(i + 1, /concepto|observ|nota|reparto|detalle|resumen|proveedor/i.test(col[0]) ? 240 : 130);
    });
    const t0 = sc.cols.length + 1;
    sh.setColumnWidth(t0, 80);
    sh.setColumnWidth(t0 + 1, 110);
    sh.hideColumns(t0 + 2, 3);
    sh.getRange(1, t0).setNote('Escribe "Sí" para eliminar el registro en todos los equipos.');
    if (c === 'mov') {
      const n = Math.max(1, maxR - 1);
      sh.getRange(2, 2, n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(Object.keys(MODS).map(function (k) { return MODS[k].name; }), true).setAllowInvalid(false).build());
      const subs = [];
      Object.keys(MODS).forEach(function (k) { Object.keys(MODS[k].subs).forEach(function (s) { if (subs.indexOf(MODS[k].subs[s]) < 0) subs.push(MODS[k].subs[s]); }); });
      sh.getRange(2, 3, n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(subs, true).setAllowInvalid(false).build());
      sh.getRange(2, 4, n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Gasto', 'Costo', 'Inversión', 'Anticipo'], true).build());
    }
    const delCol = colLetter_(sc.cols.length + 1);
    const rule = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + delCol + '2="Sí"')
      .setFontColor('#9aa3c7').setStrikethrough(true).setRanges([sh.getRange(2, 1, Math.max(1, maxR - 1), headers.length)]).build();
    sh.setConditionalFormatRules([rule]);
  }
  return sh;
}

function colLetter_(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

function appFolder_(sub) {
  const root = DriveApp.getFolderById(CFG.FOLDER_ID);
  let it = root.getFoldersByName(CFG.APP_FOLDER);
  let f = it.hasNext() ? it.next() : root.createFolder(CFG.APP_FOLDER);
  if (sub) { it = f.getFoldersByName(sub); f = it.hasNext() ? it.next() : f.createFolder(sub); }
  return f;
}

/* ===================== Disparador de edición en el Sheet ===================== */
function alEditar(e) {
  try {
    const sh = e.range.getSheet();
    const c = COLLS.filter(function (k) { return SCHEMA[k].tab === sh.getName(); })[0];
    if (!c) return;
    const r0 = Math.max(2, e.range.getRow());
    const r1 = e.range.getLastRow();
    if (r1 < 2) return;
    const hm = headerMap_(sh);
    if (hm['Actualizado'] == null || hm['Servidor'] == null) return;
    const firstCol = e.range.getColumn() - 1;
    if (firstCol >= hm['ID']) return;
    const now = Date.now();
    const n = r1 - r0 + 1;
    const vals = [];
    for (let i = 0; i < n; i++) vals.push([now, now]);
    const a = Math.min(hm['Actualizado'], hm['Servidor']);
    sh.getRange(r0, a + 1, n, 2).setValues(vals);
  } catch (err) { console.error(err); }
}

/* ===================== API web ===================== */
function doGet() { return json_({ok: true, app: 'Tablero Financiero', msg: 'Servicio activo'}); }

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const role = auth_(body.token);
    if (!role) return json_({ok: false, error: 'Clave de acceso no válida'});
    const R = ROLES[role];
    if (body.op === 'ping') return json_({ok: true, role: role, scope: R.scope, serverTime: Date.now()});
    if (body.op === 'sync') return json_(sync_(body, role));
    if (body.op === 'file') { if (!R.write) return json_({ok: false, error: 'Sin permiso de escritura'}); return json_(saveFile_(body)); }
    if (body.op === 'getFile') return json_(getFile_(body));
    if (body.op === 'report') { if (!R.write) return json_({ok: false, error: 'Sin permiso'}); renderReport_(SpreadsheetApp.openById(CFG.SHEET_ID), body.data || {}); return json_({ok: true}); }
    return json_({ok: false, error: 'Operación desconocida'});
  } catch (err) {
    return json_({ok: false, error: String(err && err.message || err)});
  }
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function auth_(tok) {
  if (!tok) return null;
  const props = PropertiesService.getScriptProperties();
  const roles = Object.keys(ROLES);
  for (let i = 0; i < roles.length; i++) if (props.getProperty('TOKEN_' + roles[i]) === String(tok).trim()) return roles[i];
  return null;
}

/* ===================== Lectura y escritura de pestañas ===================== */
function headerMap_(sh) {
  const lc = sh.getLastColumn();
  const h = lc ? sh.getRange(1, 1, 1, lc).getValues()[0] : [];
  const m = {};
  h.forEach(function (x, i) { if (x !== '' && m[x] == null) m[x] = i; });
  return m;
}

function loadTab_(ss, c) {
  const sh = tab_(ss, c);
  const hm = headerMap_(sh);
  const width = sh.getLastColumn();
  const n = sh.getLastRow();
  const rows = n > 1 ? sh.getRange(2, 1, n - 1, width).getValues() : [];
  return {c: c, sh: sh, hm: hm, width: width, rows: rows, dirty: false, tz: ss.getSpreadsheetTimeZone()};
}

function isEmptyRow_(row) { for (let i = 0; i < row.length; i++) if (row[i] !== '' && row[i] !== null) return false; return true; }
function isYes_(v) { return v === true || /^(s[ií]|true|x|1)$/i.test(String(v || '').trim()); }
function norm_(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }

function fromCell_(v, t, T, rec) {
  if (t === 'd') {
    if (v instanceof Date) return Utilities.formatDate(v, T.tz, 'yyyy-MM-dd');
    const s = String(v || '').trim(); if (!s) return '';
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0];
    return undefined;
  }
  if (t === 'n') { if (typeof v === 'number') return v; const s = String(v || '').replace(/[^\d,.\-]/g, ''); if (!s) return 0; return parseFloat(s.indexOf(',') >= 0 ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\.(?=\d{3}(\D|$))/g, '')) || 0; }
  if (t === 'bool') return isYes_(v);
  if (t === 'proj') { const k = Object.keys(MODS).filter(function (k) { return norm_(MODS[k].name) === norm_(v); })[0]; return k || rec.p; }
  if (t === 'sub') { const p = rec.p; if (!p || !MODS[p]) return rec.s; const k = Object.keys(MODS[p].subs).filter(function (s) { return norm_(MODS[p].subs[s]) === norm_(v); })[0]; return k || rec.s; }
  if (t === 'nat') { const k = Object.keys(NATL).filter(function (n) { return norm_(NATL[n]) === norm_(v); })[0]; return k || rec.nat; }
  if (t === 'ref' || t === 'sc') { rec['__' + t] = String(v || '').trim(); return undefined; }
  if (t === 'link' || t === 'calc') return undefined;
  return v === null || v === undefined ? '' : String(v);
}

function toCell_(rec, k, t, ctx, c) {
  if (t === 'd') { const s = rec[k]; if (!s) return ''; const p = String(s).split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2], 12) : s; }
  if (t === 'n') return rec[k] == null || rec[k] === '' ? '' : Number(rec[k]) || 0;
  if (t === 'bool') return rec[k] ? 'Sí' : '';
  if (t === 'proj') return MODS[rec.p] ? MODS[rec.p].name : (rec.p || '');
  if (t === 'sub') return MODS[rec.p] && MODS[rec.p].subs[rec.s] ? MODS[rec.p].subs[rec.s] : (rec.s || '');
  if (t === 'nat') return NATL[rec.nat] || rec.nat || '';
  if (t === 'link') return rec.fotoUrl || rec.fotoN || '';
  if (t === 'ref') return refText_(c, rec, ctx);
  if (t === 'sc') return scText_(rec.sc, ctx);
  if (t === 'calc') return calc_(c, k, rec, ctx);
  const v = rec[k] == null ? '' : rec[k];
  return typeof v === 'string' && /^[=+@]/.test(v) ? "'" + v : v;
}

function scText_(sc, ctx) {
  if (sc === 'mina') return 'Mina La Fe';
  if (sc === 'parcela') return 'Parcela Las Colinas';
  if (sc && sc.indexOf('inm:') === 0) { const i = ctx.inm[sc.slice(4)]; return 'Obra: ' + (i ? i.nombre : sc.slice(4)); }
  return sc || '';
}

function refText_(c, r, ctx) {
  if (c === 'abonos') { const p = ctx.prest[r.prest]; return p ? p.nombre + ' · ' + fdate_(p.fecha) : ''; }
  if (c !== 'mov') return '';
  if (r.per && ctx.per[r.per]) return ctx.per[r.per].nombre;
  if (r.veh && ctx.veh[r.veh]) return ctx.veh[r.veh].placa;
  if (r.cab && ctx.cab[r.cab]) return ctx.cab[r.cab].nombre;
  if (r.eq && ctx.eq[r.eq]) return ctx.eq[r.eq].nombre;
  if (r.p === 'inm' && r.inm && ctx.inm[r.inm]) return ctx.inm[r.inm].nombre;
  return '';
}

function fdate_(s) { return s ? String(s).slice(8, 10) + '/' + String(s).slice(5, 7) + '/' + String(s).slice(0, 4) : ''; }
function money_(n) { return '$' + Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

function calc_(c, k, r, ctx) {
  if (c === 'mov' && k === '_det') return r.arrTipo ? 'Arriendo: ' + r.arrTipo + (r.arrDesc ? ' · ' + r.arrDesc : '') + (r.arrMes ? ' · ' + r.arrMes : '') : '';
  if (c === 'prest' && k === '_ab') return ctx.ab[r.id] || 0;
  if (c === 'prest' && k === '_saldo') return (Number(r.valor) || 0) - (ctx.ab[r.id] || 0);
  if (c === 'cortes' && k === '_rep') return (r.liq || []).map(function (l) { return l.label + (l.nombre ? ' (' + l.nombre + ')' : '') + ': ' + money_(l.cop); }).join('; ');
  if (c === 'obl' && k === '_act') { const a = (ctx[r.ac] || {})[r.aid]; return OBL_ASSET[r.ac] + ': ' + (a ? (a.placa || a.nombre) : '—'); }
  if (c === 'obl' && k === '_obl') return r.tipo === 'Otro' ? (r.nombre || 'Otro') : r.tipo;
  if (c === 'obl' && k === '_est') return r.done ? 'Cumplida' : (r.fecha < today_() ? 'Vencida' : 'Vigente');
  if (c === 'cats' && k === '_rub') { const p = String(r.key || '').split('.'); return MODS[p[0]] ? MODS[p[0]].name + ' › ' + (MODS[p[0]].subs[p[1]] || p[1]) : r.key; }
  if (c === 'cfgx' && k === '_res') {
    if (r.id === 'retroP') return (r.maq || '') + ' · dueño ' + (r.dueno || '') + ' · ' + money_(r.precio) + ' por hora · mínimo ' + (r.min || 0) + ' h/día · combustible dueño ' + (r.pctComb || 0) + '%';
    if (r.id === 'conf' && r.pct) return 'Reparto del corte: terreno ' + r.pct.ter + '% · empleados ' + r.pct.emp + '% · comisionista ' + r.pct.com + '% · administrador ' + r.pct.adm + '% · dueño de la mina ' + (100 - r.pct.ter - r.pct.emp - r.pct.com - r.pct.adm) + '%';
    return '';
  }
  return '';
}

function today_() { return Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd'); }

function rowToRec_(T, row) {
  const sc = SCHEMA[T.c];
  const g = function (h) { return T.hm[h] == null ? '' : row[T.hm[h]]; };
  let rec = {};
  try { rec = JSON.parse(g('Datos') || '{}') || {}; } catch (e) { rec = {}; }
  sc.cols.forEach(function (col) {
    if (!col[3] || T.hm[col[0]] == null) return;
    const v = fromCell_(g(col[0]), col[2], T, rec);
    if (v !== undefined) rec[col[1]] = v;
  });
  const id = String(g('ID') || '').trim();
  if (id) rec.id = id;
  rec.upd = Number(g('Actualizado')) || rec.upd || 0;
  rec.srv = Number(g('Servidor')) || 0;
  rec.del = isYes_(g('Borrado'));
  if (T.c === 'rh' && rec.hf !== '' && rec.hi !== '' && rec.hf != null && rec.hi != null) rec.horas = Math.round(((Number(rec.hf) || 0) - (Number(rec.hi) || 0)) * 100) / 100;
  return rec;
}

function recToRow_(T, rec, ctx) {
  const sc = SCHEMA[T.c];
  const row = [];
  for (let i = 0; i < T.width; i++) row.push('');
  const put = function (h, v) { if (T.hm[h] != null) row[T.hm[h]] = v; };
  sc.cols.forEach(function (col) { put(col[0], toCell_(rec, col[1], col[2], ctx, T.c)); });
  const clean = clean_(rec);
  put('ID', rec.id); put('Actualizado', rec.upd || 0); put('Servidor', rec.srv || 0); put('Borrado', rec.del ? 'Sí' : ''); put('Datos', JSON.stringify(clean));
  return row;
}

function clean_(rec) {
  const o = {};
  Object.keys(rec).forEach(function (k) { if (k.indexOf('__') !== 0 && k !== 'srv') o[k] = rec[k]; });
  return o;
}

function ctx_(R) {
  const ctx = {ab: {}};
  ['inm', 'veh', 'cab', 'per', 'eq', 'prest'].forEach(function (c) { ctx[c] = {}; R[c].forEach(function (r) { if (r.id && !r.del) ctx[c][r.id] = r; }); });
  R.abonos.forEach(function (a) { if (!a.del && a.prest) ctx.ab[a.prest] = (ctx.ab[a.prest] || 0) + (Number(a.valor) || 0); });
  return ctx;
}

function findBy_(map, field, text) {
  const n = norm_(text); if (!n) return null;
  const ids = Object.keys(map).filter(function (id) { return norm_(map[id][field]) === n; });
  return ids.length ? ids[ids.length - 1] : null;
}

function resolveRefs_(R, ctx) {
  R.mov.forEach(function (r) {
    const cell = r.__ref; delete r.__ref;
    if (cell === undefined || cell === refText_('mov', r, ctx)) return;
    if (!cell) return;
    if (r.s === 'nomina') { const id = findBy_(ctx.per, 'nombre', cell); if (id) { r.per = id; r.tercero = ctx.per[id].nombre; if (r.p === 'inm' && String(ctx.per[id].sc).indexOf('inm:') === 0) r.inm = ctx.per[id].sc.slice(4); } return; }
    if (r.s === 'vehiculos') { const id = findBy_(ctx.veh, 'placa', cell); if (id) r.veh = id; return; }
    if (r.s === 'caballos') { const id = findBy_(ctx.cab, 'nombre', cell); if (id) r.cab = id; return; }
    if (r.p === 'mina') { const id = findBy_(ctx.eq, 'nombre', cell); if (id) r.eq = id; return; }
    if (r.p === 'inm') { const id = findBy_(ctx.inm, 'nombre', cell); if (id) r.inm = id; }
  });
  R.abonos.forEach(function (a) {
    const cell = a.__ref; delete a.__ref;
    if (cell === undefined || !cell || cell === refText_('abonos', a, ctx)) return;
    let id = Object.keys(ctx.prest).filter(function (k) { return norm_(ctx.prest[k].nombre + ' · ' + fdate_(ctx.prest[k].fecha)) === norm_(cell); })[0];
    if (!id) {
      const cands = Object.keys(ctx.prest).filter(function (k) { return norm_(ctx.prest[k].nombre) === norm_(cell.split('·')[0]); })
        .sort(function (x, y) { return String(ctx.prest[x].fecha).localeCompare(String(ctx.prest[y].fecha)); });
      const open = cands.filter(function (k) { return (Number(ctx.prest[k].valor) || 0) > (ctx.ab[k] || 0); });
      id = open[0] || cands[cands.length - 1];
    }
    if (id) a.prest = id;
  });
  R.per.forEach(function (p) {
    const cell = p.__sc; delete p.__sc;
    if (cell === undefined || !cell || cell === scText_(p.sc, ctx)) return;
    const n = norm_(cell);
    if (n.indexOf('mina') >= 0) p.sc = 'mina';
    else if (n.indexOf('parcela') >= 0) p.sc = 'parcela';
    else { const id = findBy_(ctx.inm, 'nombre', cell.replace(/^obra:\s*/i, '')); if (id) p.sc = 'inm:' + id; }
  });
}

function fixNew_(c, r) {
  if (c === 'mov') { if (!r.nat) r.nat = r.p === 'mina' ? 'costo' : r.s === 'materiales' ? 'inversion' : 'gasto'; if (!r.pago) r.pago = 'Efectivo'; if (!r.cat) r.cat = 'Otro'; if (!r.concepto) r.concepto = r.cat; r.resp = r.resp || 'Sheet'; }
  if (c === 'rs' && !r.asume) r.asume = 'Dueño';
  if (c === 'rs' && !r.tipo) r.tipo = 'Repuesto';
  if (c === 'rc' && !r.tipo) r.tipo = 'ACPM';
  if (c === 'prest' && !r.pago) r.pago = 'Efectivo';
  if (c === 'abonos' && !r.pago) r.pago = 'Efectivo';
  r.by = 'sheet';
}

function validNew_(c, r) {
  const req = SCHEMA[c].req;
  if (!req) return false;
  return req.every(function (k) { if (r[k] === undefined || r[k] === '' || r[k] === null) return false; if (k === 'valor') return Number(r[k]) > 0; return true; });
}

function writeTab_(T, recs, ctx) {
  const ok = recs.filter(function (r) { return !r.__skip; });
  const skipped = recs.filter(function (r) { return r.__skip; }).map(function (r) { return T.rows[r.__i]; });
  const hasF = SCHEMA[T.c].cols.some(function (x) { return x[1] === 'fecha'; });
  if (hasF) ok.sort(function (a, b) { return String(a.fecha || '').localeCompare(String(b.fecha || '')) || (a.cre || 0) - (b.cre || 0); });
  const out = ok.map(function (r) { return recToRow_(T, r, ctx); }).concat(skipped);
  const prev = T.rows.length;
  if (out.length) T.sh.getRange(2, 1, out.length, T.width).setValues(out);
  if (prev > out.length) T.sh.getRange(2 + out.length, 1, prev - out.length, T.width).clearContent();
}

/* ===================== Sincronización ===================== */
function sync_(body, role) {
  const R0 = ROLES[role];
  const lock = LockService.getScriptLock();
  lock.waitLock(28000);
  try {
    const ss = SpreadsheetApp.openById(CFG.SHEET_ID);
    const now = Date.now();
    const T = {}, R = {}, IDX = {};
    COLLS.forEach(function (c) {
      T[c] = loadTab_(ss, c); R[c] = []; IDX[c] = {};
      T[c].rows.forEach(function (row, i) {
        if (isEmptyRow_(row)) return;
        const rec = rowToRec_(T[c], row); rec.__i = i; R[c].push(rec);
      });
    });
    let ctx = ctx_(R);
    resolveRefs_(R, ctx);
    COLLS.forEach(function (c) {
      R[c].forEach(function (rec) {
        if (rec.id) return;
        if (validNew_(c, rec)) { rec.id = Utilities.getUuid(); rec.upd = now; rec.srv = now; rec.cre = now; fixNew_(c, rec); T[c].dirty = true; }
        else rec.__skip = 1;
      });
      R[c].forEach(function (rec) { if (rec.id) IDX[c][rec.id] = rec; });
    });
    ctx = ctx_(R);
    const seen = {}, force = {};
    let acc = 0, rej = 0;
    if (R0.write) (body.changes || []).forEach(function (ch) {
      const c = ch.c, rec = ch.rec;
      if (COLLS.indexOf(c) < 0 || !rec || !rec.id) return;
      seen[c + ':' + rec.id] = 1;
      const cur = IDX[c][rec.id];
      if (cur && (Number(cur.upd) || 0) > (Number(rec.upd) || 0)) { rej++; delete seen[c + ':' + rec.id]; force[c + ':' + rec.id] = 1; return; }
      const nr = clean_(rec); nr.srv = now;
      if (cur) { const i = cur.__i; Object.keys(cur).forEach(function (k) { delete cur[k]; }); Object.assign(cur, nr); cur.__i = i; }
      else { nr.__i = -1; R[c].push(nr); IDX[c][nr.id] = nr; }
      T[c].dirty = true; acc++;
    });
    if (acc) { ctx = ctx_(R); if (T.abonos.dirty) T.prest.dirty = true; ['inm', 'veh', 'cab', 'per', 'eq', 'prest'].forEach(function (c) { if (T[c].dirty) { T.mov.dirty = true; T.obl.dirty = true; T.abonos.dirty = true; } }); }
    COLLS.forEach(function (c) { if (T[c].dirty) writeTab_(T[c], R[c], ctx); });
    const since = Number(body.since) || 0;
    const out = [];
    COLLS.forEach(function (c) {
      if (!R0.read(c)) return;
      R[c].forEach(function (rec) {
        if (rec.__skip || !rec.id || seen[c + ':' + rec.id]) return;
        if (since === 0 || (Number(rec.srv) || 0) > since || force[c + ':' + rec.id]) out.push({c: c, rec: clean_(rec)});
      });
    });
    return {ok: true, serverTime: now, changes: out, accepted: acc, rejected: rej, role: role, scope: R0.scope};
  } finally { lock.releaseLock(); }
}

/* ===================== Soportes y fotos en Drive ===================== */
function saveFile_(b) {
  const m = String(b.data || '').match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return {ok: false, error: 'Archivo inválido'};
  const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], (b.prefix ? b.prefix + ' ' : '') + (b.name || 'soporte'));
  const f = appFolder_(b.folder || 'Otros').createFile(blob);
  return {ok: true, fileId: f.getId(), url: f.getUrl()};
}

function getFile_(b) {
  const f = DriveApp.getFileById(b.fileId);
  const app = appFolder_().getId();
  let ok = false;
  const ps = f.getParents();
  while (ps.hasNext()) { const p = ps.next(); if (p.getId() === app) ok = true; const gp = p.getParents(); while (gp.hasNext()) if (gp.next().getId() === app) ok = true; }
  if (!ok) return {ok: false, error: 'Archivo fuera de la carpeta de la app'};
  const blob = f.getBlob();
  return {ok: true, name: f.getName(), data: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes())};
}

/* ===================== Informe para el contador ===================== */
const C = {ink: '#0e1540', band: '#131b4d', cyan: '#12b3c2', violet: '#5c4dd6', gold: '#b8860b', ok: '#13875f', bad: '#c62f4f', warn: '#b86a00', mut: '#5b6694', light: '#eef1fb', line: '#d5dbf0'};

function renderReport_(ss, d) {
  let sh = ss.getSheetByName(CFG.REPORT_TAB);
  if (!sh) sh = ss.insertSheet(CFG.REPORT_TAB, 0);
  sh.getCharts().forEach(function (ch) { sh.removeChart(ch); });
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();
  sh.clear();
  sh.setHiddenGridlines(true);
  sh.setTabColor('#2ee6f0');
  const W = 9;
  if (sh.getMaxColumns() < 12) sh.insertColumnsAfter(sh.getMaxColumns(), 12 - sh.getMaxColumns());
  sh.setColumnWidth(1, 24);
  for (let i = 2; i <= W + 1; i++) sh.setColumnWidth(i, i === 2 ? 230 : 128);
  let r = 2;
  sh.getRange(r, 2, 1, W).merge().setValue(d.titulo || 'Informe financiero').setFontSize(20).setFontWeight('bold').setFontColor(C.ink);
  r++;
  sh.getRange(r, 2, 1, W).merge().setValue('Periodo ' + (d.periodo || '') + ' · Actualizado ' + (d.generado || '') + ' desde la app Tablero Financiero').setFontColor(C.mut);
  r += 2;
  // KPIs
  const k = d.kpis || [];
  for (let i = 0; i < k.length; i += 4) {
    const chunk = k.slice(i, i + 4);
    chunk.forEach(function (x, j) {
      const col = 2 + j * 2;
      const lab = sh.getRange(r, col, 1, 2).merge().setValue(String(x.l || '').toUpperCase()).setFontSize(9).setFontColor(C.mut).setFontWeight('bold');
      const val = sh.getRange(r + 1, col, 1, 2).merge().setValue(Number(x.v) || 0).setNumberFormat(x.f || '$#,##0').setFontSize(18).setFontWeight('bold')
        .setFontColor(x.tono === 'bad' ? C.bad : x.tono === 'ok' ? C.ok : x.tono === 'gold' ? C.gold : C.ink);
      sh.getRange(r + 2, col, 1, 2).merge().setValue(x.s || '').setFontSize(9).setFontColor(C.mut);
      sh.getRange(r, col, 3, 2).setBackground(C.light).setBorder(true, true, true, true, null, null, C.line, SpreadsheetApp.BorderStyle.SOLID);
      lab; val;
    });
    r += 4;
  }
  // Hallazgos
  r = section_(sh, r, W, 'Lo más importante del periodo');
  (d.hallazgos || []).forEach(function (h) {
    const color = h.t === 'ba' ? C.bad : h.t === 'wa' ? C.warn : h.t === 'ok' ? C.ok : C.violet;
    sh.getRange(r, 2).setValue('●').setFontColor(color).setHorizontalAlignment('right');
    sh.getRange(r, 3, 1, W - 1).merge().setValue(h.x).setWrap(true);
    r++;
  });
  r++;
  // Estado de resultados
  if (d.pyg) {
    r = section_(sh, r, W, 'Estado de resultados por proyecto');
    const head = ['Concepto'].concat(d.pyg.cols);
    const rows = d.pyg.rows.map(function (x) { return [x.l].concat(x.v); });
    r = table_(sh, r, head, rows, function (i) { return d.pyg.rows[i].tipo; });
    r++;
  }
  // Mensual
  if (d.meses) {
    r = section_(sh, r, W, 'Evolución mensual ' + (d.anio || ''));
    const head = ['Mes'].concat(d.meses.series.map(function (s) { return s.n; }));
    const rows = d.meses.lab.map(function (l, i) { return [l].concat(d.meses.series.map(function (s) { return s.v[i] || 0; })); });
    const top = r;
    r = table_(sh, r, head, rows);
    try {
      const ch = sh.newChart().setChartType(Charts.ChartType.COLUMN)
        .addRange(sh.getRange(top, 2, rows.length + 1, Math.min(head.length, 5)))
        .setNumHeaders(1).setPosition(top, 2 + head.length + 1, 0, 0)
        .setOption('title', 'Ingresos y egresos por mes').setOption('legend', {position: 'bottom'})
        .setOption('colors', ['#13875f', '#c62f4f', '#b86a00', '#5c4dd6']).setOption('width', 560).setOption('height', 320).build();
      sh.insertChart(ch);
    } catch (e) {}
    r = Math.max(r, top + 17) + 1;
  }
  if (d.proyMes) {
    r = section_(sh, r, W, 'Egresos por proyecto y mes');
    const head = ['Proyecto'].concat(d.proyMes.lab).concat(['Total']);
    const rows = d.proyMes.rows.map(function (x) { return [x.n].concat(x.v).concat([x.v.reduce(function (a, b) { return a + b; }, 0)]); });
    if (sh.getMaxColumns() < head.length + 2) sh.insertColumnsAfter(sh.getMaxColumns(), head.length + 2 - sh.getMaxColumns());
    for (let i = W + 2; i <= head.length + 1; i++) sh.setColumnWidth(i, 110);
    r = table_(sh, r, head, rows) + 1;
  }
  if (d.categorias && d.categorias.length) {
    r = section_(sh, r, W, 'Gastos, costos e inversiones por categoría');
    const top = r;
    r = table_(sh, r, ['Proyecto', 'Rubro', 'Categoría', 'Clasificación', 'Valor'], d.categorias);
    try {
      const n = Math.min(d.categorias.length, 10);
      const helperCol = 22;
      if (sh.getMaxColumns() < helperCol + 1) sh.insertColumnsAfter(sh.getMaxColumns(), helperCol + 1 - sh.getMaxColumns());
      const agg = {};
      d.categorias.forEach(function (x) { if (x[3] !== 'Inversión') agg[x[2]] = (agg[x[2]] || 0) + (Number(x[4]) || 0); });
      const arr = Object.keys(agg).map(function (kk) { return [kk, agg[kk]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
      if (arr.length) {
        sh.getRange(top, helperCol, arr.length + 1, 2).setValues([['Categoría', 'Valor']].concat(arr)).setFontColor('#ffffff');
        const ch = sh.newChart().setChartType(Charts.ChartType.PIE).addRange(sh.getRange(top, helperCol, arr.length + 1, 2))
          .setNumHeaders(1).setPosition(top, 8, 0, 0).setOption('title', 'Gastos y costos: principales categorías').setOption('pieHole', 0.5)
          .setOption('width', 460).setOption('height', 300).build();
        sh.insertChart(ch);
      }
      n;
    } catch (e) {}
    r = Math.max(r, top + 16) + 1;
  }
  if (d.cortes && d.cortes.length) {
    r = section_(sh, r, W, 'Mina La Fe: cortes de oro');
    r = table_(sh, r, ['Fecha', 'Oro (g)', 'Precio por gramo', 'Valor total', 'Dueño de la mina', 'Abono a costos'], d.cortes, null, {1: '#,##0.00'}) + 1;
  }
  if (d.retro && d.retro.length) {
    r = section_(sh, r, W, 'Retroexcavadora');
    r = table_(sh, r, ['Concepto', 'Valor'], d.retro, null, null, d.retroFmt) + 1;
  }
  if (d.prestamos && d.prestamos.length) {
    r = section_(sh, r, W, 'Préstamos por cobrar');
    r = table_(sh, r, ['Nombre', 'Cédula', 'Fecha', 'Prestado', 'Abonos', 'Saldo', 'Días'], d.prestamos, null, {6: '0'}) + 1;
  }
  if (d.obligaciones && d.obligaciones.length) {
    r = section_(sh, r, W, 'Próximas obligaciones de los activos');
    r = table_(sh, r, ['Activo', 'Obligación', 'Vence', 'Estado'], d.obligaciones) + 1;
  }
  sh.getRange(r + 1, 2, 1, W).merge().setValue('Hoja generada por la app. Los datos de detalle están en las pestañas que empiezan por "APP". No edites esta hoja: se reescribe en cada sincronización.').setFontColor(C.mut).setFontSize(9);
  sh.setFrozenRows(0);
}

function section_(sh, r, W, title) {
  sh.getRange(r, 2, 1, W).merge().setValue(title.toUpperCase()).setFontWeight('bold').setFontColor('#ffffff').setBackground(C.band).setFontSize(10);
  sh.setRowHeight(r, 26);
  return r + 1;
}

function table_(sh, r, head, rows, kindOf, fmtCols, rowFmt) {
  const w = head.length;
  sh.getRange(r, 2, 1, w).setValues([head]).setFontWeight('bold').setFontColor(C.mut).setBackground(C.light).setFontSize(9);
  if (rows.length) {
    const data = rows.map(function (x) {
      const a = x.slice(0, w); while (a.length < w) a.push('');
      return a.map(function (v) { if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) { const p = v.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); } return v; });
    });
    const rg = sh.getRange(r + 1, 2, data.length, w);
    rg.setValues(data);
    for (let j = 0; j < w; j++) {
      const sample = data.map(function (x) { return x[j]; }).filter(function (v) { return v !== '' && v !== null; })[0];
      const colR = sh.getRange(r + 1, 2 + j, data.length, 1);
      if (fmtCols && fmtCols[j]) colR.setNumberFormat(fmtCols[j]);
      else if (sample instanceof Date) colR.setNumberFormat('dd/mm/yyyy');
      else if (typeof sample === 'number') colR.setNumberFormat('$#,##0;[Red]-$#,##0');
    }
    if (rowFmt) rowFmt.forEach(function (f, i) { if (f) sh.getRange(r + 1 + i, 3).setNumberFormat(f); });
    rg.setBorder(null, null, true, null, null, true, C.line, SpreadsheetApp.BorderStyle.SOLID);
    if (kindOf) data.forEach(function (x, i) {
      const kd = kindOf(i);
      const row = sh.getRange(r + 1 + i, 2, 1, w);
      if (kd === 'total') row.setFontWeight('bold').setBackground('#e3f7f9');
      if (kd === 'sub') row.setFontWeight('bold');
      if (kd === 'nota') row.setFontColor(C.mut).setFontStyle('italic');
    });
  }
  return r + 1 + rows.length;
}
