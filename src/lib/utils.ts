export function formatMatchTime(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    SCHEDULED: "Scheduled",
    TIMED: "Scheduled",
    IN_PLAY: "LIVE",
    PAUSED: "HT",
    FINISHED: "FT",
    SUSPENDED: "Suspended",
    POSTPONED: "Postponed",
    CANCELLED: "Cancelled",
    AWARDED: "Awarded",
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  if (status === "IN_PLAY" || status === "PAUSED") return "text-green-400";
  if (status === "FINISHED") return "text-gray-400";
  return "text-gray-500";
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T12:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
