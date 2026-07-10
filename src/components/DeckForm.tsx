/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Trash2 } from "lucide-react";
import { Deck } from "../types";

interface DeckFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deckData: Omit<Deck, "id" | "createdAt">) => void;
  onDelete?: (deckId: string) => void;
  editingDeck?: Deck | null;
}

// Preset languages we support out of the box with easy speech synthesis matching
const LANGUAGES_MAP: Record<string, { name: string; flag: string }> = {
  "en-US": { name: "Inglês (EUA)", flag: "🇺🇸" },
  "en-GB": { name: "Inglês (Reino Unido)", flag: "🇬🇧" },
  "es-ES": { name: "Espanhol (Espanha)", flag: "🇪🇸" },
  "fr-FR": { name: "Francês (França)", flag: "🇫🇷" },
  "de-DE": { name: "Alemão (Alemanha)", flag: "🇩🇪" },
  "it-IT": { name: "Italiano (Itália)", flag: "🇮🇹" },
  "ja-JP": { name: "Japonês (Japão)", flag: "🇯🇵" },
  "zh-CN": { name: "Chinês (China)", flag: "🇨🇳" },
  "pt-PT": { name: "Português (Portugal)", flag: "🇵🇹" },
  "ru-RU": { name: "Russo (Rússia)", flag: "🇷🇺" },
};

export default function DeckForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingDeck,
}: DeckFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en-US");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingDeck) {
      setName(editingDeck.name);
      setDescription(editingDeck.description || "");
      setTargetLanguage(editingDeck.targetLanguage || "en-US");
    } else {
      setName("");
      setDescription("");
      setTargetLanguage("en-US");
    }
    setError("");
  }, [editingDeck, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("O nome do deck é obrigatório.");
      return;
    }

    const langInfo = LANGUAGES_MAP[targetLanguage] || { name: "Outro", flag: "🌐" };

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      targetLanguage,
      languageName: langInfo.name,
      flagEmoji: langInfo.flag,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="deck-form-modal-container">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity duration-300"
        id="deck-form-backdrop"
      ></div>

      {/* Modal Box */}
      <div 
        className="relative bg-white rounded-3xl w-full max-w-md shadow-xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden"
        id="deck-form-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0" id="deck-form-header">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-display">
              {editingDeck ? "Configurações do Deck" : "Criar Novo Deck de Idiomas"}
            </h3>
            <p className="text-xs text-gray-400">
              {editingDeck ? "Altere os detalhes do deck selecionado" : "Crie um novo deck para organizar seus cartões"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            id="close-deck-form-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left" id="deck-form">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl text-xs text-red-700 flex items-start gap-2" id="deck-form-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Nome do Deck <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Espanhol para Viagem"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
              required
              id="deck-form-name"
            />
          </div>

          {/* Description field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Descrição do Deck
            </label>
            <textarea
              placeholder="Ex: Expressões básicas para hotéis, aeroportos e restaurantes."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 resize-none"
              id="deck-form-desc"
            />
          </div>

          {/* Language dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Idioma de Destino (Para pronúncia por áudio)
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
              id="deck-form-lang-select"
            >
              {Object.entries(LANGUAGES_MAP).map(([code, details]) => (
                <option key={code} value={code}>
                  {details.flag} {details.name} ({code})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 leading-normal">
              O sistema usará a voz nativa correspondente para pronunciar seus cartões na tela de estudos.
            </p>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/60 flex items-center justify-between shrink-0" id="deck-form-footer">
          {editingDeck && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Tem certeza de que deseja excluir o deck "${editingDeck.name}"? Todos os cartões associados serão perdidos permanentemente.`)) {
                  onDelete(editingDeck.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-red-100"
              id="delete-deck-btn"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir Deck
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              id="cancel-deck-form-btn"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2"
              id="save-deck-btn"
            >
              <Save className="w-4 h-4" />
              {editingDeck ? "Salvar" : "Criar Deck"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
