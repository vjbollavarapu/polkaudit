'use client'

import { Header } from '@/components/header'
import { DashboardLayout } from '@/components/dashboard-layout'
import { EmptyProposals, EmptyTreasury, ApiError, KPICard } from '@/components/empty-states'
import {
  Database,
  Layers,
  FileText,
  BarChart3,
  PiggyBank,
  Activity,
  RefreshCw,
} from 'lucide-react'

export default function ComponentsPage() {
  const handleRetry = () => {
    alert('Retry handler called')
  }

  return (
    <DashboardLayout>
      <Header title="Component Library" showSearch={false} />
      <main className="p-6 max-w-6xl space-y-12">
        {/* Empty States */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Empty States</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                EmptyProposals (Full)
              </h3>
              <EmptyProposals />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                EmptyProposals (Compact)
              </h3>
              <div className="bg-card border border-border p-6 rounded-lg">
                <EmptyProposals compact />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                EmptyTreasury (Full)
              </h3>
              <EmptyTreasury />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                EmptyTreasury (Compact)
              </h3>
              <div className="bg-card border border-border p-6 rounded-lg">
                <EmptyTreasury compact />
              </div>
            </div>
          </div>
        </section>

        {/* Error States */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Error States</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                ApiError (Full)
              </h3>
              <ApiError onRetry={handleRetry} />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                ApiError (Compact)
              </h3>
              <ApiError compact onRetry={handleRetry} />
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">KPI Cards</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KPICard
              icon={Database}
              label="Blocks Indexed"
              value="648"
              subtitle="Latest block #31387398"
              trend={{ direction: 'up', value: '+12 today' }}
            />
            <KPICard
              icon={Layers}
              label="Extrinsics"
              value="798"
              subtitle="Decoded on-chain calls"
              trend={{ direction: 'up', value: '+45 today' }}
            />
            <KPICard
              icon={FileText}
              label="Total Proposals"
              value="0"
              subtitle="OpenGov / democracy"
            />
            <KPICard
              icon={BarChart3}
              label="Total Votes"
              value="0"
              subtitle="Cast across proposals"
            />
            <KPICard
              icon={PiggyBank}
              label="Treasury Spend"
              value="0"
              subtitle="Total value spent"
              trend={{ direction: 'down', value: '-2.5% vs week' }}
            />
            <KPICard
              icon={Activity}
              label="Indexer"
              value="Live"
              subtitle="Receiving chain data"
              badge={{ text: 'Active', variant: 'default' }}
            />
          </div>
        </section>
      </main>
    </DashboardLayout>
  )
}
