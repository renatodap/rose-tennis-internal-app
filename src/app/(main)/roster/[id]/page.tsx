import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlayer } from '@/lib/actions/players'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Mail, Star, GraduationCap } from 'lucide-react'

interface PlayerPageProps {
  params: Promise<{ id: string }>
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params
  const player = await getPlayer(parseInt(id))

  if (!player) {
    notFound()
  }

  const initials = `${player.first_name[0]}${player.last_name[0]}`
  const tags = player.player_tags?.map(pt => pt.tags) || []

  const classYearFull: Record<string, string> = {
    'Fr': 'Freshman',
    'So': 'Sophomore',
    'Jr': 'Junior',
    'Sr': 'Senior',
  }

  return (
    <div className="p-4">
      {/* Back Button */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/roster">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roster
        </Link>
      </Button>

      {/* Player Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-rose-red/10 text-rose-red text-2xl font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">
              {player.first_name} {player.last_name}
            </h1>
            {player.is_captain && (
              <Star className="h-5 w-5 text-rose-orange fill-rose-orange" />
            )}
          </div>
          <p className="text-muted-foreground capitalize">
            {player.gender === 'male' ? "Men's" : "Women's"} Team
          </p>
        </div>
      </div>

      {/* Player Details */}
      <Card className="border-rose-silver/30 mb-4">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-rose-red" />
            <div>
              <p className="text-sm text-muted-foreground">Class Year</p>
              <p className="font-medium">
                {player.class_year ? classYearFull[player.class_year] : 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-rose-red" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a
                href={`mailto:${player.email}`}
                className="font-medium text-rose-red hover:underline"
              >
                {player.email}
              </a>
            </div>
          </div>

          {player.is_captain && (
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-rose-orange fill-rose-orange" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">Team Captain</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
