"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  Send,
  Mail,
  CheckCircle2,
  PackageX,
  BookOpenCheck,
  CalendarClock,
  Target,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useNav } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPE_META: Record<string, { icon: any; tone: string; bg: string }> = {
  "out-of-stock": { icon: PackageX, tone: "text-rose-600", bg: "bg-rose-500/10" },
  "low-stock": { icon: AlertTriangle, tone: "text-amber-600", bg: "bg-amber-500/10" },
  "overdue-udhar": { icon: BookOpenCheck, tone: "text-rose-600", bg: "bg-rose-500/10" },
  expiring: { icon: CalendarClock, tone: "text-amber-600", bg: "bg-amber-500/10" },
  expired: { icon: AlertCircle, tone: "text-rose-600", bg: "bg-rose-500/10" },
  "target-behind": { icon: Target, tone: "text-violet-600", bg: "bg-violet-500/10" },
};

export function NotificationsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.notifications.list(),
    refetchInterval: 60_000,
  });
  const setNav = useNav((s) => s.set);
  const [sending, setSending] = useState<string | null>(null);

  const sendMut = useMutation({
    mutationFn: (data: { type: string; recipients: string; message: string }) =>
      api.notifications.send(data),
    onSuccess: () => {
      toast.success("Notification sent (stub)", {
        description: "Configure email/SMS provider in production.",
      });
      setSending(null);
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const notifications = data?.notifications || [];

  const handleSend = (n: any) => {
    setSending(n.id);
    sendMut.mutate({
      type: n.type,
      recipients: "store-owner@example.com",
      message: `${n.title}: ${n.message}`,
    });
  };

  const goTo = (module: string) => setNav(module as any);

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardContent className="p-5">
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="card-hover relative overflow-hidden border-emerald-500/20">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
        <CardContent className="relative p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</p>
              <p className="text-[11px] text-muted-foreground">All caught up</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 py-5 text-center">
            <CheckCircle2 className="ml-3 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">No alerts right now</p>
              <p className="text-xs text-muted-foreground">Stock healthy, no overdue udhar, no expiring items, on target.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover relative overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/10 blur-2xl" />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <Bell className="h-4.5 w-4.5" />
              {data?.criticalCount && data.criticalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {data.criticalCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</p>
              <p className="text-[11px] text-muted-foreground">
                {data?.criticalCount || 0} critical · {data?.warningCount || 0} warning{data?.warningCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {notifications.map((n: any, i: number) => {
              const meta = TYPE_META[n.type] || TYPE_META["low-stock"];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition",
                    n.severity === "critical" ? "border-rose-500/30 bg-rose-500/5" : "border-amber-500/30 bg-amber-500/5"
                  )}
                >
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.bg, meta.tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => goTo(n.module)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View details <ChevronRight className="h-3 w-3" />
                      </button>
                      <span className="text-muted-foreground/40">·</span>
                      <button
                        onClick={() => handleSend(n)}
                        disabled={sending === n.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        {sending === n.id ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3" /> Email alert
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {n.count != null && (
                    <Badge variant="secondary" className="shrink-0">{n.count}</Badge>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
          <Mail className="h-3 w-3 shrink-0" />
          <p>Email alerts are stubs — configure an email/SMS provider in production to send real notifications.</p>
        </div>
      </CardContent>
    </Card>
  );
}
