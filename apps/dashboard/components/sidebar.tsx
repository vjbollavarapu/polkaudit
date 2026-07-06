"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  Download,
  Settings,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { getApiBase, hasApiKey, fetchHealth } from "@/lib/api";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },

  { name: "Proposals", href: "/proposals", icon: FileText },
  { name: "Treasury", href: "/treasury", icon: Wallet },
  { name: "Exports", href: "/exports", icon: Download },
  { name: "Settings", href: "/settings", icon: Settings },
];

function IndexerStatus() {
  const [status, setStatus] = useState<"OK" | "DEGRADED" | "DOWN" | "UNKNOWN">("UNKNOWN");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await fetchHealth();
        setStatus("OK");
      } catch {
        setStatus("DOWN");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    OK: "bg-success",
    DEGRADED: "bg-warning",
    DOWN: "bg-destructive",
    UNKNOWN: "bg-muted-foreground",
  }[status];

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Activity className="h-3 w-3" />
      <span>Indexer</span>
      <span className={cn("h-2 w-2 rounded-full", statusColor)} />
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [apiKeySet, setApiKeySet] = useState(true); // Default to true to match server-side rendering (optimistic)
  const env = process.env.NODE_ENV === "production" ? "Prod" : "Dev";

  useEffect(() => {
    const refresh = () => setApiKeySet(hasApiKey());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('polkaudit-settings-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('polkaudit-settings-changed', refresh);
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/overview" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">PA</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">PolkAudit</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                env === "Prod"
                  ? "bg-success/20 text-success"
                  : "bg-warning/20 text-warning"
              )}
            >
              {env}
            </span>
            {!apiKeySet && (
              <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                No API Key
              </span>
            )}
          </div>
          <IndexerStatus />
          <p className="text-xs text-muted-foreground">
            {getApiBase()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
