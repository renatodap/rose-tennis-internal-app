import Link from 'next/link'
import { getPlayers } from '@/lib/actions/players'
import { getTags } from '@/lib/actions/tags'
import { PlayerCard } from '@/components/player-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Plus, UserPlus } from 'lucide-react'

export default async function AdminPlayersPage() {
  const [players, tags] = await Promise.all([
    getPlayers(),
    getTags(),
  ])

  const menPlayers = players?.filter(p => p.gender === 'male') || []
  const womenPlayers = players?.filter(p => p.gender === 'female') || []

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Players</h1>
        </div>
        <Button className="bg-rose-red hover:bg-rose-red/90" asChild>
          <Link href="/admin/players/new">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Player
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="men" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="men" className="flex-1">
            Men ({menPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="women" className="flex-1">
            Women ({womenPlayers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="men">
          {menPlayers.length > 0 ? (
            <div className="space-y-3">
              {menPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          ) : (
            <Card className="border-rose-silver/30">
              <CardContent className="p-6 text-center text-muted-foreground">
                No male players
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="women">
          {womenPlayers.length > 0 ? (
            <div className="space-y-3">
              {womenPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          ) : (
            <Card className="border-rose-silver/30">
              <CardContent className="p-6 text-center text-muted-foreground">
                No female players
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
