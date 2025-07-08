import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    userProfile, 
    fetchUserProfile, 
    refreshProfile, 
    clearProfile,
    isFetchingProfile 
  } = useUserProfile();

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
          clearProfile();
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

  const handleRefreshProfile = async () => {
    if (user) {
      await refreshProfile(user.id);
    }
  };

  return {
    user,
    userProfile,
    isLoading,
    isFetchingProfile,
    refreshProfile: handleRefreshProfile,
  };
};