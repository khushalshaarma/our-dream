import { NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { db, uploadsDir } from '@/lib/db';
import { getActiveSession } from '@/lib/auth';

export async function GET() {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const polaroids = db.prepare('SELECT * FROM polaroids ORDER BY created_at DESC').all();
  return NextResponse.json({ polaroids });
}

export async function POST(req: Request) {
  const session = getActiveSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const caption = (formData.get('caption') as string) || '';
    const dateTaken = (formData.get('date_taken') as string) || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const movieId = (formData.get('movie_id') as string) || null;

    if (!file) {
      return NextResponse.json({ error: 'Please choose a photo, bestie!' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.jpg';
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase() || '.jpg';
    const filename = `polaroid_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${safeExt}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const id = crypto.randomUUID();
    const timestamp = Date.now();

    db.prepare(`
      INSERT INTO polaroids (id, file_path, filename, caption, date_taken, movie_id, uploaded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      filePath,
      filename,
      caption,
      dateTaken,
      movieId,
      session.userName || 'Tanushree',
      timestamp
    );

    const created = db.prepare('SELECT * FROM polaroids WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      polaroid: created,
      message: 'another little memory tucked into our corner ♡',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to upload photo' }, { status: 500 });
  }
}
