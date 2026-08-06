import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatCard } from '@/components/dashboard/StatCard'
import { RoasTrendChart } from '@/components/dashboard/RoasTrendChart'
import { SpendDonutChart } from '@/components/dashboard/SpendDonutChart'
import { CreativeLeaderboard } from '@/components/dashboard/CreativeLeaderboard'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { OnboardingBanner } from '@/components/dashboard/OnboardingBanner'

export function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Your live command center." />
      <OnboardingBanner />

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Spend" value="$97.3K" delta={8.4} glow />
          <StatCard label="Blended ROAS" value="3.42x" delta={5.1} glow />
          <StatCard label="Total Impressions" value="4.2M" delta={-2.3} glow />
          <StatCard label="CPA" value="$24.60" delta={-6.8} glow />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>ROAS Trend — 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <RoasTrendChart />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Spend by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendDonutChart />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Creatives</CardTitle>
            </CardHeader>
            <CardContent>
              <CreativeLeaderboard />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertsPanel />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
