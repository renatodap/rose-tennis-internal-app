import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users, FileText, Bell, Settings } from 'lucide-react'

const adminLinks = [
  {
    href: '/admin/events',
    icon: Calendar,
    title: 'Events',
    description: 'Manage practices, matches, and meetings',
  },
  {
    href: '/admin/players',
    icon: Users,
    title: 'Players',
    description: 'Manage player profiles and tags',
  },
  {
    href: '/admin/announcements',
    icon: Bell,
    title: 'Announcements',
    description: 'Create and manage announcements',
  },
  {
    href: '/admin/forms',
    icon: FileText,
    title: 'Forms',
    description: 'Create forms and view responses',
  },
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin' && profile.role !== 'captain')) {
    redirect('/')
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose-red/10 rounded-md">
          <Settings className="h-6 w-6 text-rose-red" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage team data</p>
        </div>
      </div>

      {/* Admin Links */}
      <div className="grid grid-cols-2 gap-3">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="border-rose-silver/30 hover:border-rose-red/50 transition-colors h-full">
              <CardContent className="p-4">
                <link.icon className="h-8 w-8 text-rose-red mb-2" />
                <h3 className="font-medium">{link.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
