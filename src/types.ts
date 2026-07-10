/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Deck {
  id: string;
  name: string;
  description: string;
  targetLanguage: string; // e.g., "en", "es", "fr", "de", "it", "ja"
  languageName: string;   // e.g., "Inglês", "Espanhol", "Francês"
  flagEmoji: string;      // e.g., "🇬🇧", "🇪🇸", "🇫🇷"
  createdAt: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;          // Word or expression in target language
  back: string;           // Meaning in user language (Portuguese)
  exampleFront?: string;  // Example sentence in target language
  exampleBack?: string;   // Translation of example sentence
  hint?: string;          // Clue/Hint
  notes?: string;         // Additional grammatical notes
  createdAt: number;
  
  // Spaced Repetition System (SRS) parameters - SuperMemo SM-2
  interval: number;       // In days
  repetitions: number;    // Consecutive correct reviews
  easeFactor: number;     // Easiness factor (starting at 2.5)
  nextReview: number;     // Timestamp of next review
  lastReviewed?: number;  // Timestamp of last review
}

export interface ReviewHistoryEntry {
  id: string;
  cardId: string;
  deckId: string;
  timestamp: number;
  grade: number;          // SM-2 grade (0-5)
  previousInterval: number;
  newInterval: number;
}

export interface UserStats {
  totalStudied: number;   // Total reviews performed
  correctReviews: number; // Total reviews with grade >= 3
  streak: number;         // Current daily streak
  lastStudyDate?: string; // Date of last study (YYYY-MM-DD)
  streakHistory: string[]; // List of YYYY-MM-DD dates studied
}
