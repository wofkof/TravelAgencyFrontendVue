export function formatDateTime(
  dateTimeStr: string | null | undefined,
  options: { type?: "datetime" | "date" | "time" } = { type: "datetime" }
): string {
  if (!dateTimeStr) return "";

  const date = new Date(dateTimeStr);

  if (isNaN(date.getTime())) return "";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  switch (options.type) {
    case "date":
      return `${yyyy}-${mm}-${dd}`;
    case "time":
      return `${hh}:${mi}:${ss}`;
    case "datetime":
    default:
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }
}

export function formatRelativeTime(input: string | Date): string {
  const date = new Date(input);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return "剛剛";
  if (diffMin < 1) return `${diffSec} 秒前`;
  if (diffMin < 60) return `${diffMin} 分鐘前`;
  if (diffHour < 24) return `${diffHour} 小時前`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  if (isYesterday) return `昨天 ${hh}:${mm}`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return `${y}/${m}/${d} ${hh}:${mm}`;
}
