import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star } from 'lucide-react'
import type { Player, Tag } from '@/types/database'

interface PlayerCardProps {
  player: Player & { player_tags?: { tags: Tag }[] }
}

export function PlayerCard({ player }: PlayerCardProps) {
  const initials = `${player.first_name[0]}${player.last_name[0]}`
  const tags = player.player_tags?.map(pt => pt.tags) || []

  return (
    <Link href={`/roster/${player.id}`}>
      <Card className="border-rose-silver/30 hover:border-rose-red/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-rose-red/10 text-rose-red font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                  {player.first_name} {player.last_name}
                </span>
                {player.is_captain && (
                  <Star className="h-4 w-4 text-rose-orange fill-rose-orange" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{player.class_year}</span>
                <span className="text-rose-silver">|</span>
                <span className="capitalize">{player.gender === 'male' ? "Men's" : "Women's"}</span>
              </div>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
