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

  // Calculate time remaining with better precision
  getTimeUntilClosing: (utcClosingDate: string | Date) => {
    const now = new Date();
    const closing = new Date(utcClosingDate);
    const diffTime = closing.getTime() - now.getTime();

    if (diffTime <= 0) return "Closed";

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h left`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m left`;
    } else {
      return `${diffMinutes}m left`;
    }
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