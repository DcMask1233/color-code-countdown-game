
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { withTimeout, createDefaultProfile, withRetry } from '@/utils/authUtils';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log(`🔄 Fetching user profile for ${userId}`);
      const startTime = Date.now();
      
      const queryPromise = async () => {
        return await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
      };

      const { data, error } = await withTimeout(
        withRetry(queryPromise),
        8000
      );

      const fetchTime = Date.now() - startTime;
      console.log(`✅ Profile fetch completed in ${fetchTime}ms`);

      if (error) {
        console.error('Error fetching user profile:', error);
        setAuthError(`Failed to load profile: ${error.message}`);
        return null;
      }

      if (!data) {
        console.log('🔄 No user profile found, creating default profile');
        return createDefaultProfile(userId);
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
      setAuthError('Failed to load user profile. Please refresh the page.');
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    
    console.log('🔄 Manual profile refresh requested');
    
    try {
      const profile = await fetchUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
      }
      return profile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  }, [fetchUserProfile]);

  return {
    userProfile,
    setUserProfile,
    authError,
    setAuthError,
    fetchUserProfile,
    refreshProfile
  };
};
