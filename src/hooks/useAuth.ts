
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

  const fetchUserProfile = async (userId: string) => {
    console.log('Fetching user profile for user:', userId);
    
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
        console.log('No profile data found, creating fallback profile');
        setUserProfile({
          user_id: userId,
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
      setUserProfile({
        user_id: userId,
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
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', { event, session: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile');
          // Use the user ID from the session directly
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 100);
        } else {
          console.log('No user session, clearing profile');
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    console.log('Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session found:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('Found existing user, fetching profile');
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 100);
      }
      
      setLoading(false);
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
