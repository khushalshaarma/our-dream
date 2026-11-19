import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from './db';

const SECRET_CODE = process.env.MIDNIGHT_SECRET_CODE || '08/08/2026';
const SESSION_COOKIE_NAME = 'midnight_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string = 'global'): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    return { allowed: true };
  }

  if (record.count >= 5) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

export function validateSecret(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return code.trim() === SECRET_CODE;
}

export function createSessionToken(userName: string = 'Tanushree'): { token: string; expiresAt: number } {
  const token = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  db.prepare('INSERT INTO sessions (token, user_name, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    token,
    userName,
    expiresAt,
    now
  );

  return { token, expiresAt };
}

export function getActiveSession(): { valid: boolean; userName: string; token?: string } {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return { valid: false, userName: '' };
    }

    const row = db.prepare('SELECT user_name, expires_at FROM sessions WHERE token = ?').get(token) as
      | { user_name: string; expires_at: number }
      | undefined;

    if (!row) {
      return { valid: false, userName: '' };
    }

    if (Date.now() > row.expires_at) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return { valid: false, userName: '' };
    }

    return { valid: true, userName: row.user_name || 'Tanushree', token };
  } catch (error) {
    return { valid: false, userName: '' };
  }
}

export function deleteSession(): void {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
  } catch {
    // Ignore
  }
}

export { SESSION_COOKIE_NAME };
