"use client";

import React from "react"

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import {
  downloadExportCsv,
  downloadExportJson,
} from "@/lib/api";
import { toast } from "sonner";
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

interface ExportCardProps {
  title: string;
  description: string;
  format: string;
  fields: string[];
  icon: React.ReactNode;
  onExport: () => Promise<void>;
  disabled?: boolean;
  comingSoon?: boolean;
}

function ExportCard({
  title,
  description,
  format,
  fields,
  icon,
  onExport,
  disabled = false,
  comingSoon = false,
}: ExportCardProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (comingSoon || disabled) return;

    setLoading(true);
    try {
      await onExport();
      toast.success(`${title} exported successfully`);
    } catch (error) {
      toast.error(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {comingSoon && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Coming soon
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 flex items-center gap-2">
        <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
          {format}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <p className="text-xs font-medium text-muted-foreground">
          Included fields:
        </p>
        <ul className="mt-2 space-y-1">
          {fields.map((field) => (
            <li key={field} className="text-xs text-muted-foreground">
              • {field}
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={handleExport}
        disabled={loading || disabled || comingSoon}
        className="mt-6 gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {comingSoon ? "Coming Soon" : "Export"}
      </Button>
    </div>
  );
}

const exports = [
  {
    title: "Proposals Export",
    description: "Export all governance proposals with full details including votes and status.",
    format: "CSV",
    fields: ["ID", "Title", "Status", "Votes For", "Votes Against", "Turnout", "Created Date"],
    icon: <FileSpreadsheet className="h-5 w-5" />,
    onExport: () => downloadExportCsv("proposals"),
  },
  {
    title: "Treasury Spends Export",
    description: "Export treasury spend records with beneficiary and amount information.",
    format: "CSV",
    fields: ["ID", "Beneficiary", "Amount", "Asset", "Status", "Approved Date", "Proposal ID"],
    icon: <FileSpreadsheet className="h-5 w-5" />,
    onExport: () => downloadExportCsv("spends"),
  },
  {
    title: "Overview Data Export",
    description: "Export current overview statistics and KPI data in JSON format.",
    format: "JSON",
    fields: ["Total Proposals", "Total Votes", "Treasury Spends", "Last Indexed Block", "Indexer Status"],
    icon: <FileJson className="h-5 w-5" />,
    onExport: () => downloadExportJson(),
  },
  {
    title: "Compliance Report",
    description: "Generate a comprehensive PDF compliance report for auditing purposes.",
    format: "PDF",
    fields: ["Executive Summary", "Proposals Analysis", "Treasury Overview", "Risk Assessment"],
    icon: <FileText className="h-5 w-5" />,
    onExport: async () => {},
    comingSoon: true,
  },
];

export default function ExportsPage() {
  return (
    <div className="flex flex-col">
      <Topbar title="Exports" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Exports Center</h2>
          <p className="text-sm text-muted-foreground">
            Download governance and treasury data in various formats for reporting and analysis.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exports.map((item) => (
            <ExportCard
              key={item.title}
              title={item.title}
              description={item.description}
              format={item.format}
              fields={item.fields}
              icon={item.icon}
              onExport={item.onExport}
              comingSoon={item.comingSoon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
