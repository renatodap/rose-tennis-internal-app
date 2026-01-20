import { getTrips } from '@/lib/actions/trips'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plane, Calendar, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'

export default async function TripsPage() {
  const trips = await getTrips()

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose-red/10 rounded-md">
          <Plane className="h-6 w-6 text-rose-red" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Team Trips</h1>
          <p className="text-sm text-muted-foreground">Upcoming travel and tournaments</p>
        </div>
      </div>

      {trips && trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => {
            const menRoster = trip.trip_roster?.filter(r => r.player?.gender === 'male') || []
            const womenRoster = trip.trip_roster?.filter(r => r.player?.gender === 'female') || []
            const confirmedMen = menRoster.filter(r => r.status === 'confirmed').length
            const confirmedWomen = womenRoster.filter(r => r.status === 'confirmed').length

            return (
              <Card key={trip.id} className="border-rose-silver/30">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{trip.name}</CardTitle>
                    <Badge className="bg-green-600">Upcoming</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-red" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-rose-red" />
                      <span>
                        {format(new Date(trip.departure_date), 'MMM d')} -{' '}
                        {format(new Date(trip.return_date), 'MMM d')}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Roster Counts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Men</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-red"
                            style={{ width: `${(confirmedMen / trip.max_men) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {confirmedMen}/{trip.max_men}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Women</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-red"
                            style={{ width: `${(confirmedWomen / trip.max_women) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {confirmedWomen}/{trip.max_women}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {trip.notes && (
                    <>
                      <Separator />
                      <p className="text-sm text-muted-foreground">{trip.notes}</p>
                    </>
                  )}

                  {/* Flight Info */}
                  {trip.flight_info && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-1">Flight Information</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {trip.flight_info}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-rose-silver/30">
          <CardContent className="p-6 text-center text-muted-foreground">
            No upcoming trips scheduled
          </CardContent>
        </Card>
      )}
    </div>
  )
}
