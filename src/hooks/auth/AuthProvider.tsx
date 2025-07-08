
import React from 'react';
import { AuthContext } from './useAuthContext';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isLoading, refreshProfile } = useAuthState();
  const { signIn, signUp, signOut } = useAuthOperations();

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
