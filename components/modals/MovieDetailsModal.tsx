'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Calendar,
  Clock,
  Star,
  Edit3,
  Trash2,
  Sparkles,
  Film,
} from 'lucide-react';
import { sound } from '@/lib/audio';

export interface MovieItem {
  id: string;
  title: string;
  year?: number;
  poster_url?: string;
  backdrop_url?: string;
  overview?: string;
  runtime?: number;
  genre?: string;
  notes?: string;
  mood?: string;
  rating?: number;
  tmdb_id?: string;
  added_by?: string;
  is_watched: boolean;
  watched_date?: string | null;
  planned_date?: string | null;
  planned_time?: string | null;
}

interface MovieDetailsModalProps {
  movie: MovieItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleWatch: (movie: MovieItem) => void;
  onEdit: (movie: MovieItem) => void;
  onDelete: (id: string, title: string) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  isOpen,
  onClose,
  onToggleWatch,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !movie) return null;

  const backdrop = movie.backdrop_url || movie.poster_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        className="relative max-w-2xl w-full my-6 rounded-3xl glass-panel-3d border border-pastel-pink/40 shadow-glow-pink overflow-hidden bg-midnight-plum/95 flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-midnight-plum/80 border border-pastel-pink/30 hover:border-pastel-pink text-pastel-cream hover:text-pastel-pink transition-all shadow-lg backdrop-blur-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Widescreen Backdrop Banner */}
        <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-midnight-plum flex-shrink-0">
          {backdrop ? (
            <img
              src={backdrop}
              alt={movie.title}
              className="w-full h-full object-cover object-center filter brightness-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-midnight-plum to-midnight-aubergine">
              <span className="text-5xl">🎬</span>
            </div>
          )}

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-plum via-midnight-plum/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-plum/80 via-transparent to-midnight-plum/80" />

          {/* Badge over banner */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-midnight-plum/80 backdrop-blur-md border border-pastel-pink/30 shadow-sm text-pastel-pink text-xs font-pixel">
            <span>🎀</span>
            <span className="uppercase tracking-widest text-[10px]">midnight cinema selection</span>
          </div>

          {/* Floating Poster overlap */}
          <div className="absolute bottom-4 left-5 sm:left-7 z-10 flex items-end gap-4">
            <div className="w-20 h-28 sm:w-28 sm:h-40 rounded-2xl bg-midnight-plum overflow-hidden border-2 border-pastel-pink/50 shadow-2xl flex-shrink-0 relative">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-pastel-mauve text-xs">
                  🎬
                </div>
              )}
            </div>

            <div className="space-y-1 mb-1 text-left">
              <h2 className="font-cormorant italic text-2xl sm:text-4xl text-pastel-cream font-bold leading-tight drop-shadow-md">
                {movie.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {movie.year && (
                  <span className="font-sans text-xs text-pastel-mauve font-semibold">
                    {movie.year}
                  </span>
                )}
                {movie.runtime ? (
                  <span className="font-sans text-xs text-pastel-mauve">
                    • {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                ) : null}
                {movie.rating ? (
                  <span className="px-2 py-0.5 rounded-md bg-pastel-pink/20 text-pastel-pink font-sans text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-pastel-pink text-pastel-pink" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5">
          {/* Genre & Meta Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {movie.genre && (
              <span className="px-3 py-1 rounded-full bg-midnight-aubergine border border-pastel-pink/30 text-pastel-pink font-sans text-xs font-semibold">
                {movie.genre}
              </span>
            )}
            {movie.added_by && (
              <span className="px-3 py-1 rounded-full bg-midnight-aubergine border border-pastel-pink/20 text-pastel-cream/80 font-pixel text-[10px]">
                added by {movie.added_by} ♡
              </span>
            )}
          </div>

          {/* Planned Date / Watched Date Status Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Planned Date Badge */}
            {movie.planned_date ? (
              <div className="p-3.5 rounded-2xl bg-midnight-aubergine/80 border border-pastel-pink/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pastel-pink/15 text-pastel-pink flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-pastel-pink" />
                </div>
                <div>
                  <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-widest block">
                    Planned Date
                  </span>
                  <span className="font-sans text-xs sm:text-sm text-pastel-cream font-semibold">
                    {movie.planned_date}
                    {movie.planned_time ? ` at ${movie.planned_time}` : ''}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-midnight-surface/50 border border-pastel-pink/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pastel-mauve/10 text-pastel-mauve flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-pixel text-[10px] text-pastel-mauve uppercase tracking-widest block">
                    Planned Date
                  </span>
                  <span className="font-sans text-xs text-pastel-mauve italic">
                    not scheduled yet ♡
                  </span>
                </div>
              </div>
            )}

            {/* Watched Status Badge */}
            {movie.is_watched ? (
              <div className="p-3.5 rounded-2xl bg-pastel-pink/15 border border-pastel-pink/40 shadow-glow-pink flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pastel-pink text-midnight-plum flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 fill-midnight-plum text-midnight-plum" />
                </div>
                <div>
                  <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-widest block">
                    Watched Together ♡
                  </span>
                  <span className="font-sans text-xs sm:text-sm text-pastel-cream font-semibold">
                    {movie.watched_date || 'Completed movie night'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-midnight-surface/50 border border-pastel-pink/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pastel-mauve/10 text-pastel-mauve flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-pastel-mauve" />
                </div>
                <div>
                  <span className="font-pixel text-[10px] text-pastel-mauve uppercase tracking-widest block">
                    Status
                  </span>
                  <span className="font-sans text-xs text-pastel-mauve italic">
                    waiting on watchlist ♡
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Overview / Synopsis */}
          {movie.overview && (
            <div className="space-y-1.5">
              <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-wider block">
                synopsis
              </span>
              <p className="font-sans text-xs sm:text-sm text-pastel-cream/90 leading-relaxed bg-midnight-surface/40 p-4 rounded-2xl border border-pastel-pink/15">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Personal Notes / Snack Assignment */}
          {movie.notes && (
            <div className="space-y-1.5">
              <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-wider block">
                our personal note / snack assignment ♡
              </span>
              <p className="font-sans text-xs sm:text-sm text-pastel-cream italic bg-midnight-aubergine/80 p-4 rounded-2xl border border-pastel-pink/30 shadow-inner">
                "{movie.notes}"
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-pastel-pink/20 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                onToggleWatch(movie);
                onClose();
              }}
              className={`py-3 px-5 rounded-2xl font-sans font-bold text-xs sm:text-sm btn-3d shadow-3d-btn flex items-center gap-2 transition-all ${
                movie.is_watched
                  ? 'bg-midnight-aubergine border border-pastel-pink/40 text-pastel-pink'
                  : 'bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac text-midnight-plum'
              }`}
            >
              <Heart className={`w-4 h-4 ${movie.is_watched ? 'fill-pastel-pink text-pastel-pink' : ''}`} />
              <span>{movie.is_watched ? 'Mark as Unwatched' : 'Mark as Watched ♡'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(movie);
                  onClose();
                }}
                className="p-3 rounded-2xl glass-card text-pastel-mauve hover:text-pastel-pink hover:border-pastel-pink transition-all flex items-center gap-1.5 text-xs font-sans"
              >
                <Edit3 className="w-4 h-4" />
                <span>edit details</span>
              </button>

              <button
                onClick={() => {
                  onDelete(movie.id, movie.title);
                  onClose();
                }}
                className="p-3 rounded-2xl glass-card text-pastel-mauve hover:text-pastel-rose hover:border-pastel-rose transition-all flex items-center gap-1.5 text-xs font-sans"
              >
                <Trash2 className="w-4 h-4" />
                <span>remove</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
