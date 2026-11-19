import { NextResponse } from 'next/server';
import { getActiveSession } from '@/lib/auth';
import { searchMovies, getTmdbApiKey } from '@/lib/tmdb';

export async function GET(req: Request) {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ results: [], hasApiKey: Boolean(getTmdbApiKey()) });
  }

  try {
    const { results, provider, hasApiKey } = await searchMovies(q.trim());
    return NextResponse.json({
      results,
      provider,
      hasApiKey,
      count: results.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to search movies', results: [] },
      { status: 500 }
    );
  }
}
