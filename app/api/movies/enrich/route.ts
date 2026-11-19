import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getActiveSession } from '@/lib/auth';
import { enrichMovie } from '@/lib/tmdb';

export async function POST(req: Request) {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Optional body
    }

    const { movieId } = body;

    let targetMovies: any[] = [];
    if (movieId) {
      const single = db.prepare('SELECT * FROM movies WHERE id = ?').get(movieId) as any;
      if (single) targetMovies.push(single);
    } else {
      // Fetch movies that don't have a backdrop_url or have generic unsplash poster
      targetMovies = db
        .prepare(
          "SELECT * FROM movies WHERE backdrop_url IS NULL OR poster_url LIKE '%unsplash%' LIMIT 10"
        )
        .all() as any[];
    }

    let enrichedCount = 0;
    const updatedMovies: any[] = [];

    for (const movie of targetMovies) {
      try {
        const enriched = await enrichMovie(movie.title, movie.year);
        if (enriched) {
          const poster = enriched.poster_url || movie.poster_url;
          const backdrop = enriched.backdrop_url || movie.backdrop_url;
          const overview = enriched.overview || movie.overview;
          const runtime = enriched.runtime || movie.runtime;
          const rating = enriched.rating || movie.rating;
          const genre = enriched.genre || movie.genre;
          const tmdbId = enriched.id || movie.tmdb_id;

          db.prepare(`
            UPDATE movies SET
              poster_url = ?,
              backdrop_url = ?,
              overview = COALESCE(overview, ?),
              runtime = COALESCE(runtime, ?),
              rating = COALESCE(rating, ?),
              genre = COALESCE(genre, ?),
              tmdb_id = COALESCE(tmdb_id, ?),
              updated_at = ?
            WHERE id = ?
          `).run(
            poster,
            backdrop,
            overview,
            runtime,
            rating,
            genre,
            tmdbId,
            Date.now(),
            movie.id
          );

          enrichedCount++;
          updatedMovies.push({ id: movie.id, title: movie.title });
        }
      } catch (err) {
        console.warn(`Could not enrich movie "${movie.title}":`, err);
      }
    }

    return NextResponse.json({
      success: true,
      enrichedCount,
      updatedMovies,
      message: `Enriched ${enrichedCount} movies with official metadata ♡`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Enrichment failed' }, { status: 500 });
  }
}
