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