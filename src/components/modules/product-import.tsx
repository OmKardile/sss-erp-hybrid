"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

const SAMPLE_CSV = `name,brand,category,sku,purchasePrice,sellingPrice,quantity,unitType,minStockAlert
Tata Salt 1kg,Tata,Groceries,SKU-001,24,30,20,pcs,8
Amul Butter 100g,Amul,Dairy,SKU-002,55,68,15,pcs,5
Lays Classic,Lays,Snacks,SKU-003,18,25,30,pcs,10`;

export function ProductImport({ open, onClose }: ImportDialogProps) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [result, setResult] = useState<any | null>(null);

  const importMut = useMutation({
    mutationFn: (csv: string) => api.products.importCsv(csv),
    onSuccess: (data) => {
      setResult(data);
      if (data.created > 0) {
        toast.success(`Imported ${data.created} product(s)`, {
          description: data.errors.length > 0 ? `${data.errors.length} row(s) skipped` : undefined,
        });
        qc.invalidateQueries({ queryKey: ["products"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        qc.invalidateQueries({ queryKey: ["restock"] });
      } else {
        toast.error("No products imported", { description: "Check the errors below" });
      }
    },
    onError: (e) => toast.error("Import failed", { description: String(e) }),
  });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(String(ev.target?.result || ""));
      setResult(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const close = () => {
    setCsvText("");
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
        <DialogHeader className="border-b border-border/70 bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">Bulk Import Products</DialogTitle>
                <DialogDescription className="text-xs text-emerald-50">
                  Upload a CSV file or paste CSV data to import multiple products at once.
                </DialogDescription>
              </div>
            </div>
            <button onClick={close} className="rounded-lg bg-white/10 p-1.5 transition hover:bg-white/20" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto p-5">
          {/* Template & file upload */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" /> Choose CSV File
            </Button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
            <Button variant="ghost" size="sm" onClick={downloadTemplate} className="gap-2 text-muted-foreground">
              <Download className="h-4 w-4" /> Download Template
            </Button>
          </div>

          {/* Required columns info */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Info className="h-3.5 w-3.5" /> CSV Format
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              First row must be headers. Required: <code className="rounded bg-muted px-1">name</code>. Optional:{" "}
              <code className="rounded bg-muted px-1">brand, category, sku, purchasePrice, sellingPrice, quantity, unitType, minStockAlert, expiryDate</code>.
            </p>
          </div>

          {/* CSV textarea */}
          <div className="space-y-1.5">
            <Label>CSV Data {csvText && <span className="text-xs text-muted-foreground">({csvText.split("\n").filter(l => l.trim()).length - 1} rows)</span>}</Label>
            <Textarea
              rows={8}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setResult(null);
              }}
              placeholder={SAMPLE_CSV}
              className="scroll-thin font-mono text-xs"
            />
          </div>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  {result.created > 0 ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {result.created} of {result.total} product(s) imported successfully
                    </p>
                    {result.errors.length > 0 && (
                      <p className="text-xs text-muted-foreground">{result.errors.length} row(s) had errors</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {result.created > 0 && <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">✓ {result.created}</Badge>}
                    {result.errors.length > 0 && <Badge variant="destructive">{result.errors.length} errors</Badge>}
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="scroll-thin max-h-32 overflow-y-auto rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600">Errors</p>
                    {result.errors.slice(0, 10).map((e: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        Row {e.row}: <span className="text-rose-600">{e.error}</span>
                      </p>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="mt-1 text-xs text-muted-foreground">+{result.errors.length - 10} more…</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-3">
          <Button variant="outline" onClick={close}>Close</Button>
          <Button
            onClick={() => importMut.mutate(csvText)}
            disabled={importMut.isPending || !csvText.trim()}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {importMut.isPending ? "Importing…" : "Import Products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
