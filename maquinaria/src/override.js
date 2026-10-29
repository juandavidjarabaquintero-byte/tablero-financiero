/* ================= TABLERO DE MAQUINARIA · capa del producto ================= */
MOD.length=0;MOD.push(
 {id:'inicio',name:'Panel de la flota',ic:'home'},
 {id:'retro',name:'Maquinaria',ic:'dig',subs:[{id:'resumen',name:'Liquidación por máquina',sp:'rres'},{id:'horas',name:'Jornadas',sp:'rh'},{id:'salidas',name:'Repuestos y reparaciones',sp:'rs'},{id:'comb',name:'Combustible y aceites',sp:'rc'},{id:'dueno',name:'Vista del dueño',sp:'rdue'}]},
 {id:'clientes',name:'Clientes y cobros',ic:'user'},
 {id:'flota',name:'Gastos de la flota',ic:'tool',subs:[
  {id:'operadores',name:'Operadores y nómina',nat:'costo',cats:['Salario','Prima','Seguridad social','Viáticos','Dotación','Otro']},
  {id:'transporte',name:'Transporte de máquinas',nat:'costo',cats:['Cama baja','Fletes','Peajes','Otro']},
  {id:'legal',name:'Seguros, impuestos y trámites',nat:'gasto',cats:['Póliza','Impuestos','SOAT','Trámites','Otro']},
  {id:'taller',name:'Taller y herramientas',nat:'costo',cats:['Herramienta','Mano de obra','Repuesto general','Lubricantes','Otro'],catNat:{'Herramienta':'inversion'},nats:['costo','inversion']},
  {id:'admin',name:'Administración',nat:'gasto',cats:['Arriendo','Servicios','Papelería','Comunicaciones','Honorarios','Otro']}]},
 {id:'fondos',name:'Fondos y anticipos',ic:'cash'},
 {id:'movs',name:'Revisar movimientos',ic:'list'},
 {id:'informes',name:'Informes',ic:'chart'},
 {id:'ajustes',name:'Ajustes',ic:'gear'});
Object.assign(PNAME,{flota:'Gastos de la flota',retro:'Maquinaria'});
delete ROLES.dueno;Object.assign(ROLES,{admin:'Administrador',aux:'Auxiliar de campo',conta:'Dueño (solo lectura)'});
const cliName=id=>byId('cli',id)?.nombre||'';
const tarOf=(r,P)=>r&&r.tar!=null&&r.tar!==''?+r.tar||0:(+(P||mqById(mqOf(r))).precio||0);
const pagaC=(r,P)=>(r.asume||P.combA||'Dueño')==='Cliente';
const pagaR=r=>r.asume==='Cliente';
function retroCalc(f,t,mid){
 if(mid==null){const parts=mqIds().map(id=>retroCalc(f,t,id));const o={h:parts.flatMap(p=>p.h),parts};['horas','dias','bajo','ing','repD','repC','comb','combD','combC','gas','cos','util'].forEach(k=>o[k]=sum(parts,p=>p[k]));
  o.gas+=sum(L('mov').filter(r=>r.p==='flota'&&!r.mq&&r.nat!=='anticipo'&&inP(r.fecha,f,t)));o.cos=o.repD+o.combD+o.gas;o.util=o.ing-o.cos;o.prom=o.dias?o.horas/o.dias:0;Object.assign(o,{renta:o.ing,neto:o.util,costoMina:o.cos,salM:o.repD,cargoMina:o.cos});return o}
 const P=mqById(mid);const h=LM('rh',mid).filter(r=>inP(r.fecha,f,t));
 const horas=sum(h,r=>r.horas);const dias=h.filter(r=>r.horas>0).length;const bajo=h.filter(r=>r.horas>0&&r.horas<P.min).length;
 const ing=sum(h,r=>(+r.horas||0)*tarOf(r,P));
 const sal=LM('rs',mid).filter(r=>inP(r.fecha,f,t));const repD=sum(sal.filter(r=>!pagaR(r))),repC=sum(sal.filter(pagaR));
 const cb=LM('rc',mid).filter(r=>inP(r.fecha,f,t));const combC=sum(cb.filter(r=>pagaC(r,P))),combD=sum(cb)-combC;
 const gas=sum(L('mov').filter(r=>r.p==='flota'&&r.mq===mid&&r.nat!=='anticipo'&&inP(r.fecha,f,t)));
 const cos=repD+combD+gas,util=ing-cos;
 return {h,horas,dias,prom:dias?horas/dias:0,bajo,ing,repD,repC,comb:combD+combC,combD,combC,gas,cos,util,renta:ing,neto:util,costoMina:cos,salM:repD,cargoMina:cos,P,mid};
}
function retroKpis(R,owner,c){const P=R.P||curMq();
 return `<div class="grid k4">${kpi('Horas trabajadas',fg(R.horas)+' h',`${R.dias} día${R.dias===1?'':'s'} · ${fg(R.prom)} h/día`,'c-cy')}${kpi('Facturado',fmt(R.ing),R.horas?fmt(R.ing/R.horas)+' por hora en promedio':'Sin horas en el periodo','c-te')}${kpi('Costos del dueño',fmt(R.cos),'Repuestos, combustible y gastos','c-wa')}${kpi('Utilidad',fmt(R.util),R.ing?Math.round(R.util/R.ing*100)+'% de margen':'—','c-go',R.util<0?'neg':'gold')}</div>
 <div class="grid k4">${kpi('Días bajo mínimo',R.bajo,`Mínimo ${fg(P.min)} h por día`,R.bajo?'c-ba':'c-te',R.bajo?'neg':'')}${kpi('Repuestos y reparaciones',fmt(R.repD),R.repC?'El cliente pagó '+fmt(R.repC):'A cargo del dueño','c-wa')}${kpi('Combustible y aceites',fmt(R.combD),R.combC?'El cliente pagó '+fmt(R.combC):'A cargo del dueño','c-vi')}${kpi('Gastos de la flota',fmt(R.gas),'Operador, transporte y otros','c-ba')}</div>`}
function mqSel(owner){
 const l=mqList();
 if(!l.length)return `<div class="card"><div class="empty">Aún no hay máquinas registradas.${canEdit()?`<div class="bar" style="justify-content:center;margin-top:12px"><button class="btn pri" data-act="newMaq">${ic('plus')}Agregar la primera máquina</button></div>`:''}</div></div>`;
 const cur=curMq();
 const chips=`<div class="chips mqtabs" role="tablist">${l.map(m=>`<button role="tab" aria-selected="${m.id===cur.id}" class="chip ${m.id===cur.id?'on':''}" data-act="mqSel" data-id="${m.id}">${esc(m.maq)}${m.inactivo?' · inactiva':''}</button>`).join('')}</div>`;
 return `<div class="card"><div class="split">${chips}${owner?'':`<div class="bar"><button class="btn sm gh edit-only" data-act="newMaq">${ic('plus')}Nueva máquina</button><button class="btn sm gh edit-only" data-act="edit" data-c="maq" data-id="${cur.id}">${ic('edit')}Editar</button></div>`}</div>
 <div class="bar" style="margin-top:14px;flex-wrap:nowrap"><button class="avatar" data-act="mqFoto" data-id="${cur.id}" aria-label="Foto de ${esc(cur.maq)}">${mqImg(cur)}</button><div style="min-width:0;flex:1"><b>${esc(cur.maq)}</b><div class="mut" style="font-size:12.5px">${esc(mqSub(cur))}</div><div class="mut" style="font-size:12.5px">${fmt(cur.precio)} por hora · mínimo ${fg(cur.min)} h/día · combustible: ${esc(cur.combA||'Dueño')}</div></div></div></div>`;
}
function cliBreak(R){
 const g={};R.h.filter(r=>!enCurso(r)).forEach(r=>{const k=(r.cli||'')+'|'+tarOf(r,R.P);const o=g[k]=g[k]||{cli:r.cli||'',tar:tarOf(r,R.P),h:0};o.h+=+r.horas||0});
 const rows=Object.values(g).sort((a,b)=>b.h*b.tar-a.h*a.tar);if(!rows.length)return '';
 return `<div class="card"><h3>Facturación por cliente</h3><div class="tw"><table class="t"><thead><tr><th>Cliente u obra</th><th class="n">Horas</th><th class="n">Tarifa</th><th class="n">Valor</th></tr></thead><tbody>${rows.map(o=>`<tr class="rw"><td>${esc(cliName(o.cli)||'Sin cliente')}</td><td class="n">${fg(o.h)}</td><td class="n">${fmt(o.tar)}</td><td class="n">${fmt(o.h*o.tar)}</td></tr>`).join('')}</tbody><tfoot><tr><td>Total</td><td class="n">${fg(sum(rows,o=>o.h))}</td><td></td><td class="n">${fmt(sum(rows,o=>o.h*o.tar))}</td></tr></tfoot></table></div></div>`;
}
SPV.rres=()=>{
 if(!mqList().length)return mqSel(false);
 const P=curMq();const mid=P.id;const c=selCut(mid);const R=retroCalc(c.f,c.t,mid);
 return `${mqSel(false)}<div class="card"><div class="split"><div><h3 style="margin:0 0 4px">${esc(P.maq)}</h3><div class="mut" style="font-size:13px">${cutName(c)} · ${cutRange(c)}</div></div>
 <div class="bar"><button class="btn sm gh" data-act="dlRep" data-k="mq" data-id="${mid}">${ic('dl')}Descargar informe</button><button class="btn sm gh" data-act="go" data-m="retro" data-s="dueno">${ic('eye')}Vista del dueño</button><button class="btn sm pri edit-only" data-act="retroCorte">Cerrar corte</button></div></div></div>
 ${selBanner(c)}${retroKpis(R,false,c)}
 <h3 class="sech">Rendimiento diario</h3><div class="card">${hoursChart(R.h,P)}</div>
 ${cliBreak(R)}${cortesCard(P,false)}${registros(c.f,c.t,false)}`;
};
SPV.rdue=()=>{
 if(!mqList().length)return mqSel(true);
 const P=curMq();const mid=P.id;const c=selCut(mid);const R=retroCalc(c.f,c.t,mid);
 return `${mqSel(true)}<div class="card mqhc" style="background:linear-gradient(120deg,#1a2a7a,#16205e 60%,#1b1a63)">${P.foto?`<button class="hero mqh" data-act="mqFoto" data-id="${P.id}" aria-label="Ver foto de ${esc(P.maq)}">${mqImg(P)}</button>`:''}<div class="split"><div><div class="mut" style="font:600 11px var(--f-disp);letter-spacing:.14em;text-transform:uppercase">Seguimiento de la máquina</div><div style="font:700 24px var(--f-disp);letter-spacing:.03em">${esc(P.maq)}</div><div class="mut">${esc(mqSub(P))} · ${cutName(c)}: ${cutRange(c).toLowerCase()}</div></div><div style="text-align:right"><div class="mut" style="font:600 11px var(--f-disp);letter-spacing:.14em;text-transform:uppercase">Utilidad</div><div class="${R.util<0?'neg':'gold'}" style="font:700 30px var(--f-disp)">${fmt(R.util)}</div><div class="mut" style="font-size:13px">Facturado ${fmt(R.ing)} · costos ${fmt(R.cos)}</div></div></div><div class="bar" style="margin-top:14px"><button class="btn sm" data-act="dlRep" data-k="mq" data-id="${mid}">${ic('dl')}Descargar informe</button></div></div>
 ${selBanner(c)}${retroKpis(R,true,c)}
 <h3 class="sech">Rendimiento diario</h3><div class="card">${hoursChart(R.h,P)}</div>
 ${cliBreak(R)}${cortesCard(P,true)}${registros(c.f,c.t,true)}`;
};
['rh','rs','rc'].forEach(k=>{const o=SPV[k];SPV[k]=()=>mqList().length?o():mqSel(false)});
ACT.retroCorte=()=>{const P=curMq();const cc=curCut(P.id);
 openForm({title:'Cerrar corte · '+P.maq,preview:true,top:'<div class="note">El corte cierra el periodo de la máquina. Lo registrado hasta esa fecha queda en el historial de cortes.</div>',fields:[{k:'fecha',l:'Fecha de corte',t:'date',v:today(),req:1},{k:'obs',l:'Observaciones',t:'area',w:1,ph:'Ej. facturado al cliente'}],
 onInput:v=>{const R=retroCalc(cc.f,v.fecha||today(),P.id);$('#prev').innerHTML=`<div class="kv"><span>Horas</span><span>${fg(R.horas)}</span><span>Facturado</span><span>${fmt(R.ing)}</span><span>Costos del dueño</span><span>${fmt(-R.cos)}</span><span><b>Utilidad</b></span><span class="gold"><b>${fmt(R.util)}</b></span></div>`},
 save:v=>{v.mq=P.id;upsert('rcort',v);return 'Corte cerrado'}});
};
function formMaq(rec={}){const nw=!rec.id;const cl=L('cli').slice().sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre)));
 const f=[{k:'maq',l:'Nombre o modelo',v:rec.maq,req:1,ph:'Ej. CATERPILLAR 320 · R-07'},{k:'tipo',l:'Tipo',t:'select',opts:MQTIPOS,v:rec.tipo||'Retroexcavadora'},{k:'serie',l:'Placa, serie o código interno',v:rec.serie},
  {k:'cli',l:'Cliente u obra actual',t:'select',opts:[['','— Sin cliente (disponible) —'],...cl.map(c=>[c.id,c.nombre]),['__new','+ Nuevo cliente']],v:rec.cli||'',w:1},{k:'cliN',l:'Nombre del nuevo cliente u obra',when:v=>v.cli==='__new'},
  {k:'precio',l:'Tarifa por hora',t:'money',v:rec.precio||'',req:1,hint:'Tarifa con el cliente actual. Cada jornada guarda su propia tarifa.'},{k:'min',l:'Horas mínimas por día',t:'dec',v:rec.min??8},{k:'alerta',l:'% alerta amarilla',t:'dec',v:rec.alerta??80},
  {k:'combA',l:'El combustible lo paga',t:'select',opts:['Dueño','Cliente'],v:rec.combA||'Dueño'},{k:'repA',l:'Repuestos y reparaciones los paga',t:'select',opts:['Dueño','Cliente'],v:rec.repA||'Dueño',hint:'Es el valor por defecto; se puede cambiar en cada registro.'},
  {k:'operador',l:'Operador habitual',v:rec.operador},{k:'inactivo',l:'Estado',t:'select',opts:[['','Activa'],['1','Inactiva (vendida o fuera de servicio)']],v:rec.inactivo?'1':''},{k:'foto',l:'Foto de la máquina',t:'photo',img:1,w:1}];
 openForm({title:nw?'Nueva máquina':'Editar máquina',rec,fields:f,save:v=>{
  if(v.cli==='__new'){const n=String(v.cliN||'').trim();if(!n){toast('Escribe el nombre del cliente');return false}const ex=L('cli').find(c=>c.nombre.trim().toLowerCase()===n.toLowerCase());v.cli=ex?ex.id:upsert('cli',{nombre:n}).id}
  delete v.cliN;v.inactivo=v.inactivo==='1';const r=upsert('maq',Object.assign({id:rec.id},v));V.mq=r.id;return nw?'Máquina agregada':'Máquina guardada'}});
}
/* ---- clientes y cobros ---- */
function cliStats(id,f,t){const h=L('rh').filter(r=>(r.cli||'')===id&&!enCurso(r)&&inP(r.fecha,f,t));const fac=sum(h,r=>(+r.horas||0)*tarOf(r));const cob=sum(L('cob').filter(x=>(x.cli||'')===id&&inP(x.fecha,f,t)));return {h,horas:sum(h,r=>r.horas),fac,cob,saldo:fac-cob,last:L('cob').filter(x=>x.cli===id).map(x=>x.fecha).sort().pop()||''}}
function vClientes(){
 const cs=L('cli').slice().sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre)));const st=cs.map(c=>({c,s:cliStats(c.id)}));const sin=cliStats('');
 const mes=thisMonth();const facM=sum(L('rh').filter(r=>r.fecha.startsWith(mes)&&!enCurso(r)),r=>(+r.horas||0)*tarOf(r));const cobM=sum(L('cob').filter(x=>x.fecha.startsWith(mes)));
 return `<div class="grid k4">${kpi('Por cobrar',fmt(sum(st,x=>Math.max(0,x.s.saldo))),'Facturado menos pagos recibidos','c-wa','gold')}${kpi('Facturado este mes',fmt(facM),'Horas × tarifa','c-te')}${kpi('Cobrado este mes',fmt(cobM),'Pagos recibidos','c-cy')}${kpi('Clientes',String(cs.length),`${mqList().filter(m=>m.cli).length} máquinas asignadas`,'c-vi')}</div>
 <div class="card">${tbar(`<button class="btn pri edit-only" data-act="newCli">${ic('plus')}Nuevo cliente</button><button class="btn gh edit-only" data-act="newCob">${ic('cash')}Registrar pago recibido</button>`,false)}<div style="height:10px"></div>
 ${cs.length?`<div class="tw"><table class="t cards"><thead><tr><th>Cliente u obra</th><th>Máquinas</th><th class="n">Horas</th><th class="n">Facturado</th><th class="n">Cobrado</th><th class="n">Saldo</th><th></th></tr></thead><tbody>${st.filter(x=>!V.q||x.c.nombre.toLowerCase().includes(V.q.toLowerCase())).map(({c,s})=>`<tr class="rw"><td class="p">${esc(c.nombre)}${c.nit?`<div class="mut" style="font-size:12px">${esc(c.nit)}</div>`:''}</td><td data-l="Máquinas">${esc(mqList().filter(m=>m.cli===c.id).map(m=>m.maq).join(', ')||'—')}</td><td class="n" data-l="Horas">${fg(s.horas)}</td><td class="n" data-l="Facturado">${fmt(s.fac)}</td><td class="n" data-l="Cobrado">${fmt(s.cob)}</td><td class="n ${s.saldo>0?'gold':s.saldo<0?'pos':''}" data-l="Saldo">${fmt(s.saldo)}</td><td class="acts"><button class="ib" data-act="cliVer" data-id="${c.id}" title="Estado de cuenta">${ic('list')}</button><button class="ib edit-only" data-act="newCob" data-id="${c.id}" title="Registrar pago">${ic('cash')}</button><button class="ib edit-only" data-act="edit" data-c="cli" data-id="${c.id}" title="Editar">${ic('edit')}</button><button class="ib dan del-only" data-act="del" data-c="cli" data-id="${c.id}" title="Eliminar">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Sin clientes. Crea uno o asígnalo al editar una máquina.</div>'}
 ${sin.horas?`<p class="note" style="margin:12px 0 0">${fg(sin.horas)} horas (${fmt(sin.fac)}) están registradas sin cliente. Asígnalo al editar cada jornada.</p>`:''}</div>`;
}
function formCli(rec={}){openForm({title:rec.id?'Editar cliente':'Nuevo cliente u obra',rec,fields:[{k:'nombre',l:'Nombre del cliente u obra',v:rec.nombre,req:1,w:1},{k:'nit',l:'NIT o cédula',v:rec.nit},{k:'tel',l:'Celular',t:'tel',v:rec.tel},{k:'contacto',l:'Persona de contacto',v:rec.contacto},{k:'nota',l:'Nota',v:rec.nota}],save:v=>{upsert('cli',Object.assign({id:rec.id},v));return 'Cliente guardado'}})}
function formCob(cliId,rec={}){const cs=L('cli');if(!cs.length){toast('Primero crea un cliente');return}
 openForm({title:rec.id?'Editar pago':'Pago recibido de cliente',rec,preview:true,fields:[{k:'cli',l:'Cliente',t:'select',opts:cs.map(c=>[c.id,c.nombre]),v:rec.cli||cliId||cs[0].id,req:1,w:1},{k:'fecha',l:'Fecha',t:'date',v:rec.fecha||today(),req:1},{k:'valor',l:'Valor recibido',t:'money',v:rec.valor??'',req:1},{k:'pago',l:'Forma de pago',t:'select',opts:PAGOS,v:rec.pago||'Transferencia'},{k:'nota',l:'Nota',v:rec.nota,w:1,ph:'Ej. factura 0123'},{k:'foto',l:'Soporte',t:'photo',w:1}],
 onInput:v=>{const s=cliStats(v.cli);$('#prev').innerHTML=`<div class="kv"><span>Saldo actual</span><span>${fmt(s.saldo+(rec.valor||0))}</span><span>Nuevo saldo</span><span class="gold">${fmt(s.saldo+(rec.valor||0)-(v.valor||0))}</span></div>`},
 save:v=>{if(!(v.valor>0)){toast('El valor debe ser mayor que cero');return false}upsert('cob',Object.assign({id:rec.id},v));return 'Pago registrado'}});
}
function cliFilas(id){const rows=[...L('rh').filter(r=>(r.cli||'')===id&&!enCurso(r)).map(r=>({fecha:r.fecha,txt:mqById(mqOf(r)).maq+' · '+fg(r.horas)+' h × '+fmt(tarOf(r)),det:r.obs||'',in:(+r.horas||0)*tarOf(r),out:0,c:'rh',id:r.id,r})),...L('cob').filter(x=>x.cli===id).map(x=>({fecha:x.fecha,txt:'Pago recibido'+(x.pago?' · '+x.pago:''),det:x.nota||'',in:0,out:x.valor,c:'cob',id:x.id,r:x}))].sort((a,b)=>a.fecha.localeCompare(b.fecha)||(b.in-a.in));let s=0;rows.forEach(r=>{s+=r.in-r.out;r.saldo=s});return rows}
function cliVer(id){const c=byId('cli',id);if(!c)return;const s=cliStats(id);const rows=cliFilas(id);
 $('#sheet').classList.add('wide');
 $('#sheet').innerHTML=`<div class="sh"><h2>${esc(c.nombre)} · estado de cuenta</h2><button class="ib" data-act="close" aria-label="Cerrar">${ic('x')}</button></div><div class="sbd">
 <div class="hstat"><div><small>Horas</small><b>${fg(s.horas)}</b></div><div><small>Facturado</small><b>${fmt(s.fac)}</b></div><div><small>Cobrado</small><b>${fmt(s.cob)}</b></div><div><small>Saldo</small><b class="${s.saldo>0?'gold':'pos'}">${fmt(s.saldo)}</b></div></div>
 <div class="tw" style="margin-top:14px"><table class="t cards"><thead><tr><th>Fecha</th><th>Detalle</th><th class="n">Cargo</th><th class="n">Pago</th><th class="n">Saldo</th><th></th></tr></thead><tbody>${rows.slice().reverse().map(r=>`<tr class="rw"><td class="num" data-l="Fecha">${fd(r.fecha)}</td><td class="p">${esc(r.txt)}${r.det?`<div class="mut" style="font-size:12px">${esc(r.det)}</div>`:''}</td><td class="n" data-l="Cargo">${r.in?fmt(r.in):''}</td><td class="n" data-l="Pago">${r.out?fmt(-r.out):''}</td><td class="n" data-l="Saldo">${fmt(r.saldo)}</td><td class="acts">${r.c==='cob'?photoBtn(r.r)+`<button class="ib edit-only" data-act="cobEdit" data-id="${r.id}" title="Editar">${ic('edit')}</button><button class="ib dan del-only" data-act="del" data-c="cob" data-id="${r.id}" title="Eliminar">${ic('trash')}</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Sin movimientos.</div></td></tr>'}</tbody></table></div></div>
 <div class="sft" style="flex-wrap:wrap"><button class="btn gh" data-act="dlRep" data-k="cli" data-id="${id}">${ic('dl')}Descargar</button>${canEdit()?`<button class="btn pri" data-act="newCob" data-id="${id}">${ic('cash')}Registrar pago</button>`:''}</div>`;
 $('#modal').hidden=false;
}
function cliDoc(id){const c=byId('cli',id);const s=cliStats(id);const rows=cliFilas(id);
 return {title:'Estado de cuenta · '+c.nombre,sub:[[c.nit,c.contacto].filter(Boolean).join(' · ')||'Cliente','Generado el '+fd(today())],kpis:[['Horas',fg(s.horas)],['Facturado',fmt(s.fac)],['Cobrado',fmt(s.cob)],['Saldo por cobrar',fmt(s.saldo)]],notes:[],
  secs:[{h:'Movimientos',cols:[{l:'Fecha',t:'date'},{l:'Detalle',t:'text'},{l:'Nota',t:'text'},{l:'Cargo',t:'money'},{l:'Pago',t:'money'},{l:'Saldo',t:'money'}],rows:rows.map(r=>[r.fecha,r.txt,r.det,r.in||'',r.out||'',r.saldo]),foot:['Total','','',s.fac,s.cob,s.saldo]}],file:`estado-de-cuenta-${slug(c.nombre)}-${today()}`};
}
/* ---- panel de la flota ---- */
function mqEstado(m){const op=LM('rh',m.id).filter(enCurso)[0];if(op)return {t:'curso',l:'Trabajando · jornada en curso'};const last=LM('rh',m.id).map(r=>r.fecha).sort().pop();if(!last)return {t:'sin',l:'Sin jornadas registradas'};const d=dDiff(last,today());if(d<=1)return {t:'ok',l:d?'Reportó ayer':'Reportó hoy'};return {t:d>3?'bajo':'cerca',l:`Sin reporte hace ${d} días`}}
const PRK=[['mes','Este mes'],['mesant','Mes anterior'],['ano','Este año'],['todo','Todo']];
function pRange(k){if(k==='todo')return ['',''];return rangoDe(k)}
function vInicio(){
 const k=V.f.pk||'mes';const [f,t]=pRange(k);const A=retroCalc(f,t);const ms=mqList();const al=alerts();const T=fTotals();
 const cxc=sum(L('cli'),c=>Math.max(0,cliStats(c.id).saldo));
 const per=ms.map(m=>({m,R:retroCalc(f,t,m.id),e:mqEstado(m)}));const mx=Math.max(1,...per.map(x=>Math.abs(x.R.util)));
 if(!ms.length)return `<div class="card" style="border-color:var(--cyan)"><h3>Bienvenido al Tablero de Maquinaria</h3><p style="margin:0 0 12px">Empieza registrando tus máquinas con su tarifa por hora y su cliente actual. Luego tus auxiliares registran jornadas, repuestos y combustible desde el celular, aun sin señal.</p><div class="bar">${canEdit()?`<button class="btn pri" data-act="newMaq">${ic('plus')}Agregar máquina</button><button class="btn" data-act="newCli">${ic('user')}Agregar cliente</button>`:''}<button class="btn gh" data-act="go" data-m="ajustes">${ic('gear')}Conectar con el Drive</button></div></div>`;
 return `<div class="card" style="padding:12px 14px"><div class="chips">${PRK.map(([kk,l])=>`<button class="chip ${k===kk?'on':''}" data-act="pk" data-v="${kk}">${l}</button>`).join('')}</div></div>
 <div class="grid supg">
  <div class="card kpi kh" style="--c:#24d6a5"><div class="l">Utilidad de la flota</div><div class="v ${A.util<0?'neg':'pos'}">${fmt(A.util)}</div><div class="s">Facturado ${fmt(A.ing)} − costos ${fmt(A.cos)}${A.ing?' · margen '+Math.round(A.util/A.ing*100)+'%':''}</div></div>
  ${kpi('Horas trabajadas',fg(A.horas)+' h',`${ms.filter(m=>!m.inactivo).length} máquinas activas`,'c-cy')}${kpi('Facturado',fmt(A.ing),'Horas × tarifa','c-te')}
  ${kpi('Costos del dueño',fmt(A.cos),`Repuestos ${fmtK(A.repD)} · combustible ${fmtK(A.combD)} · gastos ${fmtK(A.gas)}`,'c-wa')}${kpi('Por cobrar a clientes',fmt(cxc),'Saldo de todos los clientes','c-go','gold')}
  ${kpi('Fondos por legalizar',fmt(T.leg),T.prov?'Anticipos en proveedores '+fmt(T.prov):'En poder de los compradores','c-vi')}${kpi('Máquinas trabajando',String(per.filter(x=>x.e.t==='curso'||x.e.t==='ok').length)+' de '+ms.filter(m=>!m.inactivo).length,'Con reporte hoy, ayer o en curso','c-cy')}
 </div>
 <div class="grid two"><div class="card"><h3>Utilidad por máquina<span class="r mut">${PRK.find(x=>x[0]===k)[1]}</span></h3><div class="ubars">${per.slice().sort((a,b)=>b.R.util-a.R.util).map(x=>`<button class="ub" data-act="mqGo" data-id="${x.m.id}"><span class="n">${esc(x.m.maq)}</span><span class="b"><i style="width:${Math.abs(x.R.util)/mx*100}%;background:${x.R.util<0?'#ff4f73':'linear-gradient(90deg,#2ee6f0,#24d6a5)'}"></i></span><span class="v ${x.R.util<0?'neg':''}">${fmtK(x.R.util)}</span></button>`).join('')}</div></div>
 <div class="card"><h3>Alertas</h3>${al.length?al.slice(0,12).map(([c,tx])=>`<div class="al ${c}"><i></i><div>${esc(tx)}</div></div>`).join(''):'<div class="al ok"><i></i><div>Todo en orden.</div></div>'}</div></div>
 <h3 class="sech">La flota</h3><div class="grid mqgrid">${per.map(({m,R,e})=>`<button class="card mqc${m.inactivo?' off':''}" data-act="mqGo" data-id="${m.id}"><div class="bar" style="flex-wrap:nowrap"><span class="avatar">${mqImg(m)}</span><div style="min-width:0;flex:1;text-align:left"><b>${esc(m.maq)}</b><div class="mut" style="font-size:12px">${esc([m.tipo,m.cli?cliName(m.cli):'Disponible'].join(' · '))}</div><div style="font-size:12px;color:${JC[e.t]}">● ${esc(m.inactivo?'Inactiva':e.l)}</div></div></div><div class="mqk"><span><small>Horas</small><b>${fg(R.horas)}</b></span><span><small>Facturado</small><b>${fmtK(R.ing)}</b></span><span><small>Utilidad</small><b class="${R.util<0?'neg':'pos'}">${fmtK(R.util)}</b></span></div></button>`).join('')}</div>`;
}
function alerts(){
 const a=[];if(srvOld()&&['admin','aux'].includes(S.cfg.tokRole))a.push(['ba','El servicio de Drive está desactualizado: avisa al administrador para actualizarlo.']);
 mqList().filter(m=>!m.inactivo).forEach(m=>{const e=mqEstado(m);const op=LM('rh',m.id).filter(enCurso)[0];if(op&&op.fecha<addDays(today(),-1))a.push(['',`${m.maq}: la jornada del ${fd(op.fecha)} sigue en curso. Ciérrala con el horómetro final.`]);else if(e.t==='bajo')a.push(['',`${m.maq}: ${e.l.toLowerCase()}.`]);
  const {f}=retroPeriodo(m.id);const R=retroCalc(f,'',m.id);if(R.bajo)a.push(['',`${m.maq}: ${R.bajo} días por debajo de ${fg(m.min)} horas en el periodo actual.`]);if(R.util<0&&R.ing)a.push(['ba',`${m.maq}: está dando pérdida en el periodo actual (${fmt(R.util)}).`])});
 L('cli').forEach(c=>{const s=cliStats(c.id);if(s.saldo>0&&(!s.last||dDiff(s.last,today())>30))a.push(['',`${c.nombre}: debe ${fmt(s.saldo)}${s.last?' · último pago el '+fd(s.last):' · sin pagos registrados'}.`])});
 a.push(...fAlerts());
 if(S.outbox.length)a.push(['',`${S.outbox.length} cambios guardados en este equipo esperan sincronizar con el Drive.`]);
 return a;
}
/* ---- informes ---- */
function fleetRows(f,t){return mqList().map(m=>{const R=retroCalc(f,t,m.id);return [m.maq,m.cli?cliName(m.cli):'',R.horas,R.ing,R.repD,R.combD,R.gas,R.util]})}
function genDoc(){
 const [f,t]=rangeNow();const A=retroCalc(f,t);const fr=fleetRows(f,t);
 const cl=L('cli').map(c=>{const s=cliStats(c.id,f,t);return [c.nombre,s.horas,s.fac,s.cob,cliStats(c.id).saldo]}).filter(r=>r[1]||r[3]||r[4]);
 const g={};L('mov').filter(r=>r.p==='flota'&&r.nat!=='anticipo'&&inP(r.fecha,f,t)).forEach(r=>{const k=(subOf('flota',r.s)?.name||r.s)+'|'+(r.cat||'');g[k]=(g[k]||0)+(+r.valor||0)});
 const secs=[{h:'Resultado por máquina',cols:[{l:'Máquina',t:'text'},{l:'Cliente',t:'text'},{l:'Horas',t:'num'},{l:'Facturado',t:'money'},{l:'Repuestos',t:'money'},{l:'Combustible',t:'money'},{l:'Gastos',t:'money'},{l:'Utilidad',t:'money'}],rows:fr,foot:['Total','',A.horas,A.ing,A.repD,A.combD,sum(fr,r=>r[6]),sum(fr,r=>r[7])]}];
 if(cl.length)secs.push({h:'Clientes',cols:[{l:'Cliente',t:'text'},{l:'Horas',t:'num'},{l:'Facturado',t:'money'},{l:'Cobrado',t:'money'},{l:'Saldo total',t:'money'}],rows:cl});
 const gr=Object.entries(g).map(([k,v])=>[...k.split('|'),v]).sort((a,b)=>b[2]-a[2]);if(gr.length)secs.push({h:'Gastos de la flota',cols:[{l:'Rubro',t:'text'},{l:'Categoría',t:'text'},{l:'Valor',t:'money'}],rows:gr,foot:['Total','',sum(gr,r=>r[2])]});
 const fs=fndSec();if(fs)secs.push(fs);
 return {title:'Informe de la flota',sub:[`Del ${f?fd(f):'inicio'} al ${fd(t||today())} · Generado el ${fd(today())}`],kpis:[['Horas trabajadas',fg(A.horas)+' h'],['Facturado',fmt(A.ing)],['Costos del dueño',fmt(A.cos)],['Utilidad',fmt(A.util)],['Por cobrar',fmt(sum(L('cli'),c=>Math.max(0,cliStats(c.id).saldo)))],['Fondos por legalizar',fmt(fTotals().leg)]],notes:alerts().map(x=>x[1]).slice(0,10),secs,file:`informe-flota-${f||'inicio'}-a-${t||today()}`};
}
function buildReport(){const D=genDoc();return {title:D.title,sub:D.sub,kpis:D.kpis,secs:D.secs.map(s=>({h:s.h,cols:s.cols.map(c=>c.l),rows:s.rows.map(r=>r.map((v,i)=>s.cols[i].t==='date'&&v?fd(v):v)),money:s.cols.map(c=>c.t==='money')}))}}
function vInformes(){
 const [f,t]=rangeNow();const A=retroCalc(f,t);const fr=fleetRows(f,t);const rk=V.f.rk||'ano';
 return `<div class="card"><div class="split"><div class="chips">${RANGOS.map(([k,l])=>`<button class="chip ${rk===k&&!V.f.custom?'on':''}" data-act="rango" data-v="${k}">${l}</button>`).join('')}</div>
 <div class="bar"><div class="fld"><label for="rf">Desde</label><input type="date" id="rf" value="${f}" data-act-change="rf"></div><div class="fld"><label for="rt">Hasta</label><input type="date" id="rt" value="${t}" data-act-change="rt"></div></div></div>
 <div class="bar" style="margin-top:12px"><button class="btn pri" data-act="dlRep" data-k="gen">${ic('dl')}Descargar o guardar en el Drive</button><button class="btn" data-act="copyRep">${ic('copy')}Copiar resumen</button></div></div>
 <div class="grid k4">${kpi('Horas trabajadas',fg(A.horas)+' h',mqList().length+' máquinas','c-cy')}${kpi('Facturado',fmt(A.ing),'Horas × tarifa','c-te')}${kpi('Costos del dueño',fmt(A.cos),'Repuestos, combustible y gastos','c-wa')}${kpi('Utilidad',fmt(A.util),A.ing?Math.round(A.util/A.ing*100)+'% de margen':'—','c-go',A.util<0?'neg':'gold')}</div>
 <div class="card"><h3>Resultado por máquina</h3><div class="tw"><table class="t cards"><thead><tr><th>Máquina</th><th>Cliente</th><th class="n">Horas</th><th class="n">Facturado</th><th class="n">Repuestos</th><th class="n">Combustible</th><th class="n">Gastos</th><th class="n">Utilidad</th></tr></thead><tbody>${fr.sort((a,b)=>b[7]-a[7]).map(r=>`<tr class="rw"><td class="p">${esc(r[0])}</td><td data-l="Cliente">${esc(r[1]||'—')}</td><td class="n" data-l="Horas">${fg(r[2])}</td><td class="n" data-l="Facturado">${fmt(r[3])}</td><td class="n" data-l="Repuestos">${fmt(r[4])}</td><td class="n" data-l="Combustible">${fmt(r[5])}</td><td class="n" data-l="Gastos">${fmt(r[6])}</td><td class="n ${r[7]<0?'neg':'pos'}" data-l="Utilidad">${fmt(r[7])}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="2">Total flota${A.gas>sum(fr,r=>r[6])?' (incluye gastos generales '+fmt(A.gas-sum(fr,r=>r[6]))+')':''}</td><td class="n">${fg(A.horas)}</td><td class="n">${fmt(A.ing)}</td><td class="n">${fmt(A.repD)}</td><td class="n">${fmt(A.combD)}</td><td class="n">${fmt(A.gas)}</td><td class="n">${fmt(A.util)}</td></tr></tfoot></table></div></div>`;
}
function reportText(){const D=genDoc();return D.title+'\n'+D.sub.join('\n')+'\n\n'+D.kpis.map(([l,v])=>l+': '+v).join('\n')+'\n\n'+D.secs[0].rows.map(r=>`${r[0]}: ${fg(r[2])} h · facturado ${fmt(r[3])} · utilidad ${fmt(r[7])}`).join('\n')}
DLF.push(['drive','Guardar en el Drive','PDF en la carpeta Informes del Drive conectado']);
async function dlGo(k){
 const c=DLCTX;if(!c)return;const pv=$('#dlPer')?.value||'per';const all=pv==='all';
 const D=c.kind==='mq'?mqDoc(c.mid,pv):c.kind==='fnd'?fndDoc(c.id):c.kind==='cli'?cliDoc(c.id):genDoc();if(c.kind==='mq'&&all)D.file+='-historial';
 if(k==='drive'){if(!S.cfg.url||!S.cfg.token){toast('Conecta el Drive en Ajustes');return}if(!navigator.onLine){toast('Sin señal: descarga el PDF y guárdalo luego');return}
  try{toast('Guardando en el Drive…');const blob=await rPdf(D);const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(blob)});const j=await api('file',{data,name:D.file+'.pdf',folder:'Informes'});toast('Informe guardado en el Drive (carpeta Informes)');if(j.url)window.__LASTREP=j.url}catch(e){toast('No se pudo guardar: '+e.message)}return}
 try{toast('Preparando '+DLF.find(x=>x[0]===k)[1]+'…');const blob=k==='pdf'?await rPdf(D):k==='xlsx'?await rXlsx(D):k==='docx'?rDocx(D):k==='csv'?rCsv(D):rHtml(D);dl(blob,`${D.file}.${k}`)}
 catch(e){toast(/cargar/.test(e.message)?'Se necesita internet la primera vez para generar '+(k==='pdf'?'PDF':'Excel'):'No se pudo generar el archivo: '+e.message)}
}
function mqDoc(mid,pv){
 const all=pv==='all';const P=mqById(mid);const cut=pv&&pv!=='per'&&!all?cutsOf(mid).find(c=>c.id===pv):null;const cc=cut||curCut(mid);
 const desde=all?'':cc.f,hasta=all?'':cc.t;const R=retroCalc(desde,hasta,mid);
 const per=all?'Todo el historial':cut?cutName(cut)+' · '+cutRange(cut).toLowerCase():'Periodo en curso · '+cutRange(cc).toLowerCase();
 const h=R.h.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
 const secs=[{h:'Jornadas',cols:[{l:'Fecha',t:'date'},{l:'Cliente',t:'text'},{l:'Inicio',t:'num'},{l:'Final',t:'num'},{l:'Horas',t:'num'},{l:'Tarifa',t:'money'},{l:'Valor',t:'money'},{l:'Novedad',t:'text'}],rows:h.map(r=>[r.fecha,cliName(r.cli),r.hi,enCurso(r)?'En curso':r.hf,enCurso(r)?'':r.horas,tarOf(r,P),enCurso(r)?'':r.horas*tarOf(r,P),r.obs||'']),foot:['Total','','','',R.horas,'',R.ing,'']}];
 const sal=LM('rs',mid).filter(r=>inP(r.fecha,desde,hasta)).sort((a,b)=>a.fecha.localeCompare(b.fecha));
 secs.push({h:'Repuestos y reparaciones',cols:[{l:'Fecha',t:'date'},{l:'Tipo',t:'text'},{l:'Concepto',t:'text'},{l:'Lo pagó',t:'text'},{l:'Valor',t:'money'}],rows:sal.map(r=>[r.fecha,r.tipo||'',r.concepto||'',r.asume||'Dueño',r.valor]),foot:['Total','','','',sum(sal)]});
 const cb=LM('rc',mid).filter(r=>inP(r.fecha,desde,hasta)).sort((a,b)=>a.fecha.localeCompare(b.fecha));
 secs.push({h:'Combustible y aceites',cols:[{l:'Fecha',t:'date'},{l:'Tipo',t:'text'},{l:'Cantidad',t:'num'},{l:'Unidad',t:'text'},{l:'Lo pagó',t:'text'},{l:'Valor',t:'money'}],rows:cb.map(r=>[r.fecha,r.tipo||'',r.cant||'',r.und||'',pagaC(r,P)?'Cliente':'Dueño',r.valor]),foot:['Total','','','','',sum(cb)]});
 const gs=L('mov').filter(r=>r.p==='flota'&&r.mq===mid&&inP(r.fecha,desde,hasta));if(gs.length)secs.push({h:'Gastos asignados',cols:[{l:'Fecha',t:'date'},{l:'Rubro',t:'text'},{l:'Concepto',t:'text'},{l:'Valor',t:'money'}],rows:gs.map(r=>[r.fecha,subOf('flota',r.s)?.name||'',r.concepto||'',r.valor]),foot:['Total','','',sum(gs)]});
 return {title:'Informe de la máquina '+P.maq,sub:[mqSub(P),per+' · Generado el '+fd(today())],kpis:[['Horas trabajadas',fg(R.horas)+' h'],['Días trabajados',String(R.dias)],['Facturado',fmt(R.ing)],['Repuestos (dueño)',fmt(R.repD)],['Combustible (dueño)',fmt(R.combD)],['Gastos asignados',fmt(R.gas)],['Utilidad',fmt(R.util)]],notes:[],secs,file:`informe-${slug(P.maq)}-${cut?'corte-'+cut.n+'-'+cut.t:today()}`};
}
Object.assign(ACT,{
 pk:d=>{V.f.pk=d.v;render()},mqGo:d=>{V.mq=d.id;go('retro','resumen')},
 newCli:()=>formCli(),newCob:d=>formCob(d.id),cliVer:d=>cliVer(d.id),cobEdit:d=>{const r=byId('cob',d.id);if(r)formCob(r.cli,r)},
 dlRep:d=>dlMenu(d.k==='mq'?{kind:'mq',mid:d.id}:d.k==='fnd'?{kind:'fnd',id:d.id}:d.k==='cli'?{kind:'cli',id:d.id}:{kind:'gen'})
});
{const e0=ACT.edit;ACT.edit=d=>{const r=byId(d.c,d.id);if(d.c==='cli'&&r)return formCli(r);if(d.c==='cob'&&r)return formCob(r.cli,r);return e0(d)}}
{const d0=ACT.del;ACT.del=d=>{if(d.c==='cli'&&(L('rh').some(r=>r.cli===d.id)||L('cob').some(x=>x.cli===d.id)||L('maq').some(m=>m.cli===d.id))){toast('El cliente tiene jornadas, pagos o máquinas asignadas.');return}return d0(d)}}
