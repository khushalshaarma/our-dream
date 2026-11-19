import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getActiveSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = params;
  try {
    const body = await req.json();
    const {
      title,
      year,
      notes,
      genre,
      mood,
      poster_url,
      backdrop_url,
      overview,
      runtime,
      rating,
      planned_date,
      planned_time,
      watched_date,
    } = body;

    const existing = db.prepare('SELECT id FROM movies WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE movies SET
        title = COALESCE(?, title),
        year = COALESCE(?, year),
        notes = COALESCE(?, notes),
        genre = COALESCE(?, genre),
        mood = COALESCE(?, mood),
        poster_url = COALESCE(?, poster_url),
        backdrop_url = COALESCE(?, backdrop_url),
        overview = COALESCE(?, overview),
        runtime = COALESCE(?, runtime),
        rating = COALESCE(?, rating),
        planned_date = COALESCE(?, planned_date),
        planned_time = COALESCE(?, planned_time),
        watched_date = COALESCE(?, watched_date),
        updated_at = ?
      WHERE id = ?
    `).run(
      title,
      year,
      notes,
      genre,
      mood,
      poster_url,
      backdrop_url,
      overview,
      runtime,
      rating,
      planned_date,
      planned_time,
      watched_date,
      Date.now(),
      id
    );

    // If watched_date was changed, also update the latest watch session if exists
    if (watched_date) {
      db.prepare(`
        UPDATE watch_sessions SET watched_date = ? WHERE movie_id = ?
      `).run(watched_date, id);
    }

    const updated = db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as any;

    return NextResponse.json({
      success: true,
      movie: {
        ...updated,
        is_watched: Boolean(updated.is_watched),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update movie' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = params;
  db.prepare('DELETE FROM watch_sessions WHERE movie_id = ?').run(id);
  db.prepare('DELETE FROM movies WHERE id = ?').run(id);

  return NextResponse.json({ success: true, message: 'Movie deleted safely' });
}
