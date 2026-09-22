/* ============================================================
   VP CAR · by VIZIO — AMBIENTE DE VALIDAÇÃO (dados zerados)
   "Movido a confiança." · um produto INPERSON
   Esta é uma CÓPIA ISOLADA para validação da Paula (não é a demo do reveal).
   Todas as coleções nascem VAZIAS — sem frota/locatários/cobranças fictícios.
   Auth client-side (estático): senhas TEMPORÁRIAS, trocadas no go-live com backend.
   ============================================================ */
const DADOS = {
  _meta: { cliente:"VP CAR — Locacao de Veiculos", versao:"validacao", gerado:"2026-09-22", moeda:"BRL" },

  _cfg: {
    produto:"VIZIO", instancia:"VP CAR",
    propLabel:"VP CAR · Locação de Veículos",
    slogan:"MOBILIDADE INTELIGENTE",
    tel:"5577981132845", cidade:"Bahia · BR",
    authUrl:"",                        // vazio = login de validação (front)
    rastreadorNome:"painel do rastreador",
    rastreadorPainel:"",
    rastreadorApi:false
  },

  // Usuários da VALIDAÇÃO (client-side). Papéis reais (MASTER/ADMIN) e "cadastrar a
  // própria senha" só existem com o backend do go-live; aqui são credenciais temporárias.
  _users: [
    { user:"isaac",  pass:"Isaac2026",  nome:"Isaac Nogueira", inicial:"IN", cor:"#4F97C4", perfil:"master", roleLabel:"Master (INPERSON)", master:true,  ultimoAcesso:"" },
    { user:"paula",  pass:"Paula2026",  nome:"Paula",          inicial:"PA", cor:"#C7A96B", perfil:"admin",  roleLabel:"Administradora",    master:false, ultimoAcesso:"" },
    { user:"victor", pass:"Victor2026", nome:"Victor Paiva",   inicial:"VP", cor:"#2FBF87", perfil:"admin",  roleLabel:"Administrador",     master:false, ultimoAcesso:"" }
  ],

  // Log de acessos: começa vazio; os logins da sessão são registrados em memória.
  _acessos: [],

  // Sementes da Agenda e do Quadro de Tarefas: vazias no ambiente de validação.
  _agendaSeed: [],
  _agendaTarefasSeed: [],

  // Notificações: nenhuma.
  _notificacoes: [],

  // ---- FROTA ----
  veiculos: [],

  // ---- LOCATÁRIOS ----
  locatarios: [],

  // Portal do locatário: nenhum acesso semeado.
  _locUsers: [],

  // ---- COBRANÇAS ----
  cobrancas: [],

  // ---- MANUTENÇÃO / DESPESAS ----
  despesas: [],

  // ---- MULTAS ----
  multas: [],

  // ---- VISTORIAS ----
  vistorias: [],

  // ---- CONTRATOS ----
  contratos: [],

  // ---- OCORRÊNCIAS ----
  ocorrencias: [],

  // ---- RESERVAS & FILA DE ESPERA ----
  reservas: [],

  // Série de receita mensal (gráfico da HOME): vazia.
  receitaMensal: []
};
if (typeof module !== "undefined") module.exports = { DADOS };
