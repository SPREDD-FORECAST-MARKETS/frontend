export function toISO8601(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null;
  // Combine to "YYYY-MM-DDTHH:mm:00Z"
  const isoString = new Date(`${dateStr}T${timeStr}:00Z`).toISOString();
  return isNaN(new Date(isoString).getTime()) ? null : isoString;
}

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

// ✅ NEW: Format date as "6th July" with ordinal suffix
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



// ✅ NEW: Combined format: "6th July, 4hrs left"
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

// Enhanced timezone utilities
export const TimeUtils = {
  // Convert UTC date to user's local time
  toLocalTime: (utcDate: string | Date) => {
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
    return date; // Date object automatically converts to local time when displayed
  },

  // Format date in user's timezone
  formatLocalDate: (utcDate: string | Date, options = {}) => {
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      ...options,
    });
  },

  // Get user's timezone
  getUserTimezone: () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  // ✅ UPDATED: Use the new getTimeLeft function for consistency
  getTimeUntilClosing: (utcClosingDate: string | Date) => {
    const dateString = typeof utcClosingDate === "string" ? utcClosingDate : utcClosingDate.toISOString();
    return getTimeLeft(dateString);
  },

  // Check if market is closed
  isMarketClosed: (utcExpiryDate: string | Date) => {
    return new Date(utcExpiryDate).getTime() <= new Date().getTime();
  },

  // Get relative time (e.g., "2 hours ago", "in 3 days")
  getRelativeTime: (utcDate: string | Date) => {
    const date = new Date(utcDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60));
    const diffMinutes = Math.floor(Math.abs(diffTime) / (1000 * 60));

    if (diffTime > 0) {
      // Future date
      if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
      if (diffHours > 0)
        return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
      if (diffMinutes > 0)
        return `in ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
      return "in a moment";
    } else {
      // Past date
      if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      if (diffHours > 0)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffMinutes > 0)
        return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      return "just now";
    }
  },
};




// Helper function to correctly parse expiry date without timezone issues
export const parseMarketExpiryDate = (expiryDate: any): Date => {
  if (typeof expiryDate === "string") {
    // Remove timezone indicators to force local time interpretation
    const cleanDateString = expiryDate.replace(/\.000Z$/, "").replace(/Z$/, "");
    return new Date(cleanDateString);
  }

  if (typeof expiryDate === "number") {
    // If it's a timestamp, convert it
    const timestamp =
      expiryDate > 1000000000000 ? expiryDate : expiryDate * 1000;
    return new Date(timestamp);
  }

  if (expiryDate instanceof Date) {
    return expiryDate;
  }

  // Fallback
  return new Date(expiryDate);
};

// Helper function to get time left in a readable format
export const getTimeLeft = (expiryDate: any): string => {
  const marketExpiry = parseMarketExpiryDate(expiryDate);
  const now = new Date();
  const timeDiff = marketExpiry.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return "Market closed";
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else if (minutes > 0) {
    return `${minutes}m left`;
  } else {
    return `${seconds}s left`;
  }
};