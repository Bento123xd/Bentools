# Masmorra do Deploy

RPG de cartas sobre conhecimentos técnicos de TI: Infra, Dev e Redes, em quatro níveis (Júnior, Pleno, Sênior e Tech Lead).

Abra `index.html` no navegador. Não precisa de build nem de dependências.

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

## Adicionar perguntas

As perguntas ficam no array `RAW` em `index.html`, no formato:

```js
[nivel, "infra" | "dev" | "redes", "Pergunta", ["correta", "errada", "errada", "errada"], "Explicação"]
```

`nivel` vai de 0 (Júnior) a 3 (Tech Lead). A primeira alternativa é sempre a correta; a ordem é embaralhada no jogo. Escreva alternativas erradas plausíveis e de tamanho parecido com o da correta, para que o tamanho não entregue a resposta.

São 96 perguntas (8 por área em cada nível).
