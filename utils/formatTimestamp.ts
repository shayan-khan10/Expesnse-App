const TIMEZONE = "Etc/GMT-5"; // change this to your preferred timezone

export function formatDate(isoString: string): string {
  if (!isoString) return "";

  const dateObj = new Date(isoString);

  return dateObj.toLocaleDateString("en-US", {
    timeZone: TIMEZONE,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTime(isoString: string): string {
  if (!isoString) return "";

  const dateObj = new Date(isoString);

  return dateObj.toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
