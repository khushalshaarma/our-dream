import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getActiveSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as any;

  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // optional body
  }

  const now = new Date();
  const istDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
  const istTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const currentlyWatched = Boolean(movie.is_watched);

  if (!currentlyWatched) {
    // Tick to watched!
    const targetDate = body.custom_date || istDate;
    const targetTime = body.custom_time || istTime;
    const sessionId = crypto.randomUUID();

    db.prepare(`
      INSERT INTO watch_sessions (id, movie_id, watched_date, watched_time, tanushree_rating, khushal_rating, review, created_at)
      VALUES (?, ?, ?, ?, 5.0, 5.0, 'completed movie date ♡', ?)
    `).run(sessionId, id, targetDate, targetTime, Date.now());

    db.prepare('UPDATE movies SET is_watched = 1, watched_date = ?, updated_at = ? WHERE id = ?').run(targetDate, Date.now(), id);

    // Check achievement for first movie
    const totalWatched = (db.prepare('SELECT COUNT(*) as count FROM movies WHERE is_watched = 1').get() as any).count;
    if (totalWatched >= 1) {
      db.prepare('UPDATE achievements SET unlocked_at = ? WHERE key = ? AND unlocked_at IS NULL').run(Date.now(), 'first_movie');
    }

    return NextResponse.json({
      success: true,
      is_watched: true,
      watched_date: targetDate,
      watched_time: targetTime,
    });
  } else {
    // Untick to unwatched!
    db.prepare('DELETE FROM watch_sessions WHERE movie_id = ?').run(id);
    db.prepare('UPDATE movies SET is_watched = 0, watched_date = NULL, updated_at = ? WHERE id = ?').run(Date.now(), id);

    return NextResponse.json({
      success: true,
      is_watched: false,
      watched_date: null,
      watched_time: null,
    });
  }
}
