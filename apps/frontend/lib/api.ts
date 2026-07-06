/**
 * PolkAudit API client for apps/frontend.
 *
 * - Server-side fetches use INTERNAL_API_URL when set (Cloud Run / docker networking).
 * - Client-side fetches use NEXT_PUBLIC_API_URL.
 * - Auth uses X-API-KEY (from env or browser override).
 */

const STORAGE_KEY = 'polkaudit_api_key_override';

function getApiBaseUrl(): string {
  // Server Components / server runtime
  if (typeof window === 'undefined' && process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}

export function getApiBase(): string {
  return getApiBaseUrl();
}

/** Server-side key (Server Components) — from API_KEY in env. */
function getServerApiKey(): string {
  return process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
}

export function getApiKeyOverride(): { key: string; enabled: boolean } {
  if (typeof window === 'undefined') return { key: '', enabled: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { key: '', enabled: false };
    return JSON.parse(raw);
  } catch {
    return { key: '', enabled: false };
  }
}

export function setApiKeyOverride(key: string, enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ key, enabled }));
  window.dispatchEvent(new Event('polkaudit-settings-changed'));
}

export function getEffectiveApiKey(): string {
  if (typeof window !== 'undefined') {
    const override = getApiKeyOverride();
    if (override.enabled && override.key) return override.key;
    return process.env.NEXT_PUBLIC_API_KEY || '';
  }
  return getServerApiKey();
}

export function hasApiKey(): boolean {
  if (getEffectiveApiKey()) return true;
  return !!(process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY);
}

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  const apiKey = getEffectiveApiKey();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${base}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = `API Error: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

export async function fetchHealth(): Promise<{ status: string }> {
  const base = getApiBaseUrl().replace('/api/v1', '');
  const res = await fetch(`${base}/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Health check failed');
  return (await res.json()) as { status: string };
}

export interface StatsOverview {
  total_proposals: number;
  total_votes: number;
  total_treasury_spend: string;
  total_blocks_indexed: number;
  total_extrinsics: number;
  last_indexed_block: number;
}

export interface Proposal {
  id: number;
  proposal_index: number;
  block_number: number;
  section: string;
  method: string;
  proposer: string;
  status: string;
}

export interface ProposalDetail extends Proposal {
  description: string | null;
  created_at: string;
  timeline: any[];
  votes: any[];
  outcome: string | null;
  raw: any;
  title: string;
}

export interface TreasurySpend {
  id: number;
  block_number: number;
  beneficiary: string;
  value: string;
}

export const api = {
  getStats: () => fetchAPI<StatsOverview>('/stats/overview'),
  getProposals: () => fetchAPI<Proposal[]>('/proposals'),
  getProposalDetail: (id: string | number) => fetchAPI<ProposalDetail>(`/proposals/${id}`),
  getTreasurySpends: () => fetchAPI<TreasurySpend[]>('/treasury/spends'),
};

export async function downloadProposalsCsv() {
  const apiKey = getEffectiveApiKey();
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/export/proposals/csv`, {
    headers: apiKey ? { 'X-API-KEY': apiKey } : {},
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proposals-export-${new Date().toISOString()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadOverviewJson() {
  const stats = await api.getStats();
  const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `overview-data-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

