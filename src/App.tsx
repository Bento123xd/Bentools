/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Flame, 
  Layers, 
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { Deck, Card, UserStats } from "./types";
import { PRESET_DECKS, PRESET_CARDS, calculateSM2 } from "./utils/srs";

// Sub-components
import StatsOverview from "./components/StatsOverview";
import DeckCard from "./components/DeckCard";
import StudySession from "./components/StudySession";
import CardList from "./components/CardList";
import CardForm from "./components/CardForm";
import DeckForm from "./components/DeckForm";

export default function App() {
  // Navigation / views: "dashboard" | "study" | "manage"
  const [currentView, setCurrentView] = useState<"dashboard" | "study" | "manage">("dashboard");
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  // States
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalStudied: 0,
    correctReviews: 0,
    streak: 0,
    streakHistory: [],
  });

  // Modal control states
  const [isDeckFormOpen, setIsDeckFormOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Hidden file input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load data from LocalStorage or seed presets on first boot
  useEffect(() => {
    const savedDecks = localStorage.getItem("srs_decks");
    const savedCards = localStorage.getItem("srs_cards");
    const savedStats = localStorage.getItem("srs_stats");

    if (savedDecks && savedCards) {
      setDecks(JSON.parse(savedDecks));
      setCards(JSON.parse(savedCards));
    } else {
      // Seed initial data
      setDecks(PRESET_DECKS);
      setCards(PRESET_CARDS);
      localStorage.setItem("srs_decks", JSON.stringify(PRESET_DECKS));
      localStorage.setItem("srs_cards", JSON.stringify(PRESET_CARDS));
    }

    if (savedStats) {
      const parsedStats: UserStats = JSON.parse(savedStats);
      
      // Calculate and verify if daily streak has been broken
      const todayStr = new Date().toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let streak = parsedStats.streak;
      if (parsedStats.streakHistory.length > 0) {
        // If history contains neither today nor yesterday, reset streak to 0
        if (!parsedStats.streakHistory.includes(todayStr) && !parsedStats.streakHistory.includes(yesterdayStr)) {
          streak = 0;
        }
      }

      setStats({
        ...parsedStats,
        streak,
      });
    }
  }, []);

  // 2. Persists stats changes
  const saveStatsToStorage = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem("srs_stats", JSON.stringify(newStats));
  };

  // 3. Spaced repetition review state transition
  const handleFinishReview = (cardId: string, grade: number) => {
    // A. Update the card parameters with SM-2 formula
    const updatedCards = cards.map((c) => {
      if (c.id === cardId) {
        const srsParams = calculateSM2(c, grade);
        return {
          ...c,
          ...srsParams,
          lastReviewed: Date.now(),
        };
      }
      return c;
    });

    setCards(updatedCards);
    localStorage.setItem("srs_cards", JSON.stringify(updatedCards));

    // B. Update User statistics & Daily Streak
    const todayStr = new Date().toISOString().split("T")[0];
    let newStreakHistory = [...stats.streakHistory];
    let currentStreak = stats.streak;

    if (!newStreakHistory.includes(todayStr)) {
      newStreakHistory.push(todayStr);
      newStreakHistory.sort();

      // Check if they studied yesterday to increment streak, or if streak was 0
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (stats.streak === 0 || newStreakHistory.includes(yesterdayStr)) {
        currentStreak += 1;
      } else {
        // If no study yesterday and streak wasn't 0, reset streak to 1 (just started today)
        currentStreak = 1;
      }
    }

    const newStats: UserStats = {
      totalStudied: stats.totalStudied + 1,
      correctReviews: grade >= 3 ? stats.correctReviews + 1 : stats.correctReviews,
      streak: currentStreak,
      lastStudyDate: todayStr,
      streakHistory: newStreakHistory,
    };

    saveStatsToStorage(newStats);
  };

  // 4. Deck CRUD operations
  const handleAddDeckSubmit = (deckData: Omit<Deck, "id" | "createdAt">) => {
    const newDeck: Deck = {
      ...deckData,
      id: `deck-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    localStorage.setItem("srs_decks", JSON.stringify(updatedDecks));
  };

  const handleEditDeckSubmit = (deckData: Omit<Deck, "id" | "createdAt">) => {
    if (!editingDeck) return;
    const updatedDecks = decks.map((d) => 
      d.id === editingDeck.id ? { ...d, ...deckData } : d
    );
    setDecks(updatedDecks);
    localStorage.setItem("srs_decks", JSON.stringify(updatedDecks));
    setEditingDeck(null);
  };

  const handleDeleteDeck = (deckId: string) => {
    const updatedDecks = decks.filter((d) => d.id !== deckId);
    const updatedCards = cards.filter((c) => c.deckId !== deckId);
    setDecks(updatedDecks);
    setCards(updatedCards);
    localStorage.setItem("srs_decks", JSON.stringify(updatedDecks));
    localStorage.setItem("srs_cards", JSON.stringify(updatedCards));
    
    if (activeDeckId === deckId) {
      setActiveDeckId(null);
      setCurrentView("dashboard");
    }
  };

  // 5. Card CRUD operations
  const handleAddCardSubmit = (
    cardData: Omit<Card, "id" | "deckId" | "createdAt" | "interval" | "repetitions" | "easeFactor" | "nextReview">
  ) => {
    if (!activeDeckId) return;
    const newCard: Card = {
      ...cardData,
      id: `card-${Date.now()}`,
      deckId: activeDeckId,
      createdAt: Date.now(),
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: Date.now(),
    };
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    localStorage.setItem("srs_cards", JSON.stringify(updatedCards));
  };

  const handleEditCardSubmit = (
    cardData: Omit<Card, "id" | "deckId" | "createdAt" | "interval" | "repetitions" | "easeFactor" | "nextReview">
  ) => {
    if (!editingCard) return;
    const updatedCards = cards.map((c) => 
      c.id === editingCard.id ? { ...c, ...cardData } : c
    );
    setCards(updatedCards);
    localStorage.setItem("srs_cards", JSON.stringify(updatedCards));
    setEditingCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm("Deseja realmente excluir este cartão de memória?")) {
      const updatedCards = cards.filter((c) => c.id !== cardId);
      setCards(updatedCards);
      localStorage.setItem("srs_cards", JSON.stringify(updatedCards));
    }
  };

  // 6. Database reset to presets
  const handleResetPresets = () => {
    if (window.confirm("Isso redefinirá todos os seus decks, cartões e estatísticas para os padrões iniciais. Seus cartões criados manualmente serão excluídos. Deseja continuar?")) {
      setDecks(PRESET_DECKS);
      setCards(PRESET_CARDS);
      const initialStats = {
        totalStudied: 0,
        correctReviews: 0,
        streak: 0,
        streakHistory: [],
      };
      setStats(initialStats);
      localStorage.setItem("srs_decks", JSON.stringify(PRESET_DECKS));
      localStorage.setItem("srs_cards", JSON.stringify(PRESET_CARDS));
      localStorage.setItem("srs_stats", JSON.stringify(initialStats));
      setCurrentView("dashboard");
      setActiveDeckId(null);
    }
  };

  // 7. Backup and Sync JSON export
  const handleExportData = () => {
    const backupData = {
      decks,
      cards,
      stats,
      version: "1.0",
      exportedAt: Date.now(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "flashcards_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 8. Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.decks && parsed.cards) {
          setDecks(parsed.decks);
          setCards(parsed.cards);
          if (parsed.stats) {
            setStats(parsed.stats);
            localStorage.setItem("srs_stats", JSON.stringify(parsed.stats));
          }
          localStorage.setItem("srs_decks", JSON.stringify(parsed.decks));
          localStorage.setItem("srs_cards", JSON.stringify(parsed.cards));
          alert("Importação concluída com sucesso! Seus decks e progresso foram restaurados.");
        } else {
          alert("Erro: O arquivo selecionado não é um arquivo de backup de flashcards válido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo de backup. Verifique se é um arquivo JSON válido.");
      }
    };
    fileReader.readAsText(file);
    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Helper variables
  const activeDeck = decks.find((d) => d.id === activeDeckId);

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-800 font-sans flex flex-col antialiased">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              setCurrentView("dashboard");
              setActiveDeckId(null);
            }}
            id="brand-logo-container"
          >
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-gray-900 font-display flex items-center gap-1.5 leading-none">
                Repetição Espaçada <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              </h1>
              <span className="text-[10px] text-gray-400 font-medium">Flashcards inteligentes para Idiomas</span>
            </div>
          </div>

          {/* Quick Streak Widget */}
          <div className="flex items-center gap-3">
            {stats.streak > 0 && (
              <div 
                className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 text-orange-600 font-bold text-xs"
                title={`${stats.streak} dias de ofensiva de estudos!`}
                id="header-streak-widget"
              >
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
                <span>{stats.streak}D</span>
              </div>
            )}

            {currentView === "dashboard" && (
              <div className="flex items-center gap-1.5">
                {/* Backup export */}
                <button
                  onClick={handleExportData}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all"
                  title="Exportar backup dos Decks (JSON)"
                  id="export-backup-btn"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Backup import */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all"
                  title="Importar backup dos Decks (JSON)"
                  id="import-backup-btn"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportData}
                  accept=".json"
                  className="hidden"
                  id="hidden-import-input"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: DASHBOARD */}
        {currentView === "dashboard" && (
          <div className="space-y-8" id="dashboard-view">
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="welcome-message-panel">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">
                  Olá! Pronto para praticar?
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Selecione um deck de idioma abaixo para começar suas revisões diárias inteligentes.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingDeck(null);
                  setIsDeckFormOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
                id="create-deck-btn"
              >
                <Plus className="w-4 h-4" /> Novo Deck
              </button>
            </div>

            {/* SRS stats summary tracker panel */}
            <StatsOverview 
              stats={stats} 
              cards={cards} 
              onResetPresets={handleResetPresets} 
            />

            {/* Decks Grid List section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Seus Decks de Idiomas
                </h3>
              </div>

              {decks.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs" id="empty-decks-dashboard">
                  <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-gray-800 font-display">Nenhum deck criado ainda</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                    Crie um novo deck de idioma e adicione cartões para iniciar sua repetição espaçada!
                  </p>
                  <button
                    onClick={() => setIsDeckFormOpen(true)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
                    id="create-first-deck-btn"
                  >
                    Criar Meu Primeiro Deck
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="decks-grid">
                  {decks.map((deck) => (
                    <DeckCard
                      key={deck.id}
                      deck={deck}
                      cards={cards}
                      onStudy={(id) => {
                        setActiveDeckId(id);
                        setCurrentView("study");
                      }}
                      onManage={(id) => {
                        setActiveDeckId(id);
                        setCurrentView("manage");
                      }}
                      onEditDeck={(deckToEdit) => {
                        setEditingDeck(deckToEdit);
                        setIsDeckFormOpen(true);
                      }}
                      onDeleteDeck={handleDeleteDeck}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: STUDY SESSIONS (Interactive Study / SRS Algorithm review) */}
        {currentView === "study" && activeDeck && (
          <StudySession
            deck={activeDeck}
            cards={cards}
            onFinishReview={handleFinishReview}
            onBackToDashboard={() => {
              setCurrentView("dashboard");
              setActiveDeckId(null);
            }}
          />
        )}

        {/* VIEW 3: DICTIONARY / CARD MANAGEMENT VIEW */}
        {currentView === "manage" && activeDeck && (
          <CardList
            deck={activeDeck}
            cards={cards}
            onAddCardClick={() => {
              setEditingCard(null);
              setIsCardFormOpen(true);
            }}
            onEditCardClick={(cardToEdit) => {
              setEditingCard(cardToEdit);
              setIsCardFormOpen(true);
            }}
            onDeleteCard={handleDeleteCard}
            onBackToDashboard={() => {
              setCurrentView("dashboard");
              setActiveDeckId(null);
            }}
          />
        )}
      </main>

      {/* MODAL 1: ADD / EDIT DECK FORM DIALOG */}
      <DeckForm
        isOpen={isDeckFormOpen}
        onClose={() => {
          setIsDeckFormOpen(false);
          setEditingDeck(null);
        }}
        onSubmit={(deckData) => {
          if (editingDeck) {
            handleEditDeckSubmit(deckData);
          } else {
            handleAddDeckSubmit(deckData);
          }
        }}
        onDelete={handleDeleteDeck}
        editingDeck={editingDeck}
      />

      {/* MODAL 2: ADD / EDIT CARD FORM DIALOG */}
      {activeDeck && (
        <CardForm
          isOpen={isCardFormOpen}
          onClose={() => {
            setIsCardFormOpen(false);
            setEditingCard(null);
          }}
          onSubmit={(cardData) => {
            if (editingCard) {
              handleEditCardSubmit(cardData);
            } else {
              handleAddCardSubmit(cardData);
            }
          }}
          editingCard={editingCard}
          deck={activeDeck}
        />
      )}

      {/* Aesthetic humble footer */}
      <footer className="py-6 border-t border-gray-100 bg-white/40 text-center text-xs text-gray-400 mt-auto shrink-0" id="app-footer-brand">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Método SuperMemo-2 (SM-2) • Algoritmo de memorização espaçada
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            © {new Date().getFullYear()} Flashcards de Idiomas
          </span>
        </div>
      </footer>
    </div>
  );
}
