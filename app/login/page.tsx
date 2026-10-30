import type { Metadata } from 'next';
import { safeNextPath } from '@/lib/auth/siteAuth';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return <LoginForm next={safeNextPath(next)} hasError={error === '1'} />;
}
