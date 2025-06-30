
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { withTimeout } from '@/utils/authUtils';

export const useAuthOperations = () => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
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
        console.log('✅ Sign in successful');
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        return true;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
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
      
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    signIn,
    signUp,
    signOut
  };
};
