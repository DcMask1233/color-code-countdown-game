
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useUserProfile } from '@/hooks/useUserProfile';
import { withTimeout } from '@/utils/authUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    userProfile,
    setUserProfile,
    authError,
    setAuthError,
    fetchUserProfile,
    refreshProfile: refreshUserProfile
  } = useUserProfile();

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
  }, [fetchUserProfile, userProfile]);

  return {
    user,
    userProfile,
    loading,
    authError,
    setUserProfile,
    setAuthError,
    refreshProfile
  };
};
