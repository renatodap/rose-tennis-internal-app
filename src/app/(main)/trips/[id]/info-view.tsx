'use client'

import { format, parseISO } from 'date-fns'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Home,
  CookingPot,
  Apple,
  Car,
} from 'lucide-react'
import type { Trip, TripStaffMember } from '@/types/database'

interface InfoViewProps {
  trip: Trip
  staffRoster: TripStaffMember[]
}

export function InfoView({ trip, staffRoster }: InfoViewProps) {
  const logistics = trip.logistics

  return (
    <Accordion type="multiple" defaultValue={['people']} className="w-full">
      {/* People Section */}
      <AccordionItem value="people">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-rose-red" />
            <span>People</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {staffRoster.length > 0 ? (
            <div className="space-y-2">
              {staffRoster.map((staff) => (
                <Card key={staff.id} className="border-rose-silver/30">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{staff.name}</p>
                        {staff.role_on_trip && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {staff.role_on_trip}
                          </Badge>
                        )}
                      </div>
                      {staff.start_date && staff.end_date && (
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(parseISO(staff.start_date), 'MMM d')} -{' '}
                          {format(parseISO(staff.end_date), 'MMM d')}
                        </p>
                      )}
                    </div>
                    {staff.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {staff.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No staff roster information.</p>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Condo Section */}
      {logistics?.condo && (
        <AccordionItem value="condo">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-rose-red" />
              <span>Condo</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm">
              <InfoRow label="Resort" value={logistics.condo.resort} />
              <InfoRow label="Address" value={logistics.condo.address} />
              <InfoRow label="Bedrooms" value={String(logistics.condo.bedrooms)} />
              <InfoRow label="Check-in" value={logistics.condo.check_in} />
              <InfoRow label="Check-out" value={logistics.condo.check_out} />
              {logistics.condo.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{logistics.condo.notes}</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Kitchen Section */}
      {(logistics?.kitchen_equipment || logistics?.fridge_zones) && (
        <AccordionItem value="kitchen">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <CookingPot className="h-4 w-4 text-rose-red" />
              <span>Kitchen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-sm">
              {logistics.kitchen_equipment && logistics.kitchen_equipment.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Equipment</p>
                  <div className="flex flex-wrap gap-1.5">
                    {logistics.kitchen_equipment.map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {logistics.fridge_zones && Object.keys(logistics.fridge_zones).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Fridge Zones</p>
                  <div className="space-y-1.5">
                    {Object.entries(logistics.fridge_zones).map(([zone, contents]) => (
                      <div key={zone} className="flex gap-2">
                        <span className="font-medium min-w-[80px]">{zone}:</span>
                        <span className="text-muted-foreground">{contents}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Nutrition Section */}
      {(logistics?.nutrition_targets || logistics?.food_safety) && (
        <AccordionItem value="nutrition">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Apple className="h-4 w-4 text-rose-red" />
              <span>Nutrition</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-sm">
              {logistics.nutrition_targets && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Daily Targets</p>
                  <div className="grid grid-cols-2 gap-2">
                    <NutritionChip label="Calories" value={`${logistics.nutrition_targets.kcal} kcal`} />
                    <NutritionChip label="Carbs" value={`${logistics.nutrition_targets.carbs_g}g`} />
                    <NutritionChip label="Protein" value={`${logistics.nutrition_targets.protein_g}g`} />
                    <NutritionChip label="Fat" value={`${logistics.nutrition_targets.fat_g}g`} />
                    <NutritionChip
                      label="Hydration"
                      value={`${logistics.nutrition_targets.hydration_oz} oz`}
                    />
                  </div>
                </div>
              )}
              {logistics.food_safety && logistics.food_safety.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Food Safety</p>
                  <ul className="space-y-1.5">
                    {logistics.food_safety.map((rule, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-rose-red mt-0.5 shrink-0">-</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Travel Section */}
      {logistics?.travel && (
        <AccordionItem value="travel">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-rose-red" />
              <span>Travel</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm">
              <InfoRow label="Vans" value={String(logistics.travel.van_count)} />
              {logistics.travel.driving_distances &&
                Object.keys(logistics.travel.driving_distances).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Driving Distances
                    </p>
                    <div className="space-y-1.5">
                      {Object.entries(logistics.travel.driving_distances).map(
                        ([route, dist]) => (
                          <div key={route} className="flex gap-2">
                            <span className="font-medium min-w-[120px]">{route}:</span>
                            <span className="text-muted-foreground">{dist}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-medium text-muted-foreground min-w-[80px]">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function NutritionChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-md px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
