
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from './useUserProfile';
import { withTimeout } from '@/utils/authUtils';
import { AuthState, AuthActions } from '@/types/auth';

export const useAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const {
    userProfile,
    setUserProfile,
    authError,
    setAuthError,
    fetchUserProfile,
    refreshProfile: refreshUserProfile
  } = useUserProfile();

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthError(null);
      console.log('🔐 Starting sign in process');

      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000
      );

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        console.log('✅ Sign in successful, fetching profile');
        setUser(data.user);
        
        // Fetch profile in background
        fetchUserProfile(data.user.id).then(profile => {
          if (profile) {
            setUserProfile(profile);
          }
        });

        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        return true;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setAuthError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    return false;
  };

  const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthError(null);
      console.log('📝 Starting sign up process');

      const { data, error } = await withTimeout(
        supabase.auth.signUp({ email, password }),
        15000
      );

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        });
        return true;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setAuthError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    return false;
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('👋 Signing out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      
      setUser(null);
      setUserProfile(null);
      setAuthError(null);
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshProfile = async (): Promise<import('@/types/auth').UserProfile | null> => {
    if (!user) return null;
    
    console.log('🔄 Manual profile refresh requested');
    setLoading(true);
    
    try {
      const profile = await refreshUserProfile(user.id);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth system');
        
        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          10000
        );

        if (!mounted) return;

        if (error) {
          console.error('Error getting initial session:', error);
          setAuthError('Failed to initialize authentication');
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Initial session found, loading profile');
          setUser(session.user);
          
          const profile = await fetchUserProfile(session.user.id);
          if (mounted && profile) {
            setUserProfile(profile);
          }
        } else {
          console.log('ℹ️ No initial session found');
        }

        console.log(`✅ Auth initialization completed`);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          if (!userProfile || userProfile.id !== session.user.id) {
            console.log('🔄 Fetching profile for auth state change');
            const profile = await fetchUserProfile(session.user.id);
            if (mounted && profile) {
              setUserProfile(profile);
            }
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  return {
    user,
    userProfile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };
};
