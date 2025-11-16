'use client';

/**
 * Client-side Providers
 * Wraps the app with necessary context providers
 */

import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
