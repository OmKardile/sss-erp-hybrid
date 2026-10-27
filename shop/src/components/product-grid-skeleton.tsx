import { cn } from "@/lib/utils";

/**
 * ProductGridSkeleton — layout-matched shimmer placeholder for the
 * product grid. Same columns, same card proportions as the real grid,
 * so there is zero layout shift when products swap in.
 * (animate-pulse + motion-reduce:animate-none — no custom keyframes.)
 */
export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4",
        className,
      )}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
        >
          <div className="aspect-square w-full animate-pulse bg-stone-100 motion-reduce:animate-none" />
          <div className="flex flex-col gap-1.5 p-2.5 sm:p-3">
            <div className="h-2 w-1/3 animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />
            <div className="h-2 w-1/4 animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="h-4 w-12 animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />
              <div className="h-10 w-[72px] animate-pulse rounded-xl bg-stone-100 motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
