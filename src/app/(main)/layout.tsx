import { BottomNav } from '@/components/bottom-nav'
import { getActiveTripId } from '@/lib/actions/trip-details'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeTripId = await getActiveTripId()

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main className="pb-bottom-nav overflow-x-hidden">
        {children}
      </main>
      <BottomNav activeTripId={activeTripId} />
    </div>
  )
}
