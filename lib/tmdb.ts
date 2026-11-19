import { db } from './db';

export interface MovieSearchResult {
  id: string; // TMDB ID or external ID
  title: string;
  year?: number;
  poster_url?: string;
  backdrop_url?: string;
  overview?: string;
  genre?: string;
  runtime?: number; // In minutes
  rating?: number; // Out of 10
  vote_count?: number;
  source: 'tmdb' | 'omdb' | 'imdb' | 'manual';
}

const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export function getTmdbApiKey(): string | null {
  if (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim()) {
    return process.env.TMDB_API_KEY.trim();
  }
  try {
    const row = db.prepare("SELECT value FROM app_settings WHERE key = 'tmdb_api_key'").get() as
      | { value: string }
      | undefined;
    if (row && row.value && row.value.trim()) {
      return row.value.trim();
    }
  } catch {
    // Ignore
  }
  return null;
}

export function getOmdbApiKey(): string | null {
  if (process.env.OMDB_API_KEY && process.env.OMDB_API_KEY.trim()) {
    return process.env.OMDB_API_KEY.trim();
  }
  try {
    const row = db.prepare("SELECT value FROM app_settings WHERE key = 'omdb_api_key'").get() as
      | { value: string }
      | undefined;
    if (row && row.value && row.value.trim()) {
      return row.value.trim();
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Searches movies using TMDB first, then OMDb, and finally zero-config public suggestions.
 */
export async function searchMovies(query: string): Promise<{
  results: MovieSearchResult[];
  provider: 'tmdb' | 'omdb' | 'imdb' | 'none';
  hasApiKey: boolean;
}> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { results: [], provider: 'none', hasApiKey: false };
  }

  const tmdbKey = getTmdbApiKey();

  // 1. Try TMDB API
  if (tmdbKey) {
    try {
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(
        cleanQuery
      )}&include_adult=false&language=en-US&page=1`;

      const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        const results: MovieSearchResult[] = (data.results || []).slice(0, 15).map((m: any) => {
          const year = m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : undefined;
          const genreNames = (m.genre_ids || [])
            .map((id: number) => TMDB_GENRES[id])
            .filter(Boolean)
            .slice(0, 2)
            .join(' / ');

          return {
            id: String(m.id),
            title: m.title || m.original_title,
            year: typeof year === 'number' && !Number.isNaN(year) ? year : undefined,
            poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined,
            backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : undefined,
            overview: m.overview || '',
            genre: genreNames || 'Cinema',
            rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : undefined,
            vote_count: m.vote_count,
            source: 'tmdb',
          };
        });

        return { results, provider: 'tmdb', hasApiKey: true };
      }
    } catch (e) {
      console.warn('TMDB search request failed, checking fallbacks:', e);
    }
  }

  // 2. Try OMDb API fallback if key is configured
  const omdbKey = getOmdbApiKey();
  if (omdbKey) {
    try {
      const url = `https://www.omdbapi.com/?apikey=${omdbKey}&s=${encodeURIComponent(cleanQuery)}&type=movie`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.Search && Array.isArray(data.Search)) {
          const results: MovieSearchResult[] = data.Search.slice(0, 12).map((m: any) => {
            const year = parseInt(m.Year, 10);
            return {
              id: m.imdbID,
              title: m.Title,
              year: typeof year === 'number' && !Number.isNaN(year) ? year : undefined,
              poster_url: m.Poster && m.Poster !== 'N/A' ? m.Poster : undefined,
              genre: m.Type || 'Cinema',
              source: 'omdb',
            };
          });
          return { results, provider: 'omdb', hasApiKey: true };
        }
      }
    } catch (e) {
      console.warn('OMDb search fallback failed:', e);
    }
  }

  // 3. Zero-config fallback via public movie suggestions (works without any API key)
  try {
    const firstChar = cleanQuery.charAt(0).toLowerCase();
    const normalized = cleanQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const url = `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${encodeURIComponent(normalized)}.json`;

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.d && Array.isArray(data.d)) {
        const results: MovieSearchResult[] = data.d
          .filter((item: any) => item.id && item.l && (item.q === 'feature' || item.qid === 'movie' || item.y))
          .slice(0, 12)
          .map((item: any) => ({
            id: item.id,
            title: item.l,
            year: item.y,
            poster_url: item.i?.imageUrl || undefined,
            overview: item.s ? `Featuring ${item.s}` : undefined,
            genre: item.q || 'Cinema',
            source: 'imdb',
          }));

        if (results.length > 0) {
          return { results, provider: 'imdb', hasApiKey: Boolean(tmdbKey || omdbKey) };
        }
      }
    }
  } catch (e) {
    console.warn('Public suggestion fallback failed:', e);
  }

  return { results: [], provider: 'none', hasApiKey: Boolean(tmdbKey || omdbKey) };
}

/**
 * Fetch detailed movie info including runtime if TMDB ID is available.
 */
export async function getMovieDetails(tmdbId: string): Promise<Partial<MovieSearchResult> | null> {
  const tmdbKey = getTmdbApiKey();
  if (!tmdbKey || !tmdbId) return null;

  try {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbKey}&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const m = await res.json();
    const genreNames = (m.genres || []).map((g: any) => g.name).slice(0, 3).join(' / ');

    return {
      runtime: m.runtime || undefined,
      overview: m.overview || undefined,
      backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : undefined,
      poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined,
      genre: genreNames || undefined,
      rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : undefined,
      vote_count: m.vote_count,
    };
  } catch {
    return null;
  }
}

/**
 * Safely enrich an existing movie entry with poster, backdrop, runtime and overview.
 */
export async function enrichMovie(title: string, year?: number): Promise<MovieSearchResult | null> {
  const { results } = await searchMovies(title);
  if (!results || results.length === 0) return null;

  // Look for exact title match + optional year match
  const cleanTitle = title.trim().toLowerCase();
  const match =
    results.find((r) => {
      const matchTitle = r.title.trim().toLowerCase() === cleanTitle;
      const matchYear = year && r.year ? Math.abs(r.year - year) <= 1 : true;
      return matchTitle && matchYear;
    }) || results[0];

  if (!match) return null;

  // If TMDB result, fetch runtime and full details
  if (match.source === 'tmdb') {
    const details = await getMovieDetails(match.id);
    if (details) {
      return { ...match, ...details };
    }
  }

  return match;
}
