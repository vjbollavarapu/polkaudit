/** Browser and server default; Docker sets INTERNAL_API_URL for server-side fetches. */
function getApiBaseUrl(): string {
    if (typeof window === 'undefined' && process.env.INTERNAL_API_URL) {
        return process.env.INTERNAL_API_URL;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}

const API_URL = getApiBaseUrl();

/** Server-side key (Server Components) — from API_KEY in .env.local */
function getServerApiKey(): string {
    return process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
}

/** Resolved key for the current context (server env or browser override). */
export function getEffectiveApiKey(): string {
    if (typeof window !== 'undefined') {
        const override = getApiKeyOverride();
        if (override.enabled && override.key) {
            return override.key;
        }
        return process.env.NEXT_PUBLIC_API_KEY || '';
    }
    return getServerApiKey();
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const apiKey = getEffectiveApiKey();
    const headers = {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

export function getApiBase() {
    return API_URL;
}

export function hasApiKey() {
    if (getEffectiveApiKey()) return true;
    // Client bundles only expose NEXT_PUBLIC_* vars
    return !!(process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY);
}

export async function fetchHealth() {
    // Check backend health (proxy for system health)
    // Backend is at API_URL's root usually, but here API_URL includes /api/v1
    // So we strip /api/v1 or just call /health on the domain
    const baseUrl = API_URL.replace('/api/v1', '');
    const res = await fetch(`${baseUrl}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
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

export interface TreasurySpend {
    id: number;
    block_number: number;
    beneficiary: string;
    value: string;
}

export const api = {
    getStats: () => fetchAPI('/stats/overview') as Promise<StatsOverview>,
    getProposals: (params?: any) => fetchAPI('/proposals') as Promise<Proposal[]>,
    getTreasurySpends: () => fetchAPI('/treasury/spends') as Promise<TreasurySpend[]>,
};

export interface ProposalDetail extends Proposal {
    description: string | null;
    created_at: string;
    timeline: any[];
    votes: any[];
    outcome: string | null;
    raw: any;
    title: string;
}

export async function fetchProposalDetail(id: string): Promise<ProposalDetail> {
    // In a real app, this would fetch specific details
    // For now, we mock extra details or fetch from a detail endpoint if it existed
    // Since we don't have a detail endpoint yet, we might error or mock
    // Let's implement a basic lookup if the backend supports it, otherwise mock for MVP to pass build
    // The backend router shows: @router.get("/{proposal_id}", response_model=ProposalResponse)
    // So we can fetch it.
    return fetchAPI(`/proposals/${id}`) as Promise<ProposalDetail>;
}

export async function downloadExportCsv(type: 'proposals' | 'spends') {
    // Navigate to backend export URL
    const baseUrl = API_URL;
    // We can't use X-API-KEY in standard navigation easily without a proxy or cookie
    // But we implemented a GET /api/v1/export/proposals/csv endpoint
    // If it requires Auth, browser navigation won't work well unless we use a token in URL or cookie
    // Backend Auth: `get_api_key` checks header.
    // Workaround: Fetch blob with header and download via JS
    const endpoint = type === 'proposals' ? '/export/proposals/csv' : '/export/treasury/csv'; // Treasury CSV not implemented yet on backend but requested

    // For now, let's implement proposals export
    if (type === 'proposals') {
        const apiKey = getEffectiveApiKey();
        const res = await fetch(`${API_URL}/export/proposals/csv`, {
            headers: apiKey ? { 'X-API-KEY': apiKey } : {},
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
    } else {
        alert("Export type not yet implemented on backend");
    }
}

export async function downloadExportJson() {
    const stats = await api.getStats();
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overview-data-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// Client-side API Key Override helpers (using localStorage)
const STORAGE_KEY = 'polkaudit_api_key_override';

export function getApiKeyOverride() {
    if (typeof window === 'undefined') return { key: '', enabled: false };
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    return { key: '', enabled: false };
}

export function setApiKeyOverride(key: string, enabled: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key, enabled }));
    window.dispatchEvent(new Event('polkaudit-settings-changed'));
}

/** Whether a key is available from env and/or browser override. */
export function getApiKeyStatus(): {
    hasEnvKey: boolean;
    hasOverride: boolean;
    usingOverride: boolean;
} {
    const hasEnvKey = !!(process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY);
    if (typeof window === 'undefined') {
        return { hasEnvKey, hasOverride: false, usingOverride: false };
    }
    const override = getApiKeyOverride();
    return {
        hasEnvKey,
        hasOverride: !!(override.enabled && override.key),
        usingOverride: !!(override.enabled && override.key),
    };
}
