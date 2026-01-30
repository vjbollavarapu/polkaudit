"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { StatusBadge } from "@/components/status-badge";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { fetchProposalDetail, type ProposalDetail } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

function ProposalHeader({ proposal }: { proposal: ProposalDetail }) {
  return (
    <div className="space-y-4">
      <Link href="/proposals">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Button>
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{proposal.title}</h1>
            <StatusBadge status={proposal.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono text-xs">ID: {proposal.id}</span>
            {proposal.proposer && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-6)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(proposal.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryTab({ proposal }: { proposal: ProposalDetail }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-semibold">{proposal.status}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Created</p>
          <p className="mt-1 text-lg font-semibold">
            {format(new Date(proposal.created_at), "MMM d, yyyy")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Outcome</p>
          <p className="mt-1 text-lg font-semibold">
            {proposal.outcome || "Pending"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Description
        </h3>
        {proposal.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {proposal.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No description available.
          </p>
        )}
      </div>
    </div>
  );
}

function VotesTab() {
  return (
    <EmptyState
      icon="document"
      title="Coming soon"
      description="Vote breakdown and analytics will be available in a future update."
    />
  );
}

function TimelineTab({ proposal }: { proposal: ProposalDetail }) {
  if (!proposal.timeline || proposal.timeline.length === 0) {
    return (
      <EmptyState
        icon="document"
        title="No timeline events"
        description="Timeline events will appear here as the proposal progresses."
      />
    );
  }

  return (
    <div className="space-y-4">
      {proposal.timeline.map((event, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            {index < proposal.timeline.length - 1 && (
              <div className="mt-2 h-full w-px bg-border" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-medium">{event.label}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.timestamp), "PPp")}
            </p>
            {event.details && (
              <p className="mt-2 text-sm text-muted-foreground">
                {event.details}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RawJsonTab({ proposal }: { proposal: ProposalDetail }) {
  return (
    <div className="rounded-lg border border-border bg-muted/50">
      <pre className="max-h-[600px] overflow-auto p-4 text-xs">
        <code>{JSON.stringify(proposal.raw, null, 2)}</code>
      </pre>
    </div>
  );
}

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProposal = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProposalDetail(id);
      setProposal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load proposal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposal();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Topbar title="Proposal Details" />
        <div className="flex-1 p-4 lg:p-6">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <Topbar title="Proposal Details" />
        <div className="flex-1 p-4 lg:p-6">
          <Link href="/proposals">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Proposals
            </Button>
          </Link>
          <ErrorState message={error} onRetry={loadProposal} />
        </div>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="flex flex-col">
      <Topbar title="Proposal Details" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <ProposalHeader proposal={proposal} />

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="votes">Votes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryTab proposal={proposal} />
          </TabsContent>

          <TabsContent value="votes">
            <VotesTab />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab proposal={proposal} />
          </TabsContent>

          <TabsContent value="raw">
            <RawJsonTab proposal={proposal} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
