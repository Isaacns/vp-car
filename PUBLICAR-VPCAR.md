# Publicar VP CAR → vpcar.viziostudio.com.br

Esta pasta já está pronta para publicar (inclui `CNAME` com o subdomínio e `.nojekyll`).
O push precisa sair da **sua máquina** (o login do GitHub já funciona aí; no ambiente do
Claude não há credencial). São 3 minutos.

## 1. Criar o repositório e subir (no PowerShell/terminal)
```powershell
cd "C:\Users\isaac\Claude\Projects\VIZIO\Clientes\VP CAR\05_Deploy\vpcar-site"
git init -b main
git add .
git commit -m "VP CAR — sistema + landing (vpcar.viziostudio.com.br)"
# com GitHub CLI (recomendado):
gh repo create vp-car --public --source=. --remote=origin --push
# --- OU, sem o gh: crie o repo "vp-car" em github.com e depois:
# git remote add origin https://github.com/Isaacns/vp-car.git
# git push -u origin main
```

## 2. Ligar o GitHub Pages
GitHub → repositório **vp-car** → **Settings → Pages**:
- **Source:** Deploy from a branch → **main** / **/(root)** → Save.
- O arquivo `CNAME` já preenche o **Custom domain** = `vpcar.viziostudio.com.br`.
- Marque **Enforce HTTPS** depois que o DNS propagar.

## 3. Apontar o DNS no Registro.br
No painel do domínio **viziostudio.com.br** → **Editar Zona / DNS** → adicionar:

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `vpcar` | `isaacns.github.io.` |

Salve. A propagação leva de minutos a algumas horas.

## 4. Links finais
- Sistema: **https://vpcar.viziostudio.com.br/**
- Landing: **https://vpcar.viziostudio.com.br/landing.html**

## Acesso ao sistema
- Proprietário: **victor / vpcar**
- Master (INPERSON): **inperson / inperson**
- Operação: **recepcao / recepcao**
- Portal do locatário (demo): **anderson / 1234** — ou pelo link exclusivo gerado no módulo "Portal do Locatário".

> Observação: para dados reais (cobranças, CPF, CNH), o ideal é repositório **privado**
> (GitHub Pro) + backend/auth de produção antes de operar — ver `GO-LIVE-VP-CAR.md`.

---
Assim que você rodar o passo 1 (push), me avise: eu abro o navegador e faço os passos 2 e 3
(Pages + DNS no Registro.br) para você, já que são telas web.
