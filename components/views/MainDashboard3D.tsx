'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Plus,
  Trash2,
  Edit3,
  Check,
  Calendar,
  Sparkles,
  Search,
  Clock,
  Star,
  Film,
  X,
  ExternalLink,
} from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { MochiCat } from '../mascots/MochiCat';
import { PuddingBunny } from '../mascots/PuddingBunny';
import { MovieSearchModal } from '../modals/MovieSearchModal';
import { MovieDetailsModal, MovieItem } from '../modals/MovieDetailsModal';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface MainDashboard3DProps {
  movies: MovieItem[];
  onRefresh: () => void;
  activeUser: string;
}

const formatDateFriendly = (dateStr?: string | null) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    if (y && m && d) {
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  } catch {}
  return dateStr;
};

export const MainDashboard3D: React.FC<MainDashboard3DProps> = ({
  movies,
  onRefresh,
  activeUser,
}) => {
  // Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedDetailMovie, setSelectedDetailMovie] = useState<MovieItem | null>(null);

  // Filter & Search
  const [filter, setFilter] = useState<'all' | 'unwatched' | 'watched'>('all');
  const [search, setSearch] = useState('');

  // Editing state: id -> edit fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState<number>(2024);
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPlannedDate, setEditPlannedDate] = useState('');
  const [editPlannedTime, setEditPlannedTime] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Safe enrichment state
  const [isEnriching, setIsEnriching] = useState(false);

  // One-click heart toggle
  const handleToggleWatch = async (movie: MovieItem) => {
    sound.playHeartPop();

    if (!movie.is_watched) {
      // Ticking to watched -> celebrate!
      sound.playStarChime();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#F4A9C5', '#C8B3F5', '#FFF0D7', '#B6E7DC'],
      });
    }

    try {
      const res = await fetch(`/api/movies/${movie.id}/toggle`, {
        method: 'POST',
      });
      if (res.ok) {
        onRefresh();
      }
    } catch {
      // Ignore
    }
  };

  // Start inline editing
  const startEditing = (movie: MovieItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playHeartPop();
    setEditingId(movie.id);
    setEditTitle(movie.title);
    setEditYear(movie.year || new Date().getFullYear());
    setEditNote(movie.notes || '');
    setEditDate(movie.watched_date || '');
    setEditPlannedDate(movie.planned_date || '');
    setEditPlannedTime(movie.planned_time || '');
  };

  // Save inline edit
  const saveEditing = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim() || isSavingEdit) return;
    setIsSavingEdit(true);
    sound.playHeartPop();

    try {
      const res = await fetch(`/api/movies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          year: editYear,
          notes: editNote.trim(),
          watched_date: editDate || null,
          planned_date: editPlannedDate || null,
          planned_time: editPlannedTime || null,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        onRefresh();
      }
    } catch {
      // Ignore
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete movie
  const handleDelete = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Delete "${title}" from our checklist? ♡`)) return;
    sound.playWrongBoop();
    try {
      const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch {
      // Ignore
    }
  };

  // Metadata Enrichment for posters & backdrops
  const handleEnrichPosters = async () => {
    setIsEnriching(true);
    sound.playHeartPop();
    try {
      const res = await fetch('/api/movies/enrich', { method: 'POST' });
      if (res.ok) {
        sound.playStarChime();
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.5 },
          colors: ['#F4A9C5', '#C8B3F5', '#FFF0D7'],
        });
        onRefresh();
      }
    } catch {
      // Ignore
    } finally {
      setIsEnriching(false);
    }
  };

  // Filter movies
  const filtered = movies.filter((m) => {
    const matchFilter =
      filter === 'all'
        ? true
        : filter === 'watched'
        ? m.is_watched
        : !m.is_watched;

    const matchSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase())) ||
      (m.genre && m.genre.toLowerCase().includes(search.toLowerCase()));

    return matchFilter && matchSearch;
  });

  const totalCount = movies.length;
  const watchedCount = movies.filter((m) => m.is_watched).length;
  const unwatchedCount = totalCount - watchedCount;

  return (
    <div className="space-y-8 pb-20">
      {/* 3D Hero Cinema Banner */}
      <Card3D depth={10}>
        <div className="relative rounded-3xl p-6 sm:p-8 glass-panel-3d overflow-hidden border border-pastel-pink/35 shadow-3d-card">
          {/* Subtle 3D background light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-pastel-pink/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-pastel-pink text-sm">🎀</span>
                <span className="font-pixel text-xs text-pastel-pink uppercase tracking-widest">
                  our 3d cinema checklist
                </span>
                <span className="text-pastel-pink text-xs">♡</span>
              </div>
              <h1 className="font-cormorant italic text-3xl sm:text-5xl text-pastel-cream font-bold leading-tight">
                same two idiots. different movie.
              </h1>
              <p className="font-sans text-xs sm:text-sm text-pastel-mauve max-w-lg">
                two hearts, one watchlist, absolutely no sleep schedule. search official movies, pick planned dates, and tick the heart to stamp!
              </p>
            </div>

            {/* Mascots & Stats Bubble */}
            <div className="flex items-center gap-4 bg-midnight-aubergine/80 p-3 sm:p-4 rounded-2xl border border-pastel-pink/30 shadow-inner">
              <MochiCat mood="sitting" size={54} />
              <div className="text-center px-2 space-y-0.5">
                <div className="font-cormorant text-2xl sm:text-3xl font-bold text-pastel-pink">
                  {watchedCount} / {totalCount}
                </div>
                <div className="font-pixel text-[9px] text-pastel-cream uppercase tracking-wider">
                  movies survived ♡
                </div>
              </div>
              <PuddingBunny mood="idle" size={54} />
            </div>
          </div>
        </div>
      </Card3D>

      {/* Prominent 3D Interactive Add Bar & Movie Search Launch */}
      <Card3D depth={8}>
        <div
          onClick={() => {
            sound.playHeartPop();
            setIsSearchModalOpen(true);
          }}
          className="p-5 sm:p-6 rounded-3xl glass-panel-3d border border-pastel-pink/40 shadow-3d-card cursor-pointer group hover:border-pastel-pink transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pastel-pink/20 to-pastel-lilac/30 border border-pastel-pink/40 flex items-center justify-center text-pastel-pink text-xl shadow-glow-pink group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div>
              <div className="font-pixel text-xs text-pastel-pink uppercase tracking-wider font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                <span>+ add another bad decision</span>
                <span className="text-[10px] text-pastel-mauve font-sans font-normal">
                  (automatic posters & backdrops)
                </span>
              </div>
              <p className="font-cormorant italic text-lg sm:text-xl text-pastel-cream">
                click to search real movies & schedule our next late-night watch ♡
              </p>
            </div>
          </div>

          <button
            type="button"
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac text-midnight-plum font-sans font-bold text-sm btn-3d shadow-3d-btn flex items-center justify-center gap-2 flex-shrink-0 group-hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4 text-midnight-plum" />
            <span>Search & Add Movie ♡</span>
          </button>
        </div>
      </Card3D>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-midnight-aubergine/80 border border-pastel-pink/25">
          <button
            onClick={() => {
              sound.playHeartPop();
              setFilter('all');
            }}
            className={`px-4 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-pastel-pink text-midnight-plum shadow-glow-pink'
                : 'text-pastel-cream/70 hover:text-pastel-cream'
            }`}
          >
            All Movies ({totalCount})
          </button>

          <button
            onClick={() => {
              sound.playHeartPop();
              setFilter('unwatched');
            }}
            className={`px-4 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all ${
              filter === 'unwatched'
                ? 'bg-pastel-pink text-midnight-plum shadow-glow-pink'
                : 'text-pastel-cream/70 hover:text-pastel-cream'
            }`}
          >
            To Watch ({unwatchedCount})
          </button>

          <button
            onClick={() => {
              sound.playHeartPop();
              setFilter('watched');
            }}
            className={`px-4 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all ${
              filter === 'watched'
                ? 'bg-pastel-pink text-midnight-plum shadow-glow-pink'
                : 'text-pastel-cream/70 hover:text-pastel-cream'
            }`}
          >
            Watched ♡ ({watchedCount})
          </button>
        </div>

        {/* Right Search & Enrich Controls */}
        <div className="flex items-center gap-2">
          {/* Safe Metadata Enrichment Button */}
          <button
            onClick={handleEnrichPosters}
            disabled={isEnriching}
            title="Safe poster & backdrop enrichment for movies"
            className="px-3 py-2 rounded-xl bg-midnight-aubergine/80 border border-pastel-pink/25 hover:border-pastel-pink text-pastel-pink text-xs font-pixel flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-pastel-pink" />
            <span>{isEnriching ? 'enriching...' : 'enrich posters'}</span>
          </button>

          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search title, genre, notes..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-midnight-aubergine/80 border border-pastel-pink/25 text-pastel-cream placeholder-pastel-mauve text-xs font-sans outline-none focus:border-pastel-pink"
            />
            <Search className="w-3.5 h-3.5 text-pastel-pink/70 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* The 3D Movie Checklist Items */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((movie) => {
              const isEditing = editingId === movie.id;

              return (
                <motion.div
                  key={movie.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card3D depth={6}>
                    <div
                      onClick={() => {
                        if (!isEditing) {
                          sound.playHeartPop();
                          setSelectedDetailMovie(movie);
                        }
                      }}
                      className={`p-4 sm:p-5 rounded-2xl glass-card-3d border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer group ${
                        movie.is_watched
                          ? 'border-pastel-pink/40 bg-midnight-surface/60'
                          : 'border-pastel-pink/20 hover:border-pastel-pink/50 bg-midnight-aubergine/70'
                      }`}
                    >
                      {/* Left Side: 3D Heart Checkbox + Real Movie Poster + Details */}
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        {/* 3D Heart Checkbox */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatch(movie);
                          }}
                          title={movie.is_watched ? 'Mark as unwatched' : 'Mark as watched ♡'}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-md ${
                            movie.is_watched
                              ? 'bg-pastel-pink text-midnight-plum shadow-glow-pink border border-pastel-cream/50'
                              : 'bg-midnight-aubergine/90 border-2 border-pastel-pink/40 hover:border-pastel-pink text-pastel-pink/50'
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 transition-transform ${
                              movie.is_watched
                                ? 'fill-midnight-plum text-midnight-plum scale-110'
                                : 'text-pastel-pink hover:scale-105'
                            }`}
                          />
                        </motion.button>

                        {/* Real Official Movie Poster Thumbnail */}
                        <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl bg-midnight-plum overflow-hidden flex-shrink-0 border border-pastel-pink/35 shadow-md relative group-hover:scale-105 transition-transform duration-300">
                          {movie.poster_url ? (
                            <img
                              src={movie.poster_url}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-pastel-mauve text-xs text-center p-1">
                              🎬
                            </div>
                          )}
                        </div>

                        {/* Title, Year, Badges, Notes or Inline Edit */}
                        {isEditing ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 space-y-2 pr-2"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-midnight-surface border border-pastel-pink/40 text-pastel-cream text-sm font-sans outline-none focus:border-pastel-pink"
                                placeholder="Movie title"
                              />
                              <input
                                type="number"
                                value={editYear}
                                onChange={(e) => setEditYear(parseInt(e.target.value, 10))}
                                className="w-20 px-2 py-1.5 rounded-lg bg-midnight-surface border border-pastel-pink/40 text-pastel-cream text-sm font-sans outline-none focus:border-pastel-pink text-center"
                                placeholder="Year"
                              />
                            </div>
                            <input
                              type="text"
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-midnight-surface border border-pastel-pink/40 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                              placeholder="Personal notes..."
                            />

                            {/* Planned Date / Time Editor */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="font-pixel text-[10px] text-pastel-pink">
                                planned:
                              </span>
                              <input
                                type="date"
                                value={editPlannedDate}
                                onChange={(e) => setEditPlannedDate(e.target.value)}
                                className="px-2.5 py-1 rounded-xl bg-midnight-plum/90 border border-pastel-pink/40 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                              />
                              <input
                                type="text"
                                value={editPlannedTime}
                                onChange={(e) => setEditPlannedTime(e.target.value)}
                                placeholder="e.g. 11:30 PM"
                                className="w-28 px-2.5 py-1 rounded-xl bg-midnight-plum/90 border border-pastel-pink/40 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                              />
                            </div>

                            {movie.is_watched && (
                              <div className="flex items-center gap-2">
                                <span className="font-pixel text-[10px] text-pastel-pink">
                                  watched date:
                                </span>
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="px-2.5 py-1 rounded-xl bg-midnight-plum/90 border border-pastel-pink/40 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <h3
                                className={`font-cormorant text-2xl sm:text-3xl font-bold transition-colors leading-tight truncate ${
                                  movie.is_watched
                                    ? 'text-pastel-cream/80 line-through decoration-pastel-pink/60'
                                    : 'text-pastel-cream group-hover:text-pastel-pink'
                                }`}
                              >
                                {movie.title}
                              </h3>
                              {movie.year && (
                                <span className="font-sans text-xs text-pastel-mauve font-medium">
                                  ({movie.year})
                                </span>
                              )}
                              {movie.rating ? (
                                <span className="px-1.5 py-0.5 rounded bg-pastel-pink/15 text-pastel-pink font-sans text-[10px] font-semibold flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-pastel-pink text-pastel-pink" />
                                  <span>{movie.rating.toFixed(1)}</span>
                                </span>
                              ) : null}
                              {movie.genre && (
                                <span className="px-2 py-0.5 rounded-full bg-midnight-surface/80 text-pastel-mauve text-[10px] font-sans font-medium hidden sm:inline-block">
                                  {movie.genre}
                                </span>
                              )}
                            </div>

                            {movie.notes && (
                              <p className="font-sans text-xs text-pastel-mauve italic line-clamp-1">
                                "{movie.notes}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Side: DATE BADGES + Action Buttons */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-pastel-pink/10 flex-shrink-0"
                      >
                        {/* Planned Date Badge (Only when unwatched) */}
                        {movie.planned_date && !movie.is_watched && (
                          <div className="px-3.5 py-1.5 rounded-full bg-pastel-lilac/25 border border-pastel-lilac/50 text-pastel-cream text-xs font-sans font-medium flex items-center gap-1.5 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-pastel-lilac" />
                            <span>
                              Planned: {formatDateFriendly(movie.planned_date)}
                              {movie.planned_time ? ` • ${movie.planned_time}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Watched Date Badge */}
                        {movie.is_watched && movie.watched_date && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="px-3.5 py-1.5 rounded-full bg-pastel-pink/20 border border-pastel-pink/50 shadow-glow-pink flex items-center gap-1.5 text-pastel-pink text-xs font-sans font-semibold flex-shrink-0"
                          >
                            <Calendar className="w-3.5 h-3.5 text-pastel-pink" />
                            <span>Watched: {movie.watched_date} ♡</span>
                          </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => saveEditing(movie.id, e)}
                                disabled={isSavingEdit}
                                className="px-3 py-1.5 rounded-xl bg-pastel-pink text-midnight-plum text-xs font-sans font-bold flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(null);
                                }}
                                className="p-1.5 rounded-xl hover:text-pastel-rose text-pastel-mauve"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => startEditing(movie, e)}
                                title="Edit movie details"
                                className="p-2 rounded-xl glass-card text-pastel-mauve hover:text-pastel-pink hover:border-pastel-pink transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDelete(movie.id, movie.title, e)}
                                title="Remove movie"
                                className="p-2 rounded-xl glass-card text-pastel-mauve hover:text-pastel-rose hover:border-pastel-rose transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card3D>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl glass-panel-3d border border-pastel-pink/20 max-w-md mx-auto space-y-3">
              <div className="text-4xl animate-bounce">🎬</div>
              <h3 className="font-cormorant italic text-3xl text-pastel-cream font-bold">
                no movies found in this view ♡
              </h3>
              <p className="font-sans text-xs text-pastel-mauve">
                click the button above to search and schedule your next midnight watch!
              </p>
              <button
                onClick={() => {
                  sound.playHeartPop();
                  setIsSearchModalOpen(true);
                }}
                className="py-2.5 px-5 rounded-2xl bg-pastel-pink text-midnight-plum font-sans font-bold text-xs shadow-glow-pink"
              >
                + search & add movie ♡
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Movie Search & Schedule Modal */}
      <MovieSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onMovieAdded={onRefresh}
        activeUser={activeUser}
      />

      {/* Movie Details Widescreen Backdrop Modal */}
      <MovieDetailsModal
        movie={selectedDetailMovie}
        isOpen={Boolean(selectedDetailMovie)}
        onClose={() => setSelectedDetailMovie(null)}
        onToggleWatch={handleToggleWatch}
        onEdit={(m) => startEditing(m)}
        onDelete={handleDelete}
      />
    </div>
  );
};
