'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Profile } from '@/types';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const mockUser: Profile = {
  id: 'mock-user-123',
  email: 'admin@puridistrict.odisha.gov.in',
  full_name: 'Puri District Administration',
  role: 'admin',
  created_at: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType>({
  user: mockUser,
  loading: false,
  signOut: async () => {},
  isAdmin: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        loading: false,
        signOut: async () => { window.location.href = '/dashboard'; },
        isAdmin: true,
        refreshUser: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useIsAdmin() {
  return { isAdmin: true, loading: false };
}