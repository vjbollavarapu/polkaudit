import React from "react"
import { cn } from "@/lib/utils";
import { FileText, Inbox, Search } from "lucide-react";

interface EmptyStateProps {
  icon?: "inbox" | "search" | "document";
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const icons = {
  inbox: Inbox,
  search: Search,
  document: FileText,
};

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
