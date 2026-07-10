/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Play, Settings2, BookOpen, Clock, AlertCircle } from "lucide-react";
import { Deck, Card } from "../types";

interface DeckCardProps {
  key?: string;
  deck: Deck;
  cards: Card[];
  onStudy: (deckId: string) => void;
  onManage: (deckId: string) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
}

export default function DeckCard({
  deck,
  cards,
  onStudy,
  onManage,
  onEditDeck,
  onDeleteDeck,
}: DeckCardProps) {
  const deckCards = cards.filter((c) => c.deckId === deck.id);
  const totalCount = deckCards.length;

  const now = Date.now();
  const dueCount = deckCards.filter((c) => c.nextReview <= now).length;
  const newCount = deckCards.filter((c) => c.repetitions === 0).length;
  const studiedCount = totalCount - newCount;

  // Calculate percentage of deck studied
  const progressPercent = totalCount > 0 ? Math.round((studiedCount / totalCount) * 100) : 0;

  // Set nice color schemes based on target language name
  const getColorScheme = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes("en") || l.includes("ing")) {
      return {
        bg: "from-blue-500/5 to-indigo-500/5 hover:border-blue-200",
        tag: "bg-blue-50 text-blue-700 border-blue-100",
        icon: "text-blue-500",
        progress: "bg-blue-600",
      };
    }
    if (l.includes("es") || l.includes("esp")) {
      return {
        bg: "from-amber-500/5 to-red-500/5 hover:border-amber-200",
        tag: "bg-amber-50 text-amber-700 border-amber-100",
        icon: "text-amber-500",
        progress: "bg-amber-600",
      };
    }
    if (l.includes("fr") || l.includes("fra")) {
      return {
        bg: "from-cyan-500/5 to-blue-500/5 hover:border-cyan-200",
        tag: "bg-cyan-50 text-cyan-700 border-cyan-100",
        icon: "text-cyan-500",
        progress: "bg-cyan-600",
      };
    }
    // Default fallback
    return {
      bg: "from-purple-500/5 to-pink-500/5 hover:border-purple-200",
      tag: "bg-purple-50 text-purple-700 border-purple-100",
      icon: "text-purple-500",
      progress: "bg-purple-600",
    };
  };

  const colors = getColorScheme(deck.targetLanguage);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-white rounded-3xl border border-gray-100 p-6 shadow-xs bg-gradient-to-br ${colors.bg} transition-all duration-300 flex flex-col justify-between`}
      id={`deck-card-${deck.id}`}
    >
      {/* Top Section */}
      <div id={`deck-card-top-${deck.id}`}>
        <div className="flex items-start justify-between mb-4" id={`deck-card-header-${deck.id}`}>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl" role="img" aria-label={deck.languageName}>
              {deck.flagEmoji || "🌐"}
            </span>
            <div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.tag}`}>
                {deck.languageName}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 font-display mt-0.5">
                {deck.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1" id={`deck-card-config-${deck.id}`}>
            <button
              onClick={() => onEditDeck(deck)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              title="Editar Deck"
              id={`edit-deck-btn-${deck.id}`}
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-5" id={`deck-card-desc-${deck.id}`}>
          {deck.description || "Nenhuma descrição fornecida."}
        </p>
      </div>

      {/* Stats Section */}
      <div className="space-y-4" id={`deck-card-stats-${deck.id}`}>
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1.5">
            <span>Progresso Geral</span>
            <span>{progressPercent}% estudado</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.progress} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Breakdown Tags */}
        <div className="grid grid-cols-3 gap-2 py-1" id={`deck-card-breakdown-${deck.id}`}>
          <div className="bg-gray-50/70 p-2 rounded-xl text-center border border-gray-50">
            <span className="block text-xs text-gray-400 font-medium">Total</span>
            <span className="text-sm font-semibold text-gray-700">{totalCount}</span>
          </div>
          <div className="bg-orange-50/50 p-2 rounded-xl text-center border border-orange-50/50">
            <span className="block text-xs text-orange-600 font-medium flex items-center justify-center gap-0.5">
              Novos
            </span>
            <span className="text-sm font-semibold text-orange-700">{newCount}</span>
          </div>
          <div className="bg-red-50/60 p-2 rounded-xl text-center border border-red-50/50 relative">
            <span className="block text-xs text-red-600 font-medium flex items-center justify-center gap-0.5">
              Estudar
            </span>
            <span className="text-sm font-semibold text-red-700">
              {dueCount}
            </span>
            {dueCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2" id={`deck-card-actions-${deck.id}`}>
          <button
            onClick={() => onManage(deck.id)}
            className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-100 transition-all flex items-center justify-center gap-1.5"
            id={`manage-cards-btn-${deck.id}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-gray-500" />
            Ver Cartões
          </button>
          
          <button
            onClick={() => onStudy(deck.id)}
            disabled={totalCount === 0}
            className={`px-3 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm ${
              totalCount === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : dueCount > 0
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            }`}
            id={`study-deck-btn-${deck.id}`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {totalCount === 0 ? "Sem Cartões" : dueCount > 0 ? "Praticar" : "Revisar Tudo"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
