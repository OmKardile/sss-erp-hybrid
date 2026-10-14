"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Settings,
  Database,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  FileJson,
  Sparkles,
  Info,
  HardDrive,
  RefreshCw,
  Store,
  Percent,
  Receipt,
  Save,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function SettingsView() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<any>(null);

  const { data: reports } = useQuery({ queryKey: ["reports"], queryFn: () => api.reports() });

  const exportMut = useMutation({
    mutationFn: () => api.backup.export(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sss-erp-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded", { description: `${a.download}` });
    },
    onError: (e) => toast.error("Export failed", { description: String(e) }),
  });

  const restoreMut = useMutation({
    mutationFn: (data: any) => api.backup.restore(data),
    onSuccess: () => {
      toast.success("Backup restored", { description: "All data replaced from backup." });
      qc.invalidateQueries();
      setRestoreOpen(false);
      setPendingRestore(null);
    },
    onError: (e) => toast.error("Restore failed", { description: String(e) }),
  });

  const clearMut = useMutation({
    mutationFn: () => api.backup.clear(),
    onSuccess: () => {
      toast.success("All data cleared", { description: "The database is now empty." });
      qc.invalidateQueries();
      setClearOpen(false);
    },
    onError: (e) => toast.error("Clear failed", { description: String(e) }),
  });

  const seedMut = useMutation({
    mutationFn: () => api.seed(),
    onSuccess: (data) => {
      if (data.seeded) {
        toast.success("Demo data loaded", { description: "Explore the ERP with sample records." });
        qc.invalidateQueries();
      } else {
        toast.info("Database already has data", { description: data.message });
      }
    },
    onError: (e) => toast.error("Seed failed", { description: String(e) }),
  });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result));
        setPendingRestore(data);
        setRestoreOpen(true);
      } catch {
        toast.error("Invalid backup file", { description: "Could not parse JSON." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const counts = reports?.summary;
  const recordCount =
    (counts ? counts.productCount : 0) +
    (reports?.income?.length || 0) +
    (reports?.expenses?.length || 0) +
    (reports?.purchases?.length || 0) +
    (reports?.udhars?.length || 0) +
    (counts ? counts.customerCount : 0) +
    (counts ? counts.supplierCount : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Backup"
        description="Manage your data: backup, restore, seed demo data and clear."
        icon={Settings}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="Total Records" value={`${recordCount}`} icon={Database} tone="emerald" subtitle="Across all modules" />
        <StatCard index={1} title="Products" value={`${counts?.productCount ?? 0}`} icon={HardDrive} tone="teal" />
        <StatCard index={2} title="Customers" value={`${counts?.customerCount ?? 0}`} icon={ShieldCheck} tone="violet" />
        <StatCard index={3} title="Suppliers" value={`${counts?.supplierCount ?? 0}`} icon={HardDrive} tone="amber" />
      </div>

      {/* Backup */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Backup & Restore"
          description="Export your full database to JSON, or restore from a backup file."
        >
          <div className="space-y-3">
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Export Backup</p>
                    <p className="text-xs text-muted-foreground">Download all data as a JSON file.</p>
                  </div>
                </div>
                <Button onClick={() => exportMut.mutate()} disabled={exportMut.isPending} className="gap-2">
                  <FileJson className="h-4 w-4" /> Export
                </Button>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Restore from File</p>
                    <p className="text-xs text-muted-foreground">Replace all data with a backup.</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
                  <Upload className="h-4 w-4" /> Choose File
                </Button>
                <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
              </CardContent>
            </Card>
          </div>
        </SectionCard>

        <StoreConfigSection />

        <SectionCard title="Data Operations" description="Seed demo data or wipe the database.">
          <div className="space-y-3">
            <Card className="border-violet-500/20 bg-violet-500/5">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Load Demo Data</p>
                    <p className="text-xs text-muted-foreground">Populate sample products, sales & ledgers.</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => seedMut.mutate()} disabled={seedMut.isPending} className="gap-2 border-violet-500/30 text-violet-700 hover:bg-violet-500/10 dark:text-violet-400">
                  <RefreshCw className={`h-4 w-4 ${seedMut.isPending ? "animate-spin" : ""}`} /> Seed
                </Button>
              </CardContent>
            </Card>

            <Card className="border-rose-500/20 bg-rose-500/5">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Clear All Data</p>
                    <p className="text-xs text-muted-foreground">Permanently wipe every record.</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setClearOpen(true)} className="gap-2 border-rose-500/30 text-rose-600 hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4" /> Clear
                </Button>
              </CardContent>
            </Card>
          </div>
        </SectionCard>
      </div>

      {/* About */}
      <SectionCard title="About" description="System information">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={Info} label="Application" value="Shubham Super Shopee ERP" />
          <InfoRow icon={Sparkles} label="Version" value="2.1 · POS + Backup" />
          <InfoRow icon={Database} label="Database" value="SQLite (Prisma)" />
          <InfoRow icon={HardDrive} label="Total records" value={`${recordCount}`} />
          <InfoRow icon={ShieldCheck} label="Backup format" value="JSON v2" />
          <InfoRow icon={Settings} label="Framework" value="Next.js 16 · TypeScript" />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-xs">
            <span className="font-semibold">Tip:</span> Export a backup regularly. Restoring overwrites all current data. Demo seed only works when the database is empty.
          </p>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear all data?"
        description="This permanently deletes every product, purchase, income, expense, udhar, customer and supplier record. This action cannot be undone. Consider exporting a backup first."
        confirmText="Yes, clear everything"
        onConfirm={() => clearMut.mutate()}
      />

      <ConfirmDialog
        open={restoreOpen}
        onOpenChange={(o) => {
          setRestoreOpen(o);
          if (!o) setPendingRestore(null);
        }}
        title="Restore from backup?"
        description="This will replace ALL current data with the contents of the backup file. Consider exporting your current data first."
        confirmText="Restore"
        onConfirm={() => pendingRestore && restoreMut.mutate(pendingRestore)}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StoreConfigSection() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.settings.get(),
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  // Initialize form when settings load
  if (settings && !loaded) {
    setForm(settings);
    setLoaded(true);
  }

  const saveMut = useMutation({
    mutationFn: (entries: { key: string; value: string }[]) => api.settings.save(entries),
    onSuccess: () => {
      toast.success("Settings saved", { description: "Store configuration updated." });
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) => toast.error("Save failed", { description: String(e) }),
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    const entries = Object.entries(form).map(([key, value]) => ({ key, value: String(value) }));
    saveMut.mutate(entries);
  };

  if (isLoading || !loaded) {
    return (
      <SectionCard title="Store Configuration" description="Tax, GST & receipt settings">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </SectionCard>
    );
  }

  const taxEnabled = form.taxEnabled === "true";

  return (
    <SectionCard
      title="Store Configuration"
      description="Tax rate, GST details & receipt customization"
      action={
        <Button onClick={save} disabled={saveMut.isPending} className="gap-2" size="sm">
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Store info */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Store className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-foreground">Store Information</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Store Name</Label>
              <Input value={form.storeName || ""} onChange={(e) => update("storeName", e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input value={form.storePhone || ""} onChange={(e) => update("storePhone", e.target.value)} className="h-9" placeholder="9876543210" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input value={form.storeAddress || ""} onChange={(e) => update("storeAddress", e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">GST Number</Label>
              <Input value={form.gstNumber || ""} onChange={(e) => update("gstNumber", e.target.value)} className="h-9" placeholder="27AAAAA0000A1Z5" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Currency Symbol</Label>
              <Input value={form.currencySymbol || "₹"} onChange={(e) => update("currencySymbol", e.target.value)} className="h-9" />
            </div>
          </div>
        </div>

        {/* Tax config */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-violet-600" />
              <p className="text-sm font-semibold text-foreground">Tax / GST</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">{taxEnabled ? "Enabled" : "Disabled"}</Label>
              <Switch checked={taxEnabled} onCheckedChange={(c) => update("taxEnabled", c ? "true" : "false")} />
            </div>
          </div>
          <div className={taxEnabled ? "" : "opacity-50 pointer-events-none"}>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.taxRate || "0"}
                onChange={(e) => update("taxRate", e.target.value)}
                className="h-9"
                placeholder="e.g. 18 for 18% GST"
              />
            </div>
            {taxEnabled && Number(form.taxRate) > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-violet-500/10 p-2.5 text-xs text-violet-700 dark:text-violet-400">
                <Receipt className="h-3.5 w-3.5" />
                Tax ({form.taxRate}%) will be auto-applied to all POS sales and shown on receipts.
              </div>
            )}
          </div>
        </div>

        {/* Receipt */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-foreground">Receipt</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Receipt Footer Message</Label>
            <Textarea
              rows={2}
              value={form.receiptFooter || ""}
              onChange={(e) => update("receiptFooter", e.target.value)}
              placeholder="Thank you for shopping with us!"
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
