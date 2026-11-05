"use client";

import Link from "next/link";
import { Button } from "@/components/ui-button";
import { useI18n } from "@/components/locale-provider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-emerald-600">404</h1>
      <p className="mt-4 text-lg font-semibold text-slate-900">
        {t("notfound.title")}
      </p>
      <p className="mt-1 text-sm text-slate-500">{t("notfound.sub")}</p>
      <Link href="/" className="mt-6">
        <Button size="lg">{t("notfound.back")}</Button>
      </Link>
    </div>
  );
}
