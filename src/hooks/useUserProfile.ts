
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { withTimeout, createDefaultProfile } from '@/utils/authUtils';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
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
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying profile fetch due to error (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchUserProfile(userId, retryCount + 1);
      }
      
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
