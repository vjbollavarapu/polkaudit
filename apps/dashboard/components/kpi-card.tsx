import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  status?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = "default",
  className,
}: KpiCardProps) {
  const statusColors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    error: "text-destructive",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 transition-colors hover:bg-card/80",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <div className={cn("rounded-full bg-muted p-2", statusColors[status])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className={cn("text-2xl font-bold", statusColors[status])}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      </div>
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.value >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {trend && <span>{trend.label}</span>}
          {subtitle && !trend && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
