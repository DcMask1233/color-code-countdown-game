
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  balance: number;
  is_admin: boolean;
  created_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add timeout for auth operations
  const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  };

  const fetchUserProfile = async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    const maxRetries = 2;
    
    try {
      console.log(`🔄 Fetching user profile for ${userId} (attempt ${retryCount + 1})`);
      const startTime = Date.now();
      
      const { data, error } = await withTimeout(
        supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        8000
      );

      const fetchTime = Date.now() - startTime;
      console.log(`✅ Profile fetch completed in ${fetchTime}ms`);

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Retry on specific errors
        if (retryCount < maxRetries && (error.code === 'PGRST301' || error.message.includes('timeout'))) {
          console.log(`🔄 Retrying profile fetch (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return fetchUserProfile(userId, retryCount + 1);
        }
        
        setAuthError(`Failed to load profile: ${error.message}`);
        return null;
      }

      if (!data) {
        console.log('🔄 No user profile found, creating default profile');
        // If no profile exists, return a default one (the trigger should create it)
        return {
          id: userId,
          balance: 1000,
          is_admin: false,
          created_at: new Date().toISOString()
        };
      }

      const profile: UserProfile = {
        id: data.id,
        balance: data.balance || 0,
        is_admin: data.is_admin || false,
        created_at: data.created_at || ''
      };

      console.log('✅ User profile loaded successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying profile fetch due to error (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchUserProfile(userId, retryCount + 1);
      }
      
      setAuthError('Failed to load user profile. Please refresh the page.');
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthError(null);
      console.log('🔐 Starting sign in process');

      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        15000 // 15 second timeout for sign in
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
        
        // Fetch profile in background, don't block the UI
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

  const signUp = async (email: string, password: string) => {
    try {
      setAuthError(null);
      console.log('📝 Starting sign up process');

      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
        }),
        15000 // 15 second timeout
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

  const signOut = async () => {
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

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth system');
        const startTime = Date.now();
        
        // Get initial session with timeout
        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          10000 // 10 second timeout
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
          
          // Fetch profile with error handling
          const profile = await fetchUserProfile(session.user.id);
          if (mounted && profile) {
            setUserProfile(profile);
          }
        } else {
          console.log('ℹ️ No initial session found');
        }

        const initTime = Date.now() - startTime;
        console.log(`✅ Auth initialization completed in ${initTime}ms`);
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          // Only fetch profile if we don't have it or it's a different user
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

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove userProfile from dependencies to prevent loops

  // Manual refresh function for users
  const refreshProfile = async () => {
    if (!user) return null;
    
    console.log('🔄 Manual profile refresh requested');
    setLoading(true);
    
    try {
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
      }
      return profile;
    } finally {
      setLoading(false);
    }
  };

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
