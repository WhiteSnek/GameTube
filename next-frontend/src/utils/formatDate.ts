export default function formatDate(dateString: string): string {
  if (!dateString || typeof dateString !== "string") return "Invalid date";
  const parsedDate = new Date(dateString.replace(" +0000 UTC", "Z"));
  const now = new Date();
  const seconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

  if (isNaN(seconds)) return "Invalid date";

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  if (seconds < 30) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}
