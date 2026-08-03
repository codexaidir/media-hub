import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, upsertUserProfile } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncUser = async (sessionUser: { id: string; email?: string | null; user_metadata?: Record<string, any> } | null) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }

    const profile = await upsertUserProfile(sessionUser.id, sessionUser.user_metadata?.full_name ?? null);

    setUser({
      id: sessionUser.id,
      name: profile?.full_name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
      email: sessionUser.email || '',
    });
  };

  const refreshSession = async () => {
    try {
      const client = getSupabase();
      const { data: { session }, error } = await client.auth.getSession();
      if (error) throw error;
      await syncUser(session?.user ?? null);
    } catch (error) {
      console.error('Failed to refresh session', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const client = getSupabase();
        const { data: { session }, error } = await client.auth.getSession();
        if (error) throw error;
        if (isMounted) {
          await syncUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = (newUser: User) => {
    setUser(newUser);
  };

  const signOut = async () => {
    try {
      const client = getSupabase();
      await client.auth.signOut();
    } catch (error) {
      console.error('Supabase sign out failed', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
