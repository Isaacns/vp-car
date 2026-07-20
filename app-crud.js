/* ============================================================
   VP CAR · by VIZIO — CRUD + Cobrança/Bloqueio/Multas + Portal
   Identidade definitiva: Preto Carbono · Champagne Gold · Titânio.
   Documentos premium com a logo oficial e acento gold.
   ============================================================ */
(function(){
  const { fmtBRL, fmtDate, byId, vNome, lNome, toast, WA_SVG } = VP;
  const W=()=>VP.WORK;
  const API_URL="";
  function persist(modulo,acao,registro,indice){if(!API_URL)return;
    try{fetch(API_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({modulo,acao,registro,indice})});}catch(e){}}
  const uid=p=>p+Math.random().toString(36).slice(2,6).toUpperCase();
  const vOpts=()=>W().veiculos.map(v=>({v:v.id,l:`${v.placa} · ${v.modelo}`}));
  const lOpts=()=>W().locatarios.map(l=>({v:l.id,l:l.nome}));
  let PIC={};   // dataURLs de foto escolhidas no modal atual

  const SCHEMAS={
    veiculos:{titulo:"Veículo",campos:[
      {k:"placa",t:"text",lab:"Placa",req:1},{k:"modelo",t:"text",lab:"Modelo",req:1,full:1},
      {k:"ano",t:"number",lab:"Ano"},{k:"cor",t:"text",lab:"Cor"},{k:"km",t:"number",lab:"KM atual"},
      {k:"valorDiaria",t:"number",lab:"Valor diária (R$)"},{k:"plano",t:"select",lab:"Plano",op:["Diário","Semanal","Mensal"]},
      {k:"statusVeic",t:"select",lab:"Status",op:["Disponível","Alugado","Manutenção","Bloqueado"]},
      {k:"ipvaVenc",t:"date",lab:"Venc. IPVA"},{k:"seguroMensal",t:"number",lab:"Seguro mensal (R$)"},
      {k:"rastreador",t:"text",lab:"ID Rastreador"},{k:"crlvVenc",t:"date",lab:"Venc. CRLV/Licenc.",opcional:1},
      {k:"seguroVenc",t:"date",lab:"Venc. Seguro",opcional:1},{k:"locatarioId",t:"selref",lab:"Locatário",ref:lOpts,opcional:1}]},
    locatarios:{titulo:"Locatário",campos:[
      {k:"foto",t:"foto",lab:"Foto do locatário",full:1},
      {k:"nome",t:"text",lab:"Nome completo",req:1,full:1},{k:"cpf",t:"text",lab:"CPF"},
      {k:"telefone",t:"text",lab:"WhatsApp (55DDDnúmero)"},{k:"app",t:"select",lab:"App",op:["Uber","99","Uber/99","InDrive","Outro"]},
      {k:"cnh",t:"text",lab:"CNH"},{k:"cnhCat",t:"select",lab:"Categoria",op:["A","B","AB","C","D"]},
      {k:"ear",t:"select",lab:"EAR (rem.)",op:["true","false"]},{k:"cnhVenc",t:"date",lab:"Venc. CNH"},
      {k:"veiculoId",t:"selref",lab:"Veículo",ref:vOpts},{k:"plano",t:"select",lab:"Plano",op:["Diário","Semanal","Mensal"]},
      {k:"valorAluguel",t:"number",lab:"Valor aluguel (R$)"},{k:"inicio",t:"date",lab:"Início"},
      {k:"statusLoc",t:"select",lab:"Situação",op:["Ativo","Inadimplente","Inativo"]}]},
    cobrancas:{titulo:"Cobrança",campos:[
      {k:"locatarioId",t:"selref",lab:"Locatário",ref:lOpts,req:1},{k:"veiculoId",t:"selref",lab:"Veículo",ref:vOpts,req:1},
      {k:"competencia",t:"text",lab:"Competência"},{k:"vencimento",t:"date",lab:"Vencimento"},{k:"valor",t:"number",lab:"Valor (R$)"},
      {k:"statusPag",t:"select",lab:"Pagamento",op:["Pendente","Pago","Atrasado"]},
      {k:"formaPag",t:"select",lab:"Forma",op:["—","PIX","Cartão","Dinheiro","Transferência"]},
      {k:"dataPagamento",t:"date",lab:"Data pgto.",opcional:1},{k:"bloqueio",t:"select",lab:"Bloqueio",op:["Não","Agendado","Bloqueado"]}]},
    despesas:{titulo:"Despesa",campos:[
      {k:"veiculoId",t:"selref",lab:"Veículo",ref:vOpts,req:1},{k:"tipo",t:"select",lab:"Tipo",op:["IPVA","Revisão","Troca de Óleo","Troca de Pneus","Seguro","Outros"]},
      {k:"categoria",t:"select",lab:"Categoria",op:["Preventiva","Corretiva","Tributo","Fixo"]},
      {k:"data",t:"date",lab:"Data"},{k:"valor",t:"number",lab:"Valor (R$)"},{k:"km",t:"number",lab:"KM"},
      {k:"proxKm",t:"number",lab:"Próx. manut. (KM)",opcional:1},{k:"fornecedor",t:"text",lab:"Fornecedor"},{k:"obs",t:"text",lab:"Observação",full:1}]},
    multas:{titulo:"Multa",campos:[
      {k:"veiculoId",t:"selref",lab:"Veículo",ref:vOpts,req:1},{k:"locatarioId",t:"selref",lab:"Locatário",ref:lOpts,req:1},
      {k:"orgao",t:"text",lab:"Órgão"},{k:"infracao",t:"text",lab:"Infração",full:1},{k:"data",t:"date",lab:"Data"},
      {k:"local",t:"text",lab:"Local",full:1},{k:"valor",t:"number",lab:"Valor (R$)"},{k:"pontos",t:"number",lab:"Pontos"},
      {k:"gravidade",t:"select",lab:"Gravidade",op:["Leve","Média","Grave","Gravíssima"]},{k:"vencimento",t:"date",lab:"Vencimento"},
      {k:"status",t:"select",lab:"Status",op:["Pendente","Repassada","Paga","Recorrida"]},{k:"responsavel",t:"select",lab:"Responsável",op:["Locatário","Empresa"]}]},
    contratos:{titulo:"Contrato",campos:[
      {k:"locatarioId",t:"selref",lab:"Locatário",ref:lOpts,req:1},{k:"veiculoId",t:"selref",lab:"Veículo",ref:vOpts,req:1},
      {k:"plano",t:"select",lab:"Plano",op:["Diário","Semanal","Mensal"]},{k:"valor",t:"number",lab:"Valor (R$)"},
      {k:"caucao",t:"number",lab:"Caução (R$)"},{k:"caucaoStatus",t:"select",lab:"Caução",op:["Retida","Devolvida","Isenta"]},
      {k:"inicio",t:"date",lab:"Início"},{k:"fim",t:"date",lab:"Fim"},{k:"statusContrato",t:"select",lab:"Status",op:["Ativo","Suspenso","Encerrado"]}]},
    vistorias:{titulo:"Vistoria",campos:[
      {k:"veiculoId",t:"selref",lab:"Veículo",ref:vOpts,req:1},{k:"tipo",t:"select",lab:"Tipo",op:["Entrega","Devolução"]},
      {k:"data",t:"date",lab:"Data"},{k:"km",t:"number",lab:"KM"},{k:"combustivel",t:"select",lab:"Combustível",op:["Reserva","1/4","1/2","3/4","Cheio"]},
      {k:"avarias",t:"text",lab:"Avarias",full:1},{k:"responsavel",t:"text",lab:"Responsável"}]},
    reservas:{titulo:"Reserva",campos:[
      {k:"nome",t:"text",lab:"Nome",req:1,full:1},{k:"telefone",t:"text",lab:"WhatsApp (55DDDnúmero)"},
      {k:"veiculoDesejado",t:"text",lab:"Veículo desejado"},{k:"plano",t:"select",lab:"Plano",op:["Diário","Semanal","Mensal"]},
      {k:"data",t:"date",lab:"Data"},{k:"status",t:"select",lab:"Status",op:["Fila","Reservado","Convertido","Cancelado"]},
      {k:"obs",t:"text",lab:"Observação",full:1}]},
    usuarios:{titulo:"Usuário",arr:"_users",chave:"user",campos:[
      {k:"foto",t:"foto",lab:"Foto",full:1},
      {k:"nome",t:"text",lab:"Nome",req:1,full:1},{k:"user",t:"text",lab:"Usuário (login)",req:1},{k:"pass",t:"password",lab:"Senha",req:1},
      {k:"cor",t:"text",lab:"Cor do avatar (hex)"},
      {k:"perfil",t:"select",lab:"Perfil",op:["admin","operacao","master"]},{k:"roleLabel",t:"text",lab:"Rótulo do cargo"}]}
  };

  function isMoney(c){return /\(R\$\)/.test(c.lab||"");}
  function isPhone(c){return c.k==="telefone"||/whats|telefone|fone|celular/i.test(c.lab||"");}
  function fieldHtml(c,val){
    if(c.t==="foto"){const cur=val?`<img src="${val}" class="photo-prev" id="prev_${c.k}"/>`:`<div class="photo-prev" id="prev_${c.k}" style="display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:.7rem">sem foto</div>`;
      return`<div class="full"><label>${c.lab}</label><div class="photo-pick">${cur}<input type="file" accept="image/*" onchange="CRUD._pickFoto(event,'${c.k}')" style="flex:1"/></div></div>`;}
    let inp;
    if(c.t==="select")inp=`<select id="f_${c.k}">${c.op.map(o=>`<option ${String(val)===String(o)?"selected":""}>${o}</option>`).join("")}</select>`;
    else if(c.t==="selref"){const o=c.ref();inp=`<select id="f_${c.k}">${c.opcional?'<option value="">—</option>':''}${o.map(x=>`<option value="${x.v}" ${val===x.v?"selected":""}>${x.l}</option>`).join("")}</select>`;}
    else if(isMoney(c))inp=`<input id="f_${c.k}" type="text" inputmode="numeric" data-mask="brl" value="${VP.numToBRLInput(val)}" ${c.req?"required":""}/>`;
    else if(isPhone(c))inp=`<input id="f_${c.k}" type="text" inputmode="tel" data-mask="phone" value="${VP.maskPhoneBR(val)}" ${c.req?"required":""}/>`;
    else if(c.t==="password")inp=`<input id="f_${c.k}" type="password" value="${String(val).replace(/"/g,'&quot;')}" ${c.req?"required":""}/>`;
    else inp=`<input id="f_${c.k}" type="${c.t}" value="${String(val).replace(/"/g,'&quot;')}" ${c.req?"required":""}/>`;
    return`<div class="${c.full?'full':''}"><label>${c.lab}${c.req?' *':''}</label>${inp}</div>`;
  }
  function _pickFoto(e,k){const f=e.target.files[0];if(!f)return;const r=new FileReader();
    r.onload=()=>{const setPic=(out)=>{PIC[k]=out;const p=document.getElementById("prev_"+k);if(p){if(p.tagName==="IMG")p.src=out;else p.outerHTML=`<img src="${out}" class="photo-prev" id="prev_${k}"/>`;}};
      const img=new Image();
      img.onload=()=>{try{const max=320;let w=img.width,h=img.height;const sc=Math.min(1,max/Math.max(w,h)||1);w=Math.round(w*sc)||max;h=Math.round(h*sc)||max;const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);setPic(c.toDataURL("image/jpeg",0.82));}catch(err){setPic(r.result);}};
      img.onerror=()=>setPic(r.result);img.src=r.result;};
    r.readAsDataURL(f);}

  function open(mod,id){const sc=SCHEMAS[mod];if(!sc)return;PIC={};const arr=W()[sc.arr||mod];const K=sc.chave||"id";const rec=id?arr.find(x=>String(x[K])===String(id)):{};
    const fields=sc.campos.map(c=>fieldHtml(c,(rec&&rec[c.k]!=null?rec[c.k]:""))).join("");
    modal(`<h3>${id?'Editar':'Novo'} ${sc.titulo}</h3><div class="form-grid">${fields}</div>
      <div class="modal-actions"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button><button class="b" onclick="CRUD.save('${mod}','${id||''}')">Salvar</button></div>`);}
  function save(mod,id){const sc=SCHEMAS[mod];const rec={};
    for(const c of sc.campos){
      if(c.t==="foto"){if(PIC[c.k]!==undefined)rec[c.k]=PIC[c.k];continue;}
      let val=document.getElementById("f_"+c.k).value;
      if(isMoney(c))val=VP.brlToNumber(val);else if(isPhone(c))val=val.replace(/\D/g,"");else if(c.t==="number")val=parseFloat(val)||0;
      if(c.k==="ear")val=(val==="true");if(c.req&&(val===""||val==null)){toast("Preencha: "+c.lab);return;}rec[c.k]=val;}
    const arr=W()[sc.arr||mod];
    const K=sc.chave||"id";
    if(id){const i=arr.findIndex(x=>String(x[K])===String(id));
      if(i<0){toast("Registro nao encontrado.");return;}
      if(K==="id")rec.id=id;
      if(sc.arr==="_users"&&rec.nome)rec.inicial=VP.initials(rec.nome);
      arr[i]=Object.assign(arr[i],rec);persist(mod,"update",rec,i);
      if((sc.arr==="_users")&&VP.session&&VP.session.user===arr[i].user){Object.assign(VP.session,arr[i]);VP.refreshUserChip&&VP.refreshUserChip();}
      toast("Atualizado.");}
    else{if(sc.arr!=="_users")rec.id=uid(mod[0].toUpperCase());else{rec.inicial=VP.initials(rec.nome);}arr.push(rec);persist(mod,"create",rec);toast(sc.titulo+" criado.");}
    if(rec.foto&&VP.saveMediaFor){const savedId=rec.id||id;if(sc.arr==="_users")VP.saveMediaFor("users",rec.user,rec.foto);else if(mod==="locatarios")VP.saveMediaFor("locatarios",savedId,rec.foto);}
    if(mod==="cobrancas")sinc(rec);PIC={};close();VP.refresh();}
  function remove(mod,id){if(!confirm("Excluir este registro?"))return;const sc=SCHEMAS[mod];const arr=W()[sc.arr||mod];
    const K=sc.chave||"id";
    if(sc.arr==="_users"){
      if(VP.session&&VP.session.user===id){toast("Voce nao pode excluir o proprio usuario.");return;}
      const alvo=arr.find(x=>x.user===id);
      if(alvo&&alvo.master&&arr.filter(x=>x.master).length<=1){toast("Nao e possivel excluir o unico master.");return;}
    }
    const i=arr.findIndex(x=>String(x[K])===String(id));if(i>=0){arr.splice(i,1);persist(mod,"delete",{id},i);toast("Excluído.");VP.refresh();}}
  function sinc(rec){const v=byId(W().veiculos,rec.veiculoId);if(rec.bloqueio==="Bloqueado")v.statusVeic="Bloqueado";
    const l=byId(W().locatarios,rec.locatarioId);if(l.id)l.statusLoc=rec.statusPag==="Atrasado"?"Inadimplente":(rec.statusPag==="Pago"?"Ativo":l.statusLoc);}

  /* ---- Perfil / Senha ---- */
  function meuPerfil(){document.getElementById("udrop").classList.add("hidden");PIC={};
    const u=VP.session;const cur=u.foto?`<img src="${u.foto}" class="photo-prev" id="prev_foto"/>`:`<div class="photo-prev" id="prev_foto" style="display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:.7rem">sem foto</div>`;
    modal(`<h3>Meu perfil</h3><div style="margin-bottom:8px;color:var(--mut);font-size:.85rem">${u.nome} · @${u.user}</div>
      <label>Foto do perfil</label><div class="photo-pick">${cur}<input type="file" accept="image/*" onchange="CRUD._pickFoto(event,'foto')" style="flex:1"/></div>
      <div class="modal-actions"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button><button class="b" onclick="CRUD._salvarFoto()">Salvar</button></div>`);}
  function _salvarFoto(){const u=VP.session;if(PIC.foto!==undefined){u.foto=PIC.foto;const r=W()._users.find(x=>x.user===u.user);if(r)r.foto=PIC.foto;
      if(VP.saveMediaFor)VP.saveMediaFor("users",u.user,PIC.foto);VP.refreshUserChip&&VP.refreshUserChip();toast("Foto atualizada.");}PIC={};close();}
  function trocarSenha(){document.getElementById("udrop").classList.add("hidden");
    modal(`<h3>Trocar senha</h3><div class="form-grid">
      <div class="full"><label>Senha atual</label><input id="pw_cur" type="password"/></div>
      <div><label>Nova senha</label><input id="pw_new" type="password"/></div>
      <div><label>Confirmar</label><input id="pw_conf" type="password"/></div></div>
      <div class="modal-actions"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button><button class="b" onclick="CRUD._salvarSenha()">Salvar</button></div>`);}
  function _salvarSenha(){const u=VP.session,cur=document.getElementById("pw_cur").value,nw=document.getElementById("pw_new").value,cf=document.getElementById("pw_conf").value;
    if(cur!==u.pass){toast("Senha atual incorreta.");return;}if(nw.length<4){toast("Nova senha muito curta.");return;}if(nw!==cf){toast("Confirmação não confere.");return;}
    u.pass=nw;const r=W()._users.find(x=>x.user===u.user);if(r)r.pass=nw;toast("Senha alterada.");close();}

  /* ---- Portal: link exclusivo ---- */
  function copiarLink(locId){const l=byId(W().locatarios,locId);const url=VP.portalUrl(l);
    if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>toast("Link copiado: "+url)).catch(()=>prompt("Copie o link:",url));
    else prompt("Copie o link:",url);}
  function enviarLink(locId){const l=byId(W().locatarios,locId);const url=VP.portalUrl(l);
    const msg=`Olá ${l.nome.split(" ")[0]}! Este é o seu acesso exclusivo ao Portal VP CAR — acompanhe seu contrato, vencimentos e multas por aqui:\n${url}\n\nAcesso: use seu login (demo: usuário/senha 1234). VP CAR · Mobilidade Inteligente.`;
    window.open(VP.waLink(l.telefone,msg),"_blank","noopener");toast("Link enviado por WhatsApp.");}

  /* ---- Motor de cobrança/bloqueio ---- */
  function marcarPago(id){const c=W().cobrancas.find(x=>x.id===id);if(!c)return;c.statusPag="Pago";c.dataPagamento="2026-07-12";if(c.formaPag==="—")c.formaPag="PIX";
    const l=byId(W().locatarios,c.locatarioId);if(l.id)l.statusLoc="Ativo";
    const estavaBloqueado=c.bloqueio==="Bloqueado";
    if(c.bloqueio==="Agendado")c.bloqueio="Não";   // o aviso agendado deixa de valer
    persist("cobrancas","update",c);
    // o veículo só sai de "Bloqueado" quando a liberação for de fato executada e confirmada
    toast(estavaBloqueado?"✓ Pagamento confirmado. Use 🛰️ Liberar para registrar a liberação.":"✓ Pagamento confirmado.");
    VP.refresh();}
  function avisar(id){const c=W().cobrancas.find(x=>x.id===id);if(!c)return;c.bloqueio="Agendado";const l=byId(W().locatarios,c.locatarioId);
    const msg=`⚠️ VP CAR — Aviso de bloqueio. Olá ${(l.nome||"").split(" ")[0]}, o aluguel do ${vNome(c.veiculoId)} (${c.competencia}) vence ${fmtDate(c.vencimento)}: ${fmtBRL(c.valor)}. Sem a confirmação do pagamento, o veículo será BLOQUEADO via satélite em 24h. 🚗`;
    window.open(VP.waLink(l.telefone,msg),"_blank","noopener");toast("Aviso de 24h registrado.");VP.refresh();}
  /* Bloqueio: o sistema DECIDE, AVISA e REGISTRA; o corte é executado no painel do
     rastreador enquanto a API não estiver integrada (_cfg.rastreadorApi). Sem simulação. */
  function bloquear(id){const c=W().cobrancas.find(x=>x.id===id);if(!c)return;
    const v=byId(W().veiculos,c.veiculoId),l=byId(W().locatarios,c.locatarioId);
    const cfg=W()._cfg||{},painel=cfg.rastreadorPainel||"",rNome=cfg.rastreadorNome||"painel do rastreador";
    const bloqueado=c.bloqueio==="Bloqueado";
    const msg=bloqueado
      ? `✅ VP CAR — Pagamento confirmado. Seu veículo ${vNome(c.veiculoId)} está liberado. Bom trabalho! 🚗`
      : `🔒 VP CAR — O aluguel do ${vNome(c.veiculoId)} (${c.competencia}, ${fmtBRL(c.valor)}) está em atraso. Conforme contrato, o veículo será bloqueado. Regularize via PIX para liberação imediata.`;
    modal(`<h3>${bloqueado?'Liberar':'Bloquear'} veículo · ${v.placa}</h3>
      <div style="color:var(--mut);font-size:.84rem;margin-bottom:10px">${l.nome||'—'} · ${vNome(c.veiculoId)} · rastreador <b>${v.rastreador||'—'}</b></div>
      <div class="det">
        ${detRow("Situação atual",`<span class="tag ${bloqueado?'t-blk':'t-warn'}">${c.bloqueio}</span>`)}
        ${detRow("Competência",c.competencia)}
        ${detRow("Vencimento",fmtDate(c.vencimento))}
        ${detRow("Valor",`<b>${fmtBRL(c.valor)}</b>`)}
        ${c.bloqueioLog?detRow("Último registro",`${c.bloqueioLog.acao} por ${c.bloqueioLog.por} · ${fmtDate(c.bloqueioLog.data)} ${c.bloqueioLog.hora}`):""}
      </div>
      <div style="background:rgba(199,169,107,.08);border:1px solid var(--line-2);border-radius:12px;padding:12px 14px;margin-bottom:14px">
        <div style="font-weight:600;font-size:.86rem;margin-bottom:6px">Como funciona</div>
        <div style="color:var(--sec);font-size:.8rem;line-height:1.7">
          <b>1.</b> O sistema avisa o locatário e <b>registra a decisão</b> (data, hora e responsável).<br>
          <b>2.</b> Você executa o ${bloqueado?'religamento':'corte'} no <b>${rNome}</b>.<br>
          <b>3.</b> Confirme abaixo — o sistema sincroniza o status do veículo e da cobrança.
        </div>
        <div style="color:var(--mut);font-size:.73rem;margin-top:8px">Integração automática com o rastreador: prevista (Fase 2). O mesmo botão passará a enviar o comando sozinho.</div>
      </div>
      <div class="modal-actions" style="flex-wrap:wrap;gap:8px">
        <a class="b-ghost" target="_blank" rel="noopener" href="${VP.waLink(l.telefone,msg)}">Avisar por WhatsApp</a>
        ${painel?`<a class="b-ghost" target="_blank" rel="noopener" href="${painel}">Abrir ${rNome}</a>`:`<button class="b-ghost" disabled style="opacity:.5;cursor:not-allowed" title="Cadastre a URL do painel em _cfg.rastreadorPainel">Painel não configurado</button>`}
        <button class="b-ghost" onclick="CRUD.close()">Cancelar</button>
        <button class="b" onclick="CRUD._confirmarBloqueio('${id}',${bloqueado?'false':'true'})">${bloqueado?'Confirmar liberação':'Confirmar bloqueio efetuado'}</button>
      </div>`);}
  function _confirmarBloqueio(id,bloquearAgora){const c=W().cobrancas.find(x=>x.id===id);if(!c)return;
    const v=byId(W().veiculos,c.veiculoId),l=byId(W().locatarios,c.locatarioId);
    const quem=(VP.session&&VP.session.nome)||"—",hora=new Date().toTimeString().slice(0,5);
    if(bloquearAgora){c.bloqueio="Bloqueado";v.statusVeic="Bloqueado";if(l.id)l.statusLoc="Inadimplente";
      c.bloqueioLog={acao:"Bloqueado",por:quem,data:"2026-07-12",hora};
      if(VP.notif)VP.notif("bloqueio","Veículo bloqueado",`${v.placa} · ${l.nome||''} · registrado por ${quem}`,{mod:"cobranca",id:c.id});
      toast("Bloqueio registrado e status sincronizado.");}
    else{c.bloqueio="Não";if(v.statusVeic==="Bloqueado")v.statusVeic="Alugado";
      c.bloqueioLog={acao:"Liberado",por:quem,data:"2026-07-12",hora};
      if(VP.notif)VP.notif("bloqueio","Veículo liberado",`${v.placa} · ${l.nome||''} · registrado por ${quem}`,{mod:"cobranca",id:c.id});
      toast("Liberação registrada e status sincronizado.");}
    persist("cobrancas","update",c);close();VP.refresh();}
  function repassarMulta(id){const m=(W().multas||[]).find(x=>x.id===id);if(!m)return;m.status="Repassada";persist("multas","update",m);toast("Multa repassada ao locatário.");VP.refresh();}
  function reportarForm(locId){const l=byId(W().locatarios,locId);
    modal(`<h3>Reportar algo à VP CAR</h3>
      <div style="color:var(--mut);font-size:.85rem;margin-bottom:12px">${l.nome} · ${vNome(l.veiculoId)}</div>
      <div class="form-grid">
        <div><label>Data do ocorrido</label><input id="rp_data" type="date" value="2026-07-12"/></div>
        <div><label>Tipo</label><select id="rp_tipo"><option>Manutenção</option><option>Sinistro/Acidente</option><option>Dúvida</option><option>Reclamação</option><option>Outro</option></select></div>
        <div class="full"><label>O que aconteceu?</label><textarea id="rp_desc" rows="4" placeholder="Descreva com detalhes o que aconteceu..."></textarea></div>
      </div>
      <div class="modal-actions"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button><button class="b" onclick="CRUD._enviarReport('${locId}')">Enviar</button></div>`);}
  function _enviarReport(locId){const dd=document.getElementById("rp_desc").value.trim();if(!dd){toast("Descreva o que aconteceu.");return;}
    const data=document.getElementById("rp_data").value||"2026-07-12",tipo=document.getElementById("rp_tipo").value;const l=byId(W().locatarios,locId);
    W().ocorrencias=W().ocorrencias||[];W().ocorrencias.push({id:uid("O"),locatarioId:locId,veiculoId:l.veiculoId,data,tipo,descricao:dd,status:"Aberto"});
    if(VP.notif)VP.notif("report","Novo report de locatário",`${l.nome} — ${tipo}: ${dd.slice(0,60)}`,{mod:"report",id:locId});persist("ocorrencias","create",{});
    modal(`<div style="text-align:center;padding:16px 6px">
      <div style="font-size:2.8rem;margin-bottom:6px">✅</div>
      <h3 style="margin-bottom:8px">Report enviado!</h3>
      <p style="color:var(--sec);font-size:.92rem;max-width:360px;margin:0 auto 4px">Recebemos, ${l.nome.split(" ")[0]}. A equipe da VP CAR foi notificada e vai te retornar em breve pelo WhatsApp. Você acompanha o andamento aqui no seu portal.</p>
      <div class="modal-actions" style="justify-content:center"><button class="b" onclick="CRUD.close()">Voltar ao meu portal</button></div></div>`);
    VP.refresh();}
  function assumirMulta(id){const m=(W().multas||[]).find(x=>x.id===id);if(!m)return;m.ciente=true;m.cienteData="2026-07-12";const l=byId(W().locatarios,m.locatarioId);
    if(VP.notif)VP.notif("ciente","Multa assumida pelo locatário",`${l.nome} assumiu a multa: ${m.infracao} (${fmtBRL(m.valor)})`,{mod:"multas",id:m.id});persist("multas","update",m);
    toast("Você assumiu a multa. Obrigado!");VP.refresh();}
  function marcarLidas(){(W()._notificacoes||[]).forEach(n=>n.lida=true);toast("Notificações marcadas como lidas.");VP.refresh();}

  /* ---- Vistorias: galeria de fotos ---- */
  function fotos(id){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;vs.fotosArr=vs.fotosArr||[];renderGaleria(vs);}
  function renderGaleria(vs){
    const cells=(vs.fotosArr||[]).map((src,i)=>`<div class="cell"><img src="${src}" onclick="CRUD._lightbox('${vs.id}',${i})"/>
      <div class="ov"><a href="${src}" download="vistoria-${vs.id}-${i+1}.jpg" title="Baixar">⬇</a>
      <button title="Apagar" onclick="CRUD._delFoto('${vs.id}',${i})">✕</button></div></div>`).join("");
    modal(`<h3>Fotos da vistoria — ${vNome(vs.veiculoId)}</h3>
      <div style="color:var(--mut);font-size:.82rem;margin-bottom:12px">${vs.tipo} · ${fmtDate(vs.data)} · ${(vs.fotosArr||[]).length} foto(s)</div>
      <div class="gal" id="galBox">${cells||'<div class="empty" style="grid-column:1/-1">Nenhuma foto ainda. Envie abaixo.</div>'}</div>
      <div class="modal-actions" style="justify-content:space-between">
        <label class="b-ghost" style="cursor:pointer">Adicionar fotos<input type="file" accept="image/*" multiple style="display:none" onchange="CRUD._addFotos('${vs.id}',event)"/></label>
        <button class="b" onclick="CRUD.close()">Concluir</button></div>`);}
  function _addFotos(id,e){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;vs.fotosArr=vs.fotosArr||[];
    const files=[...e.target.files];let pend=files.length;if(!pend)return;
    files.forEach(f=>{const r=new FileReader();r.onload=()=>{vs.fotosArr.push(r.result);vs.fotos=vs.fotosArr.length;if(--pend===0){renderGaleria(vs);toast(files.length+" foto(s) adicionada(s).");}};r.readAsDataURL(f);});}
  function _delFoto(id,i){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;if(!confirm("Apagar esta foto?"))return;vs.fotosArr.splice(i,1);vs.fotos=vs.fotosArr.length;renderGaleria(vs);}
  function _lightbox(id,i){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;const src=vs.fotosArr[i];
    const lb=document.createElement("div");lb.className="lightbox";lb.innerHTML=`<img src="${src}"/>`;lb.onclick=()=>lb.remove();document.body.appendChild(lb);}

  /* ---- Documentos premium (identidade VP CAR) ---- */
  function printDoc(titulo,corpo,opt){opt=opt||{};const w=window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo} · VP CAR</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>@page{margin:0}
      *{box-sizing:border-box}
      body{font-family:'Inter',Arial,sans-serif;color:#1A1C1F;margin:0;font-size:12.5px}
      .page{padding:22mm 18mm 24mm;position:relative;min-height:100vh}
      .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid #1A1C1F;padding-bottom:14px}
      .hd img{height:42px}
      .hd .rt{font-size:10px;color:#8F8F96;text-align:right;letter-spacing:.02em;line-height:1.5}
      .acc{height:3px;background:linear-gradient(90deg,#C7A96B,#DcC08a 55%,transparent);margin:0 0 22px;border-radius:2px}
      .doc-t{font-size:9px;letter-spacing:.32em;color:#C7A96B;text-transform:uppercase;margin-top:20px}
      h1{font-size:22px;font-weight:600;margin:2px 0 6px;color:#0B0B0D;letter-spacing:-.01em}
      .meta{font-size:11px;color:#8F8F96;margin-bottom:18px}
      table.parts{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0 18px}
      table.parts td{padding:9px 12px;border:1px solid #E6E4DE;vertical-align:top}
      table.parts td.k{background:#F6F3EC;font-weight:600;color:#0B0B0D;width:26%;white-space:nowrap}
      .cl{margin:0 0 11px;line-height:1.7}
      .cl b{color:#0B0B0D}
      .num{color:#C7A96B;font-weight:700}
      table.grid{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0}
      table.grid th{background:#0B0B0D;color:#F8F8F8;text-align:left;padding:8px 10px;font-size:10px;letter-spacing:.05em;text-transform:uppercase;font-weight:600}
      table.grid td{padding:8px 10px;border-bottom:1px solid #ECEAE3}
      table.grid tr:nth-child(even) td{background:#FAF8F3}
      .sign{margin-top:54px;display:flex;justify-content:space-between;gap:44px}
      .sign div{flex:1;text-align:center;border-top:1px solid #1A1C1F;padding-top:7px;font-size:11px;color:#1A1C1F}
      .ft{position:fixed;bottom:10mm;left:18mm;right:18mm;display:flex;justify-content:space-between;font-size:9px;color:#B7B6B0;border-top:1px solid #ECEAE3;padding-top:7px}
      .wm{position:fixed;bottom:34%;left:50%;transform:translateX(-50%) rotate(-20deg);font-size:120px;font-weight:700;color:#C7A96B;opacity:.05;letter-spacing:.1em;pointer-events:none}
    </style></head><body><div class="page">
    <div class="hd"><img src="vpcar-preta.png" alt="VP CAR" onerror="this.style.display='none'"/>
      <div class="rt">MOBILIDADE INTELIGENTE<br>WhatsApp (77) 98113-2845 · vpcar</div></div>
    <div class="acc"></div>
    ${opt.wm?'<div class="wm">VP CAR</div>':''}
    <div class="doc-t">${opt.tag||"Documento"}</div>${corpo}
    <div class="ft"><span>VP CAR · Mobilidade Inteligente</span><span>Sistema by VIZIO — um produto INPERSON · ${fmtDate("2026-07-12")}</span></div>
    </div></body></html>`);w.document.close();setTimeout(()=>w.print(),600);}

  function contrato(id){const k=W().contratos.find(x=>x.id===id);if(!k)return;const l=byId(W().locatarios,k.locatarioId),v=byId(W().veiculos,k.veiculoId);
    printDoc("Contrato de Locação",`
      <h1>Contrato de Locação de Veículo</h1>
      <div class="meta">Contrato nº ${k.id} · Plano ${k.plano} · Vigência ${fmtDate(k.inicio)} a ${fmtDate(k.fim)}</div>
      <table class="parts">
        <tr><td class="k">Locadora</td><td>VP CAR — Mobilidade Inteligente · Locação de Veículos · WhatsApp (77) 98113-2845</td></tr>
        <tr><td class="k">Locatário(a)</td><td>${l.nome||'—'} · CPF ${l.cpf||'—'} · CNH ${l.cnh||'—'} (${l.cnhCat||'—'}${l.ear?', EAR':''}) · Tel ${l.telefone||'—'}</td></tr>
        <tr><td class="k">Veículo</td><td>${v.modelo||'—'} · Placa ${v.placa||'—'} · Ano ${v.ano||'—'} · Cor ${v.cor||'—'} · Rastreador ${v.rastreador||'—'}</td></tr>
        <tr><td class="k">Valores</td><td>Aluguel <b>${fmtBRL(k.valor)}</b> (${k.plano.toLowerCase()}) · Caução <b>${fmtBRL(k.caucao||0)}</b> (${k.caucaoStatus||'—'})</td></tr>
      </table>
      <p class="cl"><span class="num">1.</span> <b>Objeto.</b> A LOCADORA cede em locação ao LOCATÁRIO o veículo descrito, destinado ao transporte remunerado de passageiros por aplicativo (Uber, 99 e similares), exigindo-se CNH com observação EAR.</p>
      <p class="cl"><span class="num">2.</span> <b>Pagamento e bloqueio.</b> O aluguel de ${fmtBRL(k.valor)} é devido em periodicidade ${k.plano.toLowerCase()}. O não pagamento na data autoriza a LOCADORA a bloquear o veículo via rastreamento satelital, após aviso prévio de 24 (vinte e quatro) horas.</p>
      <p class="cl"><span class="num">3.</span> <b>Caução.</b> O LOCATÁRIO deposita caução de ${fmtBRL(k.caucao||0)}, devolvida ao término do contrato, descontados débitos, avarias e multas pendentes.</p>
      <p class="cl"><span class="num">4.</span> <b>Multas e infrações.</b> Multas de trânsito no período de posse são de responsabilidade do LOCATÁRIO, incluindo pontuação na CNH e indicação do condutor junto ao órgão competente.</p>
      <p class="cl"><span class="num">5.</span> <b>Conservação.</b> O veículo é entregue mediante vistoria fotografada, devendo ser devolvido nas mesmas condições, ressalvado o desgaste natural de uso.</p>
      <p class="cl"><span class="num">6.</span> <b>Rescisão.</b> O descumprimento de qualquer cláusula, em especial a inadimplência, autoriza a rescisão imediata e a retomada do veículo.</p>
      <div class="sign"><div>${k.assinatura?`<img src="${k.assinatura.img}" style="max-height:46px;display:block;margin:-42px auto 4px"/><b>${l.nome}</b><br><span style="color:#8F8F96">assinado eletronicamente em ${fmtDate(k.assinatura.data)}</span>`:(l.nome||'Locatário(a)')+'<br><span style="color:#8F8F96">Locatário(a)</span>'}</div><div>VP CAR<br><span style="color:#8F8F96">Locadora</span></div></div>`,
      {tag:"Contrato",wm:true});}

  function laudo(id){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;const v=byId(W().veiculos,vs.veiculoId);
    const fotos=(vs.fotosArr&&vs.fotosArr.length)?`<div class="doc-t" style="margin-top:18px">Registro fotográfico</div><table class="grid"><tr>${vs.fotosArr.slice(0,6).map(s=>`<td style="width:33%;padding:4px"><img src="${s}" style="width:100%;border-radius:4px"/></td>`).join("")}</tr></table>`:"";
    printDoc("Laudo de Vistoria",`
      <h1>Laudo de Vistoria — ${vs.tipo}</h1>
      <div class="meta">Vistoria nº ${vs.id} · ${fmtDate(vs.data)} · Responsável: ${vs.responsavel}</div>
      <table class="parts">
        <tr><td class="k">Veículo</td><td>${v.modelo} · Placa ${v.placa} · Ano ${v.ano} · Cor ${v.cor}</td></tr>
        <tr><td class="k">KM</td><td>${(vs.km||0).toLocaleString('pt-BR')} km</td></tr>
        <tr><td class="k">Combustível</td><td>${vs.combustivel}</td></tr>
        <tr><td class="k">Avarias</td><td>${vs.avarias||'Sem avarias'}</td></tr>
      </table>
      <p class="cl">Declaro que o veículo foi vistoriado na data acima, estando as condições registradas neste laudo e no material fotográfico correspondente. Este documento integra o contrato de locação.</p>
      ${fotos}
      <div class="sign"><div>Vistoriador<br><span style="color:#8F8F96">${vs.responsavel}</span></div><div>Locatário(a)<br><span style="color:#8F8F96">Ciente</span></div></div>`,
      {tag:"Vistoria"});}

  const REP={
    veiculos:{t:"Frota",cols:["Placa","Modelo","Ano","Diária","Status","IPVA","Seguro/mês"],row:x=>[x.placa,x.modelo,x.ano,fmtBRL(x.valorDiaria),x.statusVeic,fmtDate(x.ipvaVenc),fmtBRL(x.seguroMensal)]},
    locatarios:{t:"Locatários",cols:["Nome","CPF","App","CNH","Veículo","Plano","Situação"],row:x=>[x.nome,x.cpf,x.app,(x.cnh||'')+(x.ear?' EAR':''),vNome(x.veiculoId),x.plano,x.statusLoc]},
    cobrancas:{t:"Cobranças",cols:["Locatário","Veículo","Comp.","Vence","Valor","Pagamento","Bloqueio"],row:x=>[lNome(x.locatarioId),vNome(x.veiculoId),x.competencia,fmtDate(x.vencimento),fmtBRL(x.valor),x.statusPag,x.bloqueio]},
    multas:{t:"Multas",cols:["Veículo","Locatário","Infração","Data","Valor","Pts","Status"],row:x=>[vNome(x.veiculoId),lNome(x.locatarioId),x.infracao,fmtDate(x.data),fmtBRL(x.valor),x.pontos,x.status]},
    despesas:{t:"Manutenção & Despesas",cols:["Veículo","Tipo","Categoria","Data","Valor","Fornecedor"],row:x=>[vNome(x.veiculoId),x.tipo,x.categoria||'—',fmtDate(x.data),fmtBRL(x.valor),x.fornecedor]},
    contratos:{t:"Contratos",cols:["#","Locatário","Veículo","Plano","Valor","Caução","Status"],row:x=>[x.id,lNome(x.locatarioId),vNome(x.veiculoId),x.plano,fmtBRL(x.valor),fmtBRL(x.caucao||0),x.statusContrato]},
    vistorias:{t:"Vistorias",cols:["Veículo","Tipo","Data","KM","Combustível","Fotos"],row:x=>[vNome(x.veiculoId),x.tipo,fmtDate(x.data),(x.km||0).toLocaleString('pt-BR'),x.combustivel,(x.fotosArr&&x.fotosArr.length)||x.fotos||0]}
  };
  function report(mod){const r=REP[mod];if(!r)return;const rows=W()[mod].map(x=>`<tr>${r.row(x).map(c=>`<td>${c}</td>`).join("")}</tr>`).join("");
    printDoc(r.t,`<h1>Relatório — ${r.t}</h1><div class="meta">${W()[mod].length} registro(s)</div><table class="grid"><thead><tr>${r.cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`,{tag:"Relatório"});}

  /* ---- Central de Documentos (anexos por veículo) ---- */
  function docsVeiculo(id){const vc=W().veiculos.find(x=>x.id===id);if(!vc)return;vc.docs=vc.docs||[];renderDocs(vc);}
  function renderDocs(vc){const cells=(vc.docs||[]).map((d,i)=>`<div class="cell"><img src="${d}" onclick="CRUD._docLightbox('${vc.id}',${i})"/>
    <div class="ov"><a href="${d}" download="doc-${vc.placa}-${i+1}.jpg" title="Baixar">⬇</a><button title="Apagar" onclick="CRUD._delDoc('${vc.id}',${i})">✕</button></div></div>`).join("");
    modal(`<h3>Documentos — ${vc.placa} · ${vc.modelo}</h3>
      <div style="color:var(--mut);font-size:.82rem;margin-bottom:12px">CRLV, seguro, laudos e afins. ${(vc.docs||[]).length} arquivo(s).</div>
      <div class="gal">${cells||'<div class="empty" style="grid-column:1/-1">Nenhum documento anexado. Envie abaixo.</div>'}</div>
      <div class="modal-actions" style="justify-content:space-between"><label class="b-ghost" style="cursor:pointer">➕ Anexar<input type="file" accept="image/*" multiple style="display:none" onchange="CRUD._addDocs('${vc.id}',event)"/></label><button class="b" onclick="CRUD.close()">Concluir</button></div>`);}
  function _addDocs(id,e){const vc=W().veiculos.find(x=>x.id===id);if(!vc)return;vc.docs=vc.docs||[];const files=[...e.target.files];let pend=files.length;if(!pend)return;
    files.forEach(f=>{const r=new FileReader();r.onload=()=>{vc.docs.push(r.result);if(--pend===0){renderDocs(vc);toast(files.length+" arquivo(s) anexado(s).");}};r.readAsDataURL(f);});}
  function _delDoc(id,i){const vc=W().veiculos.find(x=>x.id===id);if(!vc)return;if(!confirm("Apagar este documento?"))return;vc.docs.splice(i,1);renderDocs(vc);}
  function _docLightbox(id,i){const vc=W().veiculos.find(x=>x.id===id);if(!vc)return;const lb=document.createElement("div");lb.className="lightbox";lb.innerHTML=`<img src="${vc.docs[i]}"/>`;lb.onclick=()=>lb.remove();document.body.appendChild(lb);}

  /* ---- Assinatura eletrônica do contrato ---- */
  let SIG=null;
  function assinarContrato(id){const k=W().contratos.find(x=>x.id===id);if(!k)return;const l=byId(W().locatarios,k.locatarioId);
    modal(`<h3>Assinatura eletrônica</h3>
      <div style="color:var(--mut);font-size:.85rem;margin-bottom:10px">Contrato ${k.id} · ${l.nome} · ${vNome(k.veiculoId)}. Assine no quadro abaixo (dedo ou mouse).</div>
      <canvas id="sigpad" width="520" height="180" style="width:100%;background:#fff;border:1px solid var(--line-2);border-radius:10px;touch-action:none;cursor:crosshair"></canvas>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><button class="b-sm" onclick="CRUD._sigClear()">Limpar</button>
      <div style="display:flex;gap:9px"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button><button class="b" onclick="CRUD._sigSave('${id}')">Confirmar assinatura</button></div></div>`);
    setTimeout(_sigInit,60);}
  function _sigInit(){const c=document.getElementById("sigpad");if(!c)return;const ctx=c.getContext("2d");ctx.lineWidth=2.6;ctx.lineCap="round";ctx.strokeStyle="#0B0B0D";let draw=false,px,py;
    function pos(e){const r=c.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:(t.clientX-r.left)*(c.width/r.width),y:(t.clientY-r.top)*(c.height/r.height)};}
    function down(e){draw=true;const p=pos(e);px=p.x;py=p.y;e.preventDefault();}
    function move(e){if(!draw)return;const p=pos(e);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(p.x,p.y);ctx.stroke();px=p.x;py=p.y;e.preventDefault();}
    function up(){draw=false;}
    c.addEventListener("mousedown",down);c.addEventListener("mousemove",move);window.addEventListener("mouseup",up);
    c.addEventListener("touchstart",down,{passive:false});c.addEventListener("touchmove",move,{passive:false});c.addEventListener("touchend",up);SIG=c;}
  function _sigClear(){if(SIG)SIG.getContext("2d").clearRect(0,0,SIG.width,SIG.height);}
  function _sigSave(id){const k=W().contratos.find(x=>x.id===id);if(!k){close();return;}if(!SIG){close();return;}
    const l=byId(W().locatarios,k.locatarioId);k.assinatura={nome:l.nome,data:"2026-07-12",img:SIG.toDataURL("image/png")};persist("contratos","update",k);
    if(VP.notif)VP.notif("assinatura","Contrato assinado",`${l.nome} assinou o contrato ${k.id} eletronicamente`,{mod:"contratos",id:k.id});
    toast("Contrato assinado eletronicamente. ✓");close();VP.refresh();}

  /* ---- Recorrência PIX + Reservas ---- */
  function gerarProximas(){const ativos=W().locatarios.filter(l=>l.statusLoc!=="Inativo");let n=0;
    ativos.forEach(l=>{const cs=W().cobrancas.filter(c=>c.locatarioId===l.id).sort((a,b)=>new Date(b.vencimento)-new Date(a.vencimento));const ult=cs[0];if(!ult)return;
      const dias=l.plano==="Semanal"?7:l.plano==="Diário"?1:30;const d=new Date(ult.vencimento);d.setDate(d.getDate()+dias);const venc=d.toISOString().slice(0,10);
      if(cs.some(c=>c.vencimento===venc))return;
      W().cobrancas.push({id:uid("C"),locatarioId:l.id,veiculoId:l.veiculoId,competencia:"Próx. ciclo",vencimento:venc,valor:l.valorAluguel,statusPag:"Pendente",formaPag:"—",dataPagamento:"",bloqueio:"Não"});n++;});
    toast(n?`${n} cobrança(s) gerada(s) para o próximo ciclo.`:"Nenhuma nova cobrança a gerar.");VP.refresh();}
  function converterReserva(id){const r=(W().reservas||[]).find(x=>x.id===id);if(!r)return;r.status="Convertido";persist("reservas","update",r);
    toast("Reserva convertida. Cadastre o locatário para vincular o veículo.");VP.refresh();}

  function modal(html,wide){close();const bg=document.createElement("div");bg.className="modal-bg";bg.id="modalBg";
    bg.innerHTML=`<div class="modal${wide?' wide':''}">${html}</div>`;bg.onclick=e=>{if(e.target===bg)close();};document.body.appendChild(bg);
    if(VP.installPwToggles)VP.installPwToggles(bg);}
  function close(){const m=document.getElementById("modalBg");if(m)m.remove();}

  /* ---- Telas de detalhe (somente leitura) ---- */
  function detRow(k,v){return `<div class="det-row"><span class="det-k">${k}</span><span class="det-v">${v==null||v===""?"—":v}</span></div>`;}
  function detalhe(title,body,acts){modal(`<h3>${title}</h3><div class="det">${body}</div><div class="modal-actions">${acts||""}<button class="b" onclick="CRUD.close()">Fechar</button></div>`);}
  function verMulta(id){const m=(W().multas||[]).find(x=>x.id===id);if(!m)return;const l=byId(W().locatarios,m.locatarioId),v=byId(W().veiculos,m.veiculoId);
    const st={"Pendente":"t-warn","Repassada":"t-info","Paga":"t-ok","Recorrida":"t-vio"}[m.status]||"t-mut";
    const body=detRow("Veículo",vNome(m.veiculoId)+(v&&v.placa?` · ${v.placa}`:""))+detRow("Locatário",lNome(m.locatarioId))+detRow("Infração",m.infracao)
      +detRow("Órgão / Local",(m.orgao||"—")+" · "+(m.local||"—"))+detRow("Data",fmtDate(m.data))+detRow("Vencimento",fmtDate(m.vencimento))
      +detRow("Valor",`<b>${fmtBRL(m.valor)}</b>`)+detRow("Pontos",m.pontos)+detRow("Gravidade",m.gravidade)
      +detRow("Status",`<span class="tag ${st}">${m.status}</span>`)+detRow("Ciência do locatário",m.ciente?`✅ em ${fmtDate(m.cienteData)}`:"pendente");
    const acts=(l&&l.telefone?waBtn(l.telefone,`Olá ${(l.nome||"").split(" ")[0]}, VP CAR. Sobre a multa ${m.infracao} (${fmtBRL(m.valor)})...`,"WhatsApp"):"")+`<button class="b-ghost" onclick="CRUD.open('multas','${m.id}')">Editar</button>`;
    detalhe(`Multa · ${m.infracao}`,body,acts);}
  function verVistoria(id){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;vs.fotosArr=vs.fotosArr||[];
    const thumbs=(vs.fotosArr||[]).slice(0,12).map((s,i)=>`<img src="${s}" class="thumb" onclick="CRUD._lightbox('${vs.id}',${i})"/>`).join("")||'<div class="empty" style="grid-column:1/-1">Sem fotos anexadas.</div>';
    const body=detRow("Veículo",vNome(vs.veiculoId))+detRow("Tipo",vs.tipo)+detRow("Data",fmtDate(vs.data))+detRow("KM",fmtNum(vs.km))
      +detRow("Combustível",vs.combustivel)+detRow("Avarias",vs.avarias||"Sem avarias")+detRow("Responsável",vs.responsavel);
    modal(`<h3>Vistoria · ${vNome(vs.veiculoId)}</h3><div class="det">${body}</div>
      <div class="det-k" style="margin-bottom:2px">Fotos (${(vs.fotosArr||[]).length})</div><div class="thumbs">${thumbs}</div>
      <div class="modal-actions"><button class="b-ghost" onclick="CRUD.fotos('${vs.id}')">🖼️ Gerenciar fotos</button><button class="b-ghost" onclick="CRUD.laudo('${vs.id}')">📄 Laudo</button><button class="b" onclick="CRUD.close()">Fechar</button></div>`);}
  function verComoLocatario(id){const l=byId(W().locatarios,id);if(!l)return;
    modal(`<h3>Portal do locatário · ${l.nome}</h3><div style="color:var(--mut);font-size:.82rem;margin-bottom:12px">Pré-visualização — é exatamente o que o motorista vê no portal dele.</div><div id="pvw"></div>
      <div class="modal-actions"><button class="b-ghost" onclick="CRUD.copiarLink('${id}')">🔗 Copiar link</button><button class="b" onclick="CRUD.close()">Fechar</button></div>`,true);
    if(window.portalContent)window.portalContent(document.getElementById("pvw"),id);}
  VP.detalhe=detalhe;VP.detRow=detRow;

  window.CRUD={open,save,remove,close,report,modal,marcarPago,avisar,bloquear,repassarMulta,reportarForm,_enviarReport,assumirMulta,marcarLidas,contrato,laudo,
    fotos,_addFotos,_delFoto,_lightbox,_pickFoto,meuPerfil,_salvarFoto,trocarSenha,_salvarSenha,copiarLink,enviarLink,
    gerarProximas,converterReserva,docsVeiculo,_addDocs,_delDoc,_docLightbox,assinarContrato,_sigInit,_sigClear,_sigSave,
    verMulta,verVistoria,verComoLocatario,detalhe,detRow,_confirmarBloqueio,SCHEMAS};
})();
