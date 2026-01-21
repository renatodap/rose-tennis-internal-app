import { BottomNav } from '@/components/bottom-nav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main className="pb-bottom-nav overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
