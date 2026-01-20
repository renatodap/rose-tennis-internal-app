import { BottomNav } from '@/components/bottom-nav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-bottom-nav">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
