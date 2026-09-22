# vendor/ — assets locais (funcionamento offline)

Estes arquivos foram trazidos para dentro do projeto para a demo **não depender de CDN**
(internet do local pode falhar). Referenciados por caminho relativo no `index.html`.

- `chart.umd.min.js` — **Chart.js 4.4.1** (UMD minificado), baixado de
  `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`.
  Para atualizar a versão: baixar o novo `chart.umd.min.js` e trocar aqui (nada de `?v=` externo).
- `inter.css` + `fonts/inter-*.woff2` — **Inter** (pesos 300/400/500/600/700/800), subsets
  **latin + latin-ext** (suficiente para pt-BR). Gerado a partir do `css2` do Google Fonts
  (`family=Inter:wght@300;400;500;600;700;800`), reescrevendo os `src:url()` para os woff2 locais
  e preservando os `unicode-range` originais. Subsets cyrillic/greek/vietnamese foram omitidos
  de propósito (não usados).

Regenerar a fonte: buscar o css2 com User-Agent de navegador, manter só os blocos `latin`/
`latin-ext`, baixar os woff2 para `fonts/` e apontar os `src` para eles.
