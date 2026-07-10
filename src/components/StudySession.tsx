/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  HelpCircle, 
  ChevronLeft, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  RotateCw,
  Sparkles
} from "lucide-react";
import { Card, Deck } from "../types";

interface StudySessionProps {
  deck: Deck;
  cards: Card[];
  onFinishReview: (cardId: string, grade: number) => void;
  onBackToDashboard: () => void;
}

export default function StudySession({
  deck,
  cards,
  onFinishReview,
  onBackToDashboard,
}: StudySessionProps) {
  // We filter cards that are due (nextReview <= now), but if there are none,
  // we can offer to study the remaining cards (or all cards) in review mode.
  // Let's filter cards due today, and if none, study any cards in this deck.
  const now = Date.now();
  const dueCards = cards.filter((c) => c.deckId === deck.id && c.nextReview <= now);
  const allDeckCards = cards.filter((c) => c.deckId === deck.id);
  
  // Choose session queue: due cards first, if empty, take all cards.
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0 });

  // Initialize the session queue
  useEffect(() => {
    const queue = dueCards.length > 0 ? dueCards : allDeckCards;
    // Shuffle the queue to make studying dynamic
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setSessionCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setIsCompleted(false);
    setStats({ total: shuffled.length, correct: 0 });
  }, [deck.id]);

  const currentCard = sessionCards[currentIndex];

  // TTS Pronunciation function
  const speakText = (text: string, langCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent card flipping on speaker click
    
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis is not supported on this browser.");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    // Try to find a high-quality native voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Play audio automatically on card loading
  useEffect(() => {
    if (currentCard && !isFlipped) {
      // Small timeout to allow transition to finish
      const timer = setTimeout(() => {
        speakText(currentCard.front, deck.targetLanguage);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isFlipped]);

  const handleGrade = (grade: number) => {
    if (!currentCard) return;

    // Track statistics for this session
    if (grade >= 3) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    }

    // Trigger parent state update with SM-2 formula
    onFinishReview(currentCard.id, grade);

    // Proceed to next card or complete
    if (currentIndex + 1 < sessionCards.length) {
      setIsFlipped(false);
      setShowHint(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 150);
    } else {
      setIsCompleted(true);
    }
  };

  if (sessionCards.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs text-center max-w-md mx-auto my-12" id="empty-session">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 font-display mb-2">Tudo em Dia!</h3>
        <p className="text-sm text-gray-500 mb-6">
          Você não tem cartões pendentes de revisão para o deck <strong>{deck.name}</strong> neste momento. Bom trabalho!
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              // Custom study mode: Force practice all cards anyway
              const shuffled = [...allDeckCards].sort(() => Math.random() - 0.5);
              setSessionCards(shuffled);
              setCurrentIndex(0);
              setIsCompleted(false);
            }}
            disabled={allDeckCards.length === 0}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            id="force-study-all-btn"
          >
            Praticar Mesmo Assim ({allDeckCards.length})
          </button>
          <button
            onClick={onBackToDashboard}
            className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm border border-gray-100 transition-all"
            id="back-to-dash-btn"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  // Study Completed screen
  if (isCompleted) {
    const successRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 100;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs text-center max-w-md mx-auto my-12 relative overflow-hidden"
        id="session-completion"
      >
        {/* Confetti element decoration */}
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-10">
          <Sparkles className="w-64 h-64 text-amber-500 animate-pulse" />
        </div>

        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
          <Sparkles className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 font-display mb-1">Sessão Concluída!</h3>
        <p className="text-sm text-gray-500 mb-6">Você treinou o vocabulário de {deck.name}.</p>

        {/* Stats card */}
        <div className="bg-gray-50 p-4 rounded-2xl grid grid-cols-2 gap-4 mb-6 text-center border border-gray-100">
          <div>
            <span className="block text-[11px] text-gray-400 font-medium uppercase">Cartões</span>
            <span className="text-xl font-bold text-gray-800">{stats.total}</span>
          </div>
          <div>
            <span className="block text-[11px] text-gray-400 font-medium uppercase">Precisão</span>
            <span className={`text-xl font-bold ${successRate >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
              {successRate}%
            </span>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
          id="finish-session-btn"
        >
          Voltar ao Painel
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto" id="study-session-container">
      {/* Session Header */}
      <div className="flex items-center justify-between mb-6" id="study-session-header">
        <button
          onClick={onBackToDashboard}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl border border-gray-100 transition-all flex items-center gap-1 text-xs"
          id="exit-study-btn"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estudando</span>
          <h4 className="text-sm font-semibold text-gray-800 flex items-center justify-center gap-1.5 mt-0.5">
            <span>{deck.flagEmoji}</span>
            <span>{deck.name}</span>
          </h4>
        </div>

        <div className="text-xs font-semibold text-gray-400 font-mono bg-white px-3 py-1.5 rounded-xl border border-gray-100">
          {currentIndex + 1} / {sessionCards.length}
        </div>
      </div>

      {/* Queue Progress Bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / sessionCards.length) * 100}%` }}
        ></div>
      </div>

      {/* Main Flashcard View */}
      <div className="perspective-1000 w-full min-h-[380px] mb-8 relative">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full h-full min-h-[380px] cursor-pointer rounded-3xl transition-transform duration-500 transform-style-3d relative ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          id="3d-flashcard"
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border border-gray-100 p-8 flex flex-col justify-between shadow-xs backface-hidden">
            <div className="flex justify-between items-center text-xs text-indigo-500 font-medium">
              <span>Como se diz isso em português?</span>
              <span className="bg-indigo-50 px-2 py-1 rounded-lg">Frente</span>
            </div>

            <div className="my-auto text-center space-y-4 py-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight font-display break-words">
                {currentCard.front}
              </h2>
              
              <button
                onClick={(e) => speakText(currentCard.front, deck.targetLanguage, e)}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-all inline-flex items-center justify-center hover:scale-105"
                title="Ouvir pronúncia"
                id="pronounce-word-front-btn"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                  showHint 
                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                    : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                }`}
                id="hint-btn"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? "Ocultar Dica" : "Ver Dica"}
              </button>

              <div className="text-xs text-gray-400 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" /> Clique para revelar a tradução
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border border-gray-100 p-8 flex flex-col justify-between shadow-xs backface-hidden rotate-y-180">
            <div className="flex justify-between items-center text-xs text-emerald-500 font-medium">
              <span>Tradução e detalhes</span>
              <span className="bg-emerald-50 px-2 py-1 rounded-lg">Verso</span>
            </div>

            <div className="my-auto space-y-5 text-center overflow-y-auto max-h-[220px] py-3 pr-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Tradução</span>
                <p className="text-2xl font-bold text-gray-900 font-display">
                  {currentCard.back}
                </p>
              </div>

              {currentCard.exampleFront && (
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100/50 inline-block w-full max-w-sm text-left">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Frase Exemplo</span>
                    <button
                      onClick={(e) => speakText(currentCard.exampleFront!, deck.targetLanguage, e)}
                      className="p-1 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100/50 rounded-md transition-colors"
                      title="Ouvir frase"
                      id="pronounce-example-btn"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-relaxed font-sans italic">
                    "{currentCard.exampleFront}"
                  </p>
                  {currentCard.exampleBack && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {currentCard.exampleBack}
                    </p>
                  )}
                </div>
              )}

              {currentCard.notes && (
                <div className="text-left text-xs bg-amber-50/40 p-3 rounded-xl text-gray-600 border border-amber-100/30 flex items-start gap-1.5 max-w-sm mx-auto">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-gray-700 text-[10px] uppercase tracking-wider">Nota Gramatical</span>
                    <span>{currentCard.notes}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center pt-3 border-t border-gray-50 text-[10px] text-gray-400">
              Clique no cartão para rever a pergunta
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hint Overlay */}
      <AnimatePresence>
        {showHint && !isFlipped && currentCard.hint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 text-sm text-amber-800 flex items-start gap-2 max-w-xl mx-auto shadow-xs"
            id="hint-overlay"
          >
            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider mb-0.5">Dica</strong>
              <p>{currentCard.hint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grading Controls - Shown ONLY after flipped */}
      <div className="h-20 flex items-center justify-center" id="session-controls-area">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.button
              key="reveal-btn"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setIsFlipped(true)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              id="reveal-response-btn"
            >
              Revelar Resposta
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.div
              key="grade-btns"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="grid grid-cols-4 gap-2.5 w-full"
              id="grade-buttons-group"
            >
              {/* AGAIN */}
              <button
                onClick={() => handleGrade(1)}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-all text-center group"
                id="grade-1-btn"
              >
                <span className="text-xs font-bold text-red-600 group-hover:scale-105 transition-transform">Novamente</span>
                <span className="text-[9px] text-red-400 mt-1 font-mono">1 dia</span>
              </button>

              {/* HARD */}
              <button
                onClick={() => handleGrade(3)}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-all text-center group"
                id="grade-3-btn"
              >
                <span className="text-xs font-bold text-amber-700 group-hover:scale-105 transition-transform">Difícil</span>
                <span className="text-[9px] text-amber-500 mt-1 font-mono">~2 dias</span>
              </button>

              {/* GOOD */}
              <button
                onClick={() => handleGrade(4)}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all text-center group"
                id="grade-4-btn"
              >
                <span className="text-xs font-bold text-blue-700 group-hover:scale-105 transition-transform">Bom</span>
                <span className="text-[9px] text-blue-500 mt-1 font-mono">~4 dias</span>
              </button>

              {/* EASY */}
              <button
                onClick={() => handleGrade(5)}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-all text-center group"
                id="grade-5-btn"
              >
                <span className="text-xs font-bold text-emerald-700 group-hover:scale-105 transition-transform">Fácil</span>
                <span className="text-[9px] text-emerald-500 mt-1 font-mono">~8 dias</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
