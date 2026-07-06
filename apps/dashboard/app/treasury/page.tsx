import { api, TreasurySpend } from '@/lib/api';
import { Topbar } from '@/components/topbar';

export default async function TreasuryPage() {
    const spends = await api.getTreasurySpends();

    return (
        <div className="flex flex-col">
            <Topbar title="Treasury Spending" showSearch={true} />
            <div className="flex-1 space-y-6 p-4 lg:p-6">
                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="p-4">Block</th>
                                <th className="p-4">Beneficiary</th>
                                <th className="p-4 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spends.map((s: TreasurySpend) => (
                                <tr key={s.id} className="border-t hover:bg-muted/50">
                                    <td className="p-4">{s.block_number}</td>
                                    <td className="p-4 font-mono text-xs">{s.beneficiary}</td>
                                    <td className="p-4 text-right font-medium">{s.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
