// src/components/AuthButton.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
// Import 'User' as a type to avoid the Vite 'export named User' error
import type { User } from '@supabase/supabase-js';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Single Source of Truth for Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Explicitly redirect to local dev
          redirectTo: window.location.origin, // More flexible than hardcoded localhost
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login failed:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="w-full h-12 bg-slate-50 animate-pulse rounded-2xl border border-slate-100 flex items-center px-4">
        <div className="w-4 h-4 bg-slate-200 rounded-full mr-3" />
        <div className="h-2 w-20 bg-slate-200 rounded" />
      </div>
    );
  }

  // 2. LOGGED IN STATE
  if (user) {
    // Pre-calculate metadata safely
    const avatarUrl = user.user_metadata?.avatar_url;
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'USER';

    return (
      <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl text-white shadow-lg border border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden border border-slate-700 shrink-0">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="avatar" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={16} />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Connected</span>
            <span className="text-[11px] font-black truncate max-w-[100px] leading-tight">
              {fullName}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          title="Sign Out"
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  // 3. LOGGED OUT STATE
  return (
    <button
      onClick={handleLogin}
      className="w-full flex items-center justify-center gap-3 p-4 bg-white border-2 border-slate-100 rounded-3xl font-black italic uppercase text-xs hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm group"
    >
      <LogIn size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
      Sign in with Google
    </button>
  );
};