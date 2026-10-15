import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — returns notification stubs (not persisted; computed from current data).
// Types: low-stock, out-of-stock, overdue-udhar, expiring, expired, target-behind.
// Each includes a `dismissable` flag (always true for stubs) and an action link.
export async function GET() {
  const now = new Date();

  const [products, udhars, expiry, targets, sales] = await Promise.all([
    db.product.findMany(),
    db.udhar.findMany({ include: { payments: true } }),
    db.product.findMany({ where: { expiryDate: { not: null } } }),
    db.target.findMany(),
    db.sale.findMany(),
  ]);

  type Notification = {
    id: string;
    type: "low-stock" | "out-of-stock" | "overdue-udhar" | "expiring" | "expired" | "target-behind";
    title: string;
    message: string;
    severity: "critical" | "warning" | "info";
    module: string;
    count?: number;
    amount?: number;
  };

  const notifications: Notification[] = [];

  // Out-of-stock
  const outOfStock = products.filter((p) => p.quantity <= 0);
  if (outOfStock.length > 0) {
    notifications.push({
      id: "oos",
      type: "out-of-stock",
      title: `${outOfStock.length} product${outOfStock.length > 1 ? "s" : ""} out of stock`,
      message: outOfStock.slice(0, 3).map((p) => p.name).join(", ") + (outOfStock.length > 3 ? ` +${outOfStock.length - 3} more` : ""),
      severity: "critical",
      module: "products",
      count: outOfStock.length,
    });
  }

  // Low-stock (excluding out-of-stock)
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStockAlert);
  if (lowStock.length > 0) {
    notifications.push({
      id: "low-stock",
      type: "low-stock",
      title: `${lowStock.length} product${lowStock.length > 1 ? "s" : ""} running low`,
      message: lowStock.slice(0, 3).map((p) => `${p.name} (${p.quantity} left)`).join(", ") + (lowStock.length > 3 ? ` +${lowStock.length - 3} more` : ""),
      severity: "warning",
      module: "products",
      count: lowStock.length,
    });
  }

  // Overdue udhar
  let overdueCount = 0;
  let overdueAmount = 0;
  udhars.forEach((u) => {
    if (u.status === "PAID") return;
    if (u.dueDate && new Date(u.dueDate) < now) {
      const paid = u.payments.reduce((s, p) => s + p.amount, 0);
      const remaining = Math.max(0, u.amount - paid);
      overdueCount += 1;
      overdueAmount += remaining;
    }
  });
  if (overdueCount > 0) {
    notifications.push({
      id: "overdue-udhar",
      type: "overdue-udhar",
      title: `${overdueCount} overdue udhar entr${overdueCount > 1 ? "ies" : "y"}`,
      message: `Total outstanding: ₹${overdueAmount.toLocaleString("en-IN")}`,
      severity: "critical",
      module: "udhar",
      count: overdueCount,
      amount: overdueAmount,
    });
  }

  // Expiring soon / expired
  let expiringCount = 0;
  let expiredCount = 0;
  expiry.forEach((p) => {
    if (!p.expiryDate) return;
    const daysLeft = Math.ceil((new Date(p.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) expiredCount += 1;
    else if (daysLeft <= 7) expiringCount += 1;
  });
  if (expiredCount > 0) {
    notifications.push({
      id: "expired",
      type: "expired",
      title: `${expiredCount} expired product${expiredCount > 1 ? "s" : ""}`,
      message: "Remove expired stock to avoid selling spoiled goods.",
      severity: "critical",
      module: "products",
      count: expiredCount,
    });
  }
  if (expiringCount > 0) {
    notifications.push({
      id: "expiring",
      type: "expiring",
      title: `${expiringCount} product${expiringCount > 1 ? "s" : ""} expiring soon`,
      message: "Sell or discount before expiry to minimize waste.",
      severity: "warning",
      module: "products",
      count: expiringCount,
    });
  }

  // Target behind pace
  const currentMonth = now.toISOString().substring(0, 7);
  const currentTarget = targets.find((t) => t.month === currentMonth);
  if (currentTarget) {
    const monthSales = sales.filter((s) => s.date.toISOString().startsWith(currentMonth));
    const actual = monthSales.reduce((s, sale) => s + sale.total, 0);
    const pct = currentTarget.amount > 0 ? (actual / currentTarget.amount) * 100 : 0;
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const expectedPace = (dayOfMonth / daysInMonth) * 100;
    if (pct < expectedPace - 10) {
      notifications.push({
        id: "target-behind",
        type: "target-behind",
        title: "Sales target behind pace",
        message: `${pct.toFixed(0)}% achieved vs ${expectedPace.toFixed(0)}% expected. ₹${Math.max(0, currentTarget.amount - actual).toLocaleString("en-IN")} remaining.`,
        severity: "warning",
        module: "dashboard",
      });
    }
  }

  // Sort by severity
  const order = { critical: 0, warning: 1, info: 2 };
  notifications.sort((a, b) => order[a.severity] - order[b.severity]);

  return NextResponse.json({
    notifications,
    count: notifications.length,
    criticalCount: notifications.filter((n) => n.severity === "critical").length,
    warningCount: notifications.filter((n) => n.severity === "warning").length,
  });
}

// POST — stub for "sending" notifications (logs to console, returns success).
// In a real app, this would integrate with email/SMS/push providers.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, recipients, message } = body;
    // Stub: log the notification "send"
    console.log(`[NOTIFICATION STUB] type=${type} recipients=${recipients} message=${message}`);
    return NextResponse.json({
      success: true,
      message: "Notification queued (stub). Configure email/SMS provider in production.",
      sentAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 400 }
    );
  }
}
