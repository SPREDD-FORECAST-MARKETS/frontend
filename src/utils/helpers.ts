export function toISO8601(dateStr: string, timeStr: string): string | null {
    if (!dateStr || !timeStr) return null;

    // Combine to "YYYY-MM-DDTHH:mm:00Z"
    const isoString = new Date(`${dateStr}T${timeStr}:00Z`).toISOString();

    return isNaN(new Date(isoString).getTime()) ? null : isoString;
}
