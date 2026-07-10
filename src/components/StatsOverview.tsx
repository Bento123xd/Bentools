/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { BookOpen, Flame, CheckCircle, Calendar, Award, RefreshCw } from "lucide-react";
import { UserStats, Card } from "../types";

interface StatsOverviewProps {
  stats: UserStats;
  cards: Card[];
  onResetPresets: () => void;
}

export default function StatsOverview({ stats, cards, onResetPresets }: StatsOverviewProps) {
  // Calculate stats based on cards
  const totalCards = cards.length;
  const learnedCards = cards.filter(c => c.repetitions > 3 && c.interval > 7).length;
  const inProgressCards = cards.filter(c => c.repetitions > 0 && !(c.repetitions > 3 && c.interval > 7)).length;
  const newCards = cards.filter(c => c.repetitions === 0).length;

  const now = Date.now();
  const dueCards = cards.filter(c => c.nextReview <= now).length;

  // Calculate accurate retention rate
  const retentionRate = stats.totalStudied > 0 
    ? Math.round((stats.correctReviews / stats.totalStudied) * 100) 
    : 100;

  // Let's create an elegant visual calendar showing the past 7 days study status
  const getPastSevenDays = () => {
    const days = [];
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasStudied = stats.streakHistory.includes(dateStr);
      const dayName = weekdays[d.getDay()];
      const dayNum = d.getDate();
      
      days.push({
        dateStr,
        dayName,
        dayNum,
        hasStudied,
        isToday: i === 0
      });
    }
    return days;
  };

  const pastSevenDays = getPastSevenDays();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" id="stats-overview-container">
      {/* Left 2 Cols: Main Stats Cards Grid */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4" id="stats-grid">
        {/* Streak card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between"
          id="stat-streak-card"
        >
          <div className="flex items-center justify-between text-orange-500 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ofensiva</span>
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 font-display">
              {stats.streak} {stats.streak === 1 ? "Dia" : "Dias"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Sua constância de estudos</p>
          </div>
        </motion.div>

        {/* Total studied */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between"
          id="stat-studied-card"
        >
          <div className="flex items-center justify-between text-indigo-500 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revisões</span>
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 font-display">
              {stats.totalStudied}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total de cartões revistos</p>
          </div>
        </motion.div>

        {/* Accuracy rate */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between"
          id="stat-retention-card"
        >
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Acertos</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 font-display">
              {retentionRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Taxa de recordação</p>
          </div>
        </motion.div>

        {/* Due Today */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between"
          id="stat-due-card"
        >
          <div className="flex items-center justify-between text-red-500 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pendentes</span>
            <div className="p-1.5 bg-red-50 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 font-display">
              {dueCards}
            </div>
            <p className="text-xs text-gray-500 mt-1">Cartões para rever hoje</p>
          </div>
        </motion.div>
      </div>

      {/* Right 1 Col: Visual Calendar Activity & Deck Stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between"
        id="stats-activity-card"
      >
        <div className="flex items-center justify-between mb-3" id="stats-activity-header">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" /> Atividade Semanal
          </span>
          <button 
            onClick={onResetPresets}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            title="Restaurar dados padrão"
            id="reset-presets-btn"
          >
            <RefreshCw className="w-3 h-3" /> Restaurar Padrões
          </button>
        </div>

        {/* Weekly calendar tracker */}
        <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl gap-1 mb-3" id="weekly-calendar">
          {pastSevenDays.map((day) => (
            <div 
              key={day.dateStr} 
              className="flex flex-col items-center flex-1"
              title={`${day.dayName}, ${day.dayNum} - ${day.hasStudied ? "Estudou!" : "Sem atividade"}`}
            >
              <span className="text-[10px] text-gray-400 font-medium mb-1">{day.dayName}</span>
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                  day.hasStudied 
                    ? "bg-orange-500 text-white shadow-xs" 
                    : day.isToday 
                      ? "bg-white border-2 border-orange-200 text-gray-800" 
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {day.dayNum}
              </div>
            </div>
          ))}
        </div>

        {/* Summary counts */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1" id="srs-breakdown-counts">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> 
            Concluídos: <strong>{learnedCards}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> 
            Em progresso: <strong>{inProgressCards}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block"></span> 
            Novos: <strong>{newCards}</strong>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
