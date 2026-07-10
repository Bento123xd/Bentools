/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Save, HelpCircle, AlertCircle, Sparkles } from "lucide-react";
import { Card, Deck } from "../types";

interface CardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: Omit<Card, "id" | "deckId" | "createdAt" | "interval" | "repetitions" | "easeFactor" | "nextReview">) => void;
  editingCard?: Card | null;
  deck: Deck;
}

export default function CardForm({
  isOpen,
  onClose,
  onSubmit,
  editingCard,
  deck,
}: CardFormProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [exampleFront, setExampleFront] = useState("");
  const [exampleBack, setExampleBack] = useState("");
  const [hint, setHint] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingCard) {
      setFront(editingCard.front);
      setBack(editingCard.back);
      setExampleFront(editingCard.exampleFront || "");
      setExampleBack(editingCard.exampleBack || "");
      setHint(editingCard.hint || "");
      setNotes(editingCard.notes || "");
    } else {
      setFront("");
      setBack("");
      setExampleFront("");
      setExampleBack("");
      setHint("");
      setNotes("");
    }
    setError("");
  }, [editingCard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!front.trim()) {
      setError("A palavra ou frase de origem (Frente) é obrigatória.");
      return;
    }
    if (!back.trim()) {
      setError("A tradução ou significado (Verso) é obrigatório.");
      return;
    }

    onSubmit({
      front: front.trim(),
      back: back.trim(),
      exampleFront: exampleFront.trim() || undefined,
      exampleBack: exampleBack.trim() || undefined,
      hint: hint.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="card-form-modal-container">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity duration-300"
        id="card-form-backdrop"
      ></div>

      {/* Modal Box */}
      <div 
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden"
        id="card-form-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0" id="card-form-header">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Deck">
              {deck.flagEmoji}
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-display">
                {editingCard ? "Editar Cartão" : "Criar Novo Cartão"}
              </h3>
              <p className="text-xs text-gray-400">Inserindo no deck {deck.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            id="close-card-form-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-left" id="card-form">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl text-xs text-red-700 flex items-start gap-2" id="card-form-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Front field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Palavra ou Frase ({deck.languageName}) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Break a leg"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
              required
              id="card-form-front"
            />
          </div>

          {/* Back field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Tradução / Significado (Português) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Boa sorte"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
              required
              id="card-form-back"
            />
          </div>

          {/* Example Front field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Frase Exemplo ({deck.languageName})
            </label>
            <input
              type="text"
              placeholder="Ex: Break a leg tonight at your show!"
              value={exampleFront}
              onChange={(e) => setExampleFront(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
              id="card-form-ex-front"
            />
          </div>

          {/* Example Back field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Tradução do Exemplo (Português)
            </label>
            <input
              type="text"
              placeholder="Ex: Quebre a perna hoje à noite no seu show!"
              value={exampleBack}
              onChange={(e) => setExampleBack(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
              id="card-form-ex-back"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hint field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block flex items-center gap-1">
                Dica / Ajuda <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </label>
              <input
                type="text"
                placeholder="Ex: Expressão teatral"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
                id="card-form-hint"
              />
            </div>

            {/* Notes field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Notas extras / Gramática
              </label>
              <input
                type="text"
                placeholder="Ex: Gíria informal"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
                id="card-form-notes"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/60 flex items-center justify-end gap-3 shrink-0" id="card-form-footer">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            id="cancel-card-form-btn"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2"
            id="save-card-btn"
          >
            <Save className="w-4 h-4" />
            {editingCard ? "Atualizar Cartão" : "Criar Cartão"}
          </button>
        </div>
      </div>
    </div>
  );
}
