
import { useAuthState } from './auth/useAuthState';
import { useAuthOperations } from './auth/useAuthOperations';
import { AuthState, AuthActions } from '@/types/auth';

export const useAuth = (): AuthState & AuthActions => {
  const authState = useAuthState();
  const authOperations = useAuthOperations();

  return {
    ...authState,
    ...authOperations
  };
};
