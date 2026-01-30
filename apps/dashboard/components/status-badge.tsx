import { cn } from "@/lib/utils";

type StatusType = 
  | "Open" | "Passed" | "Rejected" | "Executed" | "Cancelled"
  | "Proposed" | "Approved" | "Paid"
  | "OK" | "DEGRADED" | "DOWN";

const statusStyles: Record<StatusType, string> = {
  // Proposal statuses
  Open: "bg-primary/20 text-primary",
  Passed: "bg-success/20 text-success",
  Rejected: "bg-destructive/20 text-destructive",
  Executed: "bg-success/20 text-success",
  Cancelled: "bg-muted text-muted-foreground",
  // Treasury statuses
  Proposed: "bg-primary/20 text-primary",
  Approved: "bg-success/20 text-success",
  Paid: "bg-success/20 text-success",
  // Indexer statuses
  OK: "bg-success/20 text-success",
  DEGRADED: "bg-warning/20 text-warning",
  DOWN: "bg-destructive/20 text-destructive",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status as StatusType] || "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
