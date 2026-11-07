# NOIR® — Camada de movimento

Tudo que anima o site vive em `src/motion.css` e `js/motion.js`. O resto do projeto só tem "ganchos" (linhas marcadas com `// Motion:`). A estrutura geral do projeto está no `README.md`.

| Arquivo | O que faz |
| --- | --- |
| `src/motion.css` | Todas as animações (CSS puro). **O `npm run build` não mexe nele**, então não precisa recompilar nada. |
| `js/motion.js` | Motor: títulos subindo da máscara, wipe de imagens, marquee, cursor, voo da foto até a sacola, confete. |
| `MOTION.md` | Este guia. |

## Os dois "verbos" do site
- **RISE** — texto sobe de dentro de uma máscara (`data-split`, `data-intro`, `data-reveal`).
- **WIPE** — imagem se abre de baixo pra cima (`data-wipe`).

## Como mexer
- **Mais rápido/lento:** em `src/motion.css`, ajuste as durações (`1.1s`, `1.2s`...) e o `--ease` no topo.
- **Atrasos da abertura da home:** cada bloco tem `style="--d: 1000"` no HTML (milissegundos).
- **Velocidade da faixa NO RULES:** em `js/motion.js`, dentro de `initTicker`, troque `groupWidth / 70` (px por segundo).
- **Tirar o cursor-anel:** apague a linha `initCursor();` em `start()` no `motion.js`.
- **Tirar o confete:** apague o bloco `confettiKey` em `js/confirmation.js`.
- **Animar um elemento novo:** `data-split` (título), `data-reveal` (texto), `data-wipe` (imagem), `data-intro` (abertura da página).

## Acessibilidade e segurança
- Quem ativou "reduzir movimento" no sistema recebe o site parado e visível.
- Se o `motion.js` não carregar, um *failsafe* mostra tudo depois de 3,5s.
- A transição de foto entre páginas só aparece em navegador com View Transitions e **rodando em servidor** (Live Server, GitHub Pages), não abrindo o arquivo direto.
