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
