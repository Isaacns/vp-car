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
    usuarios:{titulo:"Usuário",arr:"_users",campos:[
      {k:"foto",t:"foto",lab:"Foto",full:1},
      {k:"nome",t:"text",lab:"Nome",req:1,full:1},{k:"user",t:"text",lab:"Usuário (login)",req:1},{k:"pass",t:"text",lab:"Senha",req:1},
      {k:"cor",t:"text",lab:"Cor do avatar (hex)"},
      {k:"perfil",t:"select",lab:"Perfil",op:["admin","operacao","master"]},{k:"roleLabel",t:"text",lab:"Rótulo do cargo"}]}
  };

  function fieldHtml(c,val){
    if(c.t==="foto"){const cur=val?`<img src="${val}" class="photo-prev" id="prev_${c.k}"/>`:`<div class="photo-prev" id="prev_${c.k}" style="display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:.7rem">sem foto</div>`;
      return`<div class="full"><label>${c.lab}</label><div class="photo-pick">${cur}<input type="file" accept="image/*" onchange="CRUD._pickFoto(event,'${c.k}')" style="flex:1"/></div></div>`;}
    let inp;
    if(c.t==="select")inp=`<select id="f_${c.k}">${c.op.map(o=>`<option ${String(val)===String(o)?"selected":""}>${o}</option>`).join("")}</select>`;
    else if(c.t==="selref"){const o=c.ref();inp=`<select id="f_${c.k}">${c.opcional?'<option value="">—</option>':''}${o.map(x=>`<option value="${x.v}" ${val===x.v?"selected":""}>${x.l}</option>`).join("")}</select>`;}
    else inp=`<input id="f_${c.k}" type="${c.t}" value="${String(val).replace(/"/g,'&quot;')}" ${c.req?"required":""}/>`;
    return`<div class="${c.full?'full':''}"><label>${c.lab}${c.req?' *':''}</label>${inp}</div>`;
  }
  function _pickFoto(e,k){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{PIC[k]=r.result;const p=document.getElementById("prev_"+k);if(p){if(p.tagName==="IMG")p.src=r.result;else p.outerHTML=`<img src="${r.result}" class="photo-prev" id="prev_${k}"/>`;}};r.readAsDataURL(f);}

  function open(mod,id){const sc=SCHEMAS[mod];if(!sc)return;PIC={};const arr=W()[sc.arr||mod];const rec=id?arr.find(x=>x.id===id):{};
    const fields=sc.campos.map(c=>fieldHtml(c,(rec&&rec[c.k]!=null?rec[c.k]:""))).join("");
    modal(`<h3>${id?'Editar':'Novo'} ${sc.titulo}</h3><div class="form-grid">${fields}</div>
      <div class="modal-actions"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button><button class="b" onclick="CRUD.save('${mod}','${id||''}')">Salvar</button></div>`);}
  function save(mod,id){const sc=SCHEMAS[mod];const rec={};
    for(const c of sc.campos){
      if(c.t==="foto"){if(PIC[c.k]!==undefined)rec[c.k]=PIC[c.k];continue;}
      let val=document.getElementById("f_"+c.k).value;if(c.t==="number")val=parseFloat(val)||0;
      if(c.k==="ear")val=(val==="true");if(c.req&&(val===""||val==null)){toast("Preencha: "+c.lab);return;}rec[c.k]=val;}
    const arr=W()[sc.arr||mod];
    if(id){const i=arr.findIndex(x=>x.id===id);rec.id=id;arr[i]=Object.assign(arr[i],rec);persist(mod,"update",rec,i);
      if((sc.arr==="_users")&&VP.session&&VP.session.user===arr[i].user){Object.assign(VP.session,arr[i]);VP.refreshUserChip&&VP.refreshUserChip();}
      toast("Atualizado.");}
    else{if(sc.arr!=="_users")rec.id=uid(mod[0].toUpperCase());else{rec.inicial=VP.initials(rec.nome);}arr.push(rec);persist(mod,"create",rec);toast(sc.titulo+" criado.");}
    if(mod==="cobrancas")sinc(rec);PIC={};close();VP.refresh();}
  function remove(mod,id){if(!confirm("Excluir este registro?"))return;const sc=SCHEMAS[mod];const arr=W()[sc.arr||mod];
    const i=arr.findIndex(x=>x.id===id);if(i>=0){arr.splice(i,1);persist(mod,"delete",{id},i);toast("Excluído.");VP.refresh();}}
  function sinc(rec){const v=byId(W().veiculos,rec.veiculoId);if(rec.bloqueio==="Bloqueado")v.statusVeic="Bloqueado";
    const l=byId(W().locatarios,rec.locatarioId);if(l.id)l.statusLoc=rec.statusPag==="Atrasado"?"Inadimplente":(rec.statusPag==="Pago"?"Ativo":l.statusLoc);}

  /* ---- Perfil / Senha ---- */
  function meuPerfil(){document.getElementById("udrop").classList.add("hidden");PIC={};
    const u=VP.session;const cur=u.foto?`<img src="${u.foto}" class="photo-prev" id="prev_foto"/>`:`<div class="photo-prev" id="prev_foto" style="display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:.7rem">sem foto</div>`;
    modal(`<h3>Meu perfil</h3><div style="margin-bottom:8px;color:var(--mut);font-size:.85rem">${u.nome} · @${u.user}</div>
      <label>Foto do perfil</label><div class="photo-pick">${cur}<input type="file" accept="image/*" onchange="CRUD._pickFoto(event,'foto')" style="flex:1"/></div>
      <div class="modal-actions"><button class="b-ghost" onclick="CRUD.close()">Cancelar</button><button class="b" onclick="CRUD._salvarFoto()">Salvar</button></div>`);}
  function _salvarFoto(){const u=VP.session;if(PIC.foto!==undefined){u.foto=PIC.foto;const r=W()._users.find(x=>x.user===u.user);if(r)r.foto=PIC.foto;VP.refreshUserChip&&VP.refreshUserChip();toast("Foto atualizada.");}PIC={};close();}
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
    if(c.bloqueio!=="Não"){c.bloqueio="Não";const v=byId(W().veiculos,c.veiculoId);if(v.statusVeic==="Bloqueado")v.statusVeic="Alugado";}
    const l=byId(W().locatarios,c.locatarioId);if(l.id)l.statusLoc="Ativo";persist("cobrancas","update",c);toast("✓ Pagamento confirmado. Veículo liberado.");VP.refresh();}
  function avisar(id){const c=W().cobrancas.find(x=>x.id===id);if(!c)return;c.bloqueio="Agendado";const l=byId(W().locatarios,c.locatarioId);
    const msg=`⚠️ VP CAR — Aviso de bloqueio. Olá ${(l.nome||"").split(" ")[0]}, o aluguel do ${vNome(c.veiculoId)} (${c.competencia}) vence ${fmtDate(c.vencimento)}: ${fmtBRL(c.valor)}. Sem a confirmação do pagamento, o veículo será BLOQUEADO via satélite em 24h. 🚗`;
    window.open(VP.waLink(l.telefone,msg),"_blank","noopener");toast("Aviso de 24h registrado.");VP.refresh();}
  function bloquear(id){const c=W().cobrancas.find(x=>x.id===id);if(!c)return;const v=byId(W().veiculos,c.veiculoId);
    if(c.bloqueio==="Bloqueado"){if(!confirm("Desbloquear o veículo via satélite?"))return;c.bloqueio="Não";v.statusVeic="Alugado";toast("🛰️ Desbloqueio enviado ("+v.rastreador+").");}
    else{if(!confirm(`Enviar BLOQUEIO via satélite ao ${v.placa} (${v.rastreador})?`))return;c.bloqueio="Bloqueado";v.statusVeic="Bloqueado";
      const l=byId(W().locatarios,c.locatarioId);if(l.id)l.statusLoc="Inadimplente";
      window.open(VP.waLink(l.telefone,`🔒 VP CAR — Seu veículo ${vNome(c.veiculoId)} foi BLOQUEADO por falta de pagamento (${c.competencia}, ${fmtBRL(c.valor)}). Regularize via PIX para desbloqueio imediato.`),"_blank","noopener");
      toast("🛰️ Bloqueio enviado ("+v.rastreador+").");}persist("cobrancas","update",c);VP.refresh();}
  function repassarMulta(id){const m=(W().multas||[]).find(x=>x.id===id);if(!m)return;m.status="Repassada";persist("multas","update",m);toast("Multa repassada ao locatário.");VP.refresh();}
  function reportar(locId){const desc=prompt("Descreva a ocorrência (será enviada à VP CAR):");if(!desc)return;
    W().ocorrencias=W().ocorrencias||[];W().ocorrencias.push({id:uid("O"),locatarioId:locId,veiculoId:byId(W().locatarios,locId).veiculoId,data:"2026-07-12",tipo:"Reportado",descricao:desc,status:"Aberto"});
    toast("Ocorrência registrada. A VP CAR foi notificada.");VP.refresh();}

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
        <label class="b-ghost" style="cursor:pointer">➕ Enviar fotos<input type="file" accept="image/*" multiple style="display:none" onchange="CRUD._addFotos('${vs.id}',event)"/></label>
        <button class="b" onclick="CRUD.close()">Concluir</button></div>`);}
  function _addFotos(id,e){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;vs.fotosArr=vs.fotosArr||[];
    const files=[...e.target.files];let pend=files.length;if(!pend)return;
    files.forEach(f=>{const r=new FileReader();r.onload=()=>{vs.fotosArr.push(r.result);vs.fotos=vs.fotosArr.length;if(--pend===0){renderGaleria(vs);toast(files.length+" foto(s) adicionada(s).");}};r.readAsDataURL(f);});}
  function _delFoto(id,i){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;if(!confirm("Apagar esta foto?"))return;vs.fotosArr.splice(i,1);vs.fotos=vs.fotosArr.length;renderGaleria(vs);}
  function _lightbox(id,i){const vs=W().vistorias.find(x=>x.id===id);if(!vs)return;const src=vs.fotosArr[i];
    const lb=document.createElement("