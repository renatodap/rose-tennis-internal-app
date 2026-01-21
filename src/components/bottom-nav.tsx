'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/use-user'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/roster', label: 'Roster', icon: Users },
  { href: '/updates', label: 'Updates', icon: Bell },
]

const adminItem = { href: '/admin', label: 'Admin', icon: Settings }

export function BottomNav() {
  const pathname = usePathname()
  const { isCoach, isAdmin } = useUser()

  const items = [...navItems]
  if (isCoach || isAdmin) {
    items.push(adminItem)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-rose-silver/30">
      <div
        className="flex items-center justify-around"
        style={{
          height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {items.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-xs gap-1 transition-colors active:opacity-70',
                isActive
                  ? 'text-rose-red'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-6 w-6', isActive && 'stroke-[2.5]')} />
              <span className={cn('text-[11px]', isActive && 'font-medium')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
