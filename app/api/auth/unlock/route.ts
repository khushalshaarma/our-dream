import { NextResponse } from 'next/server';
import { checkRateLimit, validateSecret, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many tries, bestie! Take a breather for ${rateCheck.retryAfter}s ♡`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { code, userName = 'Tanushree' } = body;

    if (!validateSecret(code)) {
      return NextResponse.json(
        {
          success: false,
          error: 'wrong universe, bestie. try again ♡',
        },
        { status: 401 }
      );
    }

    const { token, expiresAt } = createSessionToken(userName);

    const response = NextResponse.json({
      success: true,
      message: 'welcome home, lovebugs ♡',
      user: userName,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'oopsie, something went wrong on our end.' },
      { status: 500 }
    );
  }
}
