
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert hour '0' to '12'
  return `${day}/${month}/${year} | ${hours}:${minutes} ${ampm}`;
}

export function formatDateWithOrdinal(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getUTCDate();
  const month = date.toLocaleDateString('en-US', { 
    month: 'long',
    timeZone: 'UTC' 
  });
  
  // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${day}${getOrdinalSuffix(day)} ${month}`;
}



export function formatDateAndTimeLeft(isoString: string): string {
  const dateStr = formatDateWithOrdinal(isoString);
  const timeLeft = getTimeLeft(isoString);
  
  if (timeLeft === "Ended") {
    return `${dateStr} - Ended`;
  }
  
  return `${dateStr}, ${timeLeft}`;
}

// ✅ NEW: Short version: "Jul 6, 4h left"
export function formatDateAndTimeLeftShort(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getUTCDate();
  const month = date.toLocaleDateString('en-US', { 
    month: 'short',
    timeZone: 'UTC' 
  });
  
  const now = new Date();
  const endTime = new Date(isoString);
  const diffTime = endTime.getTime() - now.getTime();
  
  if (diffTime <= 0) return `${month} ${day} - Ended`;
  
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${month} ${day}, ${diffDays}d left`;
  } else if (diffHours > 0) {
    return `${month} ${day}, ${diffHours}h left`;
  } else {
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    return `${month} ${day}, ${diffMinutes}m left`;
  }
}






export const UTCTimeHelpers = {
  // Convert local date/time input to UTC timestamp
  toUTCTimestamp: (dateStr: string, timeStr: string): number => {
    const localDateTime = new Date(`${dateStr}T${timeStr}`);
    return Math.floor(localDateTime.getTime() / 1000);
  },

  // Convert local date/time to ISO string for database storage
  toISOString: (dateStr: string, timeStr: string): string => {
    const localDateTime = new Date(`${dateStr}T${timeStr}`);
    return localDateTime.toISOString();
  },

  // Get user's timezone for display
  getUserTimezone: (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  // Format UTC timestamp back to local time for display
  formatUTCTimestamp: (utcTimestamp: number): string => {
    const date = new Date(utcTimestamp * 1000);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  },

   validateFutureTime : (dateStr: string, timeStr: string): { 
    isValid: boolean; 
    error?: string; 
    utcTimestamp?: number;
  } => {
    try {
      const endDateTime = new Date(`${dateStr}T${timeStr}`);
      
      if (isNaN(endDateTime.getTime())) {
        return { isValid: false, error: "Invalid date/time format" };
      }
      
      const utcTimestamp = Math.floor(endDateTime.getTime() / 1000);
      const nowUTC = Math.floor(Date.now() / 1000);
      
      if (utcTimestamp <= nowUTC) {
        return { isValid: false, error: "End time must be in the future" };
      }
      

      
      return { isValid: true, utcTimestamp };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { isValid: false, error: `Time validation failed: ${errorMessage}` };
    }
  }
  
};




// utils/helpers.ts

export const TimeUtils = {
  // Get user's timezone for display
  getUserTimezone: (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  // Get relative time for creation date
  getRelativeTime: (createdAt: string | Date): string => {
    const date = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  }
};

/**
 * Parse market expiry date from database UTC ISO string
 * @param expiryDate - UTC ISO string like "2025-07-14T22:09:00.000Z"
 * @returns Date object
 */
export const parseMarketExpiryDate = (expiryDate: string | Date): Date => {
  if (typeof expiryDate === 'string') {
    // Handle UTC ISO string from database
    return new Date(expiryDate);
  }
  return new Date(expiryDate);
};

/**
 * Get time remaining until market ends
 * @param expiryDate - UTC ISO string or Date object
 * @returns Formatted time string like "2d 5h" or "Ended"
 */
export const getTimeLeft = (expiryDate: string | Date): string => {
  const endDate = parseMarketExpiryDate(expiryDate);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Get precise countdown for markets ending soon
 * @param expiryDate - UTC ISO string or Date object
 * @returns Formatted countdown like "45m 30s left"
 */
export const getPreciseCountdown = (expiryDate: string | Date): string => {
  const endDate = parseMarketExpiryDate(expiryDate);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${minutes}m ${seconds}s left`;
};

/**
 * Convert local date/time input to ISO string for database storage
 * @param dateStr - Date string like "2025-07-14"
 * @param timeStr - Time string like "14:55"
 * @returns ISO string for database storage
 */
export const toISO8601 = (dateStr: string, timeStr: string): string => {
  const localDateTime = new Date(`${dateStr}T${timeStr}`);
  return localDateTime.toISOString();
};

/**
 * Format market expiry date for display
 * @param expiryDate - UTC ISO string from database
 * @returns Object with different time format options
 */
export const formatMarketTime = (expiryDate: string | Date) => {
  const endDate = parseMarketExpiryDate(expiryDate);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  return {
    // User's local timezone
    local: endDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }),
    // UTC timezone for reference
    utc: endDate.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }),
    // Relative time (e.g., "2d 5h")
    relative: getTimeLeft(expiryDate),
    // Is ending soon (less than 24 hours)
    isEndingSoon: diff > 0 && diff < 86400000,
    // Has ended
    isEnded: diff <= 0,
    // Raw time difference in milliseconds
    timeDifference: diff
  };
};

/**
 * Check if market is active (not ended)
 * @param expiryDate - UTC ISO string from database
 * @returns boolean indicating if market is still active
 */
export const isMarketActive = (expiryDate: string | Date): boolean => {
  const endDate = parseMarketExpiryDate(expiryDate);
  const now = new Date();
  return endDate.getTime() > now.getTime();
};



/**
 * Debug function to log time parsing information
 * @param expiryDate - The expiry date to debug
 */
export const debugMarketTime = (expiryDate: string | Date): void => {
  const endDate = parseMarketExpiryDate(expiryDate);
  console.log('Market Time Debug:', {
    input: expiryDate,
    parsed: endDate.toISOString(),
    local: endDate.toLocaleString(),
    utc: endDate.toUTCString(),
    timestamp: endDate.getTime(),
    timeLeft: getTimeLeft(expiryDate),
    isActive: isMarketActive(expiryDate)
  });
};