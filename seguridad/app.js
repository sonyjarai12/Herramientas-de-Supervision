const CAT0=[
// ---- MT: Tabla 3.1 Estructuras MT
{cod:'1002',tipo:'MT',comp:'EMT · Poste',desc:'Poste en mal estado de conservación o inapropiado para la función de apoyo',crit:'Poste que ha reducido su resistencia mecánica por deterioro en su estructura, exposición a la inclinación o colapso.',norma:'Art. 31º inc. b) LCE'},
{cod:'1008',tipo:'MT',comp:'EMT · Poste',desc:'Poste inclinado más de 5º',crit:'Estructura inclinada expuesta a la rotura o caída.',norma:'Art. 31º inc. b) LCE'},
{cod:'1012',tipo:'MT',comp:'EMT · Poste',desc:'Estructura expuesta al impacto vehicular',crit:'Estructura ubicada en la calzada, esquinas, curvas y/o bermas no definidas, medio o alto tránsito vehicular.',norma:'Regla 217.A.1.a CNE-S'},
{cod:'1034',tipo:'MT',comp:'EMT · Equipos',desc:'Partes rígidas bajo tensión no protegidas, incumplen DS respecto a edificación',crit:'DH: 2,5 m, DV: 4,0 m accesible y no accesible.',norma:'Regla 234.C.1 CNE-S (Tabla 234-1)',ds:true},
{cod:'1036',tipo:'MT',comp:'EMT · Equipos',desc:'Partes rígidas bajo tensión no protegidas, incumplen DS respecto a líneas de comunicaciones',crit:'DV: 1,8 m, DH: 1,5 m con cable de comunicación.',norma:'Reglas 233.C.1 y 233.B.1 CNE-S',ds:true},
{cod:'1042',tipo:'MT',comp:'EMT · Terminal de cable',desc:'Protección mecánica de cable de MT rota, inexistente, insuficiente o de material inadecuado',crit:'Altura de protección mínima requerida = 2,4 m.',norma:'Regla 360.A CNE-S'},
{cod:'1072',tipo:'MT',comp:'EMT · Retenida',desc:'Retenida en mal estado',crit:'Cable de retenida roto, con hilos rotos o destensada, que exponga la inclinación, caída del poste o contacto con puntos energizados.',norma:'Art. 31º inc. b) LCE'},
{cod:'1074',tipo:'MT',comp:'EMT · Retenida',desc:'Retenida sin conexión efectiva de puesta a tierra o sin aislador de retenida',crit:'Cuando no existe el aislador de retenida o la conexión a una puesta a tierra efectiva.',norma:'Reglas 279.A.2 y 215.C.2 CNE-S'},
{cod:'1082',tipo:'MT',comp:'EMT · Puesta a tierra',desc:'Sistema de puesta a tierra inexistente, incompleto o en mal estado en estructura con terminal de cable y/o equipos',crit:'No existe puesta a tierra efectiva o con elemento deteriorado en EMT con terminal y/o equipos con elementos metálicos a menos de 2,5 m.',norma:'Reglas 033.A y 215.C.1 CNE-S; Art. 31º inc. b) LCE'},
{cod:'1086',tipo:'MT',comp:'EMT · Puesta a tierra',desc:'Resistencia de puesta a tierra mayor a la máxima normada',crit:'Resistencia > 25 Ω para un punto (estructuras de la tipificación 1082).',norma:'Regla 036.B CNE-S'},
// Tabla 3.2 SED SAM/SAB
{cod:'2002',tipo:'MT',comp:'SED aérea · Poste',desc:'Poste de SED en mal estado de conservación o inapropiado para la función de apoyo',crit:'Poste que ha reducido su resistencia mecánica por deterioro en su estructura, exposición al colapso.',norma:'Art. 31º inc. b) LCE'},
{cod:'2004',tipo:'MT',comp:'SED aérea · Poste',desc:'Poste de SED inclinado más de 5º',crit:'Estructura inclinada expuesta a la rotura o caída.',norma:'Art. 31º inc. b) LCE'},
{cod:'2008',tipo:'MT',comp:'SED aérea · Poste',desc:'Estructura de SED expuesta al impacto vehicular',crit:'Estructura ubicada en la calzada, esquinas, curvas y/o bermas no definidas, medio o alto tránsito vehicular.',norma:'Regla 217.A.1.a CNE-S'},
{cod:'2024',tipo:'MT',comp:'SED aérea · Equipos',desc:'Partes rígidas bajo tensión no protegidas incumplen DS respecto a edificación',crit:'DH: 2,5 m, DV: 4,0 m accesible y no accesible.',norma:'Regla 234.C.1 CNE-S (Tabla 234-1)',ds:true},
{cod:'2026',tipo:'MT',comp:'SED aérea · Equipos',desc:'Partes rígidas bajo tensión no protegidas incumplen DS respecto a líneas de comunicaciones',crit:'DV: 1,8 m, DH: 1,50 m con cable de comunicación.',norma:'Reglas 233.B.1 y 233.C.1 CNE-S',ds:true},
{cod:'2034',tipo:'MT',comp:'SED aérea · Cables',desc:'Protección mecánica de cable de MT rota, inexistente o insuficiente',crit:'Altura de protección mínima requerida = 2,4 m.',norma:'Regla 360.A CNE-S'},
{cod:'2040',tipo:'MT',comp:'SED aérea · Cruceta/soporte',desc:'Mal estado de conservación de cruceta, ménsula, soporte de transformador o de otros equipos',crit:'Cruceta, ménsula y/o soporte por desprenderse o romperse, por mal estado de su estructura o elementos de fijación.',norma:'Art. 31º inc. b) LCE'},
{cod:'2072',tipo:'MT',comp:'SED aérea · Retenida',desc:'Retenida de SED en mal estado',crit:'Cable de retenida roto, con hilos rotos o destensado, que exponga la inclinación, caída del poste o contacto con puntos energizados.',norma:'Art. 31º inc. b) LCE'},
{cod:'2074',tipo:'MT',comp:'SED aérea · Retenida',desc:'Retenida de SED sin conexión a puesta a tierra o sin aislador de retenida',crit:'No existe el aislador de retenida adecuado o la conexión a una puesta a tierra efectiva.',norma:'Reglas 279.A.2 y 215.C.2 CNE-S'},
{cod:'2082',tipo:'MT',comp:'SED aérea · Puesta a tierra',desc:'Sistema de puesta a tierra de SED inexistente, incompleto o en mal estado',crit:'No existe puesta a tierra efectiva o con elemento deteriorado que no ofrece continuidad.',norma:'Reglas 033.A y 123.A CNE-S; Art. 31º inc. b) LCE'},
{cod:'2086',tipo:'MT',comp:'SED aérea · Puesta a tierra',desc:'Resistencia de puesta a tierra de SED mayor a la máxima normada',crit:'Resistencia de puesta a tierra: 25 Ω para un punto.',norma:'Regla 036.B CNE-S'},
{cod:'2104',tipo:'MT',comp:'SED aérea · Tablero BT',desc:'Tablero y/o caja portamedidor sin conexión a puesta a tierra',crit:'Parte metálica sin conexión a puesta a tierra.',norma:'Regla 180.A.9 CNE-S'},
{cod:'2106',tipo:'MT',comp:'SED aérea · Tablero BT',desc:'Tablero y/o caja portamedidor fácilmente accesible, en mal estado',crit:'Gabinete roto o con agujeros por corrosión, puerta abierta, sin seguro o en mal estado, bisagra deteriorada.',norma:'Art. 31º inc. b) LCE; Art. 19º c) RSSTAE'},
{cod:'2132',tipo:'MT',comp:'SED aérea · Ubicación',desc:'Distancia de SED a estación de combustible menor a la normada',crit:'Incumplimiento de la distancia establecida en la norma vigente.',norma:'Regla 127 CNE-S',ds:true},
// Tabla 3.3 casetas
{cod:'3052',tipo:'MT',comp:'SED caseta/bóveda',desc:'Sin rejillas o con rejillas de ventilación y de ingreso rotas, hundidas o sin cierre seguro',crit:'Rejillas a nivel del piso que por su mal estado pueden ocasionar accidentes o permitir el ingreso; ausencia de seguros.',norma:'Art. 31º inc. b) LCE'},
{cod:'3054',tipo:'MT',comp:'SED caseta/bóveda',desc:'Sin puerta o con puerta rota, arqueada o sin cierre seguro',crit:'Mal estado de la puerta, o ausencia de seguro que permita el acceso de personas extrañas a la SED.',norma:'Art. 31º inc. b) LCE'},
{cod:'3074',tipo:'MT',comp:'SED caseta · Gabinete',desc:'Gabinete y/o caja portamedidor en mal estado',crit:'Gabinete roto o con agujeros por corrosión, puerta abierta, sin seguro o en mal estado, bisagra deteriorada.',norma:'Art. 19º c) RSSTAE'},
// Tabla 3.4 compacta
{cod:'4026',tipo:'MT',comp:'SED compacta · Tablero',desc:'Tablero y/o caja portamedidor sin conexión a puesta a tierra',crit:'Parte metálica sin conexión a puesta a tierra.',norma:'Regla 180.A.9 CNE-S'},
{cod:'4028',tipo:'MT',comp:'SED compacta · Tablero',desc:'Tablero y/o caja portamedidor en mal estado',crit:'Gabinete roto o con agujeros por corrosión, puerta abierta, sin seguro o en mal estado, bisagra deteriorada.',norma:'Art. 31º inc. b) LCE; Art. 19º c) RSSTAE'},
{cod:'4042',tipo:'MT',comp:'SED compacta · Puesta a tierra',desc:'Resistencia de puesta a tierra mayor a la máxima permitida',crit:'Resistencia > 25 Ω.',norma:'Regla 036.B CNE-S'},
{cod:'4049',tipo:'MT',comp:'SED compacta · Puesta a tierra',desc:'Sistema de puesta a tierra inexistente, incompleto o en mal estado',crit:'No existe puesta a tierra efectiva o con elemento deteriorado que no ofrece continuidad.',norma:'Reglas 033.A y 123.A CNE-S; Art. 31º inc. b) LCE'},
{cod:'4072',tipo:'MT',comp:'SED compacta · Carcasa',desc:'Sin puerta o rejilla, o con puerta o rejilla rota, arqueada y sin cierre seguro',crit:'Mal estado de la puerta o rejilla, posible acceso de personas extrañas a partes con tensión.',norma:'Art. 31º inc. b) LCE'},
// Tabla 3.5 conductores MT
{cod:'5010',tipo:'MT',comp:'Tramo MT',desc:'Conductor de MT incumple DS respecto al nivel de terreno',crit:'DV: entre 5,0 m a 7,0 m según tipo de vía (Tabla 232-1 CNE-S).',norma:'Regla 232 CNE-S (Tabla 232-1)',ds:true},
{cod:'5016',tipo:'MT',comp:'Tramo MT',desc:'Conductor de MT incumple DS respecto a letrero, cartel, chimenea, antena, tanque u otras instalaciones similares',crit:'DH: 2,5 m, DV: 4,0 m accesible, DV: 3,5 m no accesible.',norma:'Regla 234.C.1 CNE-S (Tabla 234-1)',ds:true},
{cod:'5018',tipo:'MT',comp:'Tramo MT',desc:'Conductor de MT incumple DS respecto a estructura y/o cable de comunicación',crit:'DV: 1,8 m, DH: 1,50 m con cable de comunicación.',norma:'Reglas 233.B.1 y 233.C.1 CNE-S (Tabla 233-1)',ds:true},
{cod:'5026',tipo:'MT',comp:'Tramo MT',desc:'Conductor de MT incumple distancia de seguridad respecto a edificación',crit:'DH: 2,5 m, DV: 4,0 m accesible y no accesible.',norma:'Regla 234.C.1 CNE-S',ds:true},
{cod:'5030',tipo:'MT',comp:'Tramo MT',desc:'Conductor de MT incumple distancia de seguridad respecto a estación de combustible',crit:'Distancia horizontal de la línea al surtidor o tanque más cercano menor a la fijada en el CNE-S.',norma:'Regla 219.A.3 CNE-S',ds:true},
{cod:'5032',tipo:'MT',comp:'Tramo MT',desc:'Conductor de MT incumple distancia de seguridad respecto a una instalación de baja tensión',crit:'DH: 1,5 m, DV: 1,2 m.',norma:'Reglas 233.B.1 (Tabla 233-1) y 234.B.1 CNE-S',ds:true},
{cod:'5038',tipo:'MT',comp:'Tramo MT',desc:'Conductor de MT está sobre edificación',crit:'Línea de MT sobre una edificación con DV mayor a 4 m.',norma:'Regla 230.A.3 CNE-S'},
// ---- Anexo 4 · Tabla 4.1 Estructuras BT
{cod:'6002',tipo:'EBT',comp:'Poste',desc:'Poste en mal estado de conservación',crit:'Poste que ha reducido su resistencia mecánica por deterioro en su estructura, alta probabilidad de colapsar.',norma:'Art. 31º inc. b) LCE',vars:['Poste en mal estado de conservación','Poste inapropiado para la función de apoyo']},
{cod:'6004',tipo:'EBT',comp:'Poste',desc:'Estructura de BT con cimentación debilitada',crit:'Estructura con inclinación mayor a 5º o con notorias deficiencias en la cimentación, alta probabilidad de colapsar.',norma:'Art. 31º inc. b) LCE',vars:['Estructura de BT con cimentación debilitada','Poste inclinado más de 5º']},
{cod:'6006',tipo:'EBT',comp:'Poste',desc:'Caja portafusible de poste con partes energizadas expuestas y accesibles',crit:'Caja portafusible sin tapa con partes vivas expuestas o aisladas precariamente a una altura menor de 2,50 m.',norma:'Art. 31º inc. b) LCE'},
{cod:'6008',tipo:'EBT',comp:'Poste',desc:'Protección mecánica de cable rota, inexistente, insuficiente o de material inapropiado',crit:'Altura mínima de la protección = 2,40 m.',norma:'Art. 31º inc. b) LCE; Regla 360.A CNE-S'},
{cod:'6024',tipo:'EBT',comp:'Retenida',desc:'Retenida en mal estado',crit:'Cable de retenida roto, con hilos rotos o destensado, que exponga la inclinación, caída del poste o contacto con puntos energizados.',norma:'Art. 31º inc. b) LCE'},
{cod:'6026',tipo:'EBT',comp:'Alumbrado público',desc:'Pastoral de AP en mal estado o por desprenderse',crit:'Pastoral deteriorado, corroído, roto, por desprenderse o mal estado de elementos de fijación.',norma:'Art. 31º inc. b) LCE'},
{cod:'6028',tipo:'EBT',comp:'Alumbrado público',desc:'Artefacto de AP desprendido o por desprenderse',crit:'Mal estado o ausencia de los elementos de fijación del artefacto de AP.',norma:'Art. 31º inc. b) LCE'},
// Tabla 4.2 Conductores BT
{cod:'7002',tipo:'CBT',comp:'Vano de BT',desc:'Conductor con aislamiento deteriorado o inadecuado',crit:'Conductor desnudo, forrado (CPI) o aislado (autoportante) con el aislamiento deteriorado, o aislamiento inadecuado para la intemperie.',norma:'Reglas 278.A.1 y 230.A.4 CNE-S'},
{cod:'7004',tipo:'CBT',comp:'Vano de BT',desc:'Conductor de baja tensión sobre edificación o en contacto con techo o soporte metálico',crit:'Conductor sobre edificación o en contacto con techo o soporte metálico.',norma:'Art. 31º inc. b) LCE; Regla 230.A.3 CNE-S'},
{cod:'7006',tipo:'CBT',comp:'Vano de BT',desc:'Conductor de BT incumple DS respecto al nivel de terreno',crit:'Incumplimiento de la distancia vertical de la Tabla 232-1 del CNE-S.',norma:'Regla 232.B.1 CNE-S (Tabla 232-1)',ds:true},
{cod:'7008',tipo:'CBT',comp:'Vano de BT',desc:'Conductor de BT incumple DS respecto a grifo',crit:'Distancia horizontal de la línea al surtidor o tanque más cercano menor a la fijada en el CNE-S.',norma:'Regla 219.A.3 CNE-S',ds:true},
// Tabla 4.3 Conexiones eléctricas
{cod:'8002',tipo:'CE',comp:'Acometida aérea',desc:'Conductor de acometida con empalme',crit:'Conductor de acometida inapropiado, con aislamiento roto o picado, o con empalme(s) intermedio(s).',norma:'Art. 31º inc. b) LCE; Num. 5.14 y 6.2.1 DGE-11-CE-1',vars:['Conductor de acometida con empalme','Conductor de acometida con aislamiento deteriorado','Conductor de acometida inapropiado']},
{cod:'8004',tipo:'CE',comp:'Acometida aérea',desc:'Acometida sin protección mecánica',crit:'Conductor no empotrado o sin protección mecánica al ingreso de la caja portamedidor; posibilidad de electrizamiento de la caja.',norma:'Art. 31º inc. b) LCE; Num. 6.5 DGE-11-CE-1 (plano CE-3)',vars:['Acometida sin protección mecánica','Acometida no empotrada']},
{cod:'8006',tipo:'CE',comp:'Acometida aérea',desc:'Conductor de acometida no cumple distancia de seguridad respecto al nivel del terreno',crit:'3,00 m sobre suelo, veredas o vías no transitables; 5,50 m sobre vías públicas; 3,00 m sobre techos accesibles; 1,80 m sobre techos no accesibles.',norma:'Num. 6.3.1.1 y 6.3.1.3 DGE-11-CE-1',ds:true,vars:['Conductor de acometida no cumple distancia de seguridad respecto al nivel del terreno','Conductor de acometida no cumple distancia de seguridad respecto al techo']},
{cod:'8008',tipo:'CE',comp:'Acometida aérea',desc:'Conductor de acometida en contacto con parte metálica de la edificación',crit:'Contacto con partes metálicas de la edificación: techos, columnas, vigas o rejas.',norma:'Num. 6.3.1.4 DGE-11-CE-1'},
{cod:'8010',tipo:'CE',comp:'Acometida aérea',desc:'Acometida fijada precariamente',crit:'Elementos de fijación de la acometida inexistentes, inapropiados o en mal estado.',norma:'Num. 6.2.1 DGE-11-CE-1; Art. 31º inc. b) LCE'},
{cod:'8012',tipo:'CE',comp:'Caja de medición',desc:'Medidor expuesto sin caja de medición',crit:'Medidor instalado sin caja portamedidor, accesible a la manipulación.',norma:'Art. 31º inc. b) LCE; Num. 9.3 DGE-11-CE-1'},
{cod:'8016',tipo:'CE',comp:'Caja de medición',desc:'Caja portamedidor sin cerradura',crit:'Caja abierta, sin tapa o sin cerradura, con elementos energizados en el interior.',norma:'Art. 31º inc. b) LCE; Num. 9.3 DGE-11-CE-1',vars:['Caja portamedidor sin cerradura','Caja portamedidor abierta','Caja portamedidor sin tapa']},
{cod:'8026',tipo:'CE',comp:'Caja de medición',desc:'Caja portamedidor con fijación defectuosa',crit:'Caja no empotrada o mal fijada, expuesta a manipulación.',norma:'Art. 31º inc. b) LCE; Num. 9.1 y 9.3 DGE-11-CE-1',vars:['Caja portamedidor con fijación defectuosa','Caja portamedidor sin fijación']}
];

"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tt;function toast(m,ms){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),ms||2800)}
const pad2=n=>String(n).padStart(2,'0');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

/* ================= Almacenamiento ================= */
const DB={db:null,ok:false,mem:{kv:{},recs:[]},
 open(){return new Promise(res=>{try{const r=indexedDB.open('p228app',2);
  r.onupgradeneeded=e=>{const d=r.result;if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv');if(!d.objectStoreNames.contains('recs'))d.createObjectStore('recs',{keyPath:'id',autoIncrement:true})};
  r.onsuccess=async()=>{this.db=r.result;try{await this.set('__t',1);this.ok=true}catch(e){}res()};r.onerror=()=>res();r.onblocked=()=>res()}catch(e){res()}})},
 tx(st,mode,fn){return new Promise((res,rej)=>{const t=this.db.transaction(st,mode),s=t.objectStore(st);let out;const q=fn(s);if(q)q.onsuccess=()=>out=q.result;t.oncomplete=()=>res(out);t.onerror=t.onabort=()=>rej(t.error||new Error('IndexedDB'))})},
 async get(k){return this.db?this.tx('kv','readonly',s=>s.get(k)):this.mem.kv[k]},
 async set(k,v){if(this.db)return this.tx('kv','readwrite',s=>s.put(v,k));this.mem.kv[k]=v},
 async all(){return this.db?this.tx('recs','readonly',s=>s.getAll()):this.mem.recs},
 async put(r){if(this.db){const c={...r};if(c.id==null)delete c.id;const id=await this.tx('recs','readwrite',s=>s.put(c));return id}if(r.id==null){r.id=Date.now()+Math.random();this.mem.recs.push(r)}return r.id},
 async del(id){if(this.db)return this.tx('recs','readwrite',s=>s.delete(id));this.mem.recs=this.mem.recs.filter(x=>x.id!==id)}
};

/* ================= Estado ================= */
const S={cfg:{supId:null,stamp:true,copy:true,autoBk:true,bkN:10},sups:[],cat:[],all:[],a4:null,a4meta:null,editId:null,foto:null,view:'reg',gps:null,ext:[],ptManual:null};
const sup=()=>S.sups.find(x=>x.id===S.cfg.supId);
const recs=()=>S.all.filter(r=>r.supId===S.cfg.supId);
const saveCfg=()=>DB.set('cfg',S.cfg), saveSups=()=>DB.set('sups',S.sups), saveCat=()=>DB.set('cat',S.cat);
function newSup(nombre){const o={id:uid(),nombre:nombre||'Supervisión '+new Date().toLocaleDateString('es-PE'),creada:Date.now(),anexo:'ANEXO 2',titulo:'Panel Fotográfico de las Deficiencias',sed:'',tipo:'CE',seds:[],bkCount:0,bkAt:null,supervisor:S.cfg.supervisor||''};S.sups.push(o);return o}
const sedObj=c=>(sup()?.seds||[]).find(x=>x.cod===c);
function ensureSed(cod,dist){const sp=sup();cod=(cod||'').trim().toUpperCase();if(!cod||!sp)return;let o=sedObj(cod);if(!o){o={cod,distrito:dist||''};sp.seds.push(o)}else if(dist&&o.distrito!==dist)o.distrito=dist;saveSups()}

/* ================= Base de suministros ================= */
const UBI={'160101':'Iquitos','160103':'Fernando Lores','160104':'Indiana','160105':'Las Amazonas','160112':'Belén','160113':'San Juan Bautista','160201':'Yurimaguas','160205':'Jeberos','160206':'Lagunas','160301':'Nauta','160401':'Ramón Castilla','160403':'Yavarí','160501':'Requena','160510':'Jenaro Herrera','160601':'Contamana','160701':'Barranca'};
class SumDB{constructor(text){this.lines=text.split('\n').filter(Boolean);this.lines.sort((a,b)=>this.k(a)-this.k(b));this.keys=new Float64Array(this.lines.length);this.lines.forEach((l,i)=>this.keys[i]=this.k(l))}
 k(l){return +l.slice(0,l.indexOf('\t'))}
 get size(){return this.lines.length}
 find(q){const d=String(q).replace(/\D/g,'');if(!d)return null;const k=+d;let lo=0,hi=this.keys.length-1;while(lo<=hi){const m=(lo+hi)>>1,v=this.keys[m];if(v===k){const p=this.lines[m].split('\t');return{sum:p[0],dir:p[1]||'',tit:p[2]||'',med:p[3]||'',ubi:p[4]||'',sis:p[5]||''}}if(v<k)lo=m+1;else hi=m-1}return null}}
async function gunzipB64(b64){const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 const ds=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));return await new Response(ds).text()}
async function loadSumDB(){try{const custom=await DB.get('sumdbText');S.a4meta=await DB.get('sumdbMeta');
 if(custom){S.a4=new SumDB(custom);return}
 const b64=window.SUMDB_B64||(document.getElementById('sumdb')||{}).textContent;if(b64){S.a4=new SumDB(await gunzipB64(b64.trim()));S.a4meta={nombre:'Base incluida ELOR 26/11/09 (Loreto)',count:S.a4.size,emb:true}}}catch(e){console.error(e);toast('No se pudo cargar la base de suministros')}}

/* ================= Navegación ================= */
function go(v){S.view=v;$$('.view').forEach(e=>e.hidden=e.id!=='v-'+v);$$('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
 if(v==='lista')renderList();if(v==='datos')renderDatos();if(v==='exp')renderExp();if(v==='sup')renderSup();if(v==='reg')renderBkBanner();if(v==='mapa')renderMap();window.scrollTo(0,0)}
$$('.nav button').forEach(b=>b.onclick=()=>go(b.dataset.v));
$('#supBtn').onclick=()=>go('sup');

/* ================= GPS ================= */
let gpsWatch=null;
function startGPS(){if(gpsWatch!=null||!navigator.geolocation)return renderGPS();try{gpsWatch=navigator.geolocation.watchPosition(p=>{S.gps={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy,t:Date.now()};renderGPS()},e=>{S.gpsErr=e.message||('código '+e.code);renderGPS()},{enableHighAccuracy:true,maximumAge:15000,timeout:30000})}catch(e){S.gpsErr=e.message;renderGPS()}}
function renderGPS(){renderGeo();const b=$('#gpsBox');if(!b)return;if(!S.cfg.stamp){b.textContent='';return}
 if(S.gps){const u=utm(S.gps.lat,S.gps.lon);b.innerHTML=`📍 GPS: <b>${u.txt}</b> (±${Math.round(S.gps.acc)} m)`}
 else b.innerHTML=S.gpsErr?`📍 GPS no disponible (${esc(S.gpsErr)}). Se usarán las coordenadas que traiga la foto, si las tiene.`:(navigator.geolocation?'📍 Buscando señal GPS…':'📍 Este navegador no da GPS; se usarán las coordenadas de la foto si las tiene.')}

/* UTM WGS84 */
function utm(lat,lon){const a=6378137,f=1/298.257223563,k0=.9996,e2=f*(2-f),ep2=e2/(1-e2);const zone=Math.floor((lon+180)/6)+1;const lon0=((zone-1)*6-180+3)*Math.PI/180;
 const φ=lat*Math.PI/180,λ=lon*Math.PI/180,N=a/Math.sqrt(1-e2*Math.sin(φ)**2),T=Math.tan(φ)**2,C=ep2*Math.cos(φ)**2,A=Math.cos(φ)*(λ-lon0);
 const M=a*((1-e2/4-3*e2**2/64-5*e2**3/256)*φ-(3*e2/8+3*e2**2/32+45*e2**3/1024)*Math.sin(2*φ)+(15*e2**2/256+45*e2**3/1024)*Math.sin(4*φ)-(35*e2**3/3072)*Math.sin(6*φ));
 const E=k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep2)*A**5/120)+500000;
 let Nn=k0*(M+N*Math.tan(φ)*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep2)*A**6/720));if(lat<0)Nn+=10000000;
 const band='CDEFGHJKLMNPQRSTUVWXX'[Math.floor((lat+80)/8)]||'';const e=Math.round(E),n=Math.round(Nn);return{zone,band,e,n,txt:`${zone}${band} ${e} ${n}`}}

/* ================= EXIF ================= */
function parseExif(buf){const r={};try{const v=new DataView(buf);if(v.getUint16(0)!==0xFFD8)return r;let o=2;
 while(o<v.byteLength-4){const m=v.getUint16(o);if((m&0xFF00)!==0xFF00)break;const len=v.getUint16(o+2);
  if(m===0xFFE1&&v.getUint32(o+4)===0x45786966)tiff(v,o+10,r);
  else if(m>=0xFFC0&&m<=0xFFC3&&!r.w){r.h=v.getUint16(o+5);r.w=v.getUint16(o+7)}
  if(m===0xFFDA)break;o+=2+len}}catch(e){}return r}
function tiff(v,t,r){const le=v.getUint16(t)===0x4949,g16=p=>v.getUint16(p,le),g32=p=>v.getUint32(p,le);
 const str=(e,c)=>{const p=c>4?t+g32(e+8):e+8;let s='';for(let i=0;i<c-1;i++){const ch=v.getUint8(p+i);if(!ch)break;s+=String.fromCharCode(ch)}return s};
 const rat3=e=>{const p=t+g32(e+8);const q=i=>{const d=g32(p+i*8+4);return d?g32(p+i*8)/d:0};return q(0)+q(1)/60+q(2)/3600};
 const ifd=(p,fn)=>{const n=g16(p);for(let i=0;i<n;i++){const e=p+2+i*12;fn(g16(e),e,g32(e+4))}};
 let exifP,gpsP;ifd(t+g32(t+4),(tag,e,c)=>{if(tag===0x0112)r.ori=g16(e+8);if(tag===0x8769)exifP=t+g32(e+8);if(tag===0x8825)gpsP=t+g32(e+8);if(tag===0x0132&&!r.dt)r.dt=str(e,c)});
 if(exifP)ifd(exifP,(tag,e,c)=>{if(tag===0x9003)r.dt=str(e,c)});
 if(gpsP){let la,lo,laR='N',loR='E';ifd(gpsP,(tag,e,c)=>{if(tag===1)laR=str(e,c);if(tag===2)la=rat3(e);if(tag===3)loR=str(e,c);if(tag===4)lo=rat3(e)});
  if(la!=null&&lo!=null&&(la||lo)){r.lat=laR==='S'?-la:la;r.lon=loR==='W'?-lo:lo}}}
const exifDate=s=>{const m=/^(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)/.exec(s||'');return m?new Date(+m[1],m[2]-1,+m[3],+m[4],+m[5],+m[6]):null};
const MES=['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','set.','oct.','nov.','dic.'];
function fmtFecha(d){let h=d.getHours();const ap=h<12?'a. m.':'p. m.';h=h%12||12;return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}, ${pad2(h)}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ${ap}`}

/* ================= Fotos ================= */
async function decodeImg(blob){
 const tries=[()=>createImageBitmap(blob,{imageOrientation:'from-image'}),()=>createImageBitmap(blob),
  ()=>new Promise((res,rej)=>{const i=new Image(),u=URL.createObjectURL(blob);i.onload=()=>{res(i)};i.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('img'))};i.src=u})];
 let last;for(const t of tries){try{const b=await t();if((b.width||b.naturalWidth)>0)return b}catch(e){last=e}}throw last||new Error('decode')}
async function procFoto(src){
 const {buf,type,lastMod}=src;const ex=parseExif(buf);const blob=new Blob([buf],{type:type||'image/jpeg'});
 let bmp;try{bmp=await decodeImg(blob)}catch(e){const heic=/heic|heif/i.test(type)||/ftypheic|ftypmif1|ftypheix/.test(new TextDecoder().decode(new Uint8Array(buf.slice(4,12))));
  throw new Error(heic?'La foto está en formato HEIC/HEIF. En la cámara configure el formato JPG (Ajustes de cámara → Formato → JPEG/«Más compatible»).':'El navegador no pudo leer la imagen ('+(type||'tipo desconocido')+', '+Math.round(buf.byteLength/1024)+' KB). Pruebe con «Galería / otra app».')}
 const w=bmp.width||bmp.naturalWidth,h=bmp.height||bmp.naturalHeight,k=Math.min(1,1800/Math.max(w,h));const cw=Math.round(w*k),ch=Math.round(h*k);
 const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d');g.drawImage(bmp,0,0,cw,ch);if(bmp.close)try{bmp.close()}catch(e){}
 // metadatos
 let fecha=exifDate(ex.dt),fsrc='EXIF de la foto';if(!fecha&&lastMod&&Date.now()-lastMod<86400000*60){fecha=new Date(lastMod);fsrc='fecha del archivo'}if(!fecha){fecha=new Date();fsrc='hora actual'}
 let lat=ex.lat,lon=ex.lon,gsrc='GPS de la foto';if(lat==null&&S.gps&&Date.now()-S.gps.t<180000){lat=S.gps.lat;lon=S.gps.lon;gsrc='GPS del teléfono'}
 const u=lat!=null?utm(lat,lon):null;
 if(S.cfg.stamp){const lines=[fmtFecha(fecha)];if(u)lines.push(u.txt);lines.push('Perú','Departamento de Loreto');
  const fs=Math.max(14,Math.round(Math.min(cw,ch)*0.042));g.font=`${fs}px Arial, Helvetica, sans-serif`;g.textAlign='right';g.textBaseline='top';
  const x=cw-Math.round(fs*.6);let y=Math.round(fs*.5);g.lineJoin='round';
  for(const l of lines){g.lineWidth=Math.max(2,fs/7);g.strokeStyle='rgba(0,0,0,.75)';g.strokeText(l,x,y);g.fillStyle='#fff';g.fillText(l,x,y);y+=Math.round(fs*1.2)}}
 const out=await new Promise(r=>cv.toBlob(r,'image/jpeg',.85));if(!out)throw new Error('No hay memoria suficiente para procesar la foto. Cierre otras apps e intente de nuevo.');
 return{blob:out,fw:cw,fh:ch,fecha:fecha.getTime(),fsrc,lat,lon,utm:u?u.txt:'',gsrc:u?gsrc:'sin coordenadas',stamped:!!S.cfg.stamp}}
function showFoto(){setTimeout(renderGeo,0);const pv=$('#pv');if(pv._u){URL.revokeObjectURL(pv._u);pv._u=null}
 if(S.foto){pv._u=URL.createObjectURL(S.foto.blob);pv.innerHTML=`<img src="${pv._u}">`;$('#fotoInfo').innerHTML=`🕒 ${esc(fmtFecha(new Date(S.foto.fecha)))} <span class="mut">(${esc(S.foto.fsrc)})</span><br>📍 ${S.foto.utm?esc(S.foto.utm)+' <span class="mut">('+esc(S.foto.gsrc)+')</span>':'<span class="bad">sin coordenadas</span>'}`}
 else{pv.textContent='Sin foto';$('#fotoInfo').textContent=''}}
async function onFile(e){const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
 $('#pv').textContent='Procesando…';
 try{const buf=await f.arrayBuffer();S.fotoSrc={buf,type:f.type,lastMod:f.lastModified,name:f.name};S.foto=await procFoto(S.fotoSrc);showFoto();await saveDraft()}
 catch(err){S.foto=null;showFoto();dlgMsg('No se pudo usar la foto',err.message||String(err))}}
$('#bCam').onclick=()=>$('#inCam').click();$('#bGal').onclick=()=>$('#inGal').click();$('#inCam').onchange=onFile;$('#inGal').onchange=onFile;
$('#optStamp').onchange=async()=>{S.cfg.stamp=$('#optStamp').checked;saveCfg();renderGPS();if(S.cfg.stamp)startGPS();if(S.fotoSrc){try{S.foto=await procFoto(S.fotoSrc);showFoto()}catch(e){}}};

/* Borrador: si el navegador se cierra al abrir la cámara, no se pierde lo escrito */
async function saveDraft(){if(S.editId)return;const d=collect();d.foto=S.foto;d.ts=Date.now();try{await DB.set('draft',d)}catch(e){}}
let drT;function draftSoon(){clearTimeout(drT);drT=setTimeout(saveDraft,600)}
async function restoreDraft(){const d=await DB.get('draft');if(!d||d.supId!==S.cfg.supId)return;if(!(d.cod||d.desc||d.foto))return;
 setTipo(d.tipo||'CE');$('#fSed').value=d.sed||'';$('#fDist').value=d.distrito||'';$('#fCod').value=d.cod||'';$('#fUbic').value=d.ubic||'';fillTip(d.tipV||'');if(d.tipV==='__otro')$('#fTipOtro').value=d.tip;$('#fDesc').value=d.desc||'';$('#fRef').value=d.ref||'-';
 if(d.foto){S.foto=d.foto;showFoto()}lookupA4(true);toast('Se recuperó el registro que estaba sin guardar')}
const clearDraft=()=>DB.set('draft',null).catch(()=>{});

/* ================= Formulario ================= */
function refreshLists(){const sp=sup();
 $('#dlSed').innerHTML=(sp?.seds||[]).map(s=>`<option value="${esc(s.cod)}">${esc(s.distrito)}</option>`).join('');
 $('#dlDist').innerHTML=[...new Set((sp?.seds||[]).map(s=>s.distrito).filter(Boolean))].map(d=>`<option value="${esc(d)}">`).join('');
 $('#dlUbic').innerHTML=[...new Set(recs().map(r=>r.ubic).filter(Boolean))].slice(-60).map(d=>`<option value="${esc(d)}">`).join('');
 $('#sedChip').textContent='SED: '+(sp?.sed||'—');$('#supName').textContent=sp?sp.nombre:'—';$('#nCount').textContent=recs().length;renderBkBanner()}
function setTipo(t){const sp=sup();if(sp)sp.tipo=t;$$('#tipoSeg button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 $('#lCod').textContent=t==='CE'?'N.º de suministro':t==='MT'?'Código de la instalación (estructura / SED / tramo MT)':'Código de la instalación (poste / estructura / vano)';
 $('#fCod').inputMode=t==='CE'?'numeric':'text';fillTip();lookupA4()}
const curTipo=()=>sup()?.tipo||'CE';
$$('#tipoSeg button').forEach(b=>b.onclick=()=>{setTipo(b.dataset.t);saveSups()});
function fillTip(keep){const t=curTipo(),cur=keep??$('#fTip').value;const own=S.cat.filter(c=>c.tipo===t),oth=S.cat.filter(c=>c.tipo!==t);
 const o=c=>`<option value="${esc(c.cod)}">${esc(c.cod)} — ${esc(c.desc.length>60?c.desc.slice(0,58)+'…':c.desc)}</option>`;
 $('#fTip').innerHTML='<option value="">— Seleccione tipificación —</option>'+own.map(o).join('')+(oth.length?`<optgroup label="Otras tipificaciones">${oth.map(o).join('')}</optgroup>`:'')+'<option value="__otro">Otro código…</option>';
 $('#fTip').value=[...$('#fTip').options].some(x=>x.value===cur)?cur:'';onTip(false)}
const curCat=()=>S.cat.find(c=>c.cod===$('#fTip').value);
function onTip(setDesc=true){const v=$('#fTip').value,c=curCat();$('#fTipOtro').hidden=v!=='__otro';$('#dsBox').hidden=!(c&&c.ds);
 $('#critBox').hidden=!c;if(c)$('#critBox').innerHTML=`<b>${esc(c.comp)}</b> · ${esc(c.crit)}<br><span class="mut">${esc(c.norma)}</span>`;
 $('#varBox').innerHTML=c&&c.vars?c.vars.map(x=>`<button type="button" data-v="${esc(x)}">${esc(x)}</button>`).join(''):'';
 if(setDesc){$('#fDesc').value=c?(c.vars?c.vars[0]:c.desc):'';$('#fDS').value=''}}
$('#fTip').onchange=()=>{onTip(true);draftSoon()};
$('#varBox').onclick=e=>{const b=e.target.closest('button');if(!b)return;const ds=$('#fDS').value.trim();$('#fDesc').value=b.dataset.v+(ds?`; DS=${ds.replace(',','.')} m`:'');draftSoon()};
$('#fDS').oninput=()=>{let d=$('#fDesc').value.replace(/;\s*DS\s*=.*$/i,'').trim();const v=$('#fDS').value.trim().replace(',','.');$('#fDesc').value=v?`${d}; DS=${v} m`:d;draftSoon()};
$('#fSed').onchange=()=>{const c=$('#fSed').value.trim().toUpperCase();$('#fSed').value=c;const o=sedObj(c);if(o&&o.distrito)$('#fDist').value=o.distrito;if(c&&sup()){sup().sed=c;ensureSed(c,$('#fDist').value.trim());refreshLists()}};
['#fDist','#fUbic','#fDesc','#fRef','#fTipOtro'].forEach(s=>$(s).addEventListener('input',draftSoon));
let lkT;function lookupA4(now){clearTimeout(lkT);const run=()=>{
 const box=$('#a4box');const c=$('#fCod').value.trim();box.innerHTML='';if(curTipo()!=='CE'||!c)return;
 if(!S.a4){box.innerHTML='<div class="hint">Base de suministros no disponible.</div>';return}
 if(c.replace(/\D/g,'').length<6)return;
 const r=S.a4.find(c);
 if(r){box.innerHTML=`<div class="found">✔ <b>${esc(r.dir||'(sin dirección)')}</b><br><span class="mut">${esc([r.tit,r.med?'Med. '+r.med:'',r.ubi?(UBI[r.ubi]||'ubigeo '+r.ubi):'',r.sis].filter(Boolean).join(' · '))}</span>${r.dir?`<div><button type="button" class="btn sec sm" id="bUseDir" style="margin-top:6px">↺ Usar esta dirección</button></div>`:''}</div>`;const bu=$('#bUseDir');if(bu)bu.onclick=()=>{$('#fUbic').value=r.dir;$('#fUbic').dataset.auto='1';draftSoon()};
  if(r.dir&&(!$('#fUbic').value||$('#fUbic').dataset.auto==='1')){$('#fUbic').value=r.dir;$('#fUbic').dataset.auto='1'}}
 else box.innerHTML='<div class="nf">Suministro no encontrado en la base. Verifique el número o escriba la ubicación.</div>'};
 if(now===true)run();else lkT=setTimeout(run,250)}
$('#fCod').oninput=()=>{lookupA4();draftSoon()};$('#fUbic').addEventListener('input',()=>$('#fUbic').dataset.auto='0');

function collect(){const tipV=$('#fTip').value,tip=tipV==='__otro'?$('#fTipOtro').value.trim():tipV;
 return{supId:S.cfg.supId,tipo:curTipo(),sed:$('#fSed').value.trim().toUpperCase(),distrito:$('#fDist').value.trim(),cod:$('#fCod').value.trim(),tipV,tip,desc:$('#fDesc').value.trim(),ubic:$('#fUbic').value.trim(),ref:$('#fRef').value.trim()||'-'}}
async function save(same){
 const d=collect(),miss=[];if(!d.sed)miss.push('SED');if(!d.cod)miss.push('código');if(!d.tip)miss.push('tipificación');if(!d.desc)miss.push('descripción');
 if(miss.length){toast('Falta: '+miss.join(', '));return}
 if(!S.foto&&!(await ask('¿Guardar sin foto?','Podrá agregarla después editando el registro.')))return;
 delete d.tipV;if(d.tipo==='CE'&&S.a4){const f=S.a4.find(d.cod);d.dirBase=f?f.dir:''}else d.dirBase='';ensureSed(d.sed,d.distrito);sup().sed=d.sed;
 let r;if(S.editId){r=S.all.find(x=>x.id===S.editId);Object.assign(r,d)}else r=Object.assign({ts:Date.now()},d);
 if(S.foto){Object.assign(r,{foto:S.foto.blob,fw:S.foto.fw,fh:S.foto.fh,fecha:S.foto.fecha})}
 const pt=curPt();if(pt){const u=utm(pt.lat,pt.lon);Object.assign(r,{lat:pt.lat,lon:pt.lon,utm:u.txt,gsrc:pt.src})}
 try{const id=await DB.put(r);if(!S.editId){r.id=id;S.all.push(r)}}catch(e){dlgMsg('¡No se pudo guardar!','Error del almacenamiento: '+(e.message||e)+'. Haga un respaldo de inmediato.');return}
 if(S.foto&&S.cfg.copy&&S.foto.isNew!==false){dl(S.foto.blob,`P228_${safe(sup().nombre)}_${safe(d.sed)}_${safe(d.cod)}_${d.tip}_${stampName(S.foto.fecha)}.jpg`)}
 const wasEdit=!!S.editId;S.editId=null;await saveSups();await clearDraft();refreshLists();
 toast(wasEdit?'Cambios guardados':`Guardada ✔ · ${recs().length} registros`);
 resetForm(same?{keepCod:true}:{});if(wasEdit)go('lista')}
function resetForm(o={}){const sp=sup();S.foto=null;S.fotoSrc=null;S.ptManual=null;$('#fUbic').dataset.auto='1';showFoto();$('#editBanner').hidden=true;$('#editBtns').hidden=true;$('#bSaveSame').hidden=false;
 if(!o.keepCod){$('#fCod').value='';$('#fUbic').value='';$('#a4box').innerHTML=''}
 $('#fRef').value='-';$('#fDS').value='';$('#fDesc').value=$('#fDesc').value.replace(/;\s*DS\s*=.*$/i,'').trim();
 if(o.keepCod){$('#fTip').value='';onTip(false);$('#fDesc').value=''}
 $('#fSed').value=sp?.sed||'';const so=sedObj(sp?.sed);if(so)$('#fDist').value=so.distrito||'';
 setTipo(curTipo());if(o.keepCod)lookupA4(true)}
$('#bSave').onclick=()=>save(false);$('#bSaveSame').onclick=()=>save(true);
$('#bCancel').onclick=()=>{S.editId=null;resetForm();go('lista')};
$('#bDel').onclick=async()=>{if(!(await ask('¿Eliminar esta deficiencia?','Se borrará el registro y su foto.')))return;const id=S.editId;await DB.del(id);S.all=S.all.filter(r=>r.id!==id);S.editId=null;refreshLists();resetForm();toast('Eliminada');go('lista')};
function editRec(id){const r=S.all.find(x=>x.id===id);if(!r)return;S.editId=id;setTipo(r.tipo);
 $('#fSed').value=r.sed;$('#fDist').value=r.distrito;$('#fCod').value=r.cod;$('#fUbic').value=r.ubic;$('#fUbic').dataset.auto='0';
 if(!S.cat.some(c=>c.cod===r.tip)){fillTip('__otro');$('#fTipOtro').value=r.tip}else fillTip(r.tip);
 $('#fDesc').value=r.desc;$('#fRef').value=r.ref||'-';S.ptManual=r.lat!=null?{lat:r.lat,lon:r.lon,src:'guardada'}:null;S.fotoSrc=null;S.foto=r.foto?{blob:r.foto,fw:r.fw,fh:r.fh,fecha:r.fecha||r.ts,fsrc:'guardada',lat:r.lat,lon:r.lon,utm:r.utm||'',gsrc:'guardada',isNew:false}:null;showFoto();
 const n=planNumbers().get(id);$('#editBanner').hidden=false;$('#editBanner').textContent=`Editando · Foto N.º ${pad2(n)}`;
 $('#editBtns').hidden=false;$('#bSaveSame').hidden=true;go('reg');lookupA4(true)}

/* ================= Lista ================= */
function renderList(){const sel=$('#flSed'),cur=sel.value,R=recs();sel.innerHTML='<option value="">Todas las SED</option>'+[...new Set(R.map(r=>r.sed))].map(s=>`<option>${esc(s)}</option>`).join('');sel.value=cur;
 const q=$('#flQ').value.toLowerCase(),t=$('#flTipo').value,s=sel.value,nums=planNumbers();
 const rs=R.filter(r=>(!s||r.sed===s)&&(!t||r.tipo===t)&&(!q||[r.cod,r.desc,r.ubic,r.tip,r.sed].join(' ').toLowerCase().includes(q))).sort((a,b)=>nums.get(a.id)-nums.get(b.id));
 $('#lista').innerHTML=rs.length?rs.map(r=>`<div class="item" data-id="${r.id}">${r.foto?`<img data-id="${r.id}" alt="">`:'<div class="ph">sin foto</div>'}<div><div class="t">${pad2(nums.get(r.id))} · ${esc(r.cod)}</div><div><span class="tag ${r.tipo}">${r.tipo}</span><span class="tag">${esc(r.tip)}</span><span class="tag">${esc(r.sed)}</span></div><div class="s">${esc(r.desc)}</div><div class="s">${esc(r.ubic)}</div></div></div>`).join(''):'<div class="card mut">Aún no hay deficiencias en esta supervisión.</div>';
 $$('#lista img[data-id]').forEach(i=>{const r=S.all.find(x=>x.id==i.dataset.id);i.src=URL.createObjectURL(r.foto);i.onload=()=>URL.revokeObjectURL(i.src)})}
$('#lista').onclick=e=>{const it=e.target.closest('.item');if(it)editRec(+it.dataset.id||it.dataset.id)};
['#flSed','#flTipo'].forEach(s=>$(s).onchange=renderList);$('#flQ').oninput=renderList;

/* ================= Diálogos ================= */
function dlg(html){const d=$('#dlg');d.innerHTML=html;if(!d.open)d.showModal();return d}
function dlgMsg(t,m){const d=dlg(`<h3>${esc(t)}</h3><p>${esc(m)}</p><div class="btns"><button class="btn" id="dOk">Entendido</button></div>`);$('#dOk').onclick=()=>d.close()}
function ask(t,m,ok='Sí',no='Cancelar'){return new Promise(res=>{const d=dlg(`<h3>${esc(t)}</h3>${m?`<p>${esc(m)}</p>`:''}<div class="btns h"><button class="btn sec" id="dNo">${esc(no)}</button><button class="btn" id="dOk">${esc(ok)}</button></div>`);$('#dNo').onclick=()=>{d.close();res(false)};$('#dOk').onclick=()=>{d.close();res(true)}})}

/* ================= Supervisiones y respaldo ================= */
function renderBkBanner(){const b=$('#bkBanner'),sp=sup();if(!b||!sp)return;const pend=recs().length-(sp.bkCount||0);
 if(S.cfg.autoBk&&pend>=S.cfg.bkN){b.hidden=false;b.innerHTML=`<span>⚠ ${pend} registros sin respaldo</span><button class="btn er sm" id="bkNow">Respaldar</button>`;$('#bkNow').onclick=backupZip}else b.hidden=true}
function renderSup(){const sp=sup();const n=recs().length;
 $('#supActual').innerHTML=sp?`<div class="t" style="font-weight:700;font-size:16px">${esc(sp.nombre)}</div><div class="mut">Supervisor: <b>${esc(sp.supervisor||'— (sin asignar)')}</b></div><div class="mut">${n} registros · ${n-(sp.bkCount||0)>0?`<span class="bad">${n-(sp.bkCount||0)} sin respaldo</span>`:'<span class="ok">respaldada</span>'}${sp.bkAt?' · último respaldo '+new Date(sp.bkAt).toLocaleString('es-PE'):''}</div><div class="btns h" style="margin-top:8px"><button class="btn sec sm" id="bSupRen">Editar nombre / supervisor</button></div>`:'';
 if(sp)$('#bSupRen').onclick=async()=>{const d=dlg(`<h3>Datos de la supervisión</h3><label>Nombre</label><input id="dN" value="${esc(sp.nombre)}"><label>Supervisor</label><input id="dS" list="dlSupv" value="${esc(sp.supervisor||'')}">${supvDatalist()}<div class="btns h"><button class="btn sec" id="dX">Cancelar</button><button class="btn" id="dOk">Guardar</button></div>`);$('#dX').onclick=()=>d.close();$('#dOk').onclick=()=>{const v=$('#dN').value.trim();if(v)sp.nombre=v;sp.supervisor=$('#dS').value.trim();S.cfg.supervisor=sp.supervisor;saveCfg();saveSups();refreshLists();renderSup();d.close()}};
 $('#supList').innerHTML=S.sups.slice().sort((a,b)=>b.creada-a.creada).map(s=>{const c=S.all.filter(r=>r.supId===s.id).length;return `<div class="sup ${s.id===S.cfg.supId?'on':''}"><div class="t">${esc(s.nombre)}</div><div class="s">${c} registros · creada ${new Date(s.creada).toLocaleDateString('es-PE')}${c-(s.bkCount||0)>0?' · <span class="bad">'+(c-(s.bkCount||0))+' sin respaldo</span>':''}</div><div class="b">${s.id!==S.cfg.supId?`<button class="btn sm" data-open="${s.id}">Abrir</button>`:'<span class="ok">● En uso</span>'}<button class="btn er sm" data-delsup="${s.id}">Eliminar</button></div></div>`}).join('');
 $('#optCopy').checked=S.cfg.copy;$('#optAutoBk').checked=S.cfg.autoBk;$('#optBkN').value=S.cfg.bkN;storageStatus()}
$('#supList').onclick=async e=>{const o=e.target.closest('[data-open]'),d=e.target.closest('[data-delsup]');
 if(o){S.cfg.supId=o.dataset.open;await saveCfg();S.editId=null;resetForm();refreshLists();renderSup();toast('Supervisión abierta')}
 if(d){const s=S.sups.find(x=>x.id===d.dataset.delsup),rs=S.all.filter(r=>r.supId===s.id);
  if(!(await ask(`¿Eliminar «${s.nombre}»?`,`Se borrarán ${rs.length} registros y sus fotos de este teléfono.${rs.length-(s.bkCount||0)>0?' ¡ATENCIÓN: tiene registros SIN respaldo!':''}`,'Continuar')))return;
  const d2=dlg(`<h3>Confirmación final</h3><p>Escriba <b>ELIMINAR</b> para confirmar.</p><input id="dC"><div class="btns h"><button class="btn sec" id="dX">Cancelar</button><button class="btn er" id="dOk">Eliminar</button></div>`);$('#dX').onclick=()=>d2.close();
  $('#dOk').onclick=async()=>{if($('#dC').value.trim().toUpperCase()!=='ELIMINAR')return;d2.close();for(const r of rs)await DB.del(r.id);S.all=S.all.filter(r=>r.supId!==s.id);S.sups=S.sups.filter(x=>x!==s);if(!S.sups.length)newSup();if(!sup())S.cfg.supId=S.sups[0].id;await saveSups();await saveCfg();resetForm();refreshLists();renderSup();toast('Supervisión eliminada')}}};
$('#bSupNew').onclick=()=>{const d=dlg(`<h3>Nueva supervisión</h3><label>Nombre (aparece en los archivos)</label><input id="dN" placeholder="Mariscal Ramón Castilla - Nov 2026"><label>Supervisor</label><input id="dS" list="dlSupv" value="${esc(S.cfg.supervisor||'')}">${supvDatalist()}<div class="hint">La supervisión actual queda guardada; puede volver a abrirla cuando quiera.</div><div class="btns h"><button class="btn sec" id="dX">Cancelar</button><button class="btn" id="dOk">Crear</button></div>`);
 $('#dX').onclick=()=>d.close();$('#dOk').onclick=async()=>{const o=newSup($('#dN').value.trim());o.supervisor=$('#dS').value.trim();S.cfg.supervisor=o.supervisor;S.cfg.supId=o.id;await saveSups();await saveCfg();d.close();resetForm();refreshLists();renderSup();toast('Supervisión creada')}};
['#optCopy','#optAutoBk','#optBkN'].forEach(s=>$(s).onchange=()=>{S.cfg.copy=$('#optCopy').checked;S.cfg.autoBk=$('#optAutoBk').checked;S.cfg.bkN=Math.max(3,+$('#optBkN').value||10);saveCfg();renderBkBanner()});
async function storageStatus(){const el=$('#stStatus');let t='';
 if(!DB.ok)t+='<span class="bad">✖ Este navegador NO está guardando datos de forma permanente.</span> ';
 try{const p=navigator.storage&&navigator.storage.persisted?await navigator.storage.persisted():null;t+=p?'<span class="ok">✔ Almacenamiento protegido</span> (el navegador no lo borrará por falta de espacio)':'Almacenamiento normal (puede pedir protección con el botón).';
  const e=navigator.storage&&navigator.storage.estimate?await navigator.storage.estimate():null;if(e)t+=`<br>Usado: ${(e.usage/1048576).toFixed(0)} MB de ${(e.quota/1048576/1024).toFixed(1)} GB disponibles.`}catch(x){}
 el.innerHTML=t+(navigator.storage&&navigator.storage.persist?' <button class="btn sec sm" id="bPersist">Proteger almacenamiento</button>':'');
 const b=$('#bPersist');if(b)b.onclick=async()=>{const ok=await navigator.storage.persist();toast(ok?'Almacenamiento protegido':'El navegador no lo concedió (en Android suele concederse si instala la app o la usa seguido)');storageStatus()}}

const stampName=t=>{const d=new Date(t);return `${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}_${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`};
const safe=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\w\-]+/g,'_').replace(/_+/g,'_').slice(0,40);
let CAPTURE=null;
function dirBase(r){if(r.dirBase)return r.dirBase;if(r.tipo!=='CE'||!S.a4)return '';const f=S.a4.find(r.cod);return f?f.dir:''}
function dl(blob,name){if(CAPTURE){CAPTURE.push({blob,name});return}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},8000)}
async function shareOrDl(blob,name,title){try{const f=new File([blob],name,{type:blob.type||'application/octet-stream'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title});return}}catch(e){if(e&&e.name==='AbortError'){dl(blob,name);return}}dl(blob,name)}
async function backupZip(){const sp=sup(),R=recs();if(!R.length){toast('No hay registros');return}toast('Preparando respaldo…',8000);
 try{const z=new JSZip(),nums=planNumbers(),rows=[];
  for(const r of R){const o={...r};delete o.foto;if(r.foto){o.fotoFile=`fotos/${pad2(nums.get(r.id))}_${safe(r.sed)}_${safe(r.cod)}_${r.tip}_${r.id}.jpg`;z.file(o.fotoFile,r.foto)}rows.push(o)}
  z.file('datos.json',JSON.stringify({app:'P228',v:2,exportado:Date.now(),sup:sp,recs:rows},null,1));
  const blob=await z.generateAsync({type:'blob',compression:'STORE'});
  const name=`Respaldo_P228_${safe(sp.nombre)}_${stampName(Date.now())}.zip`;
  sp.bkCount=R.length;sp.bkAt=Date.now();await saveSups();refreshLists();if(S.view==='sup')renderSup();
  await shareOrDl(blob,name,'Respaldo P-228 '+sp.nombre)}catch(e){console.error(e);dlgMsg('Error al respaldar',e.message||String(e))}}
$('#bBkZip').onclick=backupZip;
$('#bRestore').onclick=()=>$('#inRestore').click();
$('#inRestore').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 try{let data,z=null;if(/\.json$/i.test(f.name))data=JSON.parse(await f.text());else{z=await JSZip.loadAsync(f);data=JSON.parse(await z.file('datos.json').async('string'))}
  if(!data.recs)throw new Error('Archivo no válido');
  const sp0=data.sup||{nombre:'Restaurada',seds:[]};let tgt=S.sups.find(x=>x.id===sp0.id);
  if(tgt&&!(await ask('Esa supervisión ya existe en el teléfono',`«${tgt.nombre}». ¿Reemplazarla con el respaldo (${data.recs.length} registros)?`,'Reemplazar')))return;
  if(tgt){for(const r of S.all.filter(r=>r.supId===tgt.id))await DB.del(r.id);S.all=S.all.filter(r=>r.supId!==tgt.id);Object.assign(tgt,sp0)}else{tgt={...sp0};if(!tgt.id)tgt.id=uid();S.sups.push(tgt)}
  for(const r0 of data.recs){const r={...r0};delete r.id;delete r.fotoFile;r.supId=tgt.id;
   if(r0.fotoFile&&z&&z.file(r0.fotoFile))r.foto=new Blob([await z.file(r0.fotoFile).async('uint8array')],{type:'image/jpeg'});
   else if(typeof r0.foto==='string'&&r0.foto.startsWith('data:'))r.foto=await (await fetch(r0.foto)).blob();
   r.id=await DB.put(r);S.all.push(r)}
  tgt.bkCount=data.recs.length;S.cfg.supId=tgt.id;await saveSups();await saveCfg();resetForm();refreshLists();renderSup();toast(`Restaurado: ${data.recs.length} registros`)}
 catch(err){console.error(err);dlgMsg('No se pudo restaurar',err.message||String(err))}};

/* ================= Datos: base, SED, catálogo ================= */
function renderDatos(){const m=S.a4meta;$('#a4status').innerHTML=S.a4?`<b>${S.a4.size.toLocaleString('es-PE')}</b> suministros · ${esc(m?m.nombre:'')}`:'Sin base cargada.';$('#bA4Clear').hidden=!(m&&!m.emb);
 const sp=sup();$('#sedList').innerHTML=sp&&sp.seds.length?`<table class="t"><tr><th>SED</th><th>Distrito</th><th>Reg.</th><th></th></tr>${sp.seds.map((s,i)=>`<tr><td><b>${esc(s.cod)}</b></td><td>${esc(s.distrito)}</td><td>${recs().filter(r=>r.sed===s.cod).length}</td><td style="text-align:right"><button class="btn sec sm" data-sed="${i}">Editar</button></td></tr>`).join('')}</table>`:'<div class="mut">Aún no hay SED. Se agregan al registrar o con el botón inferior.</div>';
 renderCat()}
function renderCat(){const f=$('#catFil').value;$('#catList').innerHTML=`<table class="t">${S.cat.map((c,i)=>(!f||c.tipo===f)?`<tr><td><b>${esc(c.cod)}</b></td><td>${esc(c.tipo)}</td><td>${esc(c.desc)}</td><td style="text-align:right"><button class="btn sec sm" data-cat="${i}">Editar</button></td></tr>`:'').join('')}</table>`}
$('#catFil').onchange=renderCat;
function sedDialog(i){const sp=sup();const s=i==null?{cod:'',distrito:''}:sp.seds[i];
 const d=dlg(`<h3>${i==null?'Nueva SED':'Editar SED'}</h3><label>Cod. SED</label><input id="dC" value="${esc(s.cod)}" autocapitalize="characters"><label>Distrito / localidad</label><input id="dD" value="${esc(s.distrito)}"><div class="btns h"><button class="btn sec" id="dX">Cancelar</button>${i!=null?'<button class="btn er" id="dE">Quitar</button>':''}<button class="btn" id="dOk">Guardar</button></div>`);
 $('#dX').onclick=()=>d.close();if(i!=null)$('#dE').onclick=()=>{sp.seds.splice(i,1);saveSups();d.close();renderDatos();refreshLists()};
 $('#dOk').onclick=async()=>{const c=$('#dC').value.trim().toUpperCase();if(!c)return;const old=s.cod;s.cod=c;s.distrito=$('#dD').value.trim();if(i==null)sp.seds.push(s);
  else if(old!==c){for(const r of recs().filter(r=>r.sed===old)){r.sed=c;await DB.put(r)}if(sp.sed===old)sp.sed=c}
  for(const r of recs().filter(r=>r.sed===c&&r.distrito!==s.distrito&&s.distrito)){r.distrito=s.distrito;await DB.put(r)}
  await saveSups();d.close();renderDatos();refreshLists();if(!S.editId)resetForm({keepCod:false})}}
$('#bSedAdd').onclick=()=>sedDialog();$('#sedList').onclick=e=>{const b=e.target.closest('[data-sed]');if(b)sedDialog(+b.dataset.sed)};
$('#sedChip').onclick=()=>{const sp=sup();
 const d=dlg(`<h3>SED en supervisión</h3><div class="hint" style="margin:0 0 8px">Se aplica sola a cada nueva deficiencia.</div><select id="dS"><option value="">— elegir —</option>${sp.seds.map(s=>`<option value="${esc(s.cod)}">${esc(s.cod)}${s.distrito?' · '+esc(s.distrito):''}</option>`).join('')}</select><label>o escribir una nueva</label><input id="dN" placeholder="0801140E" autocapitalize="characters"><label>Distrito / localidad (si es nueva)</label><input id="dDi" list="dlDist"><div class="btns h"><button class="btn sec" id="dX">Cancelar</button><button class="btn" id="dOk">Usar esta SED</button></div>`);
 $('#dS').value=sp.sed;$('#dX').onclick=()=>d.close();
 $('#dOk').onclick=()=>{const n=$('#dN').value.trim().toUpperCase(),c=n||$('#dS').value;if(!c)return;if(n)ensureSed(n,$('#dDi').value.trim());sp.sed=c;saveSups();d.close();if(!S.editId){$('#fSed').value=c;const o=sedObj(c);$('#fDist').value=o?o.distrito:''}refreshLists()}};
function catDialog(i){const c=i==null?{cod:'',tipo:curTipo(),comp:'',desc:'',crit:'',norma:''}:S.cat[i];
 const d=dlg(`<h3>${i==null?'Nueva tipificación':'Tipificación '+esc(c.cod)}</h3><div class="row"><div><label>Código</label><input id="dC" value="${esc(c.cod)}" inputmode="numeric"></div><div><label>Tipo</label><select id="dT">${['CE','EBT','CBT','MT'].map(t=>`<option ${t===c.tipo?'selected':''}>${t}</option>`).join('')}</select></div></div><label>Texto corto (va al Excel/anexo)</label><textarea id="dD">${esc(c.desc)}</textarea><label>Variantes de texto (una por línea)</label><textarea id="dV">${esc((c.vars||[]).join('\n'))}</textarea><label>Criterio de identificación</label><textarea id="dCr">${esc(c.crit||'')}</textarea><label class="tg"><input type="checkbox" id="dDS" ${c.ds?'checked':''}> Pide distancia medida (DS)</label><div class="btns h"><button class="btn sec" id="dX">Cancelar</button>${i!=null?'<button class="btn er" id="dE">Eliminar</button>':''}<button class="btn" id="dOk">Guardar</button></div>`);
 $('#dX').onclick=()=>d.close();if(i!=null)$('#dE').onclick=()=>{S.cat.splice(i,1);saveCat();d.close();renderCat();fillTip()};
 $('#dOk').onclick=()=>{const cod=$('#dC').value.trim(),desc=$('#dD').value.trim();if(!cod||!desc){toast('Complete código y texto');return}
  const vars=$('#dV').value.split('\n').map(x=>x.trim()).filter(Boolean),o={...c,cod,tipo:$('#dT').value,desc,crit:$('#dCr').value.trim()};if(vars.length)o.vars=vars;else delete o.vars;o.ds=$('#dDS').checked;
  if(i==null)S.cat.push(o);else S.cat[i]=o;S.cat.sort((a,b)=>a.cod.localeCompare(b.cod));saveCat();d.close();renderCat();fillTip()}}
$('#bCatAdd').onclick=()=>catDialog();$('#catList').onclick=e=>{const b=e.target.closest('[data-cat]');if(b)catDialog(+b.dataset.cat)};
$('#bCatReset').onclick=async()=>{if(!(await ask('¿Restaurar el catálogo oficial?','Se perderán las ediciones hechas al catálogo (los registros no cambian).')))return;S.cat=JSON.parse(JSON.stringify(CAT0));saveCat();renderCat();fillTip()};

/* Importar base de suministros */
const cellVal=v=>{if(v==null)return'';if(v instanceof Date)return v.toISOString().slice(0,10);if(typeof v==='object'){if(v.richText)return v.richText.map(x=>x.text).join('');if('result'in v)return cellVal(v.result);if('text'in v)return cellVal(v.text);return String(v)}return String(v).trim()};
const RX={sum:/^\s*suministro\s*$|n[°º.]?\s*sumin|nro\.?\s*sum|cod.*sumin/i,dir:/direcci[oó]n|domicilio/i,tit:/titular|nombre|raz[oó]n/i,med:/n[uú]mero de medidor|medidor/i,ubi:/ubigeo/i,sis:/sistema/i};
$('#bA4').onclick=()=>$('#inA4').click();
$('#inA4').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;toast('Leyendo archivo…',20000);
 try{let header,iter;
  if(/\.xlsx$/i.test(f.name)){const wb=new ExcelJS.Workbook();await wb.xlsx.load(await f.arrayBuffer());const ws=[...wb.worksheets].sort((a,b)=>b.actualRowCount-a.actualRowCount)[0];const rows=[];ws.eachRow((row)=>rows.push(Array.from(row.values.slice(1),cellVal)));
   let hr=0;rows.slice(0,25).forEach((r,i)=>{if(r.some(c=>RX.sum.test(c))&&hr===0)hr=i});header=rows[hr];iter=rows.slice(hr+1)}
  else{const txt=await f.text();const lines=txt.split(/\r?\n/);const sep=(lines[0].match(/\t/g)||[]).length?'\t':((lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?';':',');
   header=lines[0].split(sep).map(x=>x.replace(/^"|"$/g,'').trim());iter={[Symbol.iterator]:function*(){for(let i=1;i<lines.length;i++)if(lines[i])yield lines[i].split(sep).map(x=>x.replace(/^"|"$/g,'').trim())}}}
  const idx=k=>header.findIndex(h=>RX[k].test(h));const I={sum:idx('sum'),dir:idx('dir'),tit:idx('tit'),med:idx('med'),ubi:idx('ubi'),sis:idx('sis')};
  if(I.tit===I.dir)I.tit=header.findIndex((h,i)=>i!==I.dir&&RX.tit.test(h));
  if(I.sum<0||I.dir<0)throw new Error('No se encontraron las columnas «Suministro» y «Dirección».');
  const onlyL=$('#optLoreto').checked,out=[];const cl=s=>String(s||'').replace(/\s+/g,' ').trim();
  for(const r of iter){const s=String(r[I.sum]||'').replace(/\D/g,'').replace(/^0+/,'');if(!s)continue;const ub=I.ubi>=0?cl(r[I.ubi]):'';if(onlyL&&I.ubi>=0&&!ub.startsWith('16'))continue;
   out.push([s,cl(r[I.dir]),I.tit>=0?cl(r[I.tit]):'',I.med>=0?cl(r[I.med]):'',ub,I.sis>=0?cl(r[I.sis]):''].join('\t'))}
  if(!out.length)throw new Error('No se encontraron suministros'+(onlyL?' de Loreto':''));
  const text=out.join('\n');S.a4=new SumDB(text);S.a4meta={nombre:f.name+' · '+new Date().toLocaleDateString('es-PE'),count:S.a4.size};await DB.set('sumdbText',text);await DB.set('sumdbMeta',S.a4meta);renderDatos();toast(`Base actualizada: ${S.a4.size.toLocaleString('es-PE')} suministros`)}
 catch(err){console.error(err);dlgMsg('No se pudo importar',err.message||String(err))}};
$('#bA4Clear').onclick=async()=>{await DB.set('sumdbText',null);await DB.set('sumdbMeta',null);S.a4=null;S.a4meta=null;await loadSumDB();renderDatos();toast('Se usa la base incluida')};

/* ================= Plan del anexo ================= */
function buildPlan(){const items=[{t:'cover'}];let n=0;const R=recs();
 for(const tipo of ['CE','EBT','CBT','MT']){const rs=R.filter(r=>r.tipo===tipo).sort((a,b)=>(a.ts||0)-(b.ts||0));if(!rs.length)continue;
  if(tipo==='CE')items.push({t:'section',title:'Panel de deficiencias de Conexiones Eléctricas'});
  for(const sed of [...new Set(rs.map(r=>r.sed))]){items.push({t:'sed',tipo,sed});const g=rs.filter(r=>r.sed===sed);for(let i=0;i<g.length;i+=2)items.push({t:'page',recs:g.slice(i,i+2).map(r=>({r,n:++n}))})}}
 return items}
function planNumbers(){const m=new Map();buildPlan().forEach(i=>i.t==='page'&&i.recs.forEach(x=>m.set(x.r.id,x.n)));return m}
const flat=plan=>plan.filter(i=>i.t==='page').flatMap(i=>i.recs);
const bytes=async r=>r.foto?new Uint8Array(await r.foto.arrayBuffer()):null;
const fname=(pre,ext)=>`${pre}_-_${safe(sup().nombre)}.${ext}`;
function problems(){const p=[];recs().forEach(r=>{if(!r.foto)p.push(`Falta foto: ${r.cod} (${r.tip})`);if(!r.ubic)p.push(`Sin ubicación: ${r.cod}`)});return p}
function renderExp(){const sp=sup();$('#xAnexo').value=sp.anexo;$('#xTitulo').value=sp.titulo;const R=recs();
 const by={};R.forEach(r=>{(by[r.sed]=by[r.sed]||{CE:0,EBT:0,CBT:0,MT:0})[r.tipo]++});const pr=problems();
 $('#resumen').innerHTML=`<div class="mut" style="margin-bottom:6px">${esc(sp.nombre)}</div><div class="kpi"><div><b>${R.length}</b><span>deficiencias</span></div><div><b>${R.filter(r=>r.foto).length}</b><span>con foto</span></div><div><b>${Object.keys(by).length}</b><span>SED</span></div></div>`+
  (R.length?`<table class="t" style="margin-top:10px"><tr><th>SED</th><th>CE</th><th>EBT</th><th>CBT</th><th>MT</th></tr>${Object.entries(by).map(([s,v])=>`<tr><td><b>${esc(s)}</b></td><td>${v.CE}</td><td>${v.EBT}</td><td>${v.CBT}</td><td>${v.MT}</td></tr>`).join('')}</table>`:'<div class="mut" style="margin-top:8px">No hay registros para exportar.</div>')+
  (pr.length?`<div class="warn"><b>Revisar antes de exportar:</b><ul>${pr.slice(0,8).map(x=>`<li>${esc(x)}</li>`).join('')}${pr.length>8?`<li>… y ${pr.length-8} más</li>`:''}</ul></div>`:'')}
['xAnexo','xTitulo'].forEach(id=>$('#'+id).oninput=()=>{const sp=sup();sp.anexo=$('#xAnexo').value.trim()||'ANEXO 2';sp.titulo=$('#xTitulo').value.trim()||'Panel Fotográfico de las Deficiencias';saveSups()});
async function guard(fn,msg){if(!recs().length){toast('No hay deficiencias registradas');return}toast(msg,15000);try{await fn()}catch(e){console.error(e);dlgMsg('Error al generar',e.message||String(e))}}

/* ================= Georreferencia del punto ================= */
function supvDatalist(){let names=[];try{const st=JSON.parse(localStorage.getItem('osi_scrcm_state_v2')||'{}');names=(st.supervisores||[]).map(x=>x.name).filter(Boolean)}catch(e){}
 names=[...new Set([...names,...S.sups.map(x=>x.supervisor).filter(Boolean)])];return `<datalist id="dlSupv">${names.map(n=>`<option value="${esc(n)}">`).join('')}</datalist>`}
function curPt(){if(S.ptManual)return S.ptManual;if(S.foto&&S.foto.lat!=null&&S.foto.isNew!==false)return{lat:S.foto.lat,lon:S.foto.lon,src:S.foto.gsrc};if(S.gps&&Date.now()-S.gps.t<180000)return{lat:S.gps.lat,lon:S.gps.lon,src:'GPS del teléfono'};return null}
function renderGeo(){const b=$('#geoBox');if(!b)return;const p=curPt();
 b.innerHTML=`<b>📌 Georreferencia del punto:</b> ${p?`${esc(utm(p.lat,p.lon).txt)} <span class="mut">(${esc(p.src)})</span>`:'<span class="bad">sin coordenadas aún</span>'}<div class="b"><button type="button" class="btn sec sm" id="bPtGps">Fijar con GPS actual</button>${S.ptManual?'<button type="button" class="btn sec sm" id="bPtAuto">Automático</button>':''}</div>`;
 $('#bPtGps').onclick=()=>{if(!S.gps){toast('Aún no hay señal GPS');startGPS();return}S.ptManual={lat:S.gps.lat,lon:S.gps.lon,src:'GPS fijado manualmente'};renderGeo()};
 const a=$('#bPtAuto');if(a)a.onclick=()=>{S.ptManual=null;renderGeo()}}
function startGPSGeo(){if(gpsWatch==null)startGPS()}

/* ================= Mapa Observaciones ================= */
const TCOL={CE:'#D32F2F',EBT:'#1E5AA8',CBT:'#8E24AA',MT:'#EF6C00'};
let MAP=null,mapLayer=null;
function initLeaflet(){if(MAP||typeof L==='undefined')return;
 if(L.Icon&&L.Icon.Default)L.Icon.Default.imagePath='vendor/images/';
 MAP=L.map('mapObs',{zoomControl:true}).setView([-3.75,-73.25],7);
 // Misma configuración de capas que «Cambio de medidores»
 const baseLayers={
  'Calles (Esri)':L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri',maxZoom:19}),
  'Satélite (Esri)':L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri',maxZoom:19}),
  'Topográfico (Esri)':L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri',maxZoom:19}),
  'OpenStreetMap':L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19})};
 baseLayers['Calles (Esri)'].addTo(MAP);L.control.layers(baseLayers,null,{position:'topright',collapsed:false}).addTo(MAP);
 const Loc=L.Control.extend({options:{position:'topleft'},onAdd(){const d=L.DomUtil.create('div','leaflet-bar');d.innerHTML='<a href="#" title="Mi ubicación" style="font-size:16px">◎</a>';d.onclick=e=>{e.preventDefault();if(S.gps)MAP.setView([S.gps.lat,S.gps.lon],17);else{toast('Sin señal GPS');startGPS()}};return d}});MAP.addControl(new Loc());
 mapLayer=L.layerGroup().addTo(MAP)}
const ptId=r=>`${r.supId}-${r.id}`;
function myPoints(scope){const nums=planNumbers();const list=scope==='sup'?recs():S.all;
 return list.filter(r=>r.lat!=null).map(r=>{const sp=S.sups.find(x=>x.id===r.supId)||{};return{id:ptId(r),rid:r.id,own:true,item:r.supId===S.cfg.supId?nums.get(r.id):null,supervision:sp.nombre||'',supervisor:sp.supervisor||'',tipo:r.tipo,sed:r.sed,distrito:r.distrito,cod:r.cod,tip:r.tip,desc:r.desc,ubic:r.ubic,fecha:r.fecha||r.ts,lat:r.lat,lon:r.lon,foto:r.foto}})}
function mapPoints(){const src=$('#mpSrc').value,t=$('#mpTipo').value,sv=$('#mpSupv').value;let pts=[];
 if(src==='sup')pts=myPoints('sup');else if(src==='mias')pts=myPoints('all');else if(src==='todo')pts=[...myPoints('all'),...S.ext];else pts=S.ext.slice();
 return pts.filter(p=>(!t||p.tipo===t)&&(!sv||p.supervisor===sv))}
function renderMap(){
 const all=[...myPoints('all'),...S.ext];const sel=$('#mpSupv'),cur=sel.value;sel.innerHTML='<option value="">Todos los supervisores</option>'+[...new Set(all.map(p=>p.supervisor||''))].filter(Boolean).map(n=>`<option>${esc(n)}</option>`).join('');sel.value=cur;
 const exts=[...new Set(S.ext.map(p=>p.archivo))];$('#mpExtList').innerHTML=S.ext.length?`Importados: <b>${S.ext.length}</b> puntos de ${exts.length} archivo(s) (${esc(exts.join(', '))}) · <a href="#" id="mpClr">quitar importados</a>`:'Aún no hay puntos importados de otros supervisores.';
 const c=$('#mpClr');if(c)c.onclick=async e=>{e.preventDefault();if(!(await ask('¿Quitar los puntos importados?','Sus propios registros no se tocan.')))return;S.ext=[];await DB.set('extPts',[]);renderMap()};
 if(typeof L==='undefined'){$('#mpInfo').innerHTML='<span class="bad">No se encontró Leaflet (carpeta vendor/).</span>';return}
 initLeaflet();drawPoints(false);setTimeout(()=>{MAP.invalidateSize();drawPoints(true)},120)}
function drawPoints(fit){mapLayer.clearLayers();const pts=mapPoints(),drag=$('#mpDrag').checked;const sinGeo=recs().filter(r=>r.lat==null).length;
 $('#mpInfo').innerHTML=`${pts.length} puntos en el mapa${sinGeo?` · <span class="bad">${sinGeo} registros de esta supervisión sin georreferencia</span>`:''}`;
 const ll=[];
 for(const p of pts){const col=TCOL[p.tipo]||'#555';
  const html=p.own?`<div style="width:16px;height:16px;border-radius:50%;background:${col};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`:`<div style="width:16px;height:16px;border-radius:50%;background:#fff;border:4px solid ${col};box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`;
  const m=L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',html,iconSize:[16,16],iconAnchor:[8,8]}),draggable:drag&&p.own}).addTo(mapLayer);
  m.bindPopup(()=>{const u=utm(p.lat,p.lon);let img='';if(p.foto){const url=URL.createObjectURL(p.foto);img=`<img src="${url}">`;setTimeout(()=>URL.revokeObjectURL(url),60000)}
   return `<div class="pop"><b>${p.item?'Foto '+pad2(p.item)+' · ':''}${esc(p.cod)}</b> <span style="color:${col};font-weight:700">${esc(p.tipo)} ${esc(p.tip)}</span><br>${esc(p.desc)}<br><span style="color:#667">${esc(p.ubic||'')}</span><br>SED ${esc(p.sed)} · ${esc(p.distrito||'')}<br>${esc(p.supervisor||'')}${p.supervision?' · '+esc(p.supervision):''}<br>${p.fecha?esc(fmtFecha(new Date(p.fecha))):esc(p.fechaTxt||'')}<br><span style="color:#667">${u.txt}</span>${p.own&&p.item?`<br><a href="#" data-edit="${p.rid}">Editar registro</a>`:''}${img}</div>`});
  if(p.own)m.on('dragend',async()=>{const r=S.all.find(x=>x.id===p.rid);const q=m.getLatLng();r.lat=q.lat;r.lon=q.lng;r.utm=utm(q.lat,q.lng).txt;r.gsrc='ajustado en mapa';await DB.put(r);toast('Ubicación actualizada: '+r.utm)});
  ll.push([p.lat,p.lon])}
 if(fit&&ll.length)MAP.fitBounds(ll,{padding:[30,30],maxZoom:17})}
['#mpSrc','#mpTipo','#mpSupv'].forEach(s=>$(s).onchange=()=>drawPoints(true));$('#mpDrag').onchange=()=>drawPoints(false);
document.addEventListener('click',e=>{const a=e.target.closest('[data-edit]');if(a){e.preventDefault();editRec(+a.dataset.edit||a.dataset.edit)}});

/* Tabla de georreferencia (compartida por Excel del anexo, exportar puntos y consolidado) */
const GEO_H=['ID punto','Item','Supervisión','Supervisor','Tipo','Cod. SED','Distrito','Código de la Instalación','Tipificación','Descripción','Ubicación','Fecha y hora','Latitud','Longitud','Zona UTM','Este (m)','Norte (m)'];
function geoRows(pts){return pts.map(p=>{const u=utm(p.lat,p.lon);return[p.id,p.item||'',p.supervision,p.supervisor,p.tipo,p.sed,p.distrito,/^\d+$/.test(p.cod)?Number(p.cod):p.cod,p.tip,p.desc,p.ubic,p.fecha?fmtFecha(new Date(p.fecha)):(p.fechaTxt||''),+p.lat.toFixed(7),+p.lon.toFixed(7),`${u.zone}${u.band}`,u.e,u.n]})}
function addGeoSheet(wb,pts,name='Georreferencia'){const ws=wb.addWorksheet(name);const bd={top:{style:'thin'},left:{style:'thin'},bottom:{style:'thin'},right:{style:'thin'}};
 ws.addRow(GEO_H);ws.getRow(1).eachCell(c=>{c.font={bold:true};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.border=bd;c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFD9E1F2'}}});ws.getRow(1).height=32;
 geoRows(pts).forEach(r=>{const row=ws.addRow(r);row.eachCell({includeEmpty:true},c=>c.border=bd)});
 [26,6,26,24,6,11,20,16,10,48,34,24,12,12,9,10,11].forEach((w,i)=>ws.getColumn(i+1).width=w);ws.views=[{state:'frozen',ySplit:1}];ws.autoFilter={from:{row:1,column:1},to:{row:pts.length+1,column:GEO_H.length}};return ws}
async function exportMine(){const pts=myPoints('sup');if(!pts.length){toast('No hay puntos georreferenciados en esta supervisión');return}
 const wb=new ExcelJS.Workbook();addGeoSheet(wb,pts);const buf=await wb.xlsx.writeBuffer();
 await shareOrDl(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`Puntos_P228_${safe(sup().supervisor||'supervisor')}_${safe(sup().nombre)}.xlsx`,'Puntos P-228')}
function kml(pts){const x=s=>String(s??'').replace(/[<&>]/g,c=>({'<':'&lt;','&':'&amp;','>':'&gt;'}[c]));const sty=Object.entries(TCOL).map(([t,c])=>`<Style id="${t}"><IconStyle><color>ff${c.slice(5,7)}${c.slice(3,5)}${c.slice(1,3)}</color><scale>0.9</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle></Style>`).join('');
 return `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Observaciones P-228</name>${sty}${pts.map(p=>`<Placemark><name>${x(p.cod)} · ${x(p.tip)}</name><styleUrl>#${x(p.tipo)}</styleUrl><description>${x(p.desc)} | ${x(p.ubic)} | SED ${x(p.sed)} | ${x(p.supervisor)} | ${x(p.supervision)}</description><Point><coordinates>${p.lon},${p.lat},0</coordinates></Point></Placemark>`).join('')}</Document></kml>`}
async function exportAll(){const pts=[...myPoints('all'),...S.ext];if(!pts.length){toast('No hay puntos');return}
 const seen=new Set(),u=pts.filter(p=>!seen.has(p.id)&&seen.add(p.id));
 const wb=new ExcelJS.Workbook();addGeoSheet(wb,u,'Consolidado');const buf=await wb.xlsx.writeBuffer();const st=stampName(Date.now());
 dl(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`Consolidado_observaciones_P228_${st}.xlsx`);
 setTimeout(()=>dl(new Blob([kml(u)],{type:'application/vnd.google-earth.kml+xml'}),`Consolidado_observaciones_P228_${st}.kml`),700);toast(`Consolidado: ${u.length} puntos`)}
async function importPts(files){let add=0,skip=0;const known=new Set([...myPoints('all').map(p=>p.id),...S.ext.map(p=>p.id)]);
 for(const f of files){try{
  if(/\.zip$/i.test(f.name)){const z=await JSZip.loadAsync(f);const d=JSON.parse(await z.file('datos.json').async('string'));const sp=d.sup||{};
   for(const r of d.recs){if(r.lat==null)continue;const id=`${sp.id}-${r.id}`;if(known.has(id)){skip++;continue}known.add(id);S.ext.push({id,own:false,supervision:sp.nombre||'',supervisor:sp.supervisor||'',tipo:r.tipo,sed:r.sed,distrito:r.distrito,cod:r.cod,tip:r.tip,desc:r.desc,ubic:r.ubic,fecha:r.fecha||r.ts,lat:r.lat,lon:r.lon,archivo:f.name});add++}continue}
  const wb=new ExcelJS.Workbook();await wb.xlsx.load(await f.arrayBuffer());
  for(const ws of wb.worksheets){let hr=0,H=null;ws.eachRow((row,n)=>{if(H)return;const v=row.values.slice(1).map(cellVal);if(v.includes('Latitud')&&v.includes('Longitud')){H=v;hr=n}});if(!H)continue;
   const ix=k=>H.indexOf(k);ws.eachRow((row,n)=>{if(n<=hr)return;const v=row.values.slice(1).map(cellVal);const lat=parseFloat(v[ix('Latitud')]),lon=parseFloat(v[ix('Longitud')]);if(!isFinite(lat)||!isFinite(lon))return;
    const g=k=>ix(k)>=0?v[ix(k)]:'';const id=g('ID punto')||`${f.name}-${n}`;if(known.has(id)){skip++;return}known.add(id);
    S.ext.push({id,own:false,supervision:g('Supervisión'),supervisor:g('Supervisor'),tipo:g('Tipo'),sed:g('Cod. SED'),distrito:g('Distrito'),cod:g('Código de la Instalación'),tip:g('Tipificación'),desc:g('Descripción'),ubic:g('Ubicación'),fechaTxt:g('Fecha y hora'),lat,lon,archivo:f.name});add++})}}
  catch(e){console.error(e);toast('No se pudo leer '+f.name)}}
 await DB.set('extPts',S.ext);$('#mpSrc').value='todo';renderMap();toast(`Importados ${add} puntos${skip?` (${skip} repetidos omitidos)`:''}`)}
$('#mpExpMine').onclick=()=>exportMine().catch(e=>dlgMsg('Error',e.message));
$('#mpExpAll').onclick=()=>exportAll().catch(e=>dlgMsg('Error',e.message));
$('#mpImp').onclick=()=>$('#inPts').click();
$('#inPts').onchange=e=>{const fs=[...e.target.files];e.target.value='';if(fs.length)importPts(fs)};

/* Excel */
async function makeXlsx(){
 const plan=buildPlan(),rows=flat(plan);const wb=new ExcelJS.Workbook();wb.creator='Supervisión P-228';
 const ws=wb.addWorksheet('Resumen deficiencias');const bd={top:{style:'thin'},left:{style:'thin'},bottom:{style:'thin'},right:{style:'thin'}};
 const H=['Item','Distrito','Cod. SED','Tipo \nInstalación\n(EBT/CBT/CE)','Código de la\nInstalación','Tipificación','Descripción de la deficiencia','Ubicación','Dirección según\nbase de datos','Fecha y hora\nde la foto','Coordenadas UTM\n(WGS84)'];
 const W=[8,24.9,12,14,17.6,12,60,42,42,22,24];ws.getColumn(1).width=3;H.forEach((h,i)=>{ws.getColumn(i+2).width=W[i];const c=ws.getCell(2,i+2);c.value=h;c.font={bold:true,name:'Calibri',size:11};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.border=bd;c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFD9E1F2'}}});
 ws.getRow(2).height=48;
 rows.forEach(({r,n},i)=>{const row=ws.getRow(i+3);const num=/^\d+$/.test(r.cod)?Number(r.cod):r.cod;[n,r.distrito,r.sed,r.tipo,num,r.tip,r.desc,r.ubic,dirBase(r),r.fecha?fmtFecha(new Date(r.fecha)):'',r.utm||''].forEach((v,j)=>{const c=row.getCell(j+2);c.value=v;c.border=bd;c.font={name:'Calibri',size:11};c.alignment={vertical:'middle',wrapText:j>=6&&j<=8,horizontal:j>=6&&j<=8?'left':'center'}});row.getCell(7).numFmt='@'});
 ws.views=[{state:'frozen',ySplit:2}];ws.autoFilter={from:{row:2,column:2},to:{row:rows.length+2,column:12}};
 // consolidado
 const w2=wb.addWorksheet('Consolidado por SED');const tips=[...new Set(rows.map(x=>x.r.tip))].sort();const seds=[...new Set(rows.map(x=>x.r.sed))];
 w2.getColumn(1).width=3;w2.getColumn(2).width=14;w2.getColumn(3).width=24;const hdr=['Cod. SED','Distrito',...tips,'Total'];
 hdr.forEach((h,i)=>{const c=w2.getCell(2,i+2);c.value=h;c.font={bold:true};c.alignment={horizontal:'center'};c.border=bd;c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFD9E1F2'}};if(i>1)w2.getColumn(i+2).width=13});
 const colL=i=>ExcelJS.ColumnLetter?ExcelJS.ColumnLetter(i):String.fromCharCode(64+i);
 seds.forEach((s,ri)=>{const r=ri+3;const sr=rows.filter(x=>x.r.sed===s);w2.getCell(r,2).value=s;w2.getCell(r,3).value=sr[0].r.distrito;
  tips.forEach((t,ci)=>{const col=ci+4;w2.getCell(r,col).value={formula:`COUNTIFS('Resumen deficiencias'!$D:$D,$B${r},'Resumen deficiencias'!$G:$G,"${t}")`,result:sr.filter(x=>x.r.tip===t).length}});
  const tc=tips.length+4;w2.getCell(r,tc).value={formula:`SUM(D${r}:${colL(tc-1)}${r})`,result:sr.length};w2.getCell(r,tc).font={bold:true};
  for(let c=2;c<=tc;c++){w2.getCell(r,c).border=bd;if(c>3)w2.getCell(r,c).alignment={horizontal:'center'}}});
 const tr=seds.length+3;w2.getCell(tr,2).value='TOTAL';w2.getCell(tr,2).font={bold:true};
 for(let c=4;c<=tips.length+4;c++){const L=colL(c);const tot=c===tips.length+4?rows.length:rows.filter(x=>x.r.tip===tips[c-4]).length;w2.getCell(tr,c).value={formula:`SUM(${L}3:${L}${tr-1})`,result:tot};w2.getCell(tr,c).font={bold:true};w2.getCell(tr,c).alignment={horizontal:'center'}}
 for(let c=2;c<=tips.length+4;c++)w2.getCell(tr,c).border=bd;
 addGeoSheet(wb,myPoints('sup'));
 const buf=await wb.xlsx.writeBuffer();dl(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),fname('Resumen_deficiencias','xlsx'))}

/* PDF */
async function makePDF(){
 const plan=buildPlan(),{jsPDF}=window.jspdf,doc=new jsPDF({unit:'mm',format:'a4',compress:true});let first=true;
 const IMGX=50.5,IMGW=61.3,IMGH=110.8,TX=112.6,LW=33.2,VW=41.7,RH=[7.5,7.5,7.5,14,12,7.5,17,9],LH=4.3;
 const cx=(t,y,fs,font='helvetica')=>{doc.setFont(font,'bold');doc.setFontSize(fs);doc.text(t,105,y,{align:'center'})};
 for(const it of plan){if(!first)doc.addPage();first=false;
  if(it.t==='cover'){cx(sup().anexo,124,16);cx(sup().titulo,137,16)}
  else if(it.t==='section')cx(it.title,133,16);
  else if(it.t==='sed'){cx(it.tipo==='CE'?'COD SED':`DEFICIENCIAS ${it.tipo} SED`,143,40,'times');cx(it.sed,181,72,'times')}
  else for(let k=0;k<it.recs.length;k++){const {r,n}=it.recs[k],y0=25+k*(IMGH+14);
   if(r.foto){const sc=Math.min(IMGW/r.fw,IMGH/r.fh),iw=r.fw*sc,ih=r.fh*sc;doc.addImage(await bytes(r),'JPEG',IMGX+IMGW-iw,y0,iw,ih,undefined,'FAST')}
   else{doc.setDrawColor(150);doc.rect(IMGX,y0,IMGW,IMGH);doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text('Sin foto',IMGX+IMGW/2,y0+IMGH/2,{align:'center'})}
   const L=[['Foto N°',pad2(n)],['Distrito',r.distrito],['Cod. SED',r.sed],['Tipo Instalación',r.tipo],['Código de la Instalación',r.cod],['Código Deficiencia',r.tip],['Ubicación',r.ubic],['Referencia 1',r.ref||'-'],['Comentario',r.desc]];
   const hs=[...RH,IMGH-RH.reduce((a,b)=>a+b,0)];let y=y0;doc.setDrawColor(0);doc.setLineWidth(.2);
   L.forEach(([lab,val],i)=>{const h=hs[i];doc.rect(TX,y,LW,h);doc.rect(TX+LW,y,VW,h);
    doc.setFontSize(10);doc.setFont('helvetica','bold');const ll=doc.splitTextToSize(lab,LW-3);doc.text(ll,TX+LW/2,y+(h-ll.length*LH)/2+LH*.78,{align:'center'});
    doc.setFont('helvetica','normal');const vl=doc.splitTextToSize(String(val??''),VW-3);const left=i===8;
    doc.text(vl,left?TX+LW+1.5:TX+LW+VW/2,y+(h-vl.length*LH)/2+LH*.78,{align:left?'left':'center'});y+=h})}}
 dl(doc.output('blob'),fname('Anexo_Panel_fotografico','pdf'))}

/* Word */
async function makeDocx(){
 const D=window.docx,plan=buildPlan(),mm=D.convertMillimetersToTwip,kids=[];
 const none={style:D.BorderStyle.NONE,size:0,color:'FFFFFF'},nb={top:none,bottom:none,left:none,right:none},one={style:D.BorderStyle.SINGLE,size:4,color:'000000'},ab={top:one,bottom:one,left:one,right:one};
 const run=(t,o={})=>new D.TextRun({text:t,font:'Calibri',size:o.size||20,bold:!!o.b});
 const sp=(h,pb)=>new D.Paragraph({pageBreakBefore:!!pb,spacing:{before:0,after:0,line:mm(h),lineRule:D.LineRuleType.EXACT},children:[new D.TextRun({text:'',size:2})]});
 const ctr=(t,o={})=>new D.Paragraph({alignment:D.AlignmentType.CENTER,spacing:{before:0,after:o.after||0},children:[new D.TextRun({text:t,font:o.font||'Calibri',size:o.size||32,bold:true})]});
 let first=true;
 const tcell=(txt,w,o={})=>new D.TableCell({width:{size:w,type:D.WidthType.DXA},borders:ab,verticalAlign:D.VerticalAlign.CENTER,margins:{left:70,right:70,top:30,bottom:30},children:[new D.Paragraph({alignment:o.left?D.AlignmentType.LEFT:D.AlignmentType.CENTER,spacing:{before:0,after:0},children:String(txt??'').split('\n').map((l,i)=>new D.TextRun({text:l,font:'Calibri',size:20,bold:o.b,break:i?1:0}))})]});
 for(const it of plan){const pb=!first;first=false;
  if(it.t==='cover'){kids.push(sp(100),ctr(sup().anexo,{after:200}),ctr(sup().titulo))}
  else if(it.t==='section')kids.push(sp(108,pb),ctr(it.title));
  else if(it.t==='sed')kids.push(sp(92,pb),ctr(it.tipo==='CE'?'COD SED':`DEFICIENCIAS ${it.tipo} SED`,{size:80,font:'Times New Roman',after:300}),ctr(it.sed,{size:144,font:'Times New Roman'}));
  else{
   // Una página = una tabla con 2 filas de ALTO EXACTO (como el modelo): así Word siempre pone 2 fotos por hoja
   const P0={before:0,after:0};
   kids.push(new D.Paragraph({pageBreakBefore:true,spacing:{before:0,after:mm(6)},children:[new D.TextRun({text:'',size:2})]}));
   const rowsT=[];
   it.recs.forEach(({r,n},k)=>{
    let img;
    if(r.foto){const sc=Math.min(DW/r.fw,DH/r.fh),px=v=>Math.round(v/25.4*96);img=new D.Paragraph({alignment:D.AlignmentType.RIGHT,spacing:P0,children:[new D.ImageRun({type:'jpg',data:BYTES.get(r.id),transformation:{width:px(r.fw*sc),height:px(r.fh*sc)}})]})}
    else img=new D.Paragraph({alignment:D.AlignmentType.CENTER,spacing:P0,children:[run('Sin foto')]});
    const L=[['Foto N°',pad2(n)],['Distrito',r.distrito],['Cod. SED',r.sed],['Tipo\nInstalación',r.tipo],['Código de la\nInstalación',r.cod],['Código Deficiencia',r.tip],['Ubicación',r.ubic],['Referencia 1',r.ref||'-'],['Comentario',r.desc]];
    const hm=[7,7,7,11,10,7,13,7,30];
    const inner=new D.Table({width:{size:4245,type:D.WidthType.DXA},columnWidths:[1885,2360],borders:{top:one,bottom:one,left:one,right:one,insideHorizontal:one,insideVertical:one},rows:L.map(([a,b],i)=>new D.TableRow({height:{value:mm(hm[i]),rule:D.HeightRule.ATLEAST},children:[tcell(a,1885,{b:true}),tcell(b,2360,{left:i===8})]}))});
    if(k===1)rowsT.push(new D.TableRow({height:{value:mm(8),rule:D.HeightRule.EXACT},children:[new D.TableCell({borders:nb,columnSpan:2,children:[new D.Paragraph({spacing:P0,children:[new D.TextRun({text:'',size:2})]})]})]}));
    rowsT.push(new D.TableRow({cantSplit:true,height:{value:mm(112),rule:D.HeightRule.EXACT},children:[
     new D.TableCell({width:{size:mm(63),type:D.WidthType.DXA},borders:nb,margins:{right:mm(2)},children:[img]}),
     new D.TableCell({width:{size:4245,type:D.WidthType.DXA},borders:nb,verticalAlign:D.VerticalAlign.TOP,children:[inner,new D.Paragraph({spacing:P0,children:[new D.TextRun({text:'',size:2})]})]})]}))});
   kids.push(new D.Table({width:{size:mm(150),type:D.WidthType.DXA},columnWidths:[mm(63),4245],borders:{top:none,bottom:none,left:none,right:none,insideHorizontal:none,insideVertical:none},rows:rowsT}))}}
 const doc=new D.Document({creator:'Supervisión P-228',title:sup().titulo,sections:[{properties:{page:{size:{width:mm(210),height:mm(297)},margin:{top:1417,right:1274,bottom:993,left:1418}}},children:kids}]});
 dl(await D.Packer.toBlob(doc),fname('Anexo_Panel_fotografico','docx'))}
const BYTES=new Map(),DW=58,DH=106;
async function loadBytes(){BYTES.clear();for(const r of recs())if(r.foto)BYTES.set(r.id,await bytes(r))}
$('#xXlsx').onclick=()=>guard(makeXlsx,'Generando Excel…');
$('#xPdf').onclick=()=>guard(makePDF,'Generando PDF…');
$('#xDocx').onclick=()=>guard(async()=>{await loadBytes();await makeDocx()},'Generando Word…');
// «Generar los tres»: un solo ZIP (iPhone/Safari bloquea varias descargas seguidas)
$('#xAll').onclick=()=>guard(async()=>{const files=[];CAPTURE=files;try{await makeXlsx();await makePDF();await loadBytes();await makeDocx()}finally{CAPTURE=null}
 const z=new JSZip();files.forEach(f=>z.file(f.name,f.blob));const blob=await z.generateAsync({type:'blob',compression:'STORE'});
 dl(blob,fname('Anexos_P228','zip'));toast('Listo: ZIP con Excel, PDF y Word')},'Generando los tres archivos…');


/* ================= Inicio ================= */
function initUI(){$('#optStamp').checked=!!S.cfg.stamp;refreshLists();setTipo(curTipo());resetForm();go(S.view);renderGPS();startGPS()}
(async()=>{
 await DB.open();
 if(!DB.ok){const f=$('#fatal');f.hidden=false;f.textContent='⚠ ESTE NAVEGADOR NO ESTÁ GUARDANDO LOS DATOS (modo incógnito o archivo abierto desde un visor). No registre datos de campo aquí: abra la app en Chrome normal o instálela desde la web.'}
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
 const cfg=await DB.get('cfg');if(cfg)Object.assign(S.cfg,cfg);
 S.sups=(await DB.get('sups'))||[];S.cat=(await DB.get('cat'))||JSON.parse(JSON.stringify(CAT0));
 // migrar catálogo v1 (tipos[]) si existiera
 if(S.cat.length&&S.cat[0].tipos)S.cat=JSON.parse(JSON.stringify(CAT0));
 S.all=await DB.all();S.ext=(await DB.get('extPts'))||[];
 // migrar registros de la versión anterior (sin supervisión)
 const huerf=S.all.filter(r=>!r.supId);if(huerf.length||!S.sups.length){const old=await DB.get('cfg');const o=newSup(old&&old.nombre?old.nombre:'Supervisión 1');if(huerf.length){const seds=await DB.get('seds');if(seds)o.seds=seds;for(const r of huerf){r.supId=o.id;await DB.put(r)}}S.cfg.supId=S.cfg.supId&&S.sups.some(x=>x.id===S.cfg.supId&&x!==o)?S.cfg.supId:o.id;await saveSups()}
 if(!sup())S.cfg.supId=S.sups[0].id;await saveCfg();
 initUI();await restoreDraft();
 await loadSumDB();if($('#fCod').value)lookupA4(true);
})();
window.addEventListener('beforeunload',e=>{if(S.foto&&!S.editId){saveDraft()}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveDraft()});
window.APP={S,DB,buildPlan,makeXlsx,makePDF,makeDocx,loadBytes,initUI,ensureSed,saveSups,saveCfg,refreshLists,recs,sup,procFoto,utm,parseExif,backupZip};

