import re
s=open('/home/claude/tablero-financiero/apps-script/Code.gs').read()
def R(o,n,c=1):
    global s
    assert s.count(o)==c,(o[:150],s.count(o));s=s.replace(o,n)
def RX(pat,n,flags=re.S):
    global s
    s2,k=re.subn(pat,n,s,count=1,flags=flags);assert k==1,pat;s=s2
# encabezado
RX(r"^/\*\*.*?\*/\n","""/**
 * Tablero de Maquinaria · Servicio de sincronización y Drive
 * Guarda los datos en un Google Sheet y los soportes e informes en una carpeta del Drive del dueño.
 *
 * Instalación (una sola vez, con la cuenta de Google del dueño):
 *  1. script.google.com → Nuevo proyecto → pega este archivo completo → Guardar.
 *  2. (Opcional) En DRIVE_FOLDER pega el ID de la carpeta del Drive donde quieres todo.
 *     Si lo dejas vacío se crea la carpeta "Tablero de Maquinaria" en Mi unidad.
 *  3. Elige la función "configurar" → Ejecutar → autoriza los permisos.
 *  4. Implementar → Nueva implementación → Aplicación web · Ejecutar como: Yo · Acceso: Cualquier usuario.
 *  5. Copia la URL de la aplicación web y las claves que muestra el registro de ejecución.
 */
""")
RX(r"const CFG = \{.*?\n\};\n","""const DRIVE_FOLDER = '';
const CFG = {
  get SHEET_ID() { return PropertiesService.getScriptProperties().getProperty('SHEET_ID'); },
  get FOLDER_ID() { return PropertiesService.getScriptProperties().getProperty('FOLDER_ID'); },
  APP_FOLDER: 'Tablero de Maquinaria',
  REPORT_TAB: 'INFORME DUEÑO'
};
""")
RX(r"const MODS = \{.*?\};\n","""const MODS = {"flota":{"name":"Gastos de la flota","subs":{"operadores":"Operadores y nómina","transporte":"Transporte de máquinas","legal":"Seguros, impuestos y trámites","taller":"Taller y herramientas","admin":"Administración"}}};
""")
RX(r"const SCHEMA = \{.*?\n\};\nconst COLLS","""const SCHEMA = {
  rh: {tab: 'APP Jornadas', req: ['fecha', 'hi'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Máquina', 'mq', 'mq', 1], ['Cliente u obra', '_cli', 'calc', 0], ['Tarifa por hora', 'tar', 'n', 1],
    ['Horómetro inicio', 'hi', 'n', 1], ['Horómetro final', 'hf', 'n', 1], ['Horas', 'horas', 'n', 0], ['Valor', '_val', 'calc', 0],
    ['Operador', 'operador', 't', 1], ['Novedad', 'obs', 't', 1], ['Foto', 'fotoUrl', 'link', 0], ['Foto final', 'fotoUrl2', 'link', 0], ['Soporte novedad', 'fotoUrl3', 'link', 0]]},
  rs: {tab: 'APP Repuestos y reparaciones', req: ['fecha', 'concepto', 'valor'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Máquina', 'mq', 'mq', 1], ['Tipo', 'tipo', 't', 1], ['Concepto', 'concepto', 't', 1], ['Valor', 'valor', 'n', 1],
    ['Lo paga', 'asume', 't', 1], ['Pagado con', '_fnd', 'calc', 0], ['Soporte', 'fotoUrl', 'link', 0]]},
  rc: {tab: 'APP Combustible', req: ['fecha', 'valor'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Máquina', 'mq', 'mq', 1], ['Tipo', 'tipo', 't', 1], ['Cantidad', 'cant', 'n', 1], ['Unidad', 'und', 't', 1],
    ['Valor', 'valor', 'n', 1], ['Lo paga', 'asume', 't', 1], ['Horómetro', 'horo', 'n', 1], ['Pagado con', '_fnd', 'calc', 0], ['Soporte', 'fotoUrl', 'link', 0]]},
  rcort: {tab: 'APP Cortes', req: null, cols: [['Fecha de corte', 'fecha', 'd', 1], ['Máquina', 'mq', 'mq', 0], ['Observaciones', 'obs', 't', 1]]},
  maq: {tab: 'APP Máquinas', req: ['maq'], cols: [
    ['Máquina', 'maq', 't', 1], ['Tipo', 'tipo', 't', 1], ['Placa o serie', 'serie', 't', 1], ['Cliente actual', '_cli', 'calc', 0],
    ['Tarifa por hora', 'precio', 'n', 1], ['Mínimo horas por día', 'min', 'n', 1], ['Alerta %', 'alerta', 'n', 1],
    ['Combustible lo paga', 'combA', 't', 1], ['Repuestos los paga', 'repA', 't', 1], ['Operador', 'operador', 't', 1], ['Inactiva', 'inactivo', 'bool', 1], ['Foto', 'fotoUrl', 'link', 0]]},
  cli: {tab: 'APP Clientes', req: ['nombre'], cols: [
    ['Nombre', 'nombre', 't', 1], ['NIT o cédula', 'nit', 't', 1], ['Celular', 'tel', 't', 1], ['Contacto', 'contacto', 't', 1],
    ['Facturado', '_fac', 'calc', 0], ['Cobrado', '_cob', 'calc', 0], ['Saldo', '_saldo', 'calc', 0], ['Nota', 'nota', 't', 1]]},
  cob: {tab: 'APP Pagos de clientes', req: null, cols: [
    ['Fecha', 'fecha', 'd', 1], ['Cliente', '_cli', 'calc', 0], ['Valor', 'valor', 'n', 1], ['Forma de pago', 'pago', 't', 1], ['Nota', 'nota', 't', 1], ['Soporte', 'fotoUrl', 'link', 0]]},
  mov: {tab: 'APP Gastos de la flota', req: ['fecha', 'valor', 'p', 's'], cols: [
    ['Fecha', 'fecha', 'd', 1], ['Proyecto', 'p', 'proj', 1], ['Rubro', 's', 'sub', 1], ['Clasificación', 'nat', 'nat', 1],
    ['Categoría', 'cat', 't', 1], ['Concepto', 'concepto', 't', 1], ['Proveedor / beneficiario', 'tercero', 't', 1],
    ['Cédula / NIT', 'cedula', 't', 1], ['Valor', 'valor', 'n', 1], ['Forma de pago', 'pago', 't', 1], ['Responsable', 'resp', 't', 1],
    ['Máquina', '_mqm', 'calc', 0], ['Observaciones', 'nota', 't', 1], ['Soporte', 'fotoUrl', 'link', 0], ['Pagado con', '_fnd', 'calc', 0]]},
  fnd: {tab: 'APP Fondos', req: null, cols: [
    ['Tipo', '_tipo', 'calc', 0], ['Nombre', 'nombre', 't', 1], ['Proyecto', '_proj', 'calc', 0], ['Celular', 'tel', 't', 1],
    ['Entregado', '_ent', 'calc', 0], ['Legalizado', '_comp', 'calc', 0], ['Devuelto', '_dev', 'calc', 0], ['Saldo', '_saldo', 'calc', 0],
    ['Avisar si el saldo baja de', 'min', 'n', 1], ['Días para legalizar', 'dias', 'n', 1], ['Inactivo', 'inactivo', 'bool', 1], ['Nota', 'nota', 't', 1]]},
  fmov: {tab: 'APP Fondos movimientos', req: null, cols: [
    ['Fecha', 'fecha', 'd', 1], ['Fondo', '_fnd', 'calc', 0], ['Movimiento', '_tipo', 'calc', 0], ['Valor', 'valor', 'n', 1],
    ['Forma de pago', 'pago', 't', 1], ['Nota', 'nota', 't', 1], ['Soporte', 'fotoUrl', 'link', 0]]},
  cats: {tab: 'APP Categorías', req: null, cols: [['Rubro', '_rub', 'calc', 0], ['Categoría', 'name', 't', 0], ['Clasificación', 'nat', 'nat', 0]]},
  cfgx: {tab: 'APP Configuración', req: null, cols: [['Parámetro', 'id', 't', 0], ['Resumen', '_res', 'calc', 0]]}
};
const COLLS""")
RX(r"const ROLES = \{.*?\n\};\nconst ROLE_NAMES = \{[^\n]*\n","""const ROLES = {
  admin: {scope: 'full', write: true, read: function () { return true; }},
  aux: {scope: 'full', write: true, read: function () { return true; }},
  conta: {scope: 'read', write: false, read: function () { return true; }}
};
const ROLE_NAMES = {admin: 'ADMINISTRADOR', aux: 'AUXILIAR DE CAMPO', conta: 'DUEÑO (SOLO LECTURA)'};
const STUB = ['abonos', 'per', 'prest', 'inm', 'veh', 'cab', 'eq', 'own', 'cortes', 'obl'];
""")
# configurar crea hoja y carpeta
R("""function configurar() {
  const ss = SpreadsheetApp.openById(CFG.SHEET_ID);""","""function configurar() {
  const P0 = PropertiesService.getScriptProperties();
  if (!CFG.FOLDER_ID) {
    const f = DRIVE_FOLDER ? DriveApp.getFolderById(DRIVE_FOLDER) : DriveApp.createFolder(CFG.APP_FOLDER);
    P0.setProperty('FOLDER_ID', f.getId());
  }
  if (!CFG.SHEET_ID) {
    const nss = SpreadsheetApp.create('Tablero de Maquinaria · Datos');
    try { DriveApp.getFileById(nss.getId()).moveTo(DriveApp.getFolderById(CFG.FOLDER_ID)); } catch (e) {}
    P0.setProperty('SHEET_ID', nss.getId());
  }
  const ss = SpreadsheetApp.openById(CFG.SHEET_ID);""")
R("""  Logger.log('Listo. Claves de acceso para la app (Ajustes → Sincronización):');""","""  Logger.log('Carpeta del Drive: https://drive.google.com/drive/folders/' + CFG.FOLDER_ID);
  Logger.log('Sheet de datos: ' + ss.getUrl());
  Logger.log('Listo. Claves de acceso para la app (Ajustes → Sincronización):');""")
RX(r"function appFolder_\(sub\) \{.*?\n\}\n","""function appFolder_(sub, sub2) {
  let f = DriveApp.getFolderById(CFG.FOLDER_ID);
  [sub, sub2].forEach(function (n) { if (!n) return; const it = f.getFoldersByName(n); f = it.hasNext() ? it.next() : f.createFolder(n); });
  return f;
}
""")
R("""  const f = appFolder_(b.folder || 'Otros').createFile(blob);""","""  const fo = String(b.folder || 'Otros');
  const f = (fo === 'Informes' ? appFolder_('Informes', Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM')) : appFolder_('Soportes', fo)).createFile(blob);""")
R("""  let ok = false;
  const ps = f.getParents();
  while (ps.hasNext()) { const p = ps.next(); if (p.getId() === app) ok = true; const gp = p.getParents(); while (gp.hasNext()) if (gp.next().getId() === app) ok = true; }""","""  let ok = false;
  const walk = function (it, d) { while (it.hasNext() && !ok && d < 5) { const p = it.next(); if (p.getId() === app) ok = true; else walk(p.getParents(), d + 1); } };
  walk(f.getParents(), 0);""")
R("doGet() { return json_({ok: true, app: 'Tablero Financiero',","doGet() { return json_({ok: true, app: 'Tablero de Maquinaria',")
# auth sin dueños de máquina externos
R("""  const all = props.getProperties();
  const k = Object.keys(all).filter(function (x) { return x.indexOf('OWNKEY_') === 0 && all[x] === t; })[0];
  return k ? {role: 'dueno', own: k.slice(7)} : null;""","""  return null;""")
R("""    if (body.op === 'ownerKey') { if (role !== 'admin') return json_({ok: false, error: 'Solo el administrador gestiona las claves de los dueños'}); return json_(ownerKey_(body)); }\n""","")
# stubs para colecciones de la app financiera
R("""    let ctx = ctx_(R);
    resolveRefs_(R, ctx);""","""    STUB.forEach(function (c) { if (!R[c]) R[c] = []; if (!T[c]) T[c] = {dirty: false}; });
    let ctx = ctx_(R);
    resolveRefs_(R, ctx);""")
R("""    try { if (legacy_(ss, R, T, now)) acc++; } catch (e) { console.error('legacy', e); }\n""","")
R("""if (T.fmov.dirty || T.mov.dirty || T.rs.dirty || T.rc.dirty) T.fnd.dirty = true; if (T.fnd.dirty) { T.fmov.dirty = true; T.mov.dirty = true; T.rs.dirty = true; T.rc.dirty = true; } }""","""if (T.fmov.dirty || T.mov.dirty || T.rs.dirty || T.rc.dirty) T.fnd.dirty = true; if (T.fnd.dirty) { T.fmov.dirty = true; T.mov.dirty = true; T.rs.dirty = true; T.rc.dirty = true; } if (T.rh.dirty || T.cob.dirty || T.maq.dirty) T.cli.dirty = true; if (T.cli.dirty || T.maq.dirty) { T.rh.dirty = true; T.cob.dirty = true; T.maq.dirty = true; T.mov.dirty = true; } }""")
# ctx y cálculos
R("""  ['inm', 'veh', 'cab', 'per', 'eq', 'prest', 'maq', 'own', 'fnd'].forEach(function (c) { ctx[c] = {}; R[c].forEach(function (r) { if (r.id && !r.del) ctx[c][r.id] = r; }); });""","""  ['inm', 'veh', 'cab', 'per', 'eq', 'prest', 'maq', 'own', 'fnd', 'cli'].forEach(function (c) { ctx[c] = {}; (R[c] || []).forEach(function (r) { if (r.id && !r.del) ctx[c][r.id] = r; }); });
  ctx.cs = {};
  const cs = function (id) { return ctx.cs[id] = ctx.cs[id] || {fac: 0, cob: 0}; };
  R.rh.forEach(function (r) { if (r.del || !r.cli || r.hf === '' || r.hf == null) return; cs(r.cli).fac += (Number(r.horas) || 0) * tarOf_(r, ctx); });
  R.cob.forEach(function (x) { if (!x.del && x.cli) cs(x.cli).cob += Number(x.valor) || 0; });""")
R("""function findBy_(map, field, text) {""","""function tarOf_(r, ctx) { if (r.tar !== '' && r.tar != null) return Number(r.tar) || 0; const m = ctx.maq[mqOf_(r)]; return m ? Number(m.precio) || 0 : 0; }

function findBy_(map, field, text) {""")
R("""  if (c === 'prest' && k === '_ab') return ctx.ab[r.id] || 0;""","""  if (c === 'rh' && k === '_cli') { const x = ctx.cli[r.cli]; return x ? x.nombre : ''; }
  if (c === 'rh' && k === '_val') return r.hf === '' || r.hf == null ? '' : (Number(r.horas) || 0) * tarOf_(r, ctx);
  if ((c === 'maq' || c === 'cob') && k === '_cli') { const x = ctx.cli[r.cli]; return x ? x.nombre : ''; }
  if (c === 'mov' && k === '_mqm') { const m = ctx.maq[r.mq]; return m ? m.maq : (r.p === 'flota' ? 'General' : ''); }
  if (c === 'cli') { const st = ctx.cs[r.id] || {fac: 0, cob: 0}; if (k === '_fac') return st.fac; if (k === '_cob') return st.cob; if (k === '_saldo') return st.fac - st.cob; }
  if (c === 'prest' && k === '_ab') return ctx.ab[r.id] || 0;""")
R("""  R.abonos.forEach(function (a) { if (!a.del && a.prest) ctx.ab[a.prest] = (ctx.ab[a.prest] || 0) + (Number(a.valor) || 0); });""","""  (R.abonos || []).forEach(function (a) { if (!a.del && a.prest) ctx.ab[a.prest] = (ctx.ab[a.prest] || 0) + (Number(a.valor) || 0); });""")
R("""      if (col[2] === 'calc' && /abonos|saldo|entregado|legalizado|devuelto/i.test(col[0])) r.setNumberFormat('$#,##0');""","""      if (col[2] === 'calc' && /abonos|saldo|entregado|legalizado|devuelto|facturado|cobrado|^valor$/i.test(col[0])) r.setNumberFormat('$#,##0');
      if (col[2] === 'n' && /tarifa/i.test(col[0])) r.setNumberFormat('$#,##0');""")
# informe genérico
i=s.index("function renderReport_(ss, d) {");j=s.index("function section_(")
s=s[:i]+"""function renderReport_(ss, d) {
  let sh = ss.getSheetByName(CFG.REPORT_TAB);
  if (!sh) sh = ss.insertSheet(CFG.REPORT_TAB, 0);
  sh.clear();
  sh.setHiddenGridlines(true);
  const W = Math.max(4, Math.max.apply(null, (d.secs || []).map(function (x) { return x.cols.length; }).concat([2])));
  let r = 2;
  sh.getRange(r, 2, 1, W).merge().setValue(d.title || 'Informe').setFontSize(18).setFontWeight('bold').setFontColor('#ffffff').setBackground(C.ink); r++;
  (d.sub || []).forEach(function (x) { sh.getRange(r, 2, 1, W).merge().setValue(x + ' · Actualizado ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm')).setFontColor(C.mut); r++; });
  r++;
  r = section_(sh, r, W, 'Resumen');
  (d.kpis || []).forEach(function (k) { sh.getRange(r, 2, 1, 2).setValues([[k[0], k[1]]]); sh.getRange(r, 2).setFontColor(C.mut); sh.getRange(r, 3).setFontWeight('bold'); r++; });
  (d.secs || []).forEach(function (sec) {
    r++; r = section_(sh, r, W, sec.h);
    sh.getRange(r, 2, 1, sec.cols.length).setValues([sec.cols]).setFontWeight('bold').setFontColor(C.mut).setBackground(C.light); r++;
    if (sec.rows.length) {
      const data = sec.rows.map(function (x) { const a = x.slice(0, sec.cols.length); while (a.length < sec.cols.length) a.push(''); return a.map(function (v) { return v == null ? '' : v; }); });
      sh.getRange(r, 2, data.length, sec.cols.length).setValues(data);
      (sec.money || []).forEach(function (m, j) { if (m) sh.getRange(r, 2 + j, data.length, 1).setNumberFormat('$#,##0'); });
      r += data.length;
    }
  });
  for (let c = 2; c < 2 + W; c++) sh.setColumnWidth(c, c === 2 ? 220 : 130);
}

"""+s[j:]
open('/home/claude/maquinaria/apps-script/Code.gs','w').write(s)
print('ok',len(s))
