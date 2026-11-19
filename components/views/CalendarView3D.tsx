'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Calendar, Sparkles, Clock } from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { sound } from '@/lib/audio';

interface CalendarView3DProps {
  onRefresh: () => void;
}

export const CalendarView3D: React.FC<CalendarView3DProps> = ({ onRefresh }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarData, setCalendarData] = useState<{
    watched: Record<string, any[]>;
    planned: Record<string, any[]>;
    anniversary: { date: string; label: string };
  }>({
    watched: {},
    planned: {},
    anniversary: { date: '2026-08-08', label: 'The Day Our Lore Officially Began ♡' },
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadCalendar = async () => {
    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setCalendarData({
          watched: data.watched || {},
          planned: data.planned || {},
          anniversary: data.anniversary || {
            date: '2026-08-08',
            label: 'The Day Our Lore Officially Began ♡',
          },
        });
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    sound.playHeartPop();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    sound.playHeartPop();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToAnniversary = () => {
    sound.playStarChime();
    setCurrentDate(new Date(2026, 7, 8));
    setSelectedDate('2026-08-08');
  };

  const selectedWatchedMovies = selectedDate ? calendarData.watched[selectedDate] || [] : [];
  const selectedPlannedMovies = selectedDate ? calendarData.planned[selectedDate] || [] : [];
  const isAnniversary = selectedDate === calendarData.anniversary.date;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-pastel-pink text-sm">📅</span>
            <span className="font-pixel text-xs text-pastel-pink tracking-widest uppercase">
              cutesy date tracker
            </span>
          </div>
          <h1 className="font-cormorant italic text-4xl sm:text-5xl text-pastel-cream font-bold leading-tight">
            our midnight calendar.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-pastel-mauve mt-1">
            dates worth remembering, movie nights worth losing sleep over.
          </p>
        </div>

        <button
          onClick={jumpToAnniversary}
          className="px-4 py-2 rounded-2xl bg-pastel-pink/20 border border-pastel-pink/40 hover:bg-pastel-pink hover:text-midnight-plum text-pastel-pink text-xs font-sans font-semibold transition-all btn-3d shadow-sm"
        >
          🎀 Jump to Aug 8 Lore Day
        </button>
      </div>

      {/* 3D Diary Calendar Card */}
      <Card3D depth={8}>
        <div className="p-6 sm:p-8 rounded-3xl glass-panel-3d border border-pastel-pink/35 shadow-3d-card space-y-6">
          {/* Month Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-pastel-pink/15">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-midnight-surface/90 border border-pastel-pink/25 hover:border-pastel-pink text-pastel-cream"
            >
              <ChevronLeft className="w-5 h-5 text-pastel-pink" />
            </button>

            <div className="text-center">
              <h2 className="font-cormorant text-3xl sm:text-4xl text-pastel-cream font-bold">
                {monthNames[month]} {year}
              </h2>
              <p className="font-pixel text-[10px] text-pastel-mauve uppercase tracking-widest mt-0.5">
                our movie history & upcoming dates
              </p>
            </div>

            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-midnight-surface/90 border border-pastel-pink/25 hover:border-pastel-pink text-pastel-cream"
            >
              <ChevronRight className="w-5 h-5 text-pastel-pink" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 text-center font-pixel text-xs text-pastel-pink/80 uppercase">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] rounded-2xl bg-black/10" />
            ))}

            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const watched = calendarData.watched[dateStr] || [];
              const planned = calendarData.planned[dateStr] || [];
              const isLoreDay = dateStr === calendarData.anniversary.date;
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={day}
                  onClick={() => {
                    sound.playHeartPop();
                    setSelectedDate(dateStr);
                  }}
                  className={`min-h-[75px] sm:min-h-[85px] p-2 rounded-2xl cursor-pointer transition-all flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-midnight-surface border-2 border-pastel-pink shadow-glow-pink'
                      : isLoreDay
                      ? 'bg-gradient-to-br from-midnight-surface to-[#592348] border-2 border-pastel-pink/60 shadow-glow-pink'
                      : watched.length > 0
                      ? 'bg-midnight-aubergine/90 border-pastel-pink/40 hover:border-pastel-pink shadow-sm'
                      : planned.length > 0
                      ? 'bg-midnight-aubergine/80 border-pastel-lilac/40 hover:border-pastel-lilac shadow-sm'
                      : 'bg-midnight-aubergine/40 border-pastel-pink/10 hover:border-pastel-pink/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-pixel text-xs font-semibold ${
                        isLoreDay
                          ? 'text-pastel-pink font-bold'
                          : isSelected
                          ? 'text-pastel-cream font-bold'
                          : 'text-pastel-cream/80'
                      }`}
                    >
                      {day}
                    </span>
                    {isLoreDay && <span className="text-xs">🎀</span>}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {/* Watched movie pill */}
                    {watched.length > 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-pastel-pink/20 text-pastel-pink text-[10px] font-sans truncate">
                        <Heart className="w-2.5 h-2.5 fill-pastel-pink text-pastel-pink flex-shrink-0" />
                        <span className="truncate">{watched[0].title}</span>
                      </div>
                    )}

                    {/* Planned movie pill */}
                    {planned.length > 0 && watched.length === 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-pastel-lilac/25 text-pastel-cream text-[10px] font-sans truncate border border-pastel-lilac/30">
                        <Clock className="w-2.5 h-2.5 text-pastel-lilac flex-shrink-0" />
                        <span className="truncate">{planned[0].title}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card3D>

      {/* Selected Date Movies Panel */}
      {selectedDate && (
        <Card3D depth={6}>
          <div className="p-6 rounded-3xl glass-panel-3d border border-pastel-pink/40 shadow-glow-pink space-y-4">
            <div className="flex items-center justify-between border-b border-pastel-pink/15 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pastel-pink" />
                <h3 className="font-cormorant text-2xl text-pastel-cream font-bold">
                  {selectedDate} ♡ {isAnniversary ? calendarData.anniversary.label : 'movie night date'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="font-pixel text-xs text-pastel-mauve hover:text-pastel-cream"
              >
                [ close ]
              </button>
            </div>

            {/* Planned Movies for this date */}
            {selectedPlannedMovies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-pastel-lilac font-pixel text-xs uppercase">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Planned for this date ♡</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPlannedMovies.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl glass-card-3d border border-pastel-lilac/40 bg-midnight-aubergine/80 flex items-center gap-3"
                    >
                      <img
                        src={m.poster_url || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80'}
                        alt={m.title}
                        className="w-12 h-16 rounded-xl object-cover border border-pastel-lilac/30 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-cormorant text-xl text-pastel-cream font-bold leading-tight truncate">
                          {m.title} {m.year ? `(${m.year})` : ''}
                        </h4>
                        {m.planned_time && (
                          <p className="font-sans text-xs text-pastel-lilac font-semibold">
                            ⏰ {m.planned_time}
                          </p>
                        )}
                        {m.notes && (
                          <p className="font-sans text-xs text-pastel-mauve italic line-clamp-1 mt-0.5">
                            "{m.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watched Movies on this date */}
            {selectedWatchedMovies.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-pastel-pink font-pixel text-xs uppercase">
                  <Heart className="w-3.5 h-3.5 fill-pastel-pink" />
                  <span>Watched together on this date ♡</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedWatchedMovies.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl glass-card-3d border border-pastel-pink/30 flex items-center gap-3"
                    >
                      <img
                        src={m.poster_url || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80'}
                        alt={m.title}
                        className="w-12 h-16 rounded-xl object-cover border border-pastel-pink/30 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-cormorant text-xl text-pastel-cream font-bold leading-tight truncate">
                          {m.title} {m.year ? `(${m.year})` : ''}
                        </h4>
                        {m.notes && (
                          <p className="font-sans text-xs text-pastel-mauve italic line-clamp-1 mt-0.5">
                            "{m.notes}"
                          </p>
                        )}
                        <span className="font-pixel text-[10px] text-pastel-pink flex items-center gap-1 mt-1">
                          <Heart className="w-2.5 h-2.5 fill-pastel-pink" />
                          <span>completed on our checklist</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedWatchedMovies.length === 0 && selectedPlannedMovies.length === 0 && (
              <p className="font-sans text-xs text-pastel-mauve italic py-2">
                no movies scheduled or watched on this date yet. pick a movie on your checklist or search to schedule one!
              </p>
            )}
          </div>
        </Card3D>
      )}
    </div>
  );
};
