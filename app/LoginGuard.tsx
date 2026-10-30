'use client';

import { usePathname } from 'next/navigation';

/** Hides site chrome (navbar, chat drawer) on the password page. */
export const LoginGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  if (pathname === '/login') return null;
  return <>{children}</>;
};
