import { api } from '@/lib/api';
import { Proposal } from '@/lib/api';
import { Topbar } from '@/components/topbar';

export default async function ProposalsPage() {
    const proposals = await api.getProposals();

    return (
        <div className="flex flex-col">
            <Topbar title="Proposals" showSearch={true} />
            <div className="flex-1 space-y-6 p-4 lg:p-6">
                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="p-4">Index</th>
                                <th className="p-4">Section.Method</th>
                                <th className="p-4">Proposer</th>
                                <th className="p-4">Block</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.map((p: Proposal) => (
                                <tr key={p.id} className="border-t hover:bg-muted/50">
                                    <td className="p-4 font-medium">#{p.proposal_index}</td>
                                    <td className="p-4">{p.section}.{p.method}</td>
                                    <td className="p-4 font-mono text-xs">{p.proposer}</td>
                                    <td className="p-4">{p.block_number}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
