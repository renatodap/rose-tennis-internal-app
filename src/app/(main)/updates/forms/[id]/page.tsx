import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getForm, getFormResponse } from '@/lib/actions/forms'
import { createClient } from '@/lib/supabase/server'
import { FormRenderer } from '@/components/form-renderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Users } from 'lucide-react'
import { format, formatDistanceToNow, isPast } from 'date-fns'

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

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('player_id')
    .eq('id', user.id)
    .single()

  const isPlayer = !!profile?.player_id
  let existingResponse = null

  if (isPlayer && profile.player_id) {
    existingResponse = await getFormResponse(form.id, profile.player_id)
  }

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

      {/* Form Content */}
      {isPlayer && profile?.player_id ? (
        <Card className="border-rose-silver/30">
          <CardHeader>
            <CardTitle className="text-base">Your Response</CardTitle>
            <CardDescription>
              Fill out the form below. All required fields are marked with *.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormRenderer
              form={form}
              playerId={profile.player_id}
              existingResponse={existingResponse}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-rose-silver/30">
          <CardContent className="p-6 text-center text-muted-foreground">
            You need a player profile to submit this form.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
