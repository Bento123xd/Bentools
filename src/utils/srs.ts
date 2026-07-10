/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, Deck } from "../types";

// SuperMemo SM-2 algorithm implementation
export function calculateSM2(
  card: Card,
  grade: number // 1 (Again), 3 (Hard), 4 (Good), 5 (Easy)
): { interval: number; repetitions: number; easeFactor: number; nextReview: number } {
  let interval = 0;
  let repetitions = 0;
  let easeFactor = card.easeFactor;

  // Calculate easeFactor according to SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  if (grade < 3) {
    // If response was incorrect, reset repetitions
    repetitions = 0;
    interval = 1; // Repeat tomorrow (1 day)
  } else {
    // Correct response
    if (card.repetitions === 0) {
      interval = 1; // 1 day
    } else if (card.repetitions === 1) {
      interval = 4; // 4 days (or 6 days in standard, let's use 3-4 days to keep it active for learners)
    } else {
      interval = Math.round(card.interval * easeFactor);
    }
    repetitions = card.repetitions + 1;
  }

  // Safety cap on interval: Max 365 days
  if (interval > 365) {
    interval = 365;
  }

  const now = Date.now();
  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return {
    interval,
    repetitions,
    easeFactor,
    nextReview,
  };
}

// Format relative date for card review status
export function formatNextReview(nextReviewTimestamp: number): string {
  const now = Date.now();
  const diff = nextReviewTimestamp - now;

  if (diff <= 0) {
    return "Pendente";
  }

  const diffHours = Math.ceil(diff / (1000 * 60 * 60));
  if (diffHours < 24) {
    return `Em ${diffHours}h`;
  }

  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return "Amanhã";
  }

  return `Em ${diffDays} dias`;
}

// Preset Decks and Cards
export const PRESET_DECKS: Deck[] = [
  {
    id: "deck-en-basic",
    name: "Inglês do Dia a Dia",
    description: "Expressões idiomáticas, gírias e frases essenciais para soar como um nativo no inglês americano.",
    targetLanguage: "en-US",
    languageName: "Inglês",
    flagEmoji: "🇺🇸",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: "deck-es-essential",
    name: "Espanhol Essencial",
    description: "Frases, expressões comuns e verbos essenciais para viagem e conversação do dia a dia em espanhol.",
    targetLanguage: "es-ES",
    languageName: "Espanhol",
    flagEmoji: "🇪🇸",
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
  {
    id: "deck-fr-practical",
    name: "Francês Prático",
    description: "Expressões úteis, etiqueta social e vocabulário chave em francês para situações reais.",
    targetLanguage: "fr-FR",
    languageName: "Francês",
    flagEmoji: "🇫🇷",
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  }
];

export const PRESET_CARDS: Card[] = [
  // --- INGLÊS ---
  {
    id: "en-1",
    deckId: "deck-en-basic",
    front: "Get a handle on something",
    back: "Entender ou passar a controlar uma situação difícil ou complexa.",
    exampleFront: "I'm trying to get a handle on this new software before the project starts.",
    exampleBack: "Estou tentando entender/controlar este novo software antes do projeto começar.",
    hint: "Tem a ver com segurar ou segurar uma alça (handle).",
    notes: "Muito utilizado no ambiente corporativo.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "en-2",
    deckId: "deck-en-basic",
    front: "Break a leg",
    back: "Boa sorte! (Expressão usada para desejar boa sorte, especialmente no teatro/artes).",
    exampleFront: "You have a big presentation today? Break a leg!",
    exampleBack: "Você tem uma grande apresentação hoje? Boa sorte!",
    hint: "Literalmente significa 'quebrar uma perna'.",
    notes: "Dizer 'good luck' para atores é considerado azar no meio teatral; daí surgiu a expressão.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "en-3",
    deckId: "deck-en-basic",
    front: "Under the weather",
    back: "Indisposto, um pouco doente ou sem energia.",
    exampleFront: "I decided to stay home because I was feeling a bit under the weather.",
    exampleBack: "Decidi ficar em casa porque estava me sentindo um pouco indisposta.",
    hint: "Tem relação com 'tempo' ou 'clima' (weather).",
    notes: "Usa-se para resfriados leves, ressaca ou mal-estar passageiro.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "en-4",
    deckId: "deck-en-basic",
    front: "On the tip of my tongue",
    back: "Na ponta da língua (quando você sabe que sabe algo, mas não consegue lembrar no momento).",
    exampleFront: "Her name is on the tip of my tongue, but I just can't recall it!",
    exampleBack: "O nome dela está na ponta da minha língua, mas não consigo me lembrar!",
    hint: "Traduz-se literalmente de forma idêntica ao português.",
    notes: "Expressão idiomática universalmente idêntica à versão em português.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "en-5",
    deckId: "deck-en-basic",
    front: "By the way",
    back: "A propósito, por falar nisso, de passagem.",
    exampleFront: "By the way, did you check the spreadsheet I sent you yesterday?",
    exampleBack: "A propósito, você checou a planilha que te enviei ontem?",
    hint: "Abrevia-se muito como 'BTW' em mensagens de texto.",
    notes: "Usado para mudar de assunto ou introduzir uma informação extra na conversa.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },

  // --- ESPANHOL ---
  {
    id: "es-1",
    deckId: "deck-es-essential",
    front: "Echar de menos",
    back: "Sentir falta, sentir saudades de alguém ou de algo.",
    exampleFront: "Te echo de menos cuando viajas por tanto tiempo.",
    exampleBack: "Sinto sua falta quando você viaja por tanto tempo.",
    hint: "Sinônimo de 'extrañar'.",
    notes: "Mais comum na Espanha; na América Latina usa-se muito 'extrañar'.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "es-2",
    deckId: "deck-es-essential",
    front: "Dar en el clavo",
    back: "Acertar em cheio, adivinhar a resposta exata ou a solução perfeita.",
    exampleFront: "Con tu propuesta de diseño, diste en el clavo.",
    exampleBack: "Com sua proposta de design, você acertou em cheio.",
    hint: "Tem a ver com acertar a cabeça do prego (clavo).",
    notes: "Significa resolver um problema de forma perfeita e inteligente.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "es-3",
    deckId: "deck-es-essential",
    front: "Vale la pena",
    back: "Vale a pena, compensa o esforço ou custo.",
    exampleFront: "Visitar esa pequeña isla vale la pena, el paisaje es increíble.",
    exampleBack: "Visitar essa pequena ilha vale a pena, a paisagem é incrível.",
    hint: "Literalmente 'vale a pena' (pena = sofrimento/esforço).",
    notes: "Pode ser usado no presente, passado ('valió la pena') ou futuro.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "es-4",
    deckId: "deck-es-essential",
    front: "Poco a poco",
    back: "Aos poucos, gradualmente.",
    exampleFront: "Poco a poco estamos mejorando nuestra pronunciación.",
    exampleBack: "Aos poucos estamos melhorando nossa pronúncia.",
    hint: "Refere-se a passos pequenos.",
    notes: "Expressão idêntica ao português de Portugal e muito parecida com o nosso 'pouco a pouco'.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "es-5",
    deckId: "deck-es-essential",
    front: "Hacerse el sueco",
    back: "Fingir que não ouviu, dar uma de desentendido (fazer-se de bobo).",
    exampleFront: "No te hagas el sueco, sabes perfectamente de qué te estoy hablando.",
    exampleBack: "Não dê uma de desentendido, você sabe perfeitamente do que estou falando.",
    hint: "Refere-se ao país da Suécia (sueco).",
    notes: "Diz-se que a expressão vem dos marinheiros suecos que aportavam e fingiam não entender espanhol para evitar taxas.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },

  // --- FRANCÊS ---
  {
    id: "fr-1",
    deckId: "deck-fr-practical",
    front: "Ça vaut le coup",
    back: "Vale a pena, compensa.",
    exampleFront: "Tu devrais aller voir ce film, ça vaut vraiment le coup.",
    exampleBack: "Você deveria ir assistir a esse filme, vale muito a pena.",
    hint: "Equivalente ao espanhol 'vale la pena' e ao inglês 'it's worth it'.",
    notes: "Expressão ultra comum no francês cotidiano falado.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "fr-2",
    deckId: "deck-fr-practical",
    front: "S'il vous plaît",
    back: "Por favor (formal ou plural).",
    exampleFront: "Un café et l'addition, s'il vous plaît.",
    exampleBack: "Um café e a conta, por favor.",
    hint: "A versão informal para amigos é 'S'il te plaît'.",
    notes: "Indispensável na etiqueta social francesa; deve ser usado em qualquer interação pública.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "fr-3",
    deckId: "deck-fr-practical",
    front: "À tout à l'heure",
    back: "Até logo, até mais tarde (usado para quando você vai ver a pessoa no mesmo dia).",
    exampleFront: "On se retrouve au restaurant ce soir. À tout à l'heure !",
    exampleBack: "A gente se encontra no restaurante hoje à noite. Até mais tarde!",
    hint: "Frequentemente abreviado em mensagens informais como 'A++' ou 'TàL'.",
    notes: "Usa-se para intervalos de algumas horas dentro do mesmo dia.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "fr-4",
    deckId: "deck-fr-practical",
    front: "Prendre son temps",
    back: "Ir sem pressa, ir no seu tempo, com calma.",
    exampleFront: "Prends ton temps, nous ne sommes pas pressés.",
    exampleBack: "Vá no seu tempo, não estamos com pressa.",
    hint: "Literalmente significa 'pegar o seu tempo'.",
    notes: "Pode ser conjugado para qualquer pessoa ('je prends mon temps', 'il prend son temps').",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  },
  {
    id: "fr-5",
    deckId: "deck-fr-practical",
    front: "C'est pas grave",
    back: "Não tem problema, não faz mal, tudo bem.",
    exampleFront: "Ah tu as oublié ton livre ? C'est pas grave, on peut partager.",
    exampleBack: "Ah você esqueceu seu livro? Não tem problema, podemos compartilhar.",
    hint: "Coloquial para 'Ce n'est pas grave'.",
    notes: "É a resposta mais comum em francês para desculpas ou pequenos imprevistos.",
    createdAt: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  }
];
