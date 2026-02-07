import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, fetchProfile, upsertProfile } from '../lib/supabase';
import type { SupabaseProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: SupabaseProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<SupabaseProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or create profile from Supabase when user changes
  const loadProfile = useCallback(async (userId: string, email?: string) => {
    const p = await fetchProfile(userId);
    if (p) {
      setProfile(p);
      return p;
    }
    // Profile doesn't exist yet - try creating one
    const created = await upsertProfile(userId, {
      email: email || null,
      name: email?.split('@')[0] || null,
    });
    if (created) {
      const newProfile = await fetchProfile(userId);
      setProfile(newProfile);
      return newProfile;
    }
    return null;
  }, []);

  /** Re-fetch profile from Supabase (e.g., after payment to check premium) */
  const refreshProfile = useCallback(async (): Promise<SupabaseProfile | null> => {
    if (!user) return null;
    const p = await fetchProfile(user.id);
    setProfile(p);
    return p;
  }, [user]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? undefined);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? undefined);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Auth not configured') };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Auth not configured') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: new Error('Auth not configured') };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
        refreshProfile,
      }}
    >
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
