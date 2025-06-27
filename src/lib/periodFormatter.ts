
/**
 * Unified Period Formatting Utilities
 * Ensures consistent period display across all components
 * Format: YYYYMMDDRR (10 characters)
 */

export interface FormattedPeriod {
  display: string;
  fullDisplay: string;
  date: string;
  round: string;
}

/**
 * Format period for display with consistent formatting
 * Expected format: YYYYMMDDRR (e.g., 2025062761)
 */
export function formatPeriodForDisplay(period: string): FormattedPeriod {
  if (!period || period.length !== 10) {
    console.warn('Invalid period format:', period);
    return {
      display: period || 'Invalid',
      fullDisplay: period || 'Invalid',
      date: '',
      round: ''
    };
  }

  try {
    // Parse YYYYMMDDRR format
    const year = period.substring(0, 4);
    const month = period.substring(4, 6);
    const day = period.substring(6, 8);
    const round = period.substring(8, 10);

    // Full display: YYYYMMDDRR
    const fullDisplay = period;
    
    // Readable display: DD/MM/YYYY-RR
    const display = `${day}/${month}/${year}-${round}`;
    
    return {
      display,
      fullDisplay,
      date: `${day}/${month}/${year}`,
      round
    };
  } catch (error) {
    console.error('Error formatting period:', period, error);
    return {
      display: period,
      fullDisplay: period,
      date: '',
      round: ''
    };
  }
}

/**
 * Validate if a period string is valid YYYYMMDDRR format
 */
export function isValidPeriod(period: string): boolean {
  if (!period || period.length !== 10) return false;
  
  const year = parseInt(period.substring(0, 4));
  const month = parseInt(period.substring(4, 6));
  const day = parseInt(period.substring(6, 8));
  const round = parseInt(period.substring(8, 10));
  
  // Basic validation
  if (year < 2024 || year > 2030) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (isNaN(round) || round < 1) return false;
  
  return true;
}

/**
 * Get period parts for advanced formatting
 */
export function getPeriodParts(period: string) {
  if (!period || period.length !== 10) {
    return null;
  }

  return {
    year: period.substring(0, 4),
    month: period.substring(4, 6),
    day: period.substring(6, 8),
    round: period.substring(8, 10)
  };
}
