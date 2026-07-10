/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  SlidersHorizontal, 
  Volume2, 
  HelpCircle,
  CalendarDays,
  FileSpreadsheet
} from "lucide-react";
import { Card, Deck } from "../types";
import { formatNextReview } from "../utils/srs";

interface CardListProps {
  deck: Deck;
  cards: Card[];
  onAddCardClick: () => void;
  onEditCardClick: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onBackToDashboard: () => void;
}

type CardFilter = "all" | "due" | "new" | "learned";

export default function CardList({
  deck,
  cards,
  onAddCardClick,
  onEditCardClick,
  onDeleteCard,
  onBackToDashboard,
}: CardListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<CardFilter>("all");

  const deckCards = cards.filter((c) => c.deckId === deck.id);
  const now = Date.now();

  // Filters application
  const filteredCards = deckCards.filter((card) => {
    // 1. Search term match
    const matchesSearch = 
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.exampleFront || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.exampleBack || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Status filter match
    switch (activeFilter) {
      case "due":
        return card.nextReview <= now;
      case "new":
        return card.repetitions === 0;
      case "learned":
        return card.repetitions > 3 && card.interval > 7;
      case "all":
      default:
        return true;
    }
  });

  const speakText = (text: string, langCode: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6" id="card-list-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="card-list-header">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl border border-gray-100 transition-all"
            id="card-list-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{deck.flagEmoji}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
                {deck.languageName}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-display mt-0.5">
              Dicionário do Deck: {deck.name}
            </h2>
          </div>
        </div>

        <button
          onClick={onAddCardClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 self-start sm:self-auto"
          id="add-card-top-btn"
        >
          <Plus className="w-4 h-4" /> Novo Cartão
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-4" id="search-filter-panel">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por termo, tradução ou exemplo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 text-gray-800"
              id="card-search-input"
            />
          </div>

          {/* Filter options buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0" id="card-filters">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-xs"
                  : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
              }`}
            >
              Todos ({deckCards.length})
            </button>
            <button
              onClick={() => setActiveFilter("due")}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap ${
                activeFilter === "due"
                  ? "bg-red-50 text-red-700 border-red-100 shadow-xs"
                  : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
              }`}
            >
              Pendentes ({deckCards.filter((c) => c.nextReview <= now).length})
            </button>
            <button
              onClick={() => setActiveFilter("new")}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap ${
                activeFilter === "new"
                  ? "bg-amber-50 text-amber-700 border-amber-100 shadow-xs"
                  : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
              }`}
            >
              Novos ({deckCards.filter((c) => c.repetitions === 0).length})
            </button>
            <button
              onClick={() => setActiveFilter("learned")}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap ${
                activeFilter === "learned"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-xs"
                  : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
              }`}
            >
              Concluídos ({deckCards.filter((c) => c.repetitions > 3 && c.interval > 7).length})
            </button>
          </div>
        </div>
      </div>

      {/* Cards List Display */}
      {filteredCards.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xs text-center" id="empty-cards-list">
          <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 font-display">Nenhum cartão encontrado</h3>
          <p className="text-sm text-gray-500 mt-1">
            Tente mudar o termo de pesquisa ou filtros aplicados, ou crie um novo cartão!
          </p>
          <button
            onClick={onAddCardClick}
            className="mt-4 inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-4 py-2 rounded-xl text-xs transition-all border border-indigo-100"
            id="add-card-empty-btn"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Primeiro Cartão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="cards-grid">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => {
              const isDue = card.nextReview <= now;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={card.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-gray-200 transition-all duration-200 flex flex-col justify-between"
                  id={`card-item-${card.id}`}
                >
                  <div>
                    {/* Card Tags / SRS info */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        card.repetitions === 0
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : card.repetitions > 3 && card.interval > 7
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {card.repetitions === 0 
                          ? "Novo" 
                          : card.repetitions > 3 && card.interval > 7
                          ? "Concluído" 
                          : `Repetição x${card.repetitions}`}
                      </span>

                      <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-300" />
                        {formatNextReview(card.nextReview)}
                      </span>
                    </div>

                    {/* Word and translation */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-bold text-gray-900 break-words font-display">
                          {card.front}
                        </h4>
                        <button
                          onClick={() => speakText(card.front, deck.targetLanguage)}
                          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                          title="Ouvir pronúncia"
                          id={`pronounce-list-${card.id}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-sans font-medium">
                        {card.back}
                      </p>
                    </div>

                    {/* Example sentence (if present) */}
                    {card.exampleFront && (
                      <div className="bg-gray-50 p-2.5 rounded-xl text-xs mb-4 border border-gray-50 text-gray-500">
                        <span className="block font-semibold text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Exemplo:</span>
                        <p className="italic text-gray-700 font-sans font-medium">"{card.exampleFront}"</p>
                        {card.exampleBack && <p className="mt-0.5 text-gray-500">{card.exampleBack}</p>}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50" id={`card-item-actions-${card.id}`}>
                    <div className="text-[10px] text-gray-400" title="Easiness Factor">
                      Fator de Facilidade: <strong className="font-mono">{card.easeFactor.toFixed(2)}</strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditCardClick(card)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar Cartão"
                        id={`edit-card-btn-${card.id}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCard(card.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Cartão"
                        id={`delete-card-btn-${card.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
