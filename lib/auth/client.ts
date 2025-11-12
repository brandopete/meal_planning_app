'use client';

import { useEffect } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Set auth token as a cookie for server-side access
export function useAuthToken() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        // Set cookie with token
        document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
      } else {
        // Clear cookie
        document.cookie = 'auth-token=; path=/; max-age=0';
      }
    });

    return () => unsubscribe();
  }, []);
}
