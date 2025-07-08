import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from './useAuthContext';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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

  const refreshProfile = async (userId?: string) => {
    if (userId) {
      await fetchUserProfile(userId);
    }
  };

  const clearProfile = () => {
    setUserProfile(null);
  };

  return {
    userProfile,
    isFetchingProfile,
    fetchUserProfile,
    refreshProfile,
    clearProfile,
  };
};