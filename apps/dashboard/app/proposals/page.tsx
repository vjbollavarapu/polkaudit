"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { FilterBar } from "@/components/filter-bar";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { TableSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import {
  fetchProposals,
  type Proposal,
  type ProposalListResponse,
} from "@/lib/api";
import { formatDistanceToNow, format, parseISO } from "date-fns";

const statusOptions = [
  { value: "Open", label: "Open" },
  { value: "Passed", label: "Passed" },
  { value: "Rejected", label: "Rejected" },
  { value: "Executed", label: "Executed" },
  { value: "Cancelled", label: "Cancelled" },
];

const columns = [
  {
    key: "id",
    header: "ID",
    cell: (row: Proposal) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.id.slice(0, 8)}...
      </span>
    ),
  },
  {
    key: "title",
    header: "Title",
    cell: (row: Proposal) => (
      <span className="font-medium">{row.title}</span>
    ),
    className: "max-w-[300px] truncate",
  },
  {
    key: "status",
    header: "Status",
    cell: (row: Proposal) => <StatusBadge status={row.status} />,
  },
  {
    key: "votes",
    header: "Votes",
    cell: (row: Proposal) => (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-success">{row.votes_for.toLocaleString()}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-destructive">
          {row.votes_against.toLocaleString()}
        </span>
      </div>
    ),
  },
  {
    key: "turnout",
    header: "Turnout",
    cell: (row: Proposal) => (
      <span className="text-muted-foreground">
        {(row.turnout * 100).toFixed(1)}%
      </span>
    ),
  },
  {
    key: "created_at",
    header: "Created",
    cell: (row: Proposal) => (
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
      </span>
    ),
  },
];

export default function ProposalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ProposalListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state from URL
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const status = searchParams.get("status") || "";
  const q = searchParams.get("q") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const fromDate = from ? parseISO(from) : undefined;
  const toDate = to ? parseISO(to) : undefined;

  const hasActiveFilters = !!(status || from || to || q);

  const loadProposals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProposals({
        page,
        pageSize,
        status: status || undefined,
        q: q || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, q, from, to]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/proposals?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleStatusChange = (value: string) => {
    updateParams({
      status: value === "all" ? undefined : value,
      page: "1",
    });
  };

  const handleFromDateChange = (date: Date | undefined) => {
    updateParams({
      from: date ? format(date, "yyyy-MM-dd") : undefined,
      page: "1",
    });
  };

  const handleToDateChange = (date: Date | undefined) => {
    updateParams({
      to: date ? format(date, "yyyy-MM-dd") : undefined,
      page: "1",
    });
  };

  const handleClearFilters = () => {
    router.push("/proposals");
  };

  const handleRowClick = (row: Proposal) => {
    router.push(`/proposals/${row.id}`);
  };

  return (
    <div className="flex flex-col">
      <Topbar title="Proposals" showSearch />
      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <FilterBar
          statusOptions={statusOptions}
          statusValue={status}
          onStatusChange={handleStatusChange}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={handleFromDateChange}
          onToDateChange={handleToDateChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {loading && !data ? (
          <TableSkeleton rows={10} columns={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadProposals} />
        ) : data ? (
          <DataTable
            columns={columns}
            data={data.items}
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
            isLoading={loading}
            emptyMessage="No proposals found. Adjust your filters or check back later."
          />
        ) : null}
      </div>
    </div>
  );
}
