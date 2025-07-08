
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthContext, UserProfile } from './useAuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    // Prevent duplicate fetches
    if (isFetchingProfile) {
      console.log('⚠️ Profile fetch already in progress, skipping');
      return;
    }

    setIsFetchingProfile(true);
    try {
      console.log('🔄 Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        if (retryCount < 2) {
          console.log('🔄 Retrying profile fetch...');
          setTimeout(() => fetchUserProfile(userId, retryCount + 1), 1000);
          return;
        }
        toast({
          title: "Profile Error",
          description: "Failed to load user profile. Please refresh the page.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        console.log('✅ User profile loaded:', data);
        setUserProfile(data);
      } else {
        console.log('⚠️ No profile found, trigger should create it');
        if (retryCount < 3) {
          setTimeout(() => fetchUserProfile(userId, retryCount + 1), 1000);
        } else {
          toast({
            title: "Profile Setup",
            description: "Profile creation is taking longer than expected. Please refresh the page.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      if (retryCount < 2) {
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), 1000);
      } else {
        toast({
          title: "Profile Error",
          description: "Failed to load user profile. Please refresh the page.",
          variant: "destructive"
        });
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Don't manually fetch profile here - let onAuthStateChange handle it
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } else {
      setUser(null);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST to catch all events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          // Only fetch profile if we don't have it yet or user changed
          if (!userProfile || userProfile.id !== session.user.id) {
            fetchUserProfile(session.user.id);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Session error:', error);
        }
        
        // Only update if onAuthStateChange hasn't already handled this session
        if (!user && session?.user) {
          console.log('✅ Initial session found for user:', session.user.id);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else if (!session?.user) {
          console.log('❌ No initial session found');
        }
      } catch (error) {
        console.error('❌ Failed to get session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
