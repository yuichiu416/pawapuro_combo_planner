// src/components/AuthButton.tsx

import type { User } from '@supabase/supabase-js';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/style';

export const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Login failed:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // 1. LOADING STATE (Matches circular profile size)
  if (loading) {
    return (
      <div className="w-11 h-11 bg-slate-100 animate-pulse rounded-full border border-slate-200 shrink-0" />
    );
  }

  // 2. LOGGED IN STATE (Circular Avatar)
  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;

    return (
      <div className="group relative w-11 h-11 shrink-0">
        <div className="w-full h-full rounded-full border-2 border-slate-200 p-0.5 transition-all group-hover:border-blue-500 bg-white shadow-sm overflow-hidden">
          <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="profile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={18} className="text-slate-400" />
            )}
          </div>
        </div>

        {/* Hover Logout Overlay */}
        <button
          onClick={handleLogout}
          className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-[1px]"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  // 3. LOGGED OUT STATE (Secondary/Ghost Style)
  return (
    <button
      onClick={handleLogin}
      className="h-11 px-4 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl font-bold uppercase text-[xs] tracking-wider text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shrink-0"
    >
      <LogIn size={14} className="text-blue-600" />
      Sign In
    </button>
  );
};
