'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Star,
  Film,
  Check,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { CuteDatePicker } from '../ui/CuteDatePicker';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { MovieSearchResult } from '@/lib/tmdb';

interface MovieSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieAdded: () => void;
  activeUser: string;
}

export const MovieSearchModal: React.FC<MovieSearchModalProps> = ({
  isOpen,
  onClose,
  onMovieAdded,
  activeUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [searchProvider, setSearchProvider] = useState<string>('none');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected Movie for details and planned date configuration
  const [selectedMovie, setSelectedMovie] = useState<MovieSearchResult | null>(null);

  // Form Fields for final addition
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<string>('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [genre, setGenre] = useState('');
  const [overview, setOverview] = useState('');
  const [runtime, setRuntime] = useState<number | undefined>(undefined);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [tmdbId, setTmdbId] = useState('');
  const [notes, setNotes] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [plannedTime, setPlannedTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Manual entry toggle
  const [isManualMode, setIsManualMode] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return;

    if (!searchTerm.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setIsLoading(true);
    setErrorMsg(null);

    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(searchTerm.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setHasApiKey(data.hasApiKey);
          setSearchProvider(data.provider || 'none');
        } else {
          setErrorMsg('Oops, could not connect to movie archive ♡');
        }
      } catch {
        setErrorMsg('Network hiccup searching for movies ♡');
      } finally {
        setIsLoading(false);
      }
    }, 380);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm, isOpen]);

  // When a search result is chosen
  const handleSelectResult = (movie: MovieSearchResult) => {
    sound.playHeartPop();
    setSelectedMovie(movie);
    setTitle(movie.title);
    setYear(movie.year ? String(movie.year) : '');
    setPosterUrl(movie.poster_url || '');
    setBackdropUrl(movie.backdrop_url || '');
    setGenre(movie.genre || 'Romance / Cinema');
    setOverview(movie.overview || '');
    setRuntime(movie.runtime);
    setRating(movie.rating);
    setTmdbId(movie.id || '');
    setNotes('');
    setPlannedDate('');
    setPlannedTime('');
  };

  // Switch to manual mode
  const handleStartManual = () => {
    sound.playHeartPop();
    setIsManualMode(true);
    setSelectedMovie(null);
    setTitle(searchTerm.trim() || '');
    setYear(String(new Date().getFullYear()));
    setPosterUrl('');
    setBackdropUrl('');
    setGenre('Romance / Cinema');
    setOverview('');
    setRuntime(undefined);
    setRating(undefined);
    setTmdbId('');
    setNotes('');
    setPlannedDate('');
    setPlannedTime('');
  };

  // Reset to search state
  const handleBackToSearch = () => {
    sound.playHeartPop();
    setSelectedMovie(null);
    setIsManualMode(false);
  };

  // Submit final movie to checklist
  const handleSubmitMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    sound.playHeartPop();

    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          year: year ? parseInt(year, 10) : new Date().getFullYear(),
          poster_url: posterUrl.trim() || undefined,
          backdrop_url: backdropUrl.trim() || undefined,
          overview: overview.trim(),
          runtime: runtime || undefined,
          genre: genre.trim() || 'Romance / Cinema',
          notes: notes.trim(),
          rating: rating || undefined,
          tmdb_id: tmdbId || undefined,
          planned_date: plannedDate || undefined,
          planned_time: plannedTime || undefined,
          added_by: activeUser,
        }),
      });

      if (res.ok) {
        sound.playStarChime();
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#F4A9C5', '#C8B3F5', '#FFF0D7', '#B6E7DC'],
        });

        onMovieAdded();
        handleClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to add movie to list');
      }
    } catch {
      setErrorMsg('Network error adding movie ♡');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setResults([]);
    setSelectedMovie(null);
    setIsManualMode(false);
    setErrorMsg(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative max-w-2xl w-full my-6 rounded-3xl glass-panel-3d border border-pastel-pink/40 shadow-glow-pink overflow-hidden flex flex-col max-h-[90vh] bg-midnight-plum/95"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-pastel-pink/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎀</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-widest">
                  Movie Matchmaker
                </span>
                <span className="text-[10px] text-pastel-mauve">• official posters & lore</span>
              </div>
              <h2 className="font-cormorant italic text-2xl sm:text-3xl text-pastel-cream font-bold leading-tight">
                {selectedMovie || isManualMode
                  ? 'when are we watching this? ♡'
                  : '+ add another bad decision'}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-midnight-surface/80 border border-pastel-pink/25 hover:border-pastel-pink text-pastel-cream hover:text-pastel-pink transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Search Movies Mode */}
          {!selectedMovie && !isManualMode && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="type movie title (e.g. Interstellar, About Time, Past Lives...)"
                  autoFocus
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-midnight-aubergine/90 border border-pastel-pink/35 text-pastel-cream placeholder-pastel-mauve text-sm sm:text-base outline-none focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/30 transition-all font-sans"
                />
                <Search className="w-5 h-5 text-pastel-pink absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pastel-mauve hover:text-pastel-cream"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status & Provider Note */}
              <div className="flex items-center justify-between text-[11px] font-pixel text-pastel-mauve px-1">
                <span>
                  {isLoading
                    ? '✦ searching cinematic cosmos...'
                    : results.length > 0
                    ? `found ${results.length} movie matches ♡`
                    : 'search to pull real posters, genres & backdrops'}
                </span>

                <button
                  onClick={handleStartManual}
                  className="text-pastel-pink hover:underline font-pixel text-[10px]"
                >
                  [ + can't find it? add manually ]
                </button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-12 space-y-3">
                  <div className="text-3xl animate-bounce">🎬</div>
                  <p className="font-cormorant italic text-xl text-pastel-cream">
                    finding the exact movie for us...
                  </p>
                </div>
              )}

              {/* Search Results Grid */}
              {!isLoading && results.length > 0 && (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {results.map((movie) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 sm:p-4 rounded-2xl bg-midnight-surface/80 hover:bg-midnight-aubergine border border-pastel-pink/25 hover:border-pastel-pink transition-all flex items-start gap-4 group"
                    >
                      {/* Movie Poster */}
                      <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-midnight-plum overflow-hidden flex-shrink-0 border border-pastel-pink/30 shadow-md relative">
                        {movie.poster_url ? (
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-pastel-mauve text-xs text-center p-1">
                            <span>🎬 no poster</span>
                          </div>
                        )}
                      </div>

                      {/* Movie Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-pastel-cream leading-tight">
                            {movie.title}
                          </h3>
                          {movie.year && (
                            <span className="font-sans text-xs text-pastel-mauve font-medium">
                              ({movie.year})
                            </span>
                          )}
                        </div>

                        {/* Badges: Genre & Rating */}
                        <div className="flex flex-wrap items-center gap-2">
                          {movie.genre && (
                            <span className="px-2 py-0.5 rounded-md bg-pastel-pink/15 text-pastel-pink font-sans text-[11px] font-semibold">
                              {movie.genre}
                            </span>
                          )}
                          {movie.rating ? (
                            <span className="px-2 py-0.5 rounded-md bg-pastel-lilac/15 text-pastel-cream font-sans text-[11px] font-semibold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-pastel-pink text-pastel-pink" />
                              <span>{movie.rating.toFixed(1)}</span>
                            </span>
                          ) : null}
                        </div>

                        {/* Synopsis */}
                        {movie.overview && (
                          <p className="font-sans text-xs text-pastel-mauve line-clamp-2 leading-relaxed">
                            {movie.overview}
                          </p>
                        )}
                      </div>

                      {/* Select Button */}
                      <button
                        onClick={() => handleSelectResult(movie)}
                        className="self-center px-4 py-2 rounded-xl bg-pastel-pink hover:bg-pastel-rose text-midnight-plum font-sans font-bold text-xs shadow-glow-pink flex items-center gap-1 flex-shrink-0 transition-transform active:scale-95"
                      >
                        <span>Select</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* No results prompt */}
              {!isLoading && searchTerm.trim() && results.length === 0 && (
                <div className="text-center py-10 px-4 rounded-2xl bg-midnight-surface/50 border border-pastel-pink/20 space-y-3">
                  <div className="text-3xl">😿</div>
                  <h3 className="font-cormorant italic text-2xl text-pastel-cream font-bold">
                    no movie found with that name
                  </h3>
                  <p className="font-sans text-xs text-pastel-mauve">
                    don't worry! you can add it manually with your own poster and notes.
                  </p>
                  <button
                    onClick={handleStartManual}
                    className="px-4 py-2 rounded-xl bg-pastel-pink text-midnight-plum font-sans font-bold text-xs"
                  >
                    + enter "{searchTerm.trim()}" manually ♡
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Configure Details & Planned Watch Date/Time */}
          {(selectedMovie || isManualMode) && (
            <form onSubmit={handleSubmitMovie} className="space-y-5">
              <button
                type="button"
                onClick={handleBackToSearch}
                className="text-xs font-pixel text-pastel-mauve hover:text-pastel-pink flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>back to search results</span>
              </button>

              {/* Compact Movie Preview Header */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-midnight-aubergine/90 border border-pastel-pink/30 flex items-center gap-3.5">
                <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl bg-midnight-plum overflow-hidden flex-shrink-0 border border-pastel-pink/40 shadow-md relative">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pastel-mauve text-xs text-center p-1">
                      <span>🎬</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-cormorant text-2xl font-bold text-pastel-cream leading-tight truncate">
                    {title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {year && (
                      <span className="font-sans text-xs text-pastel-mauve">
                        ({year})
                      </span>
                    )}
                    {genre && (
                      <span className="px-2 py-0.5 rounded-md bg-pastel-pink/20 text-pastel-pink text-[11px] font-sans font-semibold">
                        {genre}
                      </span>
                    )}
                    {rating ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-pastel-lilac/20 text-pastel-cream text-[10px] font-sans font-semibold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-pastel-pink text-pastel-pink" />
                        <span>{rating.toFixed(1)}</span>
                      </span>
                    ) : null}
                    {runtime ? (
                      <span className="font-sans text-xs text-pastel-mauve">
                        • {Math.floor(runtime / 60)}h {runtime % 60}m
                      </span>
                    ) : null}
                  </div>

                  {overview && (
                    <p className="font-sans text-xs text-pastel-mauve line-clamp-2 leading-relaxed italic">
                      "{overview}"
                    </p>
                  )}
                </div>
              </div>

              {/* Manual Fields if manual mode */}
              {isManualMode && (
                <div className="space-y-3 p-4 rounded-2xl bg-midnight-surface/80 border border-pastel-pink/20">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-pixel text-[10px] text-pastel-pink uppercase mb-1">
                        Movie Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-midnight-aubergine border border-pastel-pink/30 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                        placeholder="Movie name"
                      />
                    </div>
                    <div>
                      <label className="block font-pixel text-[10px] text-pastel-pink uppercase mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-midnight-aubergine border border-pastel-pink/30 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink text-center"
                        placeholder="2026"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-pixel text-[10px] text-pastel-pink uppercase mb-1">
                      Poster Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-midnight-aubergine border border-pastel-pink/30 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: PLANNED WATCH DATE AND TIME */}
              <CuteDatePicker
                selectedDate={plannedDate}
                onChangeDate={setPlannedDate}
                selectedTime={plannedTime}
                onChangeTime={setPlannedTime}
              />

              {/* Optional Cozy Note / Snack Assignment */}
              <div>
                <label className="block font-pixel text-[10px] text-pastel-pink uppercase mb-1">
                  cozy note / snack assignment / why we're watching ♡
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. late night date with my favorite idiot. get strawberry mochi ready!"
                  className="w-full px-4 py-3 rounded-2xl bg-midnight-aubergine/90 border border-pastel-pink/30 text-pastel-cream placeholder-pastel-mauve text-sm outline-none focus:border-pastel-pink font-sans"
                />
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-midnight-surface/80 border border-pastel-rose/50 text-pastel-rose text-xs font-sans flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving || !title.trim()}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac text-midnight-plum font-sans font-bold text-sm btn-3d shadow-3d-btn flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-midnight-plum" />
                  <span>{isSaving ? 'adding to our universe...' : '+ add to our list ♡'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="py-3.5 px-5 rounded-2xl glass-card text-pastel-cream text-xs font-sans font-medium"
                >
                  cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
