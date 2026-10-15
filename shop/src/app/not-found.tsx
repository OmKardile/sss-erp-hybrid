import Link from "next/link";
import { Button } from "@/components/ui-button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-emerald-600">404</h1>
      <p className="mt-4 text-lg font-semibold text-slate-900">
        Page not found
      </p>
      <p className="mt-1 text-sm text-slate-500">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="mt-6">
        <Button size="lg">Back to Home</Button>
      </Link>
    </div>
  );
}
