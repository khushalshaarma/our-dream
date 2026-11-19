import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { uploadsDir } from '@/lib/db';
import { getActiveSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  const session = getActiveSession();
  if (!session.valid) {
    return new NextResponse('Unauthorized access to private memories', { status: 401 });
  }

  const { filename } = params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(uploadsDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Photo not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(safeFilename).toLowerCase();

  let contentType = 'image/jpeg';
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.gif') contentType = 'image/gif';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=86400',
    },
  });
}
