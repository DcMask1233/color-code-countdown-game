
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
    if (!session?.user) {
      console.log('No session user found, skipping profile fetch');
      return;
    }
    
    console.log('Fetching user profile for user:', session.user.id);
    
    try {
      const { data, error } = await supabase.rpc('get_user_info');
      
      console.log('User profile fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const profile = data[0];
        console.log('Setting user profile:', profile);
        setUserProfile({
          user_id: profile.user_id,
          user_code: profile.user_code,
          mobile: profile.mobile,
          balance: Number(profile.balance),
          total_bet_amount: Number(profile.total_bet_amount),
          total_deposit_amount: Number(profile.total_deposit_amount),
          total_withdraw_amount: Number(profile.total_withdraw_amount)
        });
      } else {
        console.log('No profile data found, user may not have been set up properly');
        // For now, let's create a minimal profile to avoid blocking the UI
        setUserProfile({
          user_id: session.user.id,
          user_code: 'TEMP001',
          mobile: null,
          balance: 1000,
          total_bet_amount: 0,
          total_deposit_amount: 0,
          total_withdraw_amount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Create a fallback profile to avoid blocking the UI
      setUserProfile({
        user_id: session.user.id,
        user_code: 'TEMP001',
        mobile: null,
        balance: 1000,
        total_bet_amount: 0,
        total_deposit_amount: 0,
        total_withdraw_amount: 0
      });
    }
  };

  const refreshUserProfile = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', { event, session: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile');
          // Fetch user profile after successful authentication
          setTimeout(() => {
            fetchUserProfile();
          }, 100);
        } else {
          console.log('No user session, clearing profile');
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    console.log('Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session found:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile();
        }, 100);
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
