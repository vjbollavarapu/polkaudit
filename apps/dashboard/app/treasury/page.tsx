"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { FilterBar } from "@/components/filter-bar";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { TableSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import {
  fetchTreasurySpends,
  type TreasurySpend,
  type TreasurySpendListResponse,
} from "@/lib/api";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { ExternalLink } from "lucide-react";

const statusOptions = [
  { value: "Proposed", label: "Proposed" },
  { value: "Approved", label: "Approved" },
  { value: "Paid", label: "Paid" },
  { value: "Rejected", label: "Rejected" },
];

const columns = [
  {
    key: "id",
    header: "ID",
    cell: (row: TreasurySpend) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.id.slice(0, 8)}...
      </span>
    ),
  },
  {
    key: "beneficiary",
    header: "Beneficiary",
    cell: (row: TreasurySpend) => (
      <span className="font-mono text-xs">
        {row.beneficiary.slice(0, 8)}...{row.beneficiary.slice(-6)}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    cell: (row: TreasurySpend) => (
      <span className="font-medium">
        {row.amount.toLocaleString()} {row.asset}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (row: TreasurySpend) => <StatusBadge status={row.status} />,
  },
  {
    key: "approved_at",
    header: "Approved",
    cell: (row: TreasurySpend) => (
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(row.approved_at), { addSuffix: true })}
      </span>
    ),
  },
  {
    key: "proposal",
    header: "Proposal",
    cell: (row: TreasurySpend) =>
      row.proposal_id ? (
        <Link
          href={`/proposals/${row.proposal_id}`}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View
          <ExternalLink className="h-3 w-3" />
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      ),
  },
];

export default function TreasuryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<TreasurySpendListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state from URL
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const status = searchParams.get("status") || "";
  const q = searchParams.get("q") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const min = searchParams.get("min") || "";
  const max = searchParams.get("max") || "";

  const fromDate = from ? parseISO(from) : undefined;
  const toDate = to ? parseISO(to) : undefined;

  const hasActiveFilters = !!(status || from || to || q || min || max);

  const loadTreasury = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTreasurySpends({
        page,
        pageSize,
        status: status || undefined,
        q: q || undefined,
        from: from || undefined,
        to: to || undefined,
        min: min ? Number(min) : undefined,
        max: max ? Number(max) : undefined,
      });
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load treasury spends"
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, q, from, to, min, max]);

  useEffect(() => {
    loadTreasury();
  }, [loadTreasury]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/treasury?${params.toString()}`);
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

  const handleMinAmountChange = (value: string) => {
    updateParams({ min: value || undefined, page: "1" });
  };

  const handleMaxAmountChange = (value: string) => {
    updateParams({ max: value || undefined, page: "1" });
  };

  const handleClearFilters = () => {
    router.push("/treasury");
  };

  return (
    <div className="flex flex-col">
      <Topbar title="Treasury" showSearch />
      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <FilterBar
          statusOptions={statusOptions}
          statusValue={status}
          onStatusChange={handleStatusChange}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={handleFromDateChange}
          onToDateChange={handleToDateChange}
          showAmountFilter
          minAmount={min}
          maxAmount={max}
          onMinAmountChange={handleMinAmountChange}
          onMaxAmountChange={handleMaxAmountChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {loading && !data ? (
          <TableSkeleton rows={10} columns={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadTreasury} />
        ) : data ? (
          <DataTable
            columns={columns}
            data={data.items}
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={handlePageChange}
            isLoading={loading}
            emptyMessage="No treasury spends found. Adjust your filters or check back later."
          />
        ) : null}
      </div>
    </div>
  );
}
