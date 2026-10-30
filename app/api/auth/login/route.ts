import { NextResponse } from 'next/server';
import {
  SITE_AUTH_COOKIE,
  SITE_AUTH_MAX_AGE,
  createAccessToken,
  isCorrectPassword,
  isSiteAuthEnabled,
  safeNextPath,
} from '@/lib/auth/siteAuth';

const FAILED_ATTEMPT_DELAY_MS = 1000;

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  const next = safeNextPath(String(form.get('next') ?? '/'));

  if (!isSiteAuthEnabled()) {
    return NextResponse.redirect(new URL(next, request.url), 303);
  }

  if (!(await isCorrectPassword(password))) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_ATTEMPT_DELAY_MS));
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', '1');
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(SITE_AUTH_COOKIE, await createAccessToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SITE_AUTH_MAX_AGE,
  });
  return response;
}
