import { isSiteAuthEnabled } from '@/lib/auth/siteAuth';

// Reachable only once signed in (or when the gate is off), so `enabled` is all the client needs.
export async function GET() {
  return Response.json({ enabled: isSiteAuthEnabled() });
}
