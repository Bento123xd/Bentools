# Masmorra do Deploy

RPG de cartas sobre conhecimentos técnicos de TI: Infra, Dev e Redes, em quatro níveis (Júnior, Pleno, Sênior e Tech Lead).

## Baixar

Os instaladores ficam nas [Releases do repositório](https://github.com/Bento123xd/Bentools/releases):

- **Linux** (Debian, Ubuntu, Mint, 64 bits): `masmorra-do-deploy_<versão>_amd64.deb`

  ```bash
  sudo apt install ./masmorra-do-deploy_1.1.0_amd64.deb
  ```

- **Windows 10 e 11** (64 bits): `Masmorra-do-Deploy-Setup-<versão>.exe`. O instalador não tem assinatura digital; se o SmartScreen avisar, clique em “Mais informações” e “Executar assim mesmo”.

Também dá para jogar no navegador abrindo `index.html`.

## Contas e login

- É preciso criar uma conta (usuário e senha) para jogar. Cada conta guarda recorde, partidas, vitórias e as últimas 20 partidas, e a tela inicial mostra o ranking das contas.
- As contas são **locais**: não há servidor.
  - No app para computador, ficam em `contas.json` na pasta de dados do app (`~/.config/Masmorra do Deploy/` no Linux, `%APPDATA%\Masmorra do Deploy\` no Windows), com permissão só para o seu usuário.
  - No navegador, ficam no armazenamento local do site.
- A senha nunca é gravada: o app guarda um sal aleatório e o hash da senha (scrypt no computador, PBKDF2-SHA256 com 150 mil iterações no navegador). Tentativas erradas esperam 0,6 s antes de responder.
- “Manter conectado” lembra a sessão naquele computador ou navegador. Sem essa opção, é preciso entrar de novo ao reabrir o jogo.

## Como jogar

- Escolha uma classe: ela dá +1 de dano nas cartas da sua área.
- Cada carta mostra só a área e o dano, com um nome de ataque aleatório. A pergunta aparece quando você joga a carta.
- Cada capítulo tem um chefe com uma área fraca (dano ×2). A cada nível o chefe tem mais vida, as perguntas ficam mais difíceis e o tempo por pergunta diminui (sem limite no Júnior, 45 s no Pleno, 35 s no Sênior e 30 s no Tech Lead). No Tech Lead, cada erro custa 2 de uptime.
- Nenhuma pergunta se repete na mesma jornada.
- Entre os chefes há a **Loja do Plantão**, onde você gasta o XP ganho. Gastar não reduz a pontuação final.
  - Recuperação: Café (+1 uptime) e Restart Completo (uptime cheio).
  - Cartas de suporte: Stack Overflow (corta 2 alternativas), Pato de Borracha (troca a pergunta) e Rollback (anula o próximo erro).
  - Carta de ataque: Hotfix em Produção (4 de dano direto).
  - Melhorias: Certificações (+1 de dano por área) e Servidor Redundante (+1 de uptime máximo).
- No fim, a tela de resultado mostra o acerto por área e revisa as perguntas que você errou.

## DLC: Ringue da Matemática

Modo extra de estudo, aberto pela tela inicial, com 106 perguntas de **Geometria Espacial**. A base é a lista "Geometria Espacial · questões e gabarito" (100 questões), completada com exercícios de cálculo de áreas, volumes, Euler e diagonais, porque a lista é quase toda teórica. Em cada nível as perguntas seguem uma ordem fixa, da mais fácil para a mais difícil:

| Nível | Tema | Perguntas |
|---|---|---|
| Nível 1 | Geometria de posição: determinação de planos, posições de retas e planos, retas reversas | 26 |
| Nível 2 | Perpendicularismo, diedros, projeções e distâncias | 29 |
| Nível 3 | Poliedros: Euler, Platão, prismas, pirâmides, diagonais, áreas e volumes | 26 |
| Nível 4 | Corpos redondos: cilindro, cone, esfera, sólidos inscritos e Arquimedes | 25 |

Nem todas as 100 questões entraram: escolhi as mais claras para cada tema, sem as repetidas (13/50, 12/40, 39/52, 47/55, 41/70, 48/66, 01/97) e sem as que dependem de uma figura difícil de descrever. As que entraram citam o número de origem no enunciado. Ficaram de fora de propósito as de gabarito duvidoso ou errado: 04 (r pode estar contida em β), 07, 43 (o lugar geométrico correto são quatro retas, não um par de planos) e 95.

- Antes de cada nível aparece um resumo da matéria.
- Toda pergunta, certa ou errada, mostra a resposta dada, a resposta certa e a resolução passo a passo. Nas de marcar, o jogo explica por que cada alternativa errada está errada.
- No fim do nível há uma revisão completa: os erros aparecem abertos, os acertos podem ser abertos com um toque, e as perguntas não respondidas também trazem a resolução.
- Não há limite de tempo. O alvo é um boneco de palha pendurado como saco de pancadas, com 1000 de vida. Cada acerto é um soco de boxe.
- O golpe nº k da sequência vale `força ^ expoente`, com força `1 + 0.1·(k − 1)` e expoente `1.001 · 1.1^(k − 1)`: o expoente começa em 1.001 e a cada acerto seguido soma 1/10 dele mesmo. Errar volta ao golpe 1.

  | Golpe | Dano | Total acumulado |
  |---|---|---|
  | 1º | 1 | 1 |
  | 5º | 1.64 | 6.4 |
  | 10º | 4.55 | 21.5 |
  | 15º | 27.88 | 93.5 |
  | 19º | 308.07 | 680.9 |
  | 20º | 677.35 | 1358 (nocaute) |

  Ou seja, 20 acertos seguidos derrubam o boneco. Para ajustar a curva, mude `MAT_FORCA_PASSO`, `MAT_EXP_INICIAL` e `MAT_EXP_SOMA` em `index.html`.
- Pontos por acerto: `10 × golpe × nível + dano causado`. O nocaute dá bônus de 250 × nível. Depois do nocaute dá para continuar respondendo as perguntas que faltam (sem dano, só pontos).
- Metade das perguntas é de marcar e metade pede a conta e a resposta digitada. Use ponto como separador decimal (a vírgula também é aceita). O leitor entende frações (`3/4`), raízes (`6√3`), π (`36π`, `π/3`, `9√3π`), unidades no fim (`5 cm³`) e um `x =` no começo. Decimais são aceitos com 2 casas (`113.1` para `36π`).
- Os recordes da DLC (pontos, nocaute e maior sequência por nível) ficam salvos por conta no próprio aparelho.
- As perguntas ficam em `MAT_RAW`, no formato `{ l, q, s: [passos], o: [...], ow: [...] }` (marcar) ou `{ l, q, s, f: [...], lab?, set? }` (digitar).
- Os conteúdos anteriores da DLC (Números Complexos e Polinômios) estão no histórico do git.

## Desenvolvimento do app para computador

O app usa Electron. O jogo é o mesmo `index.html`; `desktop/main.js` cria a janela e cuida das contas, e `desktop/preload.js` expõe só as funções de login para a página.

```bash
cd rpg-ti
npm install
npm start
```

Gerar os instaladores:

```bash
npm run dist:linux
```

```bash
npm run dist:win
```

Para gerar o instalador do Windows a partir do Linux, sem Wine, instale o NSIS (`sudo apt install nsis`) e rode:

```bash
npm run dist:win-linux
```

Esse script (`desktop/windows/build.sh`) monta o app com o electron-builder, grava ícone e versão no executável com a biblioteca `resedit` e cria o instalador com `makensis` a partir de `desktop/windows/installer.nsi`. O instalador fica em `dist/Masmorra-do-Deploy-Setup-<versão>.exe`, instala só para o usuário atual (sem pedir administrador), cria atalhos no Menu Iniciar e na Área de Trabalho e aparece em “Aplicativos instalados” para desinstalar. A desinstalação mantém as contas salvas.

Para trocar o ícone, substitua `desktop/icon.png` e rode `node desktop/windows/make-ico.js` (usa o Playwright) para gerar o `icon.ico`.

Também dá para gerar os dois instaladores no GitHub Actions: o workflow `.github/workflows/rpg-ti-desktop.yml` gera os dois instaladores e, ao receber uma tag `rpg-ti-vX.Y.Z`, publica uma Release com eles.

```bash
git tag rpg-ti-v1.0.1
```

```bash
git push origin rpg-ti-v1.0.1
```

Antes de criar a tag, atualize `version` em `package.json` e a constante `VERSAO` em `index.html` (usada nos botões de download da versão web).

## Adicionar perguntas

As perguntas ficam no array `RAW` em `index.html`, no formato:

```js
[nivel, "infra" | "dev" | "redes", "Pergunta", ["correta", "errada", "errada", "errada"], "Explicação"]
```

`nivel` vai de 0 (Júnior) a 3 (Tech Lead). A primeira alternativa é sempre a correta; a ordem é embaralhada no jogo. Escreva alternativas erradas plausíveis e de tamanho parecido com o da correta, para que o tamanho não entregue a resposta.

São 96 perguntas (8 por área em cada nível).
