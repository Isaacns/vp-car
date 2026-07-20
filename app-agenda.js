/* ===========================================================================
 * VP CAR by VIZIO — Módulo AGENDA / Pauta do Dia  (padrão §16 + arrastar §15)
 * Referência de UI e mecânica: Inovar Formaturas (app-pauta.js).
 *
 * DIFERENÇAS INTENCIONAIS EM RELAÇÃO AO INOVAR (correções, não cópias):
 *  1. Data real (ISO "2026-07-20") em vez de índice de dia 0-4. No Inovar a
 *     atividade reaparece toda semana; numa locadora "revisão do Onix" acontece
 *     numa data, não toda quarta.
 *  2. Seg–Sáb (§16: negócio que atende sábado inclui sábado). Locadora abre.
 *  3. Vínculo opcional com veículo/locatário — a pauta fala a língua da operação.
 *
 * LIMITAÇÃO CONHECIDA (honesta): persistência em localStorage, igual ao resto
 * do sistema hoje. §16 pede backend com tenant_id + RLS — vale quando o VP CAR
 * ganhar banco. Enquanto isso, a agenda fica no aparelho, não acompanha o usuário.
 * =========================================================================== */
(function(){
"use strict";

/* ---------- chaves de persistência ---------- */
var K_EV="vpcar_agenda_ev_v1", K_TK="vpcar_agenda_tk_v1", K_LOG="vpcar_agenda_log_v1", K_PER="vpcar_agenda_per_v1";

var EV=null, TK=null, LOG=null;
var _weekOff=0, _resp="__todos__";

var DIAS=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
var PERIODOS=[["manha","Manhã","🌅"],["tarde","Tarde","☀️"],["noite","Noite","🌙"]];
var ST={pendente:{c:"var(--warn)",l:"Pendente"},andamento:{c:"var(--info)",l:"Em andamento"},concluida:{c:"var(--ok)",l:"Concluída"}};

function esc(s){return (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function escA(s){return (s==null?"":String(s)).replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function W(){return window.VP?VP.WORK:{};}
function quem(){try{return (VP.session&&(VP.session.nome||VP.session.user))||"Usuário";}catch(e){return "Usuário";}}
function rd(k,fb){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v==null?fb:v;}catch(e){return fb;}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function load(){if(EV===null)EV=rd(K_EV,[]);if(TK===null)TK=rd(K_TK,[]);if(LOG===null)LOG=rd(K_LOG,[]);}
function saveEV(){wr(K_EV,EV);} function saveTK(){wr(K_TK,TK);}
function addLog(acao,alvo,antes){
  LOG.unshift({ts:Date.now(),user:quem(),acao:acao,texto:alvo,antes:antes||""});
  if(LOG.length>400)LOG=LOG.slice(0,400);
  wr(K_LOG,LOG);
}
function nextId(l){var m=0;(l||[]).forEach(function(x){if(+x.id>m)m=+x.id;});return m+1;}

/* ---------- datas ---------- */
function mondayOf(d){var x=new Date(d);var w=x.getDay();x.setDate(x.getDate()+(w===0?-6:1-w));x.setHours(0,0,0,0);return x;}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function dm(d){return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0");}
function hojeISO(){return iso(new Date());}
function dISO(s){var p=String(s||"").split("-");return new Date(+p[0],(+p[1]||1)-1,+p[2]||1);}

/* ---------- períodos ---------- */
function periodoDe(hora){var h=parseInt(String(hora||"").slice(0,2),10);if(isNaN(h))return "manha";return h<12?"manha":(h<18?"tarde":"noite");}
function periodoAtual(){var h=new Date().getHours();return h<12?"manha":(h<18?"tarde":"noite");}
function periodoNome(p){return p==="manha"?"Manhã":(p==="tarde"?"Tarde":"Noite");}
function horaDefault(p){return p==="manha"?"09:00":(p==="tarde"?"14:00":"19:00");}
function perState(){var s=rd(K_PER,null);if(s&&typeof s==="object")return s;var c=periodoAtual();return {manha:c!=="manha",tarde:c!=="tarde",noite:c!=="noite"};}

/* ---------- cronometragem das etapas ---------- */
function stamp(t,status){t.stamps=t.stamps||[];t.stamps.push({s:status,ts:Date.now()});}
function tAtual(t){var s=(t.stamps||[]);if(!s.length)return null;return Date.now()-s[s.length-1].ts;}
function tExec(t){/* soma o tempo que o cartão passou em "andamento" */
  var s=(t.stamps||[]),tot=0;
  for(var i=0;i<s.length;i++){if(s[i].s==="andamento"){var fim=s[i+1]?s[i+1].ts:Date.now();tot+=fim-s[i].ts;}}
  return tot||null;
}
function fmtDur(ms){
  if(ms==null)return "";
  var min=Math.floor(ms/60000);
  if(min<1)return "menos de 1 min";
  if(min<60)return min+" min";
  var h=Math.floor(min/60);
  if(h<24)return h+"h"+(min%60?" "+(min%60)+"min":"");
  var d=Math.floor(h/24);return d+(d===1?" dia":" dias")+(h%24?" "+(h%24)+"h":"");
}

/* ---------- equipe ---------- */
function equipe(){return ((W().usuarios)||[]).map(function(u){return u.nome;});}
function respOk(x){return _resp==="__todos__"||x.resp===_resp;}

/* ---------- CSS (identidade do próprio sistema: carbono + ouro) ---------- */
function injectCSS(){
  if(document.getElementById("ag-css"))return;
  var c=
  ".agweek{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}"+
  "@media(max-width:1200px){.agweek{grid-template-columns:repeat(3,1fr)}}"+
  "@media(max-width:760px){.agweek{grid-template-columns:1fr}}"+
  ".agday{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);padding:10px;min-height:96px}"+
  ".agday.today{border-color:var(--gold);box-shadow:0 0 0 2px rgba(199,169,107,.16)}"+
  ".agday-h{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px;padding-bottom:7px;border-bottom:1px solid var(--line)}"+
  ".agday-h b{font-size:.82rem;color:var(--txt)}.agday-h .dt{font-size:.74rem;color:var(--mut);font-weight:600;margin-left:6px}"+
  ".agday.today .agday-h b{color:var(--gold)}"+
  ".agday-add{border:1px dashed var(--line-2);background:none;color:var(--mut);border-radius:8px;width:26px;height:26px;cursor:pointer;font-weight:700;line-height:1;flex:none}"+
  ".agday-add:hover{border-color:var(--gold);color:var(--gold)}"+
  ".agper{border:1px solid transparent;border-radius:10px;margin-bottom:4px;padding:1px 2px 2px}"+
  ".agper-h{display:flex;align-items:center;gap:6px;font-size:.66rem;font-weight:800;color:var(--mut);padding:5px 7px;cursor:pointer;border-radius:8px;text-transform:uppercase;letter-spacing:.04em;user-select:none}"+
  ".agper-h:hover{background:rgba(255,255,255,.04)}"+
  ".agper-now{background:var(--gold);color:var(--ink-btn);border-radius:999px;padding:0 7px;font-size:.58rem;letter-spacing:.02em}"+
  ".agper-n{margin-left:auto;background:var(--raise);color:var(--sec);border-radius:999px;padding:0 8px;font-size:.62rem}"+
  ".agper-cv{color:var(--mut-2);font-size:.68rem}"+
  ".agper.col .agper-body{display:none}"+
  ".agper.cur{background:rgba(199,169,107,.06);border-color:rgba(199,169,107,.26)}"+
  ".agper.drop-ok{outline:2px dashed var(--gold);outline-offset:-2px;background:rgba(199,169,107,.1)}"+
  ".agev{position:relative;background:var(--card-2);border-left:3px solid var(--gold);border-radius:8px;padding:7px 9px;margin-bottom:6px;cursor:pointer;transition:background .12s}"+
  ".agev:hover{background:var(--raise)}"+
  ".agev[draggable=true]{cursor:grab}.agev.dragging,.agtk.dragging{opacity:.45}"+
  ".agev .eh{font-size:.66rem;font-weight:800;color:var(--gold);letter-spacing:.03em}"+
  ".agev .et{font-size:.79rem;color:var(--txt);line-height:1.35;margin-top:2px;word-break:break-word}"+
  ".agev .em{font-size:.68rem;color:var(--mut);margin-top:3px}"+
  ".agev .est{display:inline-block;margin-top:5px;font-size:.56rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-radius:999px;padding:1px 7px}"+
  ".agev .eed{position:absolute;top:5px;right:6px;font-size:.7rem;opacity:0;transition:opacity .12s;color:var(--mut)}"+
  ".agev:hover .eed{opacity:.8}"+
  ".agev .etk{margin-top:6px;font-size:.62rem;font-weight:700;color:var(--gold);background:rgba(199,169,107,.14);border:0;border-radius:6px;padding:3px 8px;cursor:pointer}"+
  ".agev .etk:hover{background:rgba(199,169,107,.26)}"+
  ".agvazio{font-size:.72rem;color:var(--mut-2);padding:5px 2px}"+
  ".agkb{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}@media(max-width:900px){.agkb{grid-template-columns:1fr}}"+
  ".agcol{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);padding:11px;min-height:120px}"+
  ".agcol.drop-ok{outline:2px dashed var(--gold);outline-offset:-4px;background:rgba(199,169,107,.08)}"+
  ".agcol h4{font-size:.74rem;font-weight:800;display:flex;align-items:center;gap:7px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--sec)}"+
  ".agcol h4 .dot{width:9px;height:9px;border-radius:50%;flex:none}"+
  ".agtk{border:1px solid var(--line);border-left:3px solid var(--mut);border-radius:9px;padding:9px 11px;margin-bottom:8px;background:var(--card-2)}"+
  ".agtk[draggable=true]{cursor:grab}"+
  ".agtk .t{font-size:.83rem;font-weight:600;color:var(--txt);line-height:1.35}"+
  ".agtk .m{font-size:.68rem;color:var(--mut);margin-top:3px}"+
  ".agtk .btns{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}"+
  ".agfocus{display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--sec);background:rgba(199,169,107,.07);border:1px solid rgba(199,169,107,.22);border-radius:10px;padding:9px 13px;margin-bottom:12px}"+
  ".agnav{display:flex;align-items:center;gap:8px;flex-wrap:wrap}"+
  ".aghint{font-size:.73rem;color:var(--mut-2);margin:2px 0 10px}"+
  ".agdrop{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;gap:10px;padding:12px 16px 14px;background:rgba(11,11,13,.94);backdrop-filter:blur(10px);box-shadow:0 -10px 34px rgba(0,0,0,.5)}"+
  ".agdz{flex:1;text-align:center;padding:15px 8px;border:2px dashed;border-radius:12px;font-weight:800;font-size:.88rem;transition:filter .1s}"+
  ".agdz:hover{filter:brightness(1.45)}";
  var s=document.createElement("style");s.id="ag-css";s.textContent=c;document.head.appendChild(s);
}

/* ---------- render ---------- */
function ctxLabel(e){
  var out=[];
  if(e.veiculoId&&window.VP&&VP.vNome){try{out.push("🚗 "+VP.vNome(e.veiculoId));}catch(x){}}
  if(e.locatarioId&&window.VP&&VP.lNome){try{out.push("👤 "+VP.lNome(e.locatarioId));}catch(x){}}
  return out.join(" · ");
}
function renderEv(e){
  var st=ST[e.status||"pendente"];
  var ctx=ctxLabel(e);
  return '<div class="agev" draggable="true" style="border-left-color:'+st.c+'"'+
    ' ondragstart="AGENDA.dragEv(event,'+e.id+')" ondragend="AGENDA.dragEnd(event)" onclick="AGENDA.editar('+e.id+')">'+
    '<span class="eed">✎</span>'+
    '<div class="eh">'+esc(e.hora||"—")+(e.tkId?' ⚡':'')+'</div>'+
    '<div class="et">'+esc(e.texto)+'</div>'+
    (ctx?'<div class="em">'+esc(ctx)+'</div>':'')+
    '<span class="est" style="background:color-mix(in srgb,'+st.c+' 18%,transparent);color:'+st.c+'">'+st.l+'</span>'+
    (e.tkId?'':'<button class="etk" title="Mandar para o quadro de tarefas" onclick="event.stopPropagation();AGENDA.paraTarefa('+e.id+',\'pendente\')">➕ Tarefa</button>')+
  '</div>';
}
function renderTk(t){
  var st=ST[t.status||"pendente"];
  var b="";
  if(t.status==="pendente")b='<button class="b-sm" onclick="AGENDA.mover('+t.id+',\'andamento\')">▶ Iniciar</button>';
  else if(t.status==="andamento")b='<button class="b-sm" onclick="AGENDA.mover('+t.id+',\'concluida\')">✓ Concluir</button><button class="b-sm" onclick="AGENDA.mover('+t.id+',\'pendente\')">↩ Voltar</button>';
  else b='<button class="b-sm" onclick="AGENDA.mover('+t.id+',\'andamento\')">↩ Reabrir</button>';
  b+='<button class="b-danger" onclick="AGENDA.delTarefa('+t.id+')">🗑</button>';
  var hint="";
  if(t.status==="pendente"){var a=tAtual(t);if(a!=null)hint='<div class="m">⏳ aguardando há '+fmtDur(a)+'</div>';}
  else if(t.status==="andamento"){var b2=tAtual(t);if(b2!=null)hint='<div class="m">▶ em execução há '+fmtDur(b2)+'</div>';}
  else{var c=tExec(t);if(c!=null)hint='<div class="m">⏱ levou '+fmtDur(c)+'</div>';}
  return '<div class="agtk" draggable="true" style="border-left-color:'+st.c+'"'+
    ' ondragstart="AGENDA.dragTk(event,'+t.id+')" ondragend="AGENDA.dragEnd(event)">'+
    '<div class="t">'+esc(t.titulo)+'</div>'+
    '<div class="m">'+esc(t.resp||"—")+'</div>'+hint+
    '<div class="btns">'+b+'</div></div>';
}
function board(){
  return ["pendente","andamento","concluida"].map(function(k){
    var its=(TK||[]).filter(function(t){return t.status===k&&respOk(t);});
    var cards=its.map(renderTk).join("")||'<div class="agvazio">Arraste uma atividade da agenda para cá, ou use o botão ➕ Tarefa.</div>';
    return '<div class="agcol" ondragover="AGENDA.allow(event)" ondragenter="AGENDA.allow(event)" ondragleave="AGENDA.dragLeave(event)" ondrop="AGENDA.dropCol(event,\''+k+'\')">'+
      '<h4><span class="dot" style="background:'+ST[k].c+'"></span>'+ST[k].l+'<span style="margin-left:auto;color:var(--mut)">'+its.length+'</span></h4>'+cards+'</div>';
  }).join("");
}

function rAgenda(v){
  injectCSS();load();
  var base=mondayOf(new Date());base.setDate(base.getDate()+_weekOff*7);
  var hj=hojeISO(), curP=periodoAtual(), pst=perState();
  var eqp=equipe();
  var meus=(EV||[]).filter(respOk);

  var dias=DIAS.map(function(nome,i){
    var d=new Date(base);d.setDate(base.getDate()+i);
    var k=iso(d);
    var evs=meus.filter(function(e){return e.data===k;})
                .sort(function(a,b){return String(a.hora).localeCompare(String(b.hora));});
    var pers=PERIODOS.map(function(P){
      var pe=evs.filter(function(e){return periodoDe(e.hora)===P[0];});
      var isCur=(P[0]===curP&&k===hj);
      var col=pst[P[0]]&&pe.length>0;
      return '<div class="agper'+(col?" col":"")+(isCur?" cur":"")+'"'+
        ' ondragover="AGENDA.allow(event)" ondragenter="AGENDA.allow(event)" ondragleave="AGENDA.dragLeave(event)"'+
        ' ondrop="AGENDA.dropDia(event,\''+k+'\',\''+P[0]+'\')">'+
        '<div class="agper-h" onclick="AGENDA.togPer(\''+P[0]+'\')"><span>'+P[2]+'</span><b>'+P[1]+'</b>'+
          (isCur?'<span class="agper-now">agora</span>':'')+
          '<span class="agper-n">'+pe.length+'</span><span class="agper-cv">'+(col?"▸":"▾")+'</span></div>'+
        '<div class="agper-body">'+(pe.map(renderEv).join("")||'<div class="agvazio">—</div>')+'</div></div>';
    }).join("");
    return '<div class="agday'+(k===hj?" today":"")+'">'+
      '<div class="agday-h"><span><b>'+nome+'</b><span class="dt">'+dm(d)+'</span></span>'+
      '<button class="agday-add" title="Adicionar atividade" onclick="AGENDA.novo(\''+k+'\')">＋</button></div>'+pers+'</div>';
  }).join("");

  var fim=new Date(base);fim.setDate(base.getDate()+5);
  var abertas=(TK||[]).filter(function(t){return respOk(t)&&t.status!=="concluida";}).length;

  v.innerHTML=
  '<div class="panel" style="margin-bottom:16px">'+
    '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">'+
      '<div style="flex:1;min-width:230px">'+
        '<h3>Pauta da semana · '+dm(base)+' a '+dm(fim)+'</h3>'+
        '<div class="ph">'+meus.length+' atividade(s) na semana · '+abertas+' tarefa(s) em aberto · clique numa atividade para editar</div>'+
      '</div>'+
      '<div class="agnav">'+
        '<select onchange="AGENDA.resp(this.value)" style="min-width:150px"><option value="__todos__"'+(_resp==="__todos__"?" selected":"")+'>Toda a equipe</option>'+
          eqp.map(function(n){return '<option'+(n===_resp?" selected":"")+'>'+esc(n)+'</option>';}).join("")+'</select>'+
        '<button class="b-sm" onclick="AGENDA.semana(-1)" title="Semana anterior">‹</button>'+
        '<button class="b-sm" onclick="AGENDA.semana(0)">Hoje</button>'+
        '<button class="b-sm" onclick="AGENDA.semana(1)" title="Próxima semana">›</button>'+
        '<button class="b-ghost" onclick="AGENDA.daOperacao()">⚡ Puxar da operação</button>'+
        '<button class="b-ghost" onclick="AGENDA.historico()">🕓 Histórico</button>'+
        '<button class="b" onclick="AGENDA.novo(null)">+ Atividade</button>'+
      '</div>'+
    '</div>'+
  '</div>'+
  '<div class="agfocus">⏰ Agora é <b>&nbsp;'+periodoNome(curP)+'</b>&nbsp;— foque nas atividades deste período. Clique no título de Manhã / Tarde / Noite para abrir ou fechar.</div>'+
  '<div class="aghint">Arraste uma atividade para <b>outro dia ou período</b> para reagendar — ou abra a atividade e troque pelo formulário. Hoje fica destacado.</div>'+
  '<div class="agweek" style="margin-bottom:20px">'+dias+'</div>'+
  '<div class="panel" style="margin-bottom:12px"><h3>Quadro de tarefas</h3>'+
    '<div class="ph">Arraste os cartões entre <b>Pendente → Em andamento → Concluída</b>, ou use os botões. O sistema cronometra cada etapa.</div></div>'+
  '<div class="agkb">'+board()+'</div>';
}

/* ---------- criar / editar ---------- */
function fld(lab,inner){return '<label style="display:block;font-size:.78rem;font-weight:600;color:var(--sec);margin-top:11px">'+lab+inner+'</label>';}
function editar(id,dataPre){
  load();
  var e=(id!=null)?(EV||[]).find(function(x){return x.id===id;}):null;
  var eqp=equipe(), vs=(W().veiculos)||[], ls=(W().locatarios)||[];
  var dAtual=e?e.data:(dataPre||hojeISO());
  var html=
    '<h3 style="margin-bottom:4px">'+(e?"Editar atividade":"Nova atividade")+'</h3>'+
    '<div class="ph" style="margin-bottom:6px">Organize o que a operação precisa fazer — e, se fizer sentido, amarre ao veículo ou ao locatário.</div>'+
    fld("Atividade",'<textarea id="ag_txt" rows="2" style="width:100%;margin-top:4px">'+esc(e?e.texto:"")+'</textarea>')+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px">'+
      fld("Data",'<input id="ag_data" type="date" value="'+escA(dAtual)+'" style="width:100%;margin-top:4px">')+
      fld("Horário",'<input id="ag_hora" type="time" value="'+escA(e?e.hora:horaDefault(periodoAtual()))+'" style="width:100%;margin-top:4px">')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px">'+
      fld("Responsável",'<select id="ag_resp" style="width:100%;margin-top:4px">'+eqp.map(function(n){return '<option'+((e&&e.resp===n)||(!e&&n===quem())?" selected":"")+'>'+esc(n)+'</option>';}).join("")+'</select>')+
      fld("Situação",'<select id="ag_st" style="width:100%;margin-top:4px">'+["pendente","andamento","concluida"].map(function(k){return '<option value="'+k+'"'+(((e&&e.status)||"pendente")===k?" selected":"")+'>'+ST[k].l+'</option>';}).join("")+'</select>')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px">'+
      fld("Veículo (opcional)",'<select id="ag_v" style="width:100%;margin-top:4px"><option value="">—</option>'+vs.map(function(x){return '<option value="'+escA(x.id)+'"'+((e&&e.veiculoId===x.id)?" selected":"")+'>'+esc(x.placa+" · "+x.modelo)+'</option>';}).join("")+'</select>')+
      fld("Locatário (opcional)",'<select id="ag_l" style="width:100%;margin-top:4px"><option value="">—</option>'+ls.map(function(x){return '<option value="'+escA(x.id)+'"'+((e&&e.locatarioId===x.id)?" selected":"")+'>'+esc(x.nome)+'</option>';}).join("")+'</select>')+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;gap:8px;margin-top:18px">'+
      (id!=null?'<button class="b-danger" style="height:38px" onclick="AGENDA.excluir('+id+')">🗑 Excluir</button>':'<span></span>')+
      '<span style="display:flex;gap:8px"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button>'+
      '<button class="b" onclick="AGENDA.salvar('+(id==null?"null":id)+')">Salvar</button></span></div>';
  CRUD.modal?CRUD.modal(html):_fallbackModal(html);
}
function _fallbackModal(html){ /* CRUD.modal não exposto: usa o mesmo esqueleto do sistema */
  var bg=document.createElement("div");bg.className="modal-bg";bg.id="modalBg";
  bg.innerHTML='<div class="modal">'+html+'</div>';
  bg.onclick=function(ev){if(ev.target===bg)CRUD.close();};
  document.body.appendChild(bg);
}
function salvar(id){
  load();
  var txt=(document.getElementById("ag_txt").value||"").trim();
  if(!txt){alert("Descreva a atividade.");return;}
  var o={
    data:document.getElementById("ag_data").value||hojeISO(),
    hora:document.getElementById("ag_hora").value||horaDefault(periodoAtual()),
    resp:document.getElementById("ag_resp").value,
    status:document.getElementById("ag_st").value,
    veiculoId:document.getElementById("ag_v").value||"",
    locatarioId:document.getElementById("ag_l").value||"",
    texto:txt
  };
  if(id==null){
    o.id=nextId(EV);EV.push(o);saveEV();addLog("criou",o.texto);
  }else{
    var e=(EV||[]).find(function(x){return x.id===id;});if(!e){CRUD.close();return;}
    var antes=e.data+" "+e.hora+" · "+e.texto;
    Object.keys(o).forEach(function(k){e[k]=o[k];});
    /* espelha a situação na tarefa vinculada, se houver */
    if(e.tkId){var t=(TK||[]).find(function(x){return x.id===e.tkId;});if(t&&t.status!==e.status){stamp(t,e.status);t.status=e.status;saveTK();}}
    saveEV();addLog("editou",e.texto,antes);
  }
  CRUD.close();VP.refresh();
}
function excluir(id){
  load();var e=(EV||[]).find(function(x){return x.id===id;});if(!e)return;
  if(!confirm("Excluir esta atividade?\n\n"+e.hora+" — "+e.texto))return;
  addLog("excluiu",e.texto);
  EV=EV.filter(function(x){return x.id!==id;});saveEV();
  CRUD.close();VP.refresh();
}

/* ---------- tarefas ---------- */
function paraTarefa(evid,status){
  load();var e=(EV||[]).find(function(x){return x.id===evid;});if(!e)return;
  status=status||"pendente";
  var t=e.tkId?(TK||[]).find(function(x){return x.id===e.tkId;}):null;
  if(t){stamp(t,status);t.status=status;}
  else{
    t={id:nextId(TK),titulo:e.texto,resp:e.resp,status:status,evId:e.id,veiculoId:e.veiculoId||"",stamps:[],criadoEm:Date.now()};
    stamp(t,status);TK.push(t);e.tkId=t.id;
  }
  e.status=status;saveEV();saveTK();
  addLog("→ tarefa ("+ST[status].l+")",e.texto);
  VP.refresh();
}
function mover(tkid,status){
  load();var t=(TK||[]).find(function(x){return x.id===tkid;});if(!t||t.status===status)return;
  var antes=ST[t.status].l;
  stamp(t,status);t.status=status;saveTK();
  var e=t.evId?(EV||[]).find(function(x){return x.id===t.evId;}):null;
  if(e){e.status=status;saveEV();}
  addLog("tarefa "+antes+" → "+ST[status].l,t.titulo);
  VP.refresh();
}
function delTarefa(tkid){
  load();var t=(TK||[]).find(function(x){return x.id===tkid;});if(!t)return;
  if(!confirm("Excluir esta tarefa?\n\n"+t.titulo))return;
  addLog("excluiu tarefa",t.titulo);
  TK=TK.filter(function(x){return x.id!==tkid;});
  (EV||[]).forEach(function(e){if(e.tkId===tkid)delete e.tkId;});
  saveTK();saveEV();VP.refresh();
}

/* ---------- puxar itens reais da operação ---------- */
function daOperacao(){
  load();
  var itens=[],w=W();
  ((w.cobrancas)||[]).forEach(function(c){
    if(c.statusPag==="Pago"||!c.vencimento)return;
    itens.push({data:c.vencimento,hora:"09:00",texto:"Cobrança "+c.competencia+" — "+(VP.lNome?VP.lNome(c.locatarioId):"")+" ("+c.statusPag+")",veiculoId:c.veiculoId||"",locatarioId:c.locatarioId||"",chave:"cob:"+c.id});
  });
  ((w.reservas)||[]).forEach(function(r){
    if(r.status!=="Fila"&&r.status!=="Reservado")return;
    if(!r.data)return;
    itens.push({data:r.data,hora:"14:00",texto:"Retornar reserva — "+r.nome+" ("+r.veiculoDesejado+")",veiculoId:"",locatarioId:"",chave:"res:"+r.id});
  });
  var jaTem={};(EV||[]).forEach(function(e){if(e.chave)jaTem[e.chave]=1;});
  var novos=itens.filter(function(i){return !jaTem[i.chave];});
  if(!novos.length){
    CRUD.modal?CRUD.modal('<h3>Puxar da operação</h3><div class="ph" style="margin:8px 0 16px">Nada novo para trazer — as cobranças em aberto e as reservas ativas já estão na sua pauta.</div><div style="text-align:right"><button class="b" onclick="CRUD.close()">Fechar</button></div>'):alert("Nada novo para trazer.");
    return;
  }
  var lista=novos.map(function(i,ix){
    return '<label style="display:flex;gap:9px;align-items:flex-start;padding:9px 2px;border-bottom:1px solid var(--line);font-size:.84rem">'+
      '<input type="checkbox" class="ag_op" data-ix="'+ix+'" checked style="margin-top:3px">'+
      '<span><b>'+esc(dm(dISO(i.data)))+'</b> · '+esc(i.texto)+'</span></label>';
  }).join("");
  _opCache=novos;
  var html='<h3>Puxar da operação</h3>'+
    '<div class="ph" style="margin:8px 0 10px">Estes são registros <b>reais</b> do sistema — cobranças em aberto e reservas ativas. Marque o que deve virar atividade na pauta.</div>'+
    '<div style="max-height:52vh;overflow:auto;margin-bottom:14px">'+lista+'</div>'+
    '<div style="display:flex;justify-content:flex-end;gap:8px"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button>'+
    '<button class="b" onclick="AGENDA._importar()">Adicionar à pauta</button></div>';
  CRUD.modal?CRUD.modal(html):_fallbackModal(html);
}
var _opCache=[];
function _importar(){
  load();var n=0;
  document.querySelectorAll(".ag_op:checked").forEach(function(ch){
    var i=_opCache[+ch.dataset.ix];if(!i)return;
    EV.push({id:nextId(EV),data:i.data,hora:i.hora,resp:quem(),status:"pendente",texto:i.texto,veiculoId:i.veiculoId,locatarioId:i.locatarioId,chave:i.chave});
    n++;
  });
  saveEV();addLog("puxou da operação",n+" atividade(s)");
  CRUD.close();
  if(VP.toast)VP.toast(n+" atividade(s) adicionada(s) à pauta.");
  VP.refresh();
}

/* ---------- histórico ---------- */
function historico(){
  load();
  var rows=(LOG||[]).slice(0,200).map(function(l){
    var d=new Date(l.ts);
    return '<div style="border-bottom:1px solid var(--line);padding:9px 2px;font-size:.83rem">'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:baseline"><b style="color:var(--gold)">'+esc(l.acao)+'</b>'+
      '<span style="margin-left:auto;color:var(--mut);font-size:.75rem">'+d.toLocaleDateString("pt-BR")+" "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})+' · '+esc(l.user)+'</span></div>'+
      '<div style="color:var(--txt);margin-top:2px">'+esc(l.texto)+'</div>'+
      (l.antes?'<div style="color:var(--mut-2);font-size:.75rem;margin-top:1px">antes: '+esc(l.antes)+'</div>':'')+
    '</div>';
  }).join("")||'<div class="ph" style="padding:8px 2px">Nenhuma alteração registrada ainda.</div>';
  var html='<h3>Histórico da pauta</h3><div class="ph" style="margin:8px 0 10px">Toda criação, edição, exclusão e movimento fica registrado aqui — quem fez e quando.</div>'+
    '<div style="max-height:60vh;overflow:auto">'+rows+'</div>'+
    '<div style="text-align:right;margin-top:14px"><button class="b" onclick="CRUD.close()">Fechar</button></div>';
  CRUD.modal?CRUD.modal(html,true):_fallbackModal(html);
}

/* ---------- arrastar e soltar (§15) ---------- */
var _kind=null;
function showBar(kind){
  hideBar();
  var bar=document.createElement("div");bar.className="agdrop";bar.id="agDropBar";
  var zs=[["pendente","Pendente","#D9A94C"],["andamento","Em andamento","#7d9bd1"],["concluida","Concluída","#4FB985"]];
  bar.innerHTML='<div style="color:#F2F2F3;font-weight:700;font-size:.84rem;align-self:center;margin-right:4px;white-space:nowrap">'+
    (kind==="ev"?"Solte para virar tarefa:":"Solte para mudar o status:")+'</div>'+
    zs.map(function(z){return '<div class="agdz" data-st="'+z[0]+'" style="border-color:'+z[2]+';color:'+z[2]+';background:'+z[2]+'22">'+z[1]+'</div>';}).join("");
  document.body.appendChild(bar);
  bar.querySelectorAll(".agdz").forEach(function(z){
    z.addEventListener("dragover",function(ev){ev.preventDefault();z.style.filter="brightness(1.5)";});
    z.addEventListener("dragleave",function(){z.style.filter="";});
    z.addEventListener("drop",function(ev){ev.preventDefault();ev.stopPropagation();dropCol(ev,z.getAttribute("data-st"));hideBar();});
  });
}
function hideBar(){var b=document.getElementById("agDropBar");if(b)b.remove();}
function limpar(){document.querySelectorAll(".agper.drop-ok,.agcol.drop-ok").forEach(function(x){x.classList.remove("drop-ok");});}
function dragEv(ev,id){
  _kind="ev";
  try{ev.dataTransfer.setData("text/vpev",String(id));ev.dataTransfer.setData("text/plain","vpev:"+id);ev.dataTransfer.effectAllowed="copyMove";}catch(x){}
  var el=ev.target.closest?ev.target.closest(".agev"):null;if(el)el.classList.add("dragging");
  showBar("ev");
}
function dragTk(ev,id){
  _kind="tk";
  try{ev.dataTransfer.setData("text/vptk",String(id));ev.dataTransfer.setData("text/plain","vptk:"+id);ev.dataTransfer.effectAllowed="move";}catch(x){}
  var el=ev.target.closest?ev.target.closest(".agtk"):null;if(el)el.classList.add("dragging");
  showBar("tk");
}
function dragEnd(){_kind=null;hideBar();
  document.querySelectorAll(".agev.dragging,.agtk.dragging").forEach(function(x){x.classList.remove("dragging");});limpar();}
function allow(ev){ev.preventDefault();try{ev.dataTransfer.dropEffect="move";}catch(x){}
  var z=ev.target.closest?ev.target.closest(".agper,.agcol"):null;if(z)z.classList.add("drop-ok");}
function dragLeave(ev){var z=ev.target.closest?ev.target.closest(".agper,.agcol"):null;
  if(z&&!z.contains(ev.relatedTarget))z.classList.remove("drop-ok");}
function leia(ev,tipo,pref){
  var v="";try{v=ev.dataTransfer.getData(tipo);}catch(x){}
  if(!v){var p="";try{p=ev.dataTransfer.getData("text/plain");}catch(x){}
    var m=new RegExp("^"+pref+":(\\d+)").exec(p||"");if(m)v=m[1];}
  return v;
}
/* soltar num DIA/PERÍODO — só aceita atividade; cartão de tarefa é ignorado */
function dropDia(ev,data,per){
  ev.preventDefault();limpar();
  var id=leia(ev,"text/vpev","vpev");
  if(!id)return;                                  /* tipo que não entende → ignora */
  hideBar();load();
  var e=(EV||[]).find(function(x){return x.id===+id;});if(!e)return;
  if(e.data===data&&periodoDe(e.hora)===per)return;   /* mesmo lugar → não faz nada */
  var antes=e.data+" "+e.hora;
  e.data=data;
  if(periodoDe(e.hora)!==per)e.hora=horaDefault(per); /* encaixe inteligente */
  saveEV();
  addLog("moveu para "+dm(dISO(data))+" ("+periodoNome(per)+")",e.texto,antes);
  VP.refresh();
}
/* soltar numa COLUNA do quadro — aceita tarefa (move) e atividade (vira tarefa) */
function dropCol(ev,status){
  ev.preventDefault();limpar();hideBar();
  var tk=leia(ev,"text/vptk","vptk");
  if(tk){mover(+tk,status);return;}
  var e=leia(ev,"text/vpev","vpev");
  if(e){paraTarefa(+e,status);return;}
  /* nenhum tipo conhecido → ignora */
}
function togPer(p){var s=perState();s[p]=!s[p];wr(K_PER,s);VP.refresh();}

window.AGENDA={
  novo:function(d){editar(null,d);},editar:editar,salvar:salvar,excluir:excluir,
  paraTarefa:paraTarefa,mover:mover,delTarefa:delTarefa,
  semana:function(o){if(o===0)_weekOff=0;else _weekOff+=o;VP.refresh();},
  resp:function(v){_resp=v;VP.refresh();},
  daOperacao:daOperacao,_importar:_importar,historico:historico,
  dragEv:dragEv,dragTk:dragTk,dragEnd:dragEnd,allow:allow,dragLeave:dragLeave,
  dropDia:dropDia,dropCol:dropCol,togPer:togPer
};
window.rAgenda=rAgenda;
})();
