'use client';

import { AuthProvider as AuthContextProvider } from '@/lib/contexts/AuthContext';
import { useAuthToken } from '@/lib/auth/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthToken();

  return <AuthContextProvider>{children}</AuthContextProvider>;
}
