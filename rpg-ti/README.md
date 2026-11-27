# Masmorra do Deploy

RPG de cartas sobre conhecimentos técnicos de TI: Infra, Dev e Redes, em quatro níveis (Júnior, Pleno, Sênior e Tech Lead).

## Baixar

Os instaladores ficam nas [Releases do repositório](https://github.com/Bento123xd/Bentools/releases):

- **Linux** (Debian, Ubuntu, Mint, 64 bits): `masmorra-do-deploy_<versão>_amd64.deb`

  ```bash
  sudo apt install ./masmorra-do-deploy_1.0.0_amd64.deb
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

O `.exe` precisa ser gerado no Windows (ou no Linux com Wine funcionando). O jeito mais simples é o GitHub Actions: o workflow `.github/workflows/rpg-ti-desktop.yml` gera os dois instaladores e, ao receber uma tag `rpg-ti-vX.Y.Z`, publica uma Release com eles.

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
