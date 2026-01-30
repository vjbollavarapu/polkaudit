// API Types
export interface OverviewStats {
  total_proposals: number;
  total_votes: number;
  treasury_spends: number;
  last_indexed_block: number;
  indexer_status: "OK" | "DEGRADED" | "DOWN";
  updated_at: string;
}

export interface ActivityItem {
  type: string;
  title: string;
  timestamp: string;
  ref_id: string;
}

export interface Proposal {
  id: string;
  title: string;
  status: "Open" | "Passed" | "Rejected" | "Executed" | "Cancelled";
  created_at: string;
  votes_for: number;
  votes_against: number;
  turnout: number;
}

export interface ProposalListResponse {
  items: Proposal[];
  page: number;
  pageSize: number;
  total: number;
}

export interface TimelineEvent {
  label: string;
  timestamp: string;
  details: string | null;
}

export interface ProposalDetail {
  id: string;
  title: string;
  status: string;
  created_at: string;
  proposer: string | null;
  description: string | null;
  outcome: string | null;
  timeline: TimelineEvent[];
  raw: Record<string, unknown>;
}

export interface TreasurySpend {
  id: string;
  beneficiary: string;
  amount: number;
  asset: string;
  approved_at: string;
  status: "Proposed" | "Approved" | "Paid" | "Rejected";
  proposal_id: string | null;
}

export interface TreasurySpendListResponse {
  items: TreasurySpend[];
  page: number;
  pageSize: number;
  total: number;
}

export interface HealthResponse {
  status: string;
  version?: string;
}

// API Configuration
const API_KEY_STORAGE_KEY = "polkaaudit_api_key_override";
const API_KEY_ENABLED_KEY = "polkaaudit_api_key_enabled";

export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
}

export function getApiKey(): string | null {
  // Only use localStorage override on client - server API key should be used via server actions
  if (typeof window !== "undefined") {
    const enabled = localStorage.getItem(API_KEY_ENABLED_KEY);
    if (enabled === "true") {
      const override = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (override) return override;
    }
  }
  return null;
}

export function setApiKeyOverride(key: string, enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    localStorage.setItem(API_KEY_ENABLED_KEY, enabled ? "true" : "false");
  }
}

export function getApiKeyOverride(): { key: string; enabled: boolean } {
  if (typeof window !== "undefined") {
    return {
      key: localStorage.getItem(API_KEY_STORAGE_KEY) || "",
      enabled: localStorage.getItem(API_KEY_ENABLED_KEY) === "true",
    };
  }
  return { key: "", enabled: false };
}

export function hasApiKey(): boolean {
  return getApiKey() !== null;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Main fetch function with retry logic
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = 1
): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const apiKey = getApiKey();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (apiKey) {
    (headers as Record<string, string>)["X-API-KEY"] = apiKey;
  }

  const fetchWithRetry = async (attempt: number): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      return response;
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithRetry(attempt + 1);
      }
      throw new ApiError(
        error instanceof Error ? error.message : "Network error"
      );
    }
  };

  const response = await fetchWithRetry(0);

  if (!response.ok) {
    throw new ApiError(`API error: ${response.statusText}`, response.status);
  }

  return response.json();
}

// File download helper
export async function apiDownload(
  path: string,
  filename: string
): Promise<void> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const apiKey = getApiKey();

  const headers: HeadersInit = {};
  if (apiKey) {
    (headers as Record<string, string>)["X-API-KEY"] = apiKey;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new ApiError(`Download failed: ${response.statusText}`, response.status);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// Typed API functions
export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

export async function fetchOverviewStats(): Promise<OverviewStats> {
  return apiFetch<OverviewStats>("/stats/overview");
}

export async function fetchActivity(limit = 10): Promise<ActivityItem[]> {
  return apiFetch<ActivityItem[]>(`/governance/activity?limit=${limit}`);
}

export interface ProposalFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
}

export async function fetchProposals(
  filters: ProposalFilters = {}
): Promise<ProposalListResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.status) params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const query = params.toString();
  return apiFetch<ProposalListResponse>(
    `/governance/proposals${query ? `?${query}` : ""}`
  );
}

export async function fetchProposalDetail(id: string): Promise<ProposalDetail> {
  return apiFetch<ProposalDetail>(`/governance/proposals/${id}`);
}

export interface TreasuryFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  min?: number;
  max?: number;
}

export async function fetchTreasurySpends(
  filters: TreasuryFilters = {}
): Promise<TreasurySpendListResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.status) params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.min !== undefined) params.set("min", String(filters.min));
  if (filters.max !== undefined) params.set("max", String(filters.max));

  const query = params.toString();
  return apiFetch<TreasurySpendListResponse>(
    `/treasury/spends${query ? `?${query}` : ""}`
  );
}

export async function downloadExportCsv(type: "proposals" | "spends"): Promise<void> {
  return apiDownload(`/export/csv?type=${type}`, `${type}-export.csv`);
}

export async function downloadExportJson(): Promise<void> {
  const data = await fetchOverviewStats();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "overview-export.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
