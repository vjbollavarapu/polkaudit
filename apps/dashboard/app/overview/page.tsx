"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { KpiCard } from "@/components/kpi-card";
import { CardSkeleton, ActivitySkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  fetchOverviewStats,
  fetchActivity,
  hasApiKey,
  type OverviewStats,
  type ActivityItem,
} from "@/lib/api";
import {
  FileText,
  Vote,
  Wallet,
  Box,
  Activity,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

function ApiKeyWarning() {
  if (hasApiKey()) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4">
      <AlertTriangle className="h-5 w-5 text-warning" />
      <div>
        <p className="text-sm font-medium text-warning">API key not set</p>
        <p className="text-xs text-muted-foreground">
          Configure your API key in{" "}
          <Link href="/settings" className="underline hover:text-foreground">
            Settings
          </Link>{" "}
          to enable data fetching.
        </p>
      </div>
    </div>
  );
}

function StatsSection() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOverviewStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadStats} />;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Proposals"
          value={stats.total_proposals}
          icon={FileText}
          status="default"
        />
        <KpiCard
          title="Total Votes"
          value={stats.total_votes}
          icon={Vote}
          status="default"
        />
        <KpiCard
          title="Treasury Spends"
          value={stats.treasury_spends}
          icon={Wallet}
          status="default"
        />
        <KpiCard
          title="Last Indexed Block"
          value={stats.last_indexed_block}
          icon={Box}
          status={stats.indexer_status === "OK" ? "success" : stats.indexer_status === "DEGRADED" ? "warning" : "error"}
          subtitle={`Indexer: ${stats.indexer_status}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Indexer Health
          </h3>
          <div className="flex items-center gap-4">
            <StatusBadge status={stats.indexer_status} />
            <span className="text-sm text-muted-foreground">
              Last updated:{" "}
              {formatDistanceToNow(new Date(stats.updated_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Risk Indicators
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm">System Normal</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm">No Anomalies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActivity(10);
      setActivity(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Recent Activity
        </h3>
        <ActivitySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Recent Activity
        </h3>
        <ErrorState message={error} onRetry={loadActivity} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Recent Activity
      </h3>
      {activity.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No recent activity"
          description="Activity will appear here as governance events occur."
        />
      ) : (
        <div className="space-y-3">
          {activity.map((item, index) => (
            <Link
              key={`${item.ref_id}-${index}`}
              href={
                item.type === "proposal"
                  ? `/proposals/${item.ref_id}`
                  : `/treasury`
              }
              className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{item.type}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(item.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div className="flex flex-col">
      <Topbar title="Overview" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <ApiKeyWarning />
        <StatsSection />
        <ActivityFeed />
      </div>
    </div>
  );
}
