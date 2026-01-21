'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Shield,
  LogOut,
  Loader2,
  ChevronRight,
  Key,
  RefreshCw
} from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, loading, isCoach, isAdmin, isPlayer, isCaptain } = useUser()
  const [signingOut, setSigningOut] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => setLoadingTimeout(true), 5000)
      return () => clearTimeout(timeout)
    }
    setLoadingTimeout(false)
  }, [loading])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-rose-red" />
        {loadingTimeout && (
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Taking longer than expected...</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh page
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-red/10 rounded-md">
            <User className="h-6 w-6 text-rose-red" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Profile</h1>
            <p className="text-sm text-muted-foreground">Sign in to view your account</p>
          </div>
        </div>

        <Card className="border-rose-silver/30">
          <CardHeader>
            <CardTitle className="text-lg">Not signed in</CardTitle>
            <CardDescription>
              Sign in with your Rose-Hulman email to access your profile and team features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full bg-rose-red hover:bg-rose-red/90">
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getRoleBadge = () => {
    if (isAdmin) return <Badge className="bg-rose-red">Admin</Badge>
    if (profile?.role === 'coach') return <Badge className="bg-blue-600">Coach</Badge>
    if (isCaptain) return <Badge className="bg-rose-orange text-white">Captain</Badge>
    if (isPlayer) return <Badge variant="secondary">Player</Badge>
    return <Badge variant="outline">Pending</Badge>
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose-red/10 rounded-md">
          <User className="h-6 w-6 text-rose-red" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>
      </div>

      {/* Account Info */}
      <Card className="border-rose-silver/30">
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
          <CardDescription>Your Rose-Hulman Tennis account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Role</p>
              <div className="mt-1">{getRoleBadge()}</div>
            </div>
          </div>

          {(isCoach || isAdmin) && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground">
                You have elevated permissions to manage events, announcements, and team settings.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-rose-silver/30">
        <CardHeader>
          <CardTitle className="text-lg">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/reset-password">
            <Button variant="ghost" className="w-full justify-between h-auto py-3">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span>Change password</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        onClick={handleSignOut}
        variant="outline"
        className="w-full border-destructive text-destructive hover:bg-destructive/10"
        disabled={signingOut}
      >
        {signingOut ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </>
        )}
      </Button>

      {/* App Info */}
      <p className="text-xs text-center text-muted-foreground pt-4">
        Rose-Hulman Tennis App v1.0
      </p>
    </div>
  )
}
