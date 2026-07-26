# VP CAR · Gestão de Frota — by VIZIO

Sistema web (SaaS de página única) para a **VP CAR — Locação de Veículos** gerenciar frota,
locatários de aplicativo, cobrança com bloqueio satelital, manutenção, contratos e vistorias.

## Como abrir
Abra `index.html` no navegador. Login de demonstração:

| Usuário | Senha | Perfil |
|---|---|---|
| `victor` | `vpcar` | Proprietário (acesso total) |
| `inperson` | `inperson` | Suporte técnico |
| `recepcao` | `recepcao` | Operação |

## Módulos
- **Visão Geral** — KPIs da frota, receita mensal, alertas de IPVA e inadimplência.
- **Frota** — 10 veículos, IPVA, seguro, status, CRUD.
- **Locatários** — motoristas de app, WhatsApp 1-clique, CRUD.
- **Cobrança & Bloqueio** — vencimentos, "✓ Pago", "🔔 Avisar 24h", "🛰️ Bloquear/Desbloquear".
- **Manutenção & Despesas** — IPVA, revisões, óleo, pneus, seguro; gráfico por tipo.
- **Contratos** — gerador de contrato de locação (PDF/impressão).
- **Vistorias** — checklist + fotos + laudo (PDF).
- **Saúde Financeira** — rentabilidade por veículo + leitura estratégica automática.

## Arquivos
- `index.html` — app (login, HOME, módulos, tema claro/escuro, movimento vivo).
- `dados.js` — snapshot dos dados (trocar este arquivo = nova instância).
- `app-crud.js` — CRUD, motor de cobrança/bloqueio (mock), contrato, laudo, relatórios PDF.
- `landing.html` — página de conversão para captação de locatários.
- `manifest.json` + ícones — instalável como app (PWA).

## Go-live
Ver `../04_Documentos/GUIA-GO-LIVE.md` (GitHub Pages + backend Apps Script) e
`../04_Documentos/ESPEC-BLOQUEIO-SATELITAL.md` (integração real do bloqueio).

## Notas
- Modo demonstração: o CRUD edita uma cópia da sessão; nada é gravado até preencher `API_URL`.
- Bloqueio satelital é **simulado** no piloto (ver especificação para integração real).

---
_VP CAR · Locação de veículos. Sem burocracia. — Sistema **by VIZIO**, um produto **INPERSON**._
_"Sua planilha virou software."_
