// Formatting helpers for the ERP

export function formatCurrency(value: number, opts?: { compact?: boolean }): string {
  const num = Number.isFinite(value) ? value : 0;
  if (opts?.compact && Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)}L`;
  }
  if (opts?.compact && Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number): string {
  const num = Number.isFinite(value) ? value : 0;
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatDate(date: string | Date, opts?: { withTime?: boolean }): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  const day = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (opts?.withTime) {
    const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return `${day} · ${time}`;
  }
  return day;
}

export function formatRelative(date: string | Date): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function toDateInput(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function monthKey(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().substring(0, 7);
}

export function monthLabel(key: string): string {
  // key like "2025-03"
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}
