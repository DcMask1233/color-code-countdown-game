
/**
 * Unified Period Generation System
 * This ensures consistent period calculation across frontend and backend
 */

export interface PeriodInfo {
  period: string;
  timeLeft: number;
  periodNumber: number;
  dateString: string;
}

/**
 * Generate current period using consistent IST calculation
 * This matches the backend logic exactly
 */
export function getCurrentPeriod(durationSeconds: number): PeriodInfo {
  try {
    // Get current time in IST (UTC + 5.5 hours)
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Get start of day in IST
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Calculate seconds since start of day
    const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    
    // Calculate current period number (1-based, consistent with backend)
    const periodNumber = Math.floor(secondsSinceStart / durationSeconds) + 1;
    
    // Format date as YYYYMMDD (consistent with backend)
    const dateString = istTime.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Create period string with 3-digit padding (consistent with backend)
    const period = dateString + periodNumber.toString().padStart(3, '0');
    
    // Calculate time left in current period
    const secondsInCurrentPeriod = secondsSinceStart % durationSeconds;
    const timeLeft = durationSeconds - secondsInCurrentPeriod;
    
    return {
      period,
      timeLeft,
      periodNumber,
      dateString
    };
  } catch (error) {
    console.error('❌ Error in period calculation:', error);
    // Return safe defaults
    return {
      period: 'ERROR',
      timeLeft: 0,
      periodNumber: 0,
      dateString: ''
    };
  }
}

/**
 * Validate if a period string is valid
 */
export function isValidPeriod(period: string): boolean {
  if (!period || period.length !== 11) return false;
  
  const dateStr = period.substring(0, 8);
  const periodNum = period.substring(8);
  
  // Check date format YYYYMMDD
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));
  
  if (year < 2024 || year > 2030) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Check period number (3 digits)
  const periodNumber = parseInt(periodNum);
  if (isNaN(periodNumber) || periodNumber < 1 || periodNumber > 999) return false;
  
  return true;
}

/**
 * Format period for display
 */
export function formatPeriodForDisplay(period: string): string {
  if (!isValidPeriod(period)) return period;
  
  const year = period.substring(0, 4);
  const month = period.substring(4, 6);
  const day = period.substring(6, 8);
  const round = period.substring(8);
  
  return `${year}${month}${day}${round}`;
}

/**
 * Get IST time string for logging
 */
export function getISTTimeString(): string {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime.toISOString();
}
