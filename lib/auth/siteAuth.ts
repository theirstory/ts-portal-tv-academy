/**
 * Shared-password gate for the whole portal.
 *
 * Enabled only when SITE_PASSWORD is set. The access cookie holds an
 * HMAC of the password keyed by SITE_AUTH_SECRET, so rotating either value
 * signs everyone out. Uses Web Crypto so it runs inside proxy.ts.
 */

export const SITE_AUTH_COOKIE = 'site_access';
export const SITE_AUTH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function isSiteAuthEnabled(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

function getSecret(): string {
  const secret = process.env.SITE_AUTH_SECRET;
  if (!secret) {
    throw new Error('SITE_AUTH_SECRET must be set when SITE_PASSWORD is enabled');
  }
  return secret;
}

async function hmacHex(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createAccessToken(): Promise<string> {
  return hmacHex(getSecret(), `site-access:v1:${process.env.SITE_PASSWORD}`);
}

export async function isValidAccessToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  return timingSafeEqual(token, await createAccessToken());
}

export async function isCorrectPassword(candidate: string): Promise<boolean> {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return false;
  // Compare digests so the comparison length doesn't depend on the input.
  const secret = getSecret();
  const [a, b] = await Promise.all([hmacHex(secret, candidate), hmacHex(secret, expected)]);
  return timingSafeEqual(a, b);
}

/** Only allow same-origin relative paths as post-login destinations. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  if (next.startsWith('/login')) return '/';
  return next;
}
