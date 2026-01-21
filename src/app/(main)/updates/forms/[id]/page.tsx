import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getForm, getFormResponse } from '@/lib/actions/forms'
import { createClient } from '@/lib/supabase/server'
import { FormRenderer } from '@/components/form-renderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Users, LogIn } from 'lucide-react'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import type { Profile } from '@/types/database'

interface FormPageProps {
  params: Promise<{ id: string }>
}

export default async function FormPage({ params }: FormPageProps) {
  const { id } = await params
  const form = await getForm(parseInt(id))

  if (!form) {
    notFound()
  }

  // Get current user and their player profile
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  let existingResponse = null
  const isAuthenticated = !!user

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data

    if (profile?.player_id) {
      existingResponse = await getFormResponse(form.id, profile.player_id)
    }
  }

  const isPlayer = !!profile?.player_id
  const isDueSoon = form.due_date && !isPast(new Date(form.due_date)) &&
    new Date(form.due_date).getTime() - Date.now() < 48 * 60 * 60 * 1000
  const isOverdue = form.due_date && isPast(new Date(form.due_date))

  return (
    <div className="p-4">
      {/* Back Button */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/updates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Updates
        </Link>
      </Button>

      {/* Form Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-2xl font-semibold">{form.title}</h1>
          {isDueSoon && <Badge className="bg-rose-orange">Due Soon</Badge>}
          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
        </div>
        {form.description && (
          <p className="text-muted-foreground">{form.description}</p>
        )}
      </div>

      {/* Form Meta */}
      <Card className="border-rose-silver/30 mb-6">
        <CardContent className="p-4 space-y-3">
          {form.due_date && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-rose-red" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {format(new Date(form.due_date), 'EEEE, MMMM d, yyyy')}
                  <span className="text-muted-foreground ml-2">
                    ({formatDistanceToNow(new Date(form.due_date), { addSuffix: true })})
                  </span>
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-rose-red" />
            <div>
              <p className="text-sm text-muted-foreground">For</p>
              <p className="font-medium">
                {form.for_mens && form.for_womens ? 'All Teams' :
                  form.for_mens ? "Men's Team" : "Women's Team"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Content - conditional based on auth state */}
      {!isAuthenticated ? (
        // Not logged in - show login prompt
        <Card className="border-rose-silver/30">
          <CardContent className="p-6 text-center">
            <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">Sign in to fill this form</h3>
            <p className="text-muted-foreground text-sm mb-4">
              You need to be logged in with your Rose-Hulman account to submit a response.
            </p>
            <Button asChild className="bg-rose-red hover:bg-rose-red/90">
              <Link href={`/login?next=/updates/forms/${id}`}>
                Sign in to continue
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : isPlayer && profile?.player_id ? (
        // Logged in as player - show form
        <Card className="border-rose-silver/30">
          <CardHeader>
            <CardTitle className="text-base">Your Response</CardTitle>
            <CardDescription>
              Fill out the form below. All required fields are marked with *.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormRenderer
              form={{ ...form, form_questions: form.form_questions ?? [] }}
              playerId={profile.player_id}
              existingResponse={existingResponse}
            />
          </CardContent>
        </Card>
      ) : (
        // Logged in but not a player
        <Card className="border-rose-silver/30">
          <CardContent className="p-6 text-center text-muted-foreground">
            You need a player profile to submit this form.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
