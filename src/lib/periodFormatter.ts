
/**
 * Unified Period Formatting Utilities
 * Ensures consistent period display across all components
 */

export interface FormattedPeriod {
  display: string;
  shortDisplay: string;
  date: string;
  round: string;
}

/**
 * Format period for display with consistent formatting
 */
export function formatPeriodForDisplay(period: string): FormattedPeriod {
  if (!period || period.length < 11) {
    return {
      display: period || 'Invalid',
      shortDisplay: period || 'Invalid',
      date: '',
      round: ''
    };
  }

  try {
    // Expected format: YYYYMMDDRRRR (e.g., 20250627001)
    const year = period.substring(0, 4);
    const month = period.substring(4, 6);
    const day = period.substring(6, 8);
    const round = period.substring(8);

    // Format: DD/MM/YYYY-RRR
    const display = `${day}/${month}/${year}-${round}`;
    
    // Short format: DDMM-RRR (for compact displays)
    const shortDisplay = `${day}${month}-${round}`;
    
    return {
      display,
      shortDisplay,
      date: `${day}/${month}/${year}`,
      round
    };
  } catch (error) {
    console.error('Error formatting period:', period, error);
    return {
      display: period,
      shortDisplay: period,
      date: '',
      round: ''
    };
  }
}

/**
 * Format period for table display (last 6 characters)
 */
export function formatPeriodForTable(period: string): string {
  if (!period || period.length < 6) return period;
  return period.slice(-6);
}

/**
 * Get period parts for advanced formatting
 */
export function getPeriodParts(period: string) {
  if (!period || period.length < 11) {
    return null;
  }

  return {
    year: period.substring(0, 4),
    month: period.substring(4, 6),
    day: period.substring(6, 8),
    round: period.substring(8)
  };
}
