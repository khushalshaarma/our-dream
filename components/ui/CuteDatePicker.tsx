'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, X, Sparkles, Check } from 'lucide-react';
import { sound } from '@/lib/audio';

interface CuteDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onChangeDate: (date: string) => void;
  selectedTime: string; // e.g. "11:30 PM"
  onChangeTime: (time: string) => void;
  className?: string;
}

const TIME_PRESETS = [
  { time: '10:00 PM', label: '10:00 PM', desc: 'cozy watch', icon: '🌙' },
  { time: '11:30 PM', label: '11:30 PM', desc: 'late night', icon: '✨' },
  { time: '12:00 AM', label: '12:00 AM', desc: 'midnight', icon: '🎀' },
  { time: '1:30 AM', label: '1:30 AM', desc: 'night owls', icon: '🦉' },
  { time: '2:00 AM', label: '2:00 AM', desc: 'our usual', icon: '💜' },
];

export const CuteDatePicker: React.FC<CuteDatePickerProps> = ({
  selectedDate,
  onChangeDate,
  selectedTime,
  onChangeTime,
  className = '',
}) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewDate, setViewDate] = useState(() => (isNaN(initialDate.getTime()) ? new Date() : initialDate));
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.playHeartPop();
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.playHeartPop();
    setViewDate(new Date(year, month + 1, 1));
  };

  const selectDay = (day: number) => {
    sound.playHeartPop();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChangeDate(dateStr);
  };

  const setQuickDate = (type: 'today' | 'tomorrow' | 'weekend') => {
    sound.playHeartPop();
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (type === 'weekend') {
      const day = d.getDay();
      const diff = (6 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
    }
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onChangeDate(dateStr);
    setViewDate(d);
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return 'Not scheduled yet (optional) ♡';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) {
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // Fallback
    }
    return dateStr;
  };

  const hasSchedule = Boolean(selectedDate || selectedTime);

  return (
    <div className={`rounded-2xl p-4 bg-midnight-aubergine/85 border border-pastel-pink/30 shadow-lg space-y-3.5 ${className}`}>
      {/* Top Banner: Status & Quick Clear */}
      <div className="flex items-center justify-between border-b border-pastel-pink/15 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pastel-pink/20 to-pastel-lilac/30 border border-pastel-pink/40 flex items-center justify-center text-pastel-pink text-sm flex-shrink-0">
            {activeTab === 'date' ? '📅' : '⏰'}
          </div>
          <div className="min-w-0">
            <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-wider block leading-none">
              When are we watching this? ♡
            </span>
            <div className="font-sans text-xs text-pastel-cream font-semibold mt-0.5 truncate flex items-center gap-1.5">
              <span>{formatFriendlyDate(selectedDate)}</span>
              {selectedTime && (
                <span className="text-pastel-pink font-bold">• {selectedTime}</span>
              )}
            </div>
          </div>
        </div>

        {hasSchedule && (
          <button
            type="button"
            onClick={() => {
              sound.playWrongBoop();
              onChangeDate('');
              onChangeTime('');
            }}
            className="text-[10px] font-pixel text-pastel-mauve hover:text-pastel-rose transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-pastel-rose/10 flex-shrink-0"
            title="Clear planned date and time"
          >
            <X className="w-3 h-3" />
            <span>clear</span>
          </button>
        )}
      </div>

      {/* Romantic Tab Switcher: Pick Date vs Pick Time */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-midnight-plum/70 border border-pastel-pink/20">
        <button
          type="button"
          onClick={() => {
            sound.playHeartPop();
            setActiveTab('date');
          }}
          className={`py-2 px-3 rounded-lg font-sans text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'date'
              ? 'bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac text-midnight-plum shadow-md'
              : 'text-pastel-mauve hover:text-pastel-cream'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>1. Pick Date</span>
          {selectedDate && <span className="text-[10px] opacity-80">✓</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playHeartPop();
            setActiveTab('time');
          }}
          className={`py-2 px-3 rounded-lg font-sans text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'time'
              ? 'bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac text-midnight-plum shadow-md'
              : 'text-pastel-mauve hover:text-pastel-cream'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>2. Watch Time</span>
          {selectedTime && <span className="text-[10px] opacity-80">✓</span>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'date' ? (
          <motion.div
            key="date-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {/* Quick Date Shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-pixel text-[10px] text-pastel-mauve uppercase mr-1">quick:</span>
              <button
                type="button"
                onClick={() => setQuickDate('today')}
                className="px-3 py-1 rounded-xl bg-midnight-surface/90 hover:bg-pastel-pink/20 hover:text-pastel-pink text-pastel-cream text-xs font-sans border border-pastel-pink/20 transition-all flex items-center gap-1 shadow-sm"
              >
                <span>✦</span>
                <span>Tonight</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('tomorrow')}
                className="px-3 py-1 rounded-xl bg-midnight-surface/90 hover:bg-pastel-pink/20 hover:text-pastel-pink text-pastel-cream text-xs font-sans border border-pastel-pink/20 transition-all flex items-center gap-1 shadow-sm"
              >
                <span>⋆</span>
                <span>Tomorrow</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('weekend')}
                className="px-3 py-1 rounded-xl bg-midnight-surface/90 hover:bg-pastel-pink/20 hover:text-pastel-pink text-pastel-cream text-xs font-sans border border-pastel-pink/20 transition-all flex items-center gap-1 shadow-sm"
              >
                <span>🎀</span>
                <span>This Weekend</span>
              </button>
            </div>

            {/* Cute Mini Calendar */}
            <div className="rounded-2xl p-3 bg-midnight-plum/60 border border-pastel-pink/20 space-y-2.5">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-pastel-pink/20 text-pastel-pink transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-cormorant italic font-bold text-lg text-pastel-cream tracking-wide">
                  {monthNames[month]} {year}
                </span>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-pastel-pink/20 text-pastel-pink transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-pixel text-[10px] text-pastel-pink/70 uppercase">
                {daysOfWeek.map((d, i) => (
                  <div key={i} className="py-0.5">{d}</div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1">
                {[...Array(firstDay)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const now = new Date();
                  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={`h-8 rounded-xl font-sans text-xs transition-all relative flex items-center justify-center ${
                        isSelected
                          ? 'bg-pastel-pink text-midnight-plum font-bold shadow-glow-pink scale-105'
                          : 'text-pastel-cream/80 hover:bg-pastel-lilac/30 hover:text-pastel-pink'
                      } ${isToday && !isSelected ? 'border border-pastel-pink/40 text-pastel-pink font-semibold' : ''}`}
                    >
                      <span>{day}</span>
                      {isToday && !isSelected && (
                        <span className="absolute top-0.5 right-1 text-[7px] text-pastel-pink leading-none">
                          ⋆
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt to switch to time */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-sans text-pastel-mauve italic">
                {selectedDate ? `Selected: ${formatFriendlyDate(selectedDate)}` : 'Click any date above ♡'}
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playHeartPop();
                  setActiveTab('time');
                }}
                className="text-xs font-sans text-pastel-pink hover:underline font-semibold flex items-center gap-1"
              >
                <span>next: set watch time ⏰</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="time-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-wider">
                Choose our late-night watch slot ♡
              </span>
              {selectedTime && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playWrongBoop();
                    onChangeTime('');
                  }}
                  className="text-[10px] font-pixel text-pastel-mauve hover:text-pastel-rose"
                >
                  [ clear time ]
                </button>
              )}
            </div>

            {/* Romantic Time Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIME_PRESETS.map((t) => {
                const isSelected = selectedTime === t.time;
                return (
                  <button
                    key={t.time}
                    type="button"
                    onClick={() => {
                      sound.playHeartPop();
                      onChangeTime(t.time);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-pastel-pink text-midnight-plum border-pastel-pink font-bold shadow-glow-pink scale-[1.02]'
                        : 'bg-midnight-plum/60 border-pastel-pink/20 hover:border-pastel-pink/60 text-pastel-cream/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t.icon}</span>
                      <div>
                        <span className="font-sans text-xs font-bold block leading-tight">
                          {t.time}
                        </span>
                        <span className={`text-[10px] font-pixel ${isSelected ? 'text-midnight-plum/80' : 'text-pastel-mauve'}`}>
                          {t.desc}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-midnight-plum" />}
                  </button>
                );
              })}
            </div>

            {/* Custom time input */}
            <div className="pt-1 space-y-1">
              <label className="block font-pixel text-[10px] text-pastel-mauve uppercase">
                or type custom watch time:
              </label>
              <input
                type="text"
                value={selectedTime}
                onChange={(e) => onChangeTime(e.target.value)}
                placeholder="e.g. 11:45 PM or after dinner date"
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-plum/60 border border-pastel-pink/25 text-pastel-cream placeholder-pastel-mauve text-xs font-sans outline-none focus:border-pastel-pink transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
