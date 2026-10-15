import { Star } from "lucide-react";
import { cn, getStars } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  count?: number;
}

export function StarRating({
  rating,
  size = 16,
  className,
  showValue = false,
  count,
}: StarRatingProps) {
  const stars = getStars(rating);
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center">
        {stars.map((s, i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={
              s.filled
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-slate-600">
          {rating.toFixed(1)}
          {typeof count === "number" && (
            <span className="text-slate-400"> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
