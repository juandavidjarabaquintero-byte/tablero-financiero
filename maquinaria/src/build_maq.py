import re,os,shutil
src=open('/home/claude/tablero/index.html').read()
ov=open('/home/claude/maquinaria-src/override.js').read()+'\n'+open('/home/claude/maquinaria-src/campo.js').read()
s=src
def R(o,n,c=1):
    global s
    assert s.count(o)==c,(o[:150],s.count(o));s=s.replace(o,n)
def RA(o,n):
    global s
    assert o in s,o[:150];s=s.replace(o,n)
s=re.sub(r'/\*SEED-START\*/.*?/\*SEED-END\*/','',s,flags=re.S)
R("<title>Tablero Financiero</title>","<title>Tablero de Maquinaria</title>")
R("<div><b>Tablero Financiero</b><small>Finanzas y proyectos</small></div>","<div><b>Tablero de Maquinaria</b><small>Flota, costos y clientes</small></div>")
R("indexedDB.open('tablero-fin',1)","indexedDB.open('tablero-maquinaria',1)")
R("retroP:{maq:'CATERPILLAR E110B',dueno:'JP',precio:150000,min:7,alerta:80,pctComb:0}","retroP:{maq:'',dueno:'',precio:0,min:8,alerta:80,pctComb:0}")
R("sheetUrl:'https://docs.google.com/spreadsheets/d/1ggJdlmDgeIXk0o0W41a9pRzUtoiHNmZOvs5IT0KSpTk/edit',pct:{ter:20,emp:8,com:2,adm:3},presMina:370000000,imported:'2026-10-23'","sheetUrl:'',pct:{ter:20,emp:8,com:2,adm:3},presMina:0,imported:''")
RA("'https://docs.google.com/spreadsheets/d/1ggJdlmDgeIXk0o0W41a9pRzUtoiHNmZOvs5IT0KSpTk/edit'","''")
R("const COLLS=['mov','prest','abonos','cab','veh','inm','per','cortes','rh','rs','rc','rcort','cats','eq','obl','maq','own','fnd','fmov'];","const COLLS=['mov','rh','rs','rc','rcort','maq','cli','cob','fnd','fmov','cats'];")
R("const NEWC=['maq','own','fnd','fmov'];","const NEWC=[];")
R("const FPROJ=()=>[['mina','Mina La Fe'],['retro','Maquinaria'],['parcela','Parcela Las Colinas'],...L('inm').map(i=>['inm:'+i.id,i.nombre]),['personal','Gastos personales']];","const FPROJ=()=>[['retro','Maquinaria (repuestos y combustible)'],['flota','Gastos de la flota']];")
R("const projs=[['personal','Gastos personales'],['parcela','Parcela Las Colinas'],...L('inm').map(i=>['inm:'+i.id,i.nombre]),['mina','Mina La Fe']];","const projs=[['flota','Gastos de la flota']];")
R(" else if(V.m==='fondos')h=vFondos();"," else if(V.m==='fondos')h=vFondos();\n else if(V.m==='clientes')h=vClientes();\n else if(V.m==='campo')h=vCampo();\n else if(V.m==='validar')h=vValidar();")
R("Administrador: todo. Auxiliar: registra y edita, no borra. Contador: solo lectura e informes. Dueño de la máquina: solo su vista de la retroexcavadora.","Administrador: todo. Auxiliar de campo: registra y edita, no borra. Dueño: ve todo e informes, sin modificar.")
R("""<div class="card"><h3>Mina La Fe</h3><div class="fg"><div class="fld"><label for="presM">Presupuesto de la mina</label><input id="presM" inputmode="numeric" data-money value="${(c.presMina||0).toLocaleString('es-CO')}"></div></div><div class="bar" style="margin-top:12px"><button class="btn pri" data-act="savePres">Guardar</button><button class="btn dan del-only" data-act="reset">Restablecer datos</button></div></div></div>""","""<div class="card"><h3>Datos de este equipo</h3><p class="note" style="margin:0 0 12px">Restablecer borra lo guardado en este equipo y lo vuelve a descargar del Drive.</p><div class="bar"><button class="btn dan del-only" data-act="reset">Restablecer datos</button></div></div></div>""")
RA("Datos importados del Sheet “Control Financiero PROYECTOS” el ${fd(c.imported)}: Mina La Fe, Villa Suárez, Gastos Personales, Retroexcavadora y Nómina.","Copia completa de los datos de este equipo en un archivo.")
R("${S.cfg.role==='admin'?ownersCard():''}","")
R("""`<div class="lbl">Préstamos por cobrar</div><div class="big">${fmt(sum(L('prest'))-sum(L('abonos')))}</div>""","""`<div class="lbl">Por cobrar a clientes</div><div class="big">${fmt(sum(L('cli'),c=>Math.max(0,cliStats(c.id).saldo)))}</div>""")
# jornadas con cliente y tarifa
R("""{k:'operador',l:'Operador',v:rec.operador||last?.operador||''},""","""{k:'cli',l:'Cliente u obra',t:'select',blank:'Sin cliente',opts:L('cli').map(c=>[c.id,c.nombre]),v:rec.id?(rec.cli||''):(P.cli||'')},{k:'tar',l:'Tarifa por hora',t:'money',v:rec.tar??P.precio??''},{k:'operador',l:'Operador',v:rec.operador||last?.operador||P.operador||''},""")
R("""${propia(P)?'':`<span>Valor del día</span><span>${fmt(h*P.precio)}</span>`}""","""<span>Valor del día</span><span>${fmt(h*(v.tar||0))}</span>""")
# repuestos y combustible: quién paga
R("""{k:'asume',l:'Lo asume',t:'select',opts:['Dueño','Mina'],v:rec.asume||(propia(P)?'Mina':'Dueño'),hint:'Dueño: se descuenta de la renta. Mina: costo de la mina.'}""","""{k:'asume',l:'Lo paga',t:'select',opts:['Dueño','Cliente'],v:rec.asume||P.repA||'Dueño',hint:'Dueño: es costo de la máquina. Cliente: lo pagó el cliente y no afecta la utilidad.'}""")
R("""{k:'und',l:'Unidad',t:'select',opts:['gal','lt','und'],v:rec.und||'gal'},""","""{k:'und',l:'Unidad',t:'select',opts:['gal','lt','und'],v:rec.und||'gal'},{k:'asume',l:'Lo paga',t:'select',opts:['Dueño','Cliente'],v:rec.asume||P.combA||'Dueño'},""")
RA("r.asume==='Mina'?JC.ok:JC.bajo","r.asume==='Cliente'?JC.ok:JC.bajo")
RA("r.asume==='Mina'?' · Asume la mina':''","r.asume==='Cliente'?' · Lo pagó el cliente':''")
for a,b in [("kpi('Asume el dueño',fmt(sum(rows.filter(r=>r.asume!=='Mina'))),'Se descuenta de la renta','c-wa')","kpi('Pagado por el dueño',fmt(sum(rows.filter(r=>r.asume!=='Cliente'))),'Costo de la máquina','c-wa')"),("kpi('Asume la mina',fmt(sum(rows.filter(r=>r.asume==='Mina'))),'Costo de la mina','c-ba')","kpi('Pagado por el cliente',fmt(sum(rows.filter(r=>r.asume==='Cliente'))),'No afecta la utilidad','c-te')")]:RA(a,b)
RA("r.asume==='Mina'?'ok':'wa'","r.asume==='Cliente'?'ok':'wa'")
RA("propia(P)?'Máquina propia':(100-(P.pctComb||0))+'% a cargo de la mina'","'Pagado por el dueño: '+fmt(sum(rows.filter(r=>!pagaC(r,P))))")
RA("r.horas*P.precio","r.horas*tarOf(r,P)")
# máquina en gastos de la flota
R(""" const copts=canEdit()?[...cats,['__new','+ Nueva categoría…']]:cats;""",""" if(m==='flota')fields.push({k:'mq',l:'Máquina',t:'select',blank:'General de la flota',opts:mqList().map(x=>[x.id,x.maq]),v:rec.mq||extra.mq||''});
 const copts=canEdit()?[...cats,['__new','+ Nueva categoría…']]:cats;""")
R("const fo=ctx.kind==='fnd'?byId('fnd',ctx.id):null;","const fo=ctx.kind==='fnd'?byId('fnd',ctx.id):ctx.kind==='cli'?byId('cli',ctx.id):null;")
RA("'Tablero Financiero · Informe para el contador'","'Tablero de Maquinaria'")
RA("doc.text('Tablero Financiero',M,PH-20)","doc.text('Tablero de Maquinaria',M,PH-20)")
R("const FOLDER_OF=(c,r)=>c==='fmov'?'Fondos y anticipos':","const FOLDER_OF=(c,r)=>c==='cob'?'Pagos de clientes':c==='mov'&&r.p==='flota'?'Gastos de la flota':c==='fmov'?'Fondos y anticipos':")
s=re.sub(r"const mqSub=m=>[^\n]*\n","const mqSub=m=>[m.tipo,m.serie,m.cli?'Cliente: '+cliName(m.cli):'Sin cliente asignado'].filter(Boolean).join(' · ');\n",s,count=1)
R("const pks=rec.id?fKeys(rec):[V.f.fp||'mina'];","const pks=rec.id?fKeys(rec):[V.f.fp||'retro'];")
R("/* ---------- arranque ---------- */",ov+"\n/* ---------- arranque ---------- */")
R("S=st&&st.mov?st:seed();","S=st&&st.cfg?st:seed();")
R(" if(h[0]&&modOf(h[0]))go(h[0],h[1]);else render();"," const inv=connectFromHash();\n if(!inv&&h[0]&&modOf(h[0]))go(h[0],h[1]);else if(S.cfg.role==='aux')go('campo');else render();")
R(" if(navigator.onLine&&S.cfg.url&&S.cfg.token)setTimeout(()=>sync(false),1500);"," if(!inv&&navigator.onLine&&S.cfg.url&&S.cfg.token)setTimeout(()=>sync(false),1500);")
RA("const lim=['dueno','conta'].includes(c.role);","const lim=['dueno','conta','aux'].includes(c.role);")
RA("!S.cfg.url?(n?`${n} sin enviar`:'Sin conectar')","!S.cfg.url?'Solo en este equipo'")
R(' return `<div class="grid two"><div class="card"><h3>Perfil de este equipo</h3>',' return storeCard()+`<div class="grid two"><div class="card"><h3>Perfil de este equipo</h3>')
css=""".ubars{display:grid;gap:6px}.ub{display:grid;grid-template-columns:minmax(90px,30%) 1fr auto;gap:10px;align-items:center;background:none;border:0;color:inherit;font:inherit;padding:4px 2px;cursor:pointer;text-align:left}.ub .n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13.5px}.ub .b{height:10px;border-radius:9px;background:#ffffff10;overflow:hidden}.ub .b i{display:block;height:100%;border-radius:9px}.ub .v{font:700 13px var(--f-disp);font-variant-numeric:tabular-nums}
.mqgrid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}.mqc{text-align:left;cursor:pointer;color:inherit;font:inherit;display:grid;gap:12px}.mqc:hover{border-color:var(--cyan)}.mqc.off{opacity:.55}.mqc .avatar{cursor:inherit}.mqk{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mqk small{display:block;color:var(--mut);font:600 10px var(--f-disp);letter-spacing:.1em;text-transform:uppercase}.mqk b{font:700 15px var(--f-disp)}
"""
css2='\n.big-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}\n.big-ic{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 8px;border-radius:20px;border:1px solid var(--line);background:linear-gradient(165deg,#1b2564,#141c52);color:inherit;font:inherit;cursor:pointer;text-align:center}\n.big-ic:active{transform:scale(.97)}.big-ic b{font:700 17px/1.2 var(--f-disp)}.big-ic small{color:var(--mut);font-size:13px}\n.bc{width:86px;height:86px;border-radius:50%;display:grid;place-items:center;box-shadow:0 8px 22px #0006,inset 0 -4px 0 #0002}.bc svg{width:44px;height:44px;stroke:#fff;stroke-width:2.2}\n.camq{display:grid;gap:10px}.camq-b{display:flex;align-items:center;gap:14px;background:none;border:0;color:inherit;font:inherit;padding:0;cursor:pointer}.camq-b b{display:block;font:700 20px var(--f-disp)}.camq-b small{display:block}.camq .avatar{width:64px;height:64px}\n.cstat{border-radius:12px;padding:10px 12px;font-weight:700;background:#ffffff10}.cstat.ok{background:#1fe0a01f;color:#1fe0a0}.cstat.wa{background:#ffb5471f;color:#ffb547}\n.sheet.wzs{width:min(560px,100%)}.wz{display:grid;gap:14px}.wq{font:700 22px/1.3 var(--f-disp);margin:4px 0;text-align:center}\n.wz-dots{display:flex;gap:6px;justify-content:center}.wz-dots i{width:28px;height:6px;border-radius:9px;background:#ffffff1f}.wz-dots i.on{background:var(--cyan)}\n.wz-cam{display:grid;place-items:center;gap:10px;min-height:220px;border:2px dashed var(--line2);border-radius:20px;cursor:pointer;overflow:hidden;padding:12px}.wz-cam img{max-height:320px;border-radius:12px}.wz-cam b{font-size:18px}\n.wz-in{width:100%;box-sizing:border-box;font:700 40px var(--f-disp);text-align:center;padding:16px;border-radius:16px;border:2px solid var(--line2);background:#0b1238;color:inherit}.wz-in.sm{font:600 20px var(--f-body);text-align:left}\n.wz-ch{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.wz-ch.two{grid-template-columns:1fr 1fr}.wz-ch button{display:flex;align-items:center;gap:10px;justify-content:center;min-height:72px;border-radius:16px;border:2px solid var(--line2);background:#ffffff08;color:inherit;font:700 18px var(--f-body);cursor:pointer;padding:10px}.wz-ch button svg{width:26px;height:26px;stroke:currentColor;flex:none}.vcampo .fab{display:none!important}.wz-ch button.on{border-color:var(--cyan);background:#2ee6f01f}\n.wz-chips{display:flex;flex-wrap:wrap;gap:8px}.wz-chips button{border-radius:999px;border:1px solid var(--line2);background:#ffffff0a;color:inherit;font:600 15px var(--f-body);padding:10px 14px;cursor:pointer}\n.wz-kv{font-size:16px}.wz-ft .btn.big{flex:1;min-height:56px;font-size:18px;justify-content:center}\n#toast.big{font-size:18px;padding:16px 20px}\n.inv-g{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}.inv{border:1px solid var(--line);border-radius:14px;padding:14px;display:grid;gap:4px}.qr{display:none;background:#fff;border-radius:10px;padding:8px;margin-top:10px;max-width:220px}\n.vrow{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid #ffffff10;flex-wrap:wrap}\n.st2 .stc{text-align:left;border:2px solid var(--line2);border-radius:14px;padding:14px;background:#ffffff06;color:inherit;font:inherit;cursor:pointer;display:grid;gap:4px}.st2 .stc.on{border-color:var(--cyan);background:#2ee6f014}.st2 .stc small{color:var(--mut)}'
R(".dlg{display:grid;gap:8px;margin-top:14px}",css+".dlg{display:grid;gap:8px;margin-top:14px}\n.dlx-drive{background:#1a73e8;font-size:9.5px!important}"+css2)
for bad in ['Diomedez','Cárcamo','1ggJdlmDgeIXk0o0W41a9pRzUtoiHNmZOvs5IT0KSpTk']:assert bad not in s,bad
os.makedirs('/home/claude/maquinaria',exist_ok=True)
open('/home/claude/maquinaria/dev.html','w').write(s)
title='<title>Tablero de Maquinaria</title>'
body=s.replace(title,'',1)
head=f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
{title}
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Maquinaria">
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
'''
out='/home/claude/maquinaria/pwa';os.makedirs(out+'/icons',exist_ok=True)
open(out+'/index.html','w').write(head+body+'\n</body>\n</html>\n')
for f in os.listdir('/home/claude/tablero-pwa/icons'):shutil.copy('/home/claude/tablero-pwa/icons/'+f,out+'/icons/'+f)
sw=open('/home/claude/tablero-pwa/sw.js').read()
sw=re.sub(r"const VERSION='[^']*';","const VERSION='maquinaria-v2';",sw)
sw=sw.replace("k.startsWith('tablero-')","k.startsWith('maquinaria-')")
assert "k.startsWith('maquinaria-')" in sw
open(out+'/sw.js','w').write(sw)
open(out+'/manifest.webmanifest','w').write('''{
  "name": "Tablero de Maquinaria",
  "short_name": "Maquinaria",
  "description": "Administración de flota de maquinaria: jornadas, clientes, costos, fondos de compras e informes al Drive. Funciona sin internet.",
  "lang": "es-CO",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0a0f2e",
  "theme_color": "#0a0f2e",
  "icons": [
    {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
''')
print('ok',len(s))
