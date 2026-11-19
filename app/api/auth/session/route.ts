import { NextResponse } from 'next/server';
import { getActiveSession } from '@/lib/auth';

export async function GET() {
  const session = getActiveSession();
  return NextResponse.json({
    authenticated: session.valid,
    userName: session.userName || 'Tanushree',
  });
}
