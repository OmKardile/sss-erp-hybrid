"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  delay = 0,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
    >
      <Card className={cn("overflow-hidden", className)}>
        {(title || action) && (
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5">
            <div>
              {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            {action}
          </div>
        )}
        <div className={cn("p-5", contentClassName)}>{children}</div>
      </Card>
    </motion.div>
  );
}
