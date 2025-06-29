
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  balance: number;
  is_admin: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}
