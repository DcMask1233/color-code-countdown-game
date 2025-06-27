
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBackendPeriod = (duration: number) => {
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate current period using new format (YYYY-MM-DD-XXX)
  const getCurrentPeriodFormatted = (durationSeconds: number): string => {
    // Get current time in IST (UTC + 5.5 hours)
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Get start of day in IST
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Calculate seconds since start of day
    const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    
    // Calculate current period number (1-based)
    const periodNumber = Math.floor(secondsSinceStart / durationSeconds) + 1;
    
    // Format date as YYYY-MM-DD
    const yearMonthDay = istTime.toISOString().slice(0, 10);
    
    // Create readable period string: YYYY-MM-DD-XXX
    const period = yearMonthDay + '-' + periodNumber.toString().padStart(3, '0');
    
    return period;
  };

  // Get time left in current period
  const getTimeLeftInPeriod = (durationSeconds: number): number => {
    // Get current time in IST (UTC + 5.5 hours)
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Get start of day in IST
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Calculate seconds since start of day
    const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    
    // Calculate time left in current period
    const secondsInCurrentPeriod = secondsSinceStart % durationSeconds;
    const timeLeftInPeriod = durationSeconds - secondsInCurrentPeriod;
    
    return timeLeftInPeriod;
  };

  useEffect(() => {
    const updatePeriodInfo = () => {
      try {
        const period = getCurrentPeriodFormatted(duration);
        const timeRemaining = getTimeLeftInPeriod(duration);
        
        setCurrentPeriod(period);
        setTimeLeft(timeRemaining);
        setError(null);
        setIsLoading(false);
        
        console.log(`🕐 Updated period info: ${period}, time left: ${timeRemaining}s`);
      } catch (err) {
        console.error('Error updating period info:', err);
        setError('Failed to calculate period information');
        setIsLoading(false);
      }
    };

    // Update immediately
    updatePeriodInfo();

    // Update every second
    const interval = setInterval(updatePeriodInfo, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return {
    currentPeriod,
    timeLeft,
    isLoading,
    error
  };
};
