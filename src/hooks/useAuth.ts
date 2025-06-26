
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  user_id: string;
  user_code: string;
  mobile: string | null;
  balance: number;
  total_bet_amount: number;
  total_deposit_amount: number;
  total_withdraw_amount: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_info');
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const profile = data[0];
        setUserProfile({
          user_id: profile.user_id,
          user_code: profile.user_code,
          mobile: profile.mobile,
          balance: Number(profile.balance),
          total_bet_amount: Number(profile.total_bet_amount),
          total_deposit_amount: Number(profile.total_deposit_amount),
          total_withdraw_amount: Number(profile.total_withdraw_amount)
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshUserProfile = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          // Fetch user profile after successful authentication
          setTimeout(() => {
            fetchUserProfile();
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUserProfile(null);
    return { error };
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUserProfile
  };
};
