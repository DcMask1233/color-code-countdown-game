
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

export const createDefaultProfile = (userId: string): import('../types/auth').UserProfile => ({
  id: userId,
  balance: 1000,
  is_admin: false,
  created_at: new Date().toISOString()
});
