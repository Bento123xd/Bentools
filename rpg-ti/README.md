# Masmorra do Deploy

RPG de cartas sobre conhecimentos técnicos de TI: Infra, Dev e Redes, em quatro níveis (Júnior, Pleno, Sênior e Tech Lead).

Abra `index.html` no navegador. Não precisa de build nem de dependências.

## Como jogar

- Escolha uma classe: ela dá +1 de dano nas cartas da sua área.
- Cada capítulo tem um chefe com uma área fraca (dano ×2).
- Jogue uma carta da mão para revelar a pergunta técnica. Acertou, causa dano. Errou, perde 1 ponto de uptime (são 5).
- Itens por capítulo: **Café** (+1 uptime) e **Stack Overflow** (elimina 2 alternativas).
- No fim, a tela de resultado mostra o acerto por área e revisa as perguntas que você errou.

## Adicionar perguntas

As perguntas ficam no array `RAW` em `index.html`, no formato:

```js
[nivel, "infra" | "dev" | "redes", "Nome da carta", "Pergunta", ["correta", "errada", "errada", "errada"], "Explicação"]
```

`nivel` vai de 0 (Júnior) a 3 (Tech Lead). A primeira alternativa é sempre a correta; a ordem é embaralhada no jogo.
