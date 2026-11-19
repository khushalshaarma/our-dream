import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getActiveSession } from '@/lib/auth';

export async function GET() {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Fetch all watched movies with date
  const watchedMovies = db.prepare(`
    SELECT id, title, year, poster_url, backdrop_url, genre, notes, watched_date
    FROM movies
    WHERE is_watched = 1 AND watched_date IS NOT NULL AND watched_date != ''
    ORDER BY watched_date DESC
  `).all() as any[];

  const watchedByDate: Record<string, any[]> = {};
  for (const m of watchedMovies) {
    const d = m.watched_date;
    if (!watchedByDate[d]) {
      watchedByDate[d] = [];
    }
    watchedByDate[d].push(m);
  }

  // Fetch all planned movies with planned_date
  const plannedMovies = db.prepare(`
    SELECT id, title, year, poster_url, backdrop_url, genre, notes, planned_date, planned_time, is_watched
    FROM movies
    WHERE planned_date IS NOT NULL AND planned_date != ''
    ORDER BY planned_date ASC
  `).all() as any[];

  const plannedByDate: Record<string, any[]> = {};
  for (const m of plannedMovies) {
    const d = m.planned_date;
    if (!plannedByDate[d]) {
      plannedByDate[d] = [];
    }
    plannedByDate[d].push(m);
  }

  return NextResponse.json({
    watched: watchedByDate,
    planned: plannedByDate,
    anniversary: {
      date: '2026-08-08',
      label: 'The Day Our Lore Officially Began ♡',
    },
  });
}
