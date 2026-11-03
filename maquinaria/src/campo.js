/* ================= Modo sencillo para el auxiliar de mina ================= */
Object.assign(IC,{
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 fuel:'<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 7h5v4H7z"/><path d="M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
 wrench:'<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 0-5-5L14 2z"/>',
 alert:'<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>',
 send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
 stop:'<circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
 play:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
 ok:'<path d="M20 6 9 17l-5-5"/>',
 back:'<path d="M15 18l-6-6 6-6"/>',
 link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'
});
Object.assign(ROLES,{admin:'Administrador de la app',aux:'Auxiliar de mina',conta:'Dueño (solo ve)'});
MOD.splice(1,0,{id:'campo',name:'Registrar',ic:'clock'},{id:'validar',name:'Validar registros',ic:'ok'});
const isAux=()=>S.cfg.role==='aux';
{const n0=navItems;navItems=function(){if(isAux())return MOD.filter(m=>m.id==='campo'||m.id==='ajustes');if(S.cfg.role==='conta')return MOD.filter(m=>!['campo','validar'].includes(m.id));return n0()}}
{const g0=go;go=function(m,s){if(isAux()&&m!=='ajustes')m='campo';if(S.cfg.role==='conta'&&(m==='campo'||m==='validar'))m='inicio';return g0(m,s)}}
{const r0=render;render=function(){document.body.classList.toggle('vcampo',V.m==='campo'||isAux());if(isAux()&&V.m!=='ajustes'&&V.m!=='campo'){V.m='campo';V.s=null}if((S.cfg.role==='conta')&&(V.m==='campo'||V.m==='validar'))V.m='inicio';return r0()}}
const pendVal=()=>['rh','rs','rc'].flatMap(c=>L(c).filter(r=>r.src==='campo'&&!r.val).map(r=>({c,r}))).sort((a,b)=>b.r.fecha.localeCompare(a.r.fecha)||(b.r.cre-a.r.cre));
function cmq(){const l=mqList().filter(m=>!m.inactivo);if(!l.length)return null;if(!V.cm||!l.find(m=>m.id===V.cm))V.cm=(S.cfg.mqDef&&l.find(m=>m.id===S.cfg.mqDef)?.id)||l[0].id;return byId('maq',V.cm)}
function vCampo(){
 const m=cmq();const n=S.outbox.length;const on=navigator.onLine;
 if(!m)return `<div class="card"><div class="empty">Todavía no hay máquinas. Pide al administrador que las registre${S.cfg.url?' y toca “Enviar y recibir”':''}.</div>${S.cfg.url?`<div class="bar" style="justify-content:center"><button class="btn pri" data-act="sync">${ic('sync')}Enviar y recibir</button></div>`:''}</div>`;
 const op=LM('rh',m.id).filter(enCurso)[0];const hoy=today();const jh=LM('rh',m.id).filter(r=>r.fecha===hoy);
 const B=(act,icon,col,lab,sub)=>`<button class="big-ic" data-act="${act}"><span class="bc" style="background:${col}">${ic(icon)}</span><b>${lab}</b>${sub?`<small>${sub}</small>`:''}</button>`;
 return `<div class="card camq"><button class="camq-b" data-act="cmSel"><span class="avatar">${mqImg(m)}</span><span style="flex:1;min-width:0;text-align:left"><small class="mut">Máquina</small><b>${esc(m.maq)}</b>${mqList().filter(x=>!x.inactivo).length>1?'<small class="mut">Toca para cambiar</small>':''}</span></button>
 <div class="cstat ${!S.cfg.url?'':n?'wa':'ok'}">${!S.cfg.url?'Guardado en este celular':n?`${n} registro${n===1?'':'s'} por enviar${on?'':' · sin señal'}`:'Todo enviado'}</div></div>
 ${op?`<div class="al in" style="margin:0 0 14px"><i></i><div>Jornada en curso desde el horómetro <b>${f1(op.hi)}</b> (${fdl(op.fecha)}).</div></div>`:jh.length?`<div class="al ok" style="margin:0 0 14px"><i></i><div>Hoy: ${jh.map(r=>enCurso(r)?'en curso':f1(r.horas)+' h').join(', ')}</div></div>`:''}
 <div class="big-grid">
  ${op?B('wz','stop','#ff4f73','Terminar jornada','Foto y horómetro final'):B('wz','play','#1fc98b','Iniciar jornada','Foto y horómetro')}
  ${B('wzNov','alert','#ff9f1c','Novedad','Daño, lluvia, parada')}
  ${B('wzRs','wrench','#3d8bff','Repuesto o arreglo','Foto de la factura')}
  ${B('wzRc','fuel','#e94f9a','Combustible','ACPM, aceite, grasa')}
  ${B('cMis','list','#8b6dff','Mis registros','Ver y corregir')}
  ${S.cfg.url?B('sync','send','#14b8c4','Enviar y recibir',on?'Con señal':'Sin señal: se envía luego'):B('goAj','cam','#64748b','Copia de seguridad','Ajustes')}
 </div>`;
}
let WZ=null;
const WZT={jor:'Jornada',nov:'Novedad',rs:'Repuesto o arreglo',rc:'Combustible'};
function wzStart(type){const m=cmq();if(!m)return;const op=LM('rh',m.id).filter(enCurso)[0];const last=LM('rh',m.id).filter(r=>!enCurso(r)).sort((a,b)=>a.fecha.localeCompare(b.fecha)||(a.hf-b.hf)).pop();
 const steps={jor:op?['foto','num','novq','ok']:['foto','num','ok'],nov:['nov','foto','ok'],rs:['foto','tipo','txt','money','pago','ok'],rc:['foto','tipo','num','money','pago','ok']}[type];
 WZ={type,m,op,last,steps,i:0,d:{fecha:today(),tipo:type==='rc'?'ACPM':type==='rs'?'Repuesto':''}};wzRender()}
function wzFundOpts(){const k=WZ.type==='rs'||WZ.type==='rc'?'retro':'';return L('fnd').filter(f=>!f.inactivo&&fFor(f,k))}
function wzRender(){
 const st=WZ.steps[WZ.i];const d=WZ.d;const T=WZ.type==='jor'?(WZ.op?'Terminar jornada':'Iniciar jornada'):WZT[WZ.type];
 let body='',hint='';
 if(st==='foto'){const lab=WZ.type==='jor'?'Toma la foto del horómetro (reloj)':WZ.type==='nov'?'Foto de la novedad (opcional)':'Foto de la factura o soporte';
  body=`<p class="wq">${lab}</p><label class="wz-cam">${d.foto?`<img src="${IMG[d.foto]?.data||''}" alt="Foto tomada">`:`<span class="bc" style="background:#14b8c4">${ic('cam')}</span><b>Tomar foto</b>`}<input type="file" accept="image/*" capture="environment" id="wzFile" hidden></label>${d.foto?'<p class="mut" style="text-align:center">Toca la foto para tomarla de nuevo</p>':''}`;
  hint=WZ.type==='jor'?'':'Si no hay foto, toca “Siguiente”.'}
 if(st==='num'){const jor=WZ.type==='jor';const lab=jor?(WZ.op?'¿Qué número marca el horómetro ahora?':'¿Qué número marca el horómetro al empezar?'):'¿Cuántos galones?';const v=d.n??(jor?(WZ.op?'':(WZ.last?.hf??'')):'');
  body=`<p class="wq">${lab}</p><input class="wz-in" id="wzN" inputmode="decimal" autocomplete="off" value="${v===''?'':String(v).replace('.',',')}" placeholder="0">${jor&&WZ.op?`<p class="mut" style="text-align:center">Empezó en ${f1(WZ.op.hi)}</p>`:''}`}
 if(st==='money')body=`<p class="wq">¿Cuánto costó?</p><input class="wz-in" id="wzM" inputmode="numeric" data-money autocomplete="off" value="${d.valor?(+d.valor).toLocaleString('es-CO'):''}" placeholder="$ 0">`;
 if(st==='tipo'){const op=WZ.type==='rs'?[['Repuesto','wrench'],['Reparación','tool'],['Otro','plus']]:[['ACPM','fuel'],['Gasolina','fuel'],['Aceite','fuel'],['Grasa','fuel']];
  body=`<p class="wq">¿Qué fue?</p><div class="wz-ch">${op.map(([o,i])=>`<button class="${d.tipo===o?'on':''}" data-act="wzSet" data-k="tipo" data-v="${o}">${ic(i)}${o}</button>`).join('')}</div>`}
 if(st==='txt')body=`<p class="wq">¿Qué se compró o arregló?</p><input class="wz-in sm" id="wzT" autocomplete="off" value="${esc(d.txt||'')}" placeholder="Ej. manguera, filtro"><div class="wz-chips">${['Manguera','Filtro','Aceite','Llanta','Pasador','Soldadura','Mano de obra'].map(o=>`<button data-act="wzAdd" data-v="${o}">${o}</button>`).join('')}</div>`;
 if(st==='nov'||st==='novq'){if(st==='novq'&&d.hasNov==null)body=`<p class="wq">¿Hubo alguna novedad hoy?</p><div class="wz-ch two"><button data-act="wzSet" data-k="hasNov" data-v="1">${ic('alert')}Sí</button><button data-act="wzSet" data-k="hasNov" data-v="0">${ic('ok')}No</button></div>`;
  else body=`<p class="wq">¿Qué pasó?</p><div class="wz-chips">${['Daño de la máquina','Lluvia','Sin operador','Mantenimiento','Festivo','Sin combustible','No hubo trabajo'].map(o=>`<button data-act="wzAdd" data-v="${o}">${o}</button>`).join('')}</div><textarea class="wz-in sm" id="wzT" rows="3" placeholder="Escribe o toca una opción">${esc(d.txt||'')}</textarea>`}
 if(st==='pago'){const fo=wzFundOpts();if(!fo.length){WZ.d.fnd='';WZ.i++;return wzRender()}
  body=`<p class="wq">¿Con qué plata se pagó?</p><div class="wz-ch">${fo.map(f=>`<button class="${d.fnd===f.id?'on':''}" data-act="wzSet" data-k="fnd" data-v="${f.id}">${ic('cash')}${isProv(f)?'Anticipo en '+esc(f.nombre):'Plata entregada a '+esc(f.nombre)}</button>`).join('')}<button class="${d.fnd===''?'on':''}" data-act="wzSet" data-k="fnd" data-v="">${ic('user')}Otra persona pagó</button></div>`}
 if(st==='ok'){const rows=[['Máquina',WZ.m.maq],['Fecha',fdl(d.fecha)]];
  if(WZ.type==='jor')rows.push([WZ.op?'Horómetro final':'Horómetro inicio',f1(d.n)],...(WZ.op?[['Horas',f1(Math.max(0,d.n-WZ.op.hi))]]:[]),...(d.txt?[['Novedad',d.txt]]:[]));
  if(WZ.type==='nov')rows.push(['Novedad',d.txt]);
  if(WZ.type==='rs')rows.push(['Tipo',d.tipo],['Qué',d.txt],['Valor',fmt(d.valor)]);
  if(WZ.type==='rc')rows.push(['Tipo',d.tipo],['Cantidad',f1(d.n)+' gal'],['Valor',fmt(d.valor)]);
  if((WZ.type==='rs'||WZ.type==='rc')&&wzFundOpts().length){const f=byId('fnd',d.fnd);rows.push(['Pagado con',f?f.nombre:'Otra persona'])}
  rows.push(['Foto',d.foto||d.foto2?'Sí':'No']);
  body=`<p class="wq">Revisa y guarda</p><div class="kv wz-kv">${rows.map(([a,b])=>`<span>${esc(a)}</span><span>${esc(String(b??''))}</span>`).join('')}</div><div class="fld" style="margin-top:12px"><label for="wzF">Fecha</label><input type="date" id="wzF" value="${d.fecha}" max="${today()}"></div>`}
 const last=st==='ok';
 $('#sheet').classList.add('wide');$('#sheet').classList.add('wzs');
 $('#sheet').innerHTML=`<div class="sh"><h2>${esc(T)}</h2><button class="ib" data-act="close" aria-label="Cerrar">${ic('x')}</button></div><div class="sbd wz"><div class="wz-dots">${WZ.steps.map((_,j)=>`<i class="${j<=WZ.i?'on':''}"></i>`).join('')}</div>${body}${hint?`<p class="mut" style="text-align:center">${hint}</p>`:''}</div>
 <div class="sft wz-ft">${WZ.i?`<button class="btn gh big" data-act="wzBack">${ic('back')}Atrás</button>`:''}<button class="btn pri big" data-act="${last?'wzSave':'wzNext'}">${last?ic('ok')+'Guardar':'Siguiente'}</button></div>`;
 $('#modal').hidden=false;
 const fi=$('#wzFile');if(fi)fi.onchange=async()=>{const f=fi.files[0];if(!f)return;try{const fid=uid();const data=await compress(f);const rec={name:f.name,data};await DB.put('files',fid,rec);IMG[fid]=rec;WZ.d.foto=fid;wzRender()}catch(e){toast('No se pudo guardar la foto')}};
 const mi=$('#wzM');if(mi)mi.oninput=()=>moneyMask(mi);
 const fi2=$('#wzN')||$('#wzM')||$('#wzT');if(fi2&&!('ontouchstart' in window))setTimeout(()=>fi2.focus(),60);
}
function wzRead(){const d=WZ.d;const n=$('#wzN');if(n)d.n=num(n.value);const m=$('#wzM');if(m)d.valor=+(m.value.replace(/\D/g,''))||0;const t=$('#wzT');if(t)d.txt=t.value.trim();const f=$('#wzF');if(f&&f.value)d.fecha=f.value}
function wzCheck(){const st=WZ.steps[WZ.i],d=WZ.d;
 if(st==='foto'&&WZ.type==='jor'&&!d.foto){toast('Toma la foto del horómetro');return false}
 if(st==='num'){if(!(d.n>0)&&!(WZ.type==='jor'&&d.n===0)){toast('Escribe el número');return false}if(WZ.type==='jor'&&WZ.op&&d.n<WZ.op.hi){toast('El número es menor que el del inicio ('+f1(WZ.op.hi)+')');return false}}
 if(st==='money'&&!(d.valor>0)){toast('Escribe cuánto costó');return false}
 if(st==='txt'&&!d.txt){toast('Escribe qué se compró');return false}
 if(st==='nov'&&!d.txt){toast('Escribe o toca la novedad');return false}
 if(st==='pago'&&d.fnd==null){toast('Toca una opción');return false}
 return true}
function wzSave(){wzRead();const d=WZ.d,m=WZ.m,src='campo';
 if(WZ.type==='jor'){if(WZ.op){const hf=d.n;upsert('rh',{id:WZ.op.id,hf,horas:Math.round((hf-WZ.op.hi)*100)/100,foto2:d.foto||WZ.op.foto2||'',fotoDrive2:'',fotoUrl2:'',...(d.txt?{obs:(WZ.op.obs?WZ.op.obs+' · ':'')+d.txt}:{}),val:false})}
  else upsert('rh',{fecha:d.fecha,mq:m.id,cli:m.cli||'',tar:m.precio||0,hi:d.n,hf:'',horas:0,operador:m.operador||'',obs:'',foto:d.foto||'',src})}
 if(WZ.type==='nov'){const r=LM('rh',m.id).filter(x=>x.fecha===d.fecha).sort((a,b)=>(enCurso(b)?1:0)-(enCurso(a)?1:0))[0];
  if(r)upsert('rh',{id:r.id,obs:(r.obs?r.obs+' · ':'')+d.txt,...(d.foto?{foto3:d.foto,fotoDrive3:'',fotoUrl3:''}:{}),val:false});
  else{const lh=WZ.last?.hf??0;upsert('rh',{fecha:d.fecha,mq:m.id,cli:m.cli||'',tar:m.precio||0,hi:lh,hf:lh,horas:0,operador:m.operador||'',obs:d.txt,foto3:d.foto||'',src})}}
 if(WZ.type==='rs')upsert('rs',{fecha:d.fecha,mq:m.id,tipo:d.tipo||'Repuesto',concepto:d.txt,valor:d.valor,asume:m.repA||'Dueño',fnd:d.fnd||'',foto:d.foto||'',src});
 if(WZ.type==='rc')upsert('rc',{fecha:d.fecha,mq:m.id,tipo:d.tipo||'ACPM',cant:d.n,und:'gal',valor:d.valor,asume:m.combA||'Dueño',fnd:d.fnd||'',foto:d.foto||'',src});
 WZ=null;closeModal();render();
 const t=$('#toast');toast(S.cfg.url?(navigator.onLine?'Guardado. Enviando…':'Guardado en el celular. Se envía cuando haya señal.'):'Guardado en este celular.');t.classList.add('big');setTimeout(()=>t.classList.remove('big'),3000);
 if(S.cfg.url&&navigator.onLine)setTimeout(()=>sync(false),400);
}
function vMis(){const m=cmq();if(!m)return '';const rows=[...LM('rh',m.id).map(r=>({c:'rh',r,t:enCurso(r)?'Jornada en curso':r.horas>0?'Jornada · '+f1(r.horas)+' h':'Novedad',d:r.obs||'',v:''})),...LM('rs',m.id).map(r=>({c:'rs',r,t:r.tipo+': '+r.concepto,d:'',v:fmt(r.valor)})),...LM('rc',m.id).map(r=>({c:'rc',r,t:r.tipo+(r.cant?' · '+f1(r.cant)+' gal':''),d:'',v:fmt(r.valor)}))].sort((a,b)=>b.r.fecha.localeCompare(a.r.fecha)||(b.r.cre||0)-(a.r.cre||0)).slice(0,40);
 const pend=new Set(S.outbox.map(o=>o.c+':'+o.id));
 $('#sheet').classList.add('wide');
 $('#sheet').innerHTML=`<div class="sh"><h2>Mis registros · ${esc(m.maq)}</h2><button class="ib" data-act="close" aria-label="Cerrar">${ic('x')}</button></div><div class="sbd">${rows.map(x=>`<button class="rl" data-act="edit" data-c="${x.c}" data-id="${x.r.id}"><i class="d" style="color:${pend.has(x.c+':'+x.r.id)?'#ffb547':'#1fe0a0'}"></i><span class="t"><b>${esc(x.t)}</b><small>${fdl(x.r.fecha)}${x.d?' · '+esc(x.d):''} · ${pend.has(x.c+':'+x.r.id)?'por enviar':x.r.val?'validado':'enviado'}</small></span><span class="v">${x.v}</span></button>`).join('')||'<div class="empty">Sin registros.</div>'}</div>`;
 $('#modal').hidden=false;
}
function vValidar(){const p=pendVal();
 return `<div class="card"><h3>Registros por validar<span class="r mut">${p.length}</span></h3><p class="note" style="margin:0 0 12px">Lo que envían los auxiliares de mina queda aquí hasta que lo revises. Puedes corregirlo antes de validarlo.</p>
 ${p.length?`<div class="bar" style="margin-bottom:10px"><button class="btn sm pri edit-only" data-act="valAll">${ic('ok')}Validar todo (${p.length})</button></div>`+p.map(({c,r})=>{const m=mqById(mqOf(r));const t=c==='rh'?(enCurso(r)?'Jornada en curso · inicio '+f1(r.hi):r.horas>0?`Jornada ${f1(r.hi)} → ${f1(r.hf)} · ${f1(r.horas)} h`:'Novedad'):c==='rs'?`${r.tipo}: ${r.concepto} · ${fmt(r.valor)}`:`${r.tipo} ${r.cant?f1(r.cant)+' gal':''} · ${fmt(r.valor)}`;
  const fotos=['','2','3'].filter(x=>r['foto'+x]).map(x=>`<button class="ib" data-act="foto" data-id="${esc(r['foto'+x])}"${r['fotoDrive'+x]?` data-drive="${esc(r['fotoDrive'+x])}"`:''} title="Ver foto">${ic('cam')}</button>`).join('');
  return `<div class="vrow"><div style="min-width:0;flex:1"><b>${esc(m.maq)}</b> · ${fdl(r.fecha)}<div>${esc(t)}</div>${r.obs?`<div class="mut" style="font-size:13px">${esc(r.obs)}</div>`:''}</div><div class="acts">${fotos}<button class="ib edit-only" data-act="edit" data-c="${c}" data-id="${r.id}" title="Corregir">${ic('edit')}</button><button class="btn sm pri edit-only" data-act="valOne" data-c="${c}" data-id="${r.id}">${ic('ok')}Validar</button></div></div>`}).join(''):'<div class="al ok"><i></i><div>Todo validado.</div></div>'}</div>`;
}
Object.assign(ACT,{
 wz:()=>wzStart('jor'),wzNov:()=>wzStart('nov'),wzRs:()=>wzStart('rs'),wzRc:()=>wzStart('rc'),
 wzNext:()=>{wzRead();const st=WZ.steps[WZ.i];if(st==='novq'&&WZ.d.hasNov==null){toast('Toca Sí o No');return}if(st!=='novq'&&!wzCheck())return;WZ.i++;wzRender()},
 wzBack:()=>{wzRead();WZ.i=Math.max(0,WZ.i-1);wzRender()},
 wzSave:()=>{wzRead();wzSave()},
 wzSet:d=>{wzRead();WZ.d[d.k]=d.v;if(d.k==='hasNov'){if(d.v==='1'){if(!WZ.steps.includes('nov'))WZ.steps.splice(WZ.i+1,0,'nov')}else{WZ.steps=WZ.steps.filter(s=>s!=='nov');WZ.d.txt=''}WZ.i++}else if(d.k==='fnd'||d.k==='tipo')WZ.i++;wzRender()},
 wzAdd:d=>{wzRead();WZ.d.txt=WZ.d.txt?(WZ.d.txt.includes(d.v)?WZ.d.txt:WZ.d.txt+', '+d.v):d.v;wzRender()},
 cMis:()=>vMis(),goAj:()=>go('ajustes'),
 cmSel:()=>{const l=mqList().filter(m=>!m.inactivo);if(l.length<2)return;$('#sheet').classList.remove('wide');$('#sheet').innerHTML=`<div class="sh"><h2>¿Con qué máquina?</h2><button class="ib" data-act="close">${ic('x')}</button></div><div class="sbd">${l.map(m=>`<button class="rl" data-act="cmPick" data-id="${m.id}"><span class="avatar" style="width:44px;height:44px">${mqImg(m)}</span><span class="t"><b>${esc(m.maq)}</b><small>${esc(m.tipo||'')}</small></span></button>`).join('')}</div>`;$('#modal').hidden=false;hydrate($('#sheet'))},
 cmPick:d=>{V.cm=d.id;S.cfg.mqDef=d.id;save();closeModal();render()},
 valOne:d=>{upsert(d.c,{id:d.id,val:true});render();toast('Validado')},
 valAll:()=>{const p=pendVal();confirmBox('¿Validar todo?',`Se marcan ${p.length} registros como revisados.`,()=>{p.forEach(({c,r})=>upsert(c,{id:r.id,val:true}));render();toast('Registros validados')})}
});
{const c0=closeModal;closeModal=function(){$('#sheet').classList.remove('wzs');return c0()}}
/* ---- alerta de validación para el administrador ---- */
{const a0=alerts;alerts=function(){const a=a0();const n=pendVal().length;if(n&&S.cfg.role==='admin')a.unshift(['',`${n} registro${n===1?'':'s'} de los auxiliares de mina por validar.`]);return a}}
/* ---- invitaciones por rol y modo local/Drive ---- */
function invLink(tok,mq){const h=new URLSearchParams({u:S.cfg.url,k:tok});if(mq)h.set('m',mq);return location.href.split('#')[0]+'#conectar&'+h.toString()}
async function invitar(){
 if(!S.cfg.url||S.cfg.tokRole!=='admin'){toast('Primero conecta esta app al Drive con la clave de administrador');return}
 if(!navigator.onLine){toast('Se necesita señal para generar las invitaciones');return}
 let j;try{j=await api('keys')}catch(e){toast(e.message);return}
 const ms=mqList().filter(m=>!m.inactivo);
 const card=(rol,lab,desc,tok)=>`<div class="inv"><b>${lab}</b><small class="mut">${desc}</small>${rol==='aux'&&ms.length?`<div class="fld" style="margin-top:8px"><label for="invM">Máquina que maneja</label><select id="invM" data-act-change="invM"><option value="">Todas</option>${ms.map(m=>`<option value="${m.id}">${esc(m.maq)}</option>`).join('')}</select></div>`:''}<div class="bar" style="margin-top:10px"><button class="btn sm pri" data-act="invWa" data-r="${rol}">${ic('send')}WhatsApp</button><button class="btn sm gh" data-act="invCp" data-r="${rol}">${ic('copy')}Copiar enlace</button><button class="btn sm gh" data-act="invQr" data-r="${rol}">QR</button></div><div class="qr" id="qr_${rol}"></div></div>`;
 window.__KEYS=j.keys||{};
 $('#sheet').classList.add('wide');
 $('#sheet').innerHTML=`<div class="sh"><h2>Invitar personas</h2><button class="ib" data-act="close" aria-label="Cerrar">${ic('x')}</button></div><div class="sbd"><p class="note" style="margin:0 0 12px">Cada persona abre su enlace (o escanea el QR) en su celular o PC: la app queda conectada con su perfil. Luego la instala en la pantalla de inicio.</p><div class="grid inv-g">
 ${card('aux','Auxiliar de mina','Registra jornadas, novedades, repuestos y combustible con botones grandes. No borra.')}
 ${card('conta','Dueño','Ve el panel, las máquinas y los informes. No modifica nada.')}
 ${card('admin','Administrador de la app','Todo: valida lo que envían los auxiliares, corrige y genera informes.')}</div></div>`;
 $('#modal').hidden=false;
}
const invUrl=r=>invLink((window.__KEYS||{})[r]||'',r==='aux'?($('#invM')?.value||''):'');
const invMsg=r=>`Hola. Este es tu acceso al Tablero de Maquinaria como ${ROLES[r]}.\n1. Abre este enlace en tu celular: ${invUrl(r)}\n2. Instálala: en iPhone, Safari → Compartir → Agregar a inicio. En Android, Chrome → ⋮ → Instalar aplicación.\nFunciona sin señal: lo que registres se envía cuando haya internet.`;
Object.assign(ACT,{
 invitar:()=>invitar(),
 invWa:d=>{window.open('https://wa.me/?text='+encodeURIComponent(invMsg(d.r)),'_blank','noopener')},
 invCp:d=>copyText(invMsg(d.r)),
 invQr:async d=>{const box=$('#qr_'+d.r);try{await loadJs('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');const q=qrcode(0,'M');q.addData(invUrl(d.r));q.make();box.innerHTML=q.createSvgTag({cellSize:5,margin:2,scalable:true});box.style.display='block'}catch(e){toast('Se necesita señal para generar el QR')}},
 modoLocal:()=>confirmBox('¿Usar solo este equipo?','La información queda guardada en este equipo. Puedes conectar el Drive cuando quieras; lo guardado se envía completo.',()=>{S.cfg.url='';S.cfg.token='';S.cfg.tokRole='';S.cfg.modo='local';save();render();toast('Modo: solo este equipo')}),
 modoDrive:()=>{S.cfg.modo='drive';save();render();setTimeout(()=>$('#surl')?.focus(),80)}
});
function connectFromHash(){const h=location.hash||'';if(!h.startsWith('#conectar'))return false;const p=new URLSearchParams(h.replace(/^#conectar&?/,''));const u=p.get('u'),k=p.get('k'),m=p.get('m');try{history.replaceState(null,'',location.pathname)}catch(e){}
 if(!u||!k||!/^(https:\/\/script\.google\.com\/|http:\/\/localhost[:\/])/.test(u)){toast('Enlace de invitación no válido');return false}
 S.cfg.url=u;S.cfg.token=k;S.cfg.tokRole='';S.cfg.scopeUrl='';S.cfg.pushedAll='';S.cfg.modo='drive';if(m)S.cfg.mqDef=m;save();
 setTimeout(async()=>{await sync(true);if(S.cfg.tokRole){S.cfg.role=S.cfg.tokRole;save();go(S.cfg.role==='aux'?'campo':'inicio');toast('Conectado como '+ROLES[S.cfg.role]+'. Ahora instala la app en la pantalla de inicio.')}},300);return true}
function storeCard(){const c=S.cfg;const drive=!!c.url||c.modo==='drive';if(c.url&&c.tokRole&&c.tokRole!=='admin')return '';
 return `<div class="card"><h3>¿Dónde se guarda la información?</h3><div class="grid two st2">
 <button class="stc ${!drive?'on':''}" data-act="modoLocal"><b>Solo en este equipo</b><small>Sin cuentas ni internet. Usa “Copia de seguridad” para respaldar o pasar los datos a otro equipo.</small></button>
 <button class="stc ${drive?'on':''}" data-act="modoDrive"><b>Google Drive</b><small>Varios equipos comparten la información. Fotos, soportes e informes quedan en una carpeta del Drive y los datos en un Sheet.</small></button></div>
 ${c.tokRole==='admin'?`<div class="bar" style="margin-top:12px"><button class="btn pri" data-act="invitar">${ic('link')}Invitar personas: auxiliares de mina y dueño</button></div>`:drive&&!c.url?'<p class="note" style="margin:12px 0 0">Pega abajo el enlace del servicio y tu clave, o abre el enlace de invitación que te enviaron.</p>':''}</div>`}
{const ml=ACT.modoLocal;ACT.modoLocal=()=>{if(!S.cfg.url){S.cfg.modo='local';save();render();toast('Modo: solo este equipo');return}ml()}}
