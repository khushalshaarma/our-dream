import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getActiveSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // 'all', 'watched', 'unwatched'

  let query = 'SELECT * FROM movies WHERE 1=1';
  if (status === 'watched') {
    query += ' AND is_watched = 1';
  } else if (status === 'unwatched') {
    query += ' AND is_watched = 0';
  }
  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all() as any[];

  return NextResponse.json({
    movies: rows.map((m) => ({
      ...m,
      is_watched: Boolean(m.is_watched),
    })),
  });
}

export async function POST(req: Request) {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      year,
      poster_url,
      backdrop_url,
      overview = '',
      runtime,
      genre = 'Romance / Cinema',
      notes = '',
      mood = 'comfort watch',
      rating,
      vote_count,
      tmdb_id,
      planned_date,
      planned_time,
      added_by = session.userName || 'Tanushree',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Movie title is required!' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = Date.now();

    db.prepare(`
      INSERT INTO movies (
        id, title, year, poster_url, backdrop_url, overview, runtime,
        genre, notes, mood, rating, vote_count, tmdb_id,
        planned_date, planned_time, added_by, is_watched, watched_date, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)
    `).run(
      id,
      title.trim(),
      year || new Date().getFullYear(),
      poster_url || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80',
      backdrop_url || null,
      overview.trim(),
      runtime || null,
      genre,
      notes.trim(),
      mood,
      rating || null,
      vote_count || null,
      tmdb_id || null,
      planned_date || null,
      planned_time || null,
      added_by,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as any;

    return NextResponse.json({
      success: true,
      movie: {
        ...created,
        is_watched: false,
      },
      message: 'movie added to our checklist ♡',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add movie' }, { status: 500 });
  }
}
