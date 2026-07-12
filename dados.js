/* ============================================================
   VP CAR · by VIZIO — Snapshot de dados (modo demonstração)
   "Movido a confiança." · um produto INPERSON
   Dinheiro: 2 casas · Datas: AAAA-MM-DD
   Trocar este arquivo = trocar a instância (não edita o HTML).
   ============================================================ */
const DADOS = {
  _meta: { cliente:"VP CAR — Locacao de Veiculos", versao:"2.0.0", gerado:"2026-07-12", moeda:"BRL" },

  _cfg: {
    produto:"VIZIO", instancia:"VP CAR",
    propLabel:"VP CAR · Locação de Veículos",
    slogan:"MOBILIDADE INTELIGENTE",
    tel:"5577981132845", cidade:"Bahia · BR",
    authUrl:""                         // vazio = login de demonstração (front)
  },

  // Usuários do sistema (com foto/inicial, perfil e master). No go-live: hash no backend.
  _users: [
    { user:"inperson", pass:"inperson", nome:"INPERSON",      inicial:"iP", cor:"#4F97C4", perfil:"master", roleLabel:"Master (INPERSON)", master:true,  ultimoAcesso:"2026-07-12 09:14" },
    { user:"victor",   pass:"vpcar",    nome:"Victor Paiva",  inicial:"VP", cor:"#2FBF87", perfil:"admin",  roleLabel:"Proprietário",       master:false, ultimoAcesso:"2026-07-12 08:02" },
    { user:"recepcao", pass:"recepcao", nome:"Recepção",      inicial:"RC", cor:"#E0A93B", perfil:"operacao",roleLabel:"Operação",          master:false, ultimoAcesso:"2026-07-11 17:40" }
  ],

  // Registro de acessos (log). Novos logins são adicionados na sessão; master vê tudo.
  _acessos: [
    { data:"2026-07-12", hora:"09:14", user:"inperson", nome:"INPERSON",     acao:"login",    origem:"Web" },
    { data:"2026-07-12", hora:"08:02", user:"victor",   nome:"Victor Paiva", acao:"login",    origem:"Web" },
    { data:"2026-07-11", hora:"17:40", user:"recepcao", nome:"Recepção",     acao:"login",    origem:"Web" },
    { data:"2026-07-11", hora:"12:05", user:"victor",   nome:"Victor Paiva", acao:"bloqueio", origem:"Cobrança V02" },
    { data:"2026-07-10", hora:"19:22", user:"victor",   nome:"Victor Paiva", acao:"logout",   origem:"Web" }
  ],

  // ---- FROTA (10 veículos) ----
  veiculos: [
    { id:"V01", placa:"OKT-4A21", modelo:"Chevrolet Onix 1.0", ano:2021, cor:"Branco",  km:78240, valorDiaria:150.00, plano:"Mensal",  statusVeic:"Alugado",    ipvaVenc:"2026-08-15", seguroMensal:210.00, rastreador:"RST-1001", locatarioId:"L01" },
    { id:"V02", placa:"PJS-2B77", modelo:"Hyundai HB20 1.0",   ano:2020, cor:"Prata",   km:95120, valorDiaria:150.00, plano:"Mensal",  statusVeic:"Bloqueado",  ipvaVenc:"2026-07-20", seguroMensal:205.00, rastreador:"RST-1002", locatarioId:"L02" },
    { id:"V03", placa:"QGD-9C03", modelo:"Chevrolet Prisma 1.4",ano:2019,cor:"Preto",   km:112800,valorDiaria:160.00, plano:"Semanal", statusVeic:"Alugado",    ipvaVenc:"2026-09-10", seguroMensal:198.00, rastreador:"RST-1003", locatarioId:"L03" },
    { id:"V04", placa:"RKA-1D45", modelo:"Fiat Cronos 1.3",    ano:2022, cor:"Cinza",   km:53400, valorDiaria:180.00, plano:"Mensal",  statusVeic:"Alugado",    ipvaVenc:"2026-10-05", seguroMensal:230.00, rastreador:"RST-1004", locatarioId:"L04" },
    { id:"V05", placa:"SLB-7E88", modelo:"Renault Kwid 1.0",   ano:2021, cor:"Vermelho",km:69950, valorDiaria:150.00, plano:"Diário",  statusVeic:"Disponível", ipvaVenc:"2026-11-12", seguroMensal:175.00, rastreador:"RST-1005", locatarioId:null  },
    { id:"V06", placa:"TMC-3F12", modelo:"VW Voyage 1.6",      ano:2019, cor:"Branco",  km:134200,valorDiaria:170.00, plano:"Mensal",  statusVeic:"Manutenção", ipvaVenc:"2026-07-28", seguroMensal:212.00, rastreador:"RST-1006", locatarioId:null  },
    { id:"V07", placa:"UND-6G59", modelo:"Fiat Argo 1.0",      ano:2022, cor:"Azul",    km:41200, valorDiaria:175.00, plano:"Mensal",  statusVeic:"Alugado",    ipvaVenc:"2026-12-01", seguroMensal:222.00, rastreador:"RST-1007", locatarioId:"L05" },
    { id:"V08", placa:"VPE-8H24", modelo:"Nissan Versa 1.6",   ano:2020, cor:"Prata",   km:88700, valorDiaria:190.00, plano:"Mensal",  statusVeic:"Alugado",    ipvaVenc:"2026-08-30", seguroMensal:240.00, rastreador:"RST-1008", locatarioId:"L06" },
    { id:"V09", placa:"WQF-5J71", modelo:"Renault Logan 1.6",  ano:2021, cor:"Cinza",   km:76300, valorDiaria:170.00, plano:"Semanal", statusVeic:"Alugado",    ipvaVenc:"2026-09-22", seguroMensal:208.00, rastreador:"RST-1009", locatarioId:"L07" },
    { id:"V10", placa:"XRG-2K10", modelo:"Ford Ka 1.0",        ano:2019, cor:"Branco",  km:121500,valorDiaria:150.00, plano:"Diário",  statusVeic:"Disponível", ipvaVenc:"2026-10-18", seguroMensal:180.00, rastreador:"RST-1010", locatarioId:null  }
  ],

  // ---- LOCATÁRIOS (motoristas de app) ----  (+ CNH/EAR — compliance)
  locatarios: [
    { id:"L01", nome:"Anderson Souza",   cpf:"012.345.678-90", telefone:"5577991110001", app:"Uber",    cnh:"04567890123", cnhCat:"B", ear:true,  cnhVenc:"2028-03-10", veiculoId:"V01", plano:"Mensal",  valorAluguel:2100.00, inicio:"2026-05-02", statusLoc:"Ativo" },
    { id:"L02", nome:"Bruno Carvalho",   cpf:"023.456.789-01", telefone:"5577991110002", app:"99",      cnh:"05678901234", cnhCat:"B", ear:true,  cnhVenc:"2027-11-22", veiculoId:"V02", plano:"Mensal",  valorAluguel:2100.00, inicio:"2026-04-18", statusLoc:"Inadimplente" },
    { id:"L03", nome:"Carla Menezes",    cpf:"034.567.890-12", telefone:"5577991110003", app:"Uber/99", cnh:"06789012345", cnhCat:"B", ear:true,  cnhVenc:"2029-01-15", veiculoId:"V03", plano:"Semanal", valorAluguel:640.00,  inicio:"2026-06-10", statusLoc:"Ativo" },
    { id:"L04", nome:"Diego Ramos",      cpf:"045.678.901-23", telefone:"5577991110004", app:"Uber",    cnh:"07890123456", cnhCat:"B", ear:true,  cnhVenc:"2026-09-05", veiculoId:"V04", plano:"Mensal",  valorAluguel:2400.00, inicio:"2026-03-25", statusLoc:"Ativo" },
    { id:"L05", nome:"Emerson Lima",     cpf:"056.789.012-34", telefone:"5577991110005", app:"99",      cnh:"08901234567", cnhCat:"B", ear:false, cnhVenc:"2028-07-30", veiculoId:"V07", plano:"Mensal",  valorAluguel:2300.00, inicio:"2026-06-01", statusLoc:"Ativo" },
    { id:"L06", nome:"Fábio Nogueira",   cpf:"067.890.123-45", telefone:"5577991110006", app:"Uber",    cnh:"09012345678", cnhCat:"B", ear:true,  cnhVenc:"2027-05-18", veiculoId:"V08", plano:"Mensal",  valorAluguel:2500.00, inicio:"2026-02-14", statusLoc:"Ativo" },
    { id:"L07", nome:"Gustavo Prado",    cpf:"078.901.234-56", telefone:"5577991110007", app:"Uber/99", cnh:"10123456789", cnhCat:"B", ear:true,  cnhVenc:"2028-12-02", veiculoId:"V09", plano:"Semanal", valorAluguel:680.00,  inicio:"2026-06-20", statusLoc:"Ativo" }
  ],

  // Portal do locatário (piloto): login do motorista
  _locUsers: [
    { user:"anderson", pass:"1234", locatarioId:"L01" },
    { user:"bruno",    pass:"1234", locatarioId:"L02" }
  ],

  // ---- COBRANÇAS (ciclo atual) ----
  cobrancas: [
    { id:"C01", locatarioId:"L01", veiculoId:"V01", competencia:"Jul/2026", vencimento:"2026-07-15", valor:2100.00, statusPag:"Pago",     formaPag:"PIX",     dataPagamento:"2026-07-14", bloqueio:"Não" },
    { id:"C02", locatarioId:"L02", veiculoId:"V02", competencia:"Jul/2026", vencimento:"2026-07-08", valor:2100.00, statusPag:"Atrasado", formaPag:"—",       dataPagamento:"",           bloqueio:"Bloqueado" },
    { id:"C03", locatarioId:"L03", veiculoId:"V03", competencia:"Sem 28",   vencimento:"2026-07-13", valor:640.00,  statusPag:"Pendente", formaPag:"—",       dataPagamento:"",           bloqueio:"Agendado" },
    { id:"C04", locatarioId:"L04", veiculoId:"V04", competencia:"Jul/2026", vencimento:"2026-07-25", valor:2400.00, statusPag:"Pendente", formaPag:"—",       dataPagamento:"",           bloqueio:"Não" },
    { id:"C05", locatarioId:"L05", veiculoId:"V07", competencia:"Jul/2026", vencimento:"2026-07-01", valor:2300.00, statusPag:"Pago",     formaPag:"PIX",     dataPagamento:"2026-06-30", bloqueio:"Não" },
    { id:"C06", locatarioId:"L06", veiculoId:"V08", competencia:"Jul/2026", vencimento:"2026-07-14", valor:2500.00, statusPag:"Pago",     formaPag:"Cartão",  dataPagamento:"2026-07-12", bloqueio:"Não" },
    { id:"C07", locatarioId:"L07", veiculoId:"V09", competencia:"Sem 28",   vencimento:"2026-07-20", valor:680.00,  statusPag:"Pendente", formaPag:"—",       dataPagamento:"",           bloqueio:"Não" }
  ],

  // ---- MANUTENÇÃO / DESPESAS (+ categoria, km, próxima) ----
  despesas: [
    { id:"D01", veiculoId:"V01", tipo:"Troca de Óleo",  categoria:"Preventiva", data:"2026-06-12", valor:180.00,  km:76800, proxKm:86800, fornecedor:"Auto Center BA",  obs:"Óleo 5W30 + filtro" },
    { id:"D02", veiculoId:"V02", tipo:"IPVA",           categoria:"Tributo",    data:"2026-01-20", valor:1240.00, km:0,     proxKm:0,     fornecedor:"DETRAN-BA",       obs:"IPVA 2026 cota única" },
    { id:"D03", veiculoId:"V03", tipo:"Troca de Pneus", categoria:"Corretiva",  data:"2026-05-30", valor:1360.00, km:110200,proxKm:150200,fornecedor:"Pneus Center",    obs:"4 pneus 185/65 R15" },
    { id:"D04", veiculoId:"V04", tipo:"Revisão",        categoria:"Preventiva", data:"2026-06-28", valor:520.00,  km:52000, proxKm:62000, fornecedor:"Fiat Concess.",   obs:"Revisão 50 mil km" },
    { id:"D05", veiculoId:"V06", tipo:"Revisão",        categoria:"Corretiva",  data:"2026-07-05", valor:980.00,  km:134000,proxKm:0,     fornecedor:"Oficina do Zé",   obs:"Suspensão + freios" },
    { id:"D06", veiculoId:"V08", tipo:"Seguro",         categoria:"Fixo",       data:"2026-07-01", valor:240.00,  km:0,     proxKm:0,     fornecedor:"Porto Seguro",    obs:"Parcela mensal" },
    { id:"D07", veiculoId:"V02", tipo:"Troca de Óleo",  categoria:"Preventiva", data:"2026-06-02", valor:175.00,  km:94000, proxKm:104000,fornecedor:"Auto Center BA",  obs:"Óleo + filtro de ar" },
    { id:"D08", veiculoId:"V09", tipo:"Revisão",        categoria:"Preventiva", data:"2026-06-15", valor:430.00,  km:75000, proxKm:85000, fornecedor:"Renault Serv.",   obs:"Revisão preventiva" }
  ],

  // ---- MULTAS (infrações com o carro alugado) ----
  multas: [
    { id:"M