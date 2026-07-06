import { api } from '@/lib/api';
import { KpiCard } from '@/components/kpi-card';
import { Topbar } from '@/components/topbar';

import { Activity, BarChart3, Database, FileText, Layers, PiggyBank } from 'lucide-react';
import { Proposal } from '@/lib/api';

export default async function OverviewPage() {
    const stats = await api.getStats();
    const recentProposals = await api.getProposals({ limit: 5 });

    return (
        <div className="flex flex-col">
            <Topbar title="Overview" />
            <div className="flex-1 space-y-6 p-4 lg:p-6">
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <KpiCard
                        title="Blocks Indexed"
                        value={stats.total_blocks_indexed}
                        icon={Database}
                        subtitle={`Latest block #${stats.last_indexed_block}`}
                    />
                    <KpiCard
                        title="Extrinsics"
                        value={stats.total_extrinsics}
                        icon={Layers}
                        subtitle="Decoded on-chain calls"
                    />
                    <KpiCard
                        title="Total Proposals"
                        value={stats.total_proposals}
                        icon={FileText}
                        subtitle="OpenGov / democracy"
                    />
                    <KpiCard
                        title="Total Votes"
                        value={stats.total_votes}
                        icon={BarChart3}
                        subtitle="Cast across proposals"
                    />
                    <KpiCard
                        title="Treasury Spend"
                        value={stats.total_treasury_spend}
                        icon={PiggyBank}
                        subtitle="Total value spent"
                    />
                    <KpiCard
                        title="Indexer"
                        value={stats.last_indexed_block > 0 ? 'Live' : 'Idle'}
                        icon={Activity}
                        subtitle={stats.last_indexed_block > 0 ? 'Receiving chain data' : 'Start indexer'}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-col space-y-3">
                            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
                            <p className="text-sm text-muted-foreground">Latest governance proposals.</p>
                        </div>
                        <div className="p-6 pt-0">
                            {/* Simple list for now, ideally Recharts activity graph */}
                            <div className="space-y-4">
                                {recentProposals.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No governance proposals yet. The indexer is storing blocks and extrinsics;
                                        proposals appear when OpenGov referenda activity is found in indexed blocks.
                                    </p>
                                ) : (
                                    recentProposals.slice(0, 5).map((p: Proposal) => (
                                        <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">Proposal #{p.proposal_index}</p>
                                                <p className="text-xs text-muted-foreground">{p.section}.{p.method}</p>
                                            </div>
                                            <div className="text-sm font-medium">{p.status}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
