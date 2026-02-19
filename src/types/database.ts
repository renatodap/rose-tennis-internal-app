export type NoteType = 'practice' | 'match' | 'pre_match' | 'post_match' | 'practice_plan' | 'film_review' | 'general'

export interface Note {
  id: number
  author_id: string
  note_type: NoteType
  title: string
  content: string
  event_id: number | null
  visibility: 'private' | 'team' | 'specific'
  player_mentions: number[]
  key_points: string[]
  ai_raw_output: AIParsedResult | null
  created_at: string
  updated_at: string
}

export interface AIParsedResult {
  extracted_text: string
  players_mentioned: string[]
  key_points: string[]
  related_events?: { id: number; title: string }[]
  related_notes?: { id: number; title: string }[]
}

export interface NoteShare {
  note_id: number
  player_id: number
}

export type UserRole = 'player' | 'coach' | 'admin' | 'captain' | 'pending'
export type Gender = 'male' | 'female'
export type ClassYear = 'Fr' | 'So' | 'Jr' | 'Sr'
export type EventType = 'practice' | 'match' | 'fitness' | 'meeting' | 'scrimmage' | 'trip' | 'other'
export type HomeAway = 'home' | 'away' | 'neutral'
export type MatchResult = 'win' | 'loss' | 'tie' | 'cancelled' | null
export type StaffRole = 'head_coach' | 'assistant_coach' | 'trainer'
export type Priority = 'low' | 'normal' | 'high' | 'urgent'
export type TripStatus = 'pending' | 'confirmed' | 'declined'
export type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'time' | 'boolean'

export interface Profile {
  id: string
  email: string
  role: UserRole
  player_id: number | null
  staff_id: number | null
  created_at: string
}

export interface Player {
  id: number
  first_name: string
  last_name: string
  email: string
  gender: Gender
  class_year: ClassYear | null
  is_captain: boolean
  is_active: boolean
  created_at: string
  player_tags?: { tags: Tag }[]
}

export interface Staff {
  id: number
  first_name: string
  last_name: string
  email: string
  title: string
  role: StaffRole
  created_at: string
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface PlayerTag {
  player_id: number
  tag_id: number
}

export interface Event {
  id: number
  title: string
  event_type: EventType
  event_date: string
  start_time: string | null
  end_time: string | null
  location: string | null
  for_mens: boolean
  for_womens: boolean
  notes: string | null
  meeting_notes: string | null
  created_by: string | null
  created_at: string
  match_details?: MatchDetails | null
}

export interface MatchDetails {
  event_id: number
  opponent: string
  home_away: HomeAway
  mens_score: string | null
  womens_score: string | null
  result: MatchResult
}

export type TripScheduleCategory = 'travel' | 'match' | 'meal' | 'prep' | 'free' | 'recovery' | 'other'
export type TripMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type GroceryCategory = 'produce' | 'meat' | 'dairy' | 'bakery' | 'frozen' | 'canned' | 'dry_goods' | 'condiments' | 'spices' | 'breakfast' | 'snacks' | 'beverages' | 'household'
export type ShoppingTeam = 'alpha' | 'bravo' | 'charlie'
export type TripTaskCategory = 'cooking' | 'dishes' | 'cleanup' | 'shopping' | 'packing' | 'driving' | 'night_prep' | 'other'

export interface TripLogistics {
  condo?: { address: string; resort: string; check_in: string; check_out: string; bedrooms: number; notes: string }
  kitchen_equipment?: string[]
  fridge_zones?: Record<string, string>
  food_safety?: string[]
  nutrition_targets?: { kcal: number; carbs_g: number; protein_g: number; fat_g: number; hydration_oz: number }
  travel?: { van_count: number; driving_distances: Record<string, string> }
}

export interface Trip {
  id: number
  name: string
  destination: string
  departure_date: string
  return_date: string
  max_men: number
  max_women: number
  notes: string | null
  flight_info: string | null
  logistics: TripLogistics | null
  created_at: string
  trip_roster?: TripRoster[]
}

export interface TripScheduleEntry {
  id: number
  trip_id: number
  day_date: string
  start_time: string
  end_time: string | null
  title: string
  category: TripScheduleCategory
  description: string | null
  location: string | null
  drive_info: { destination: string; distance_mi: number; drive_time_min: number; route_notes?: string; i4_risk?: string } | null
  sort_order: number
}

export interface TripMeal {
  id: number
  trip_id: number
  day_date: string
  meal_type: TripMealType
  name: string
  description: string | null
  recipe_content: string | null
  prep_time_min: number | null
  cook_time_min: number | null
  nutrition: { kcal: number; carbs_g: number; protein_g: number; fat_g: number } | null
  sort_order: number
}

export interface TripGroceryItem {
  id: number
  trip_id: number
  item_name: string
  quantity: string | null
  estimated_price: number | null
  category: GroceryCategory
  shopping_team: ShoppingTeam | null
  meal_use: string | null
  is_purchased: boolean
  purchased_by: number | null
  purchaser?: Player
  sort_order: number
}

export interface TripTask {
  id: number
  trip_id: number
  day_date: string
  time_slot: string | null
  title: string
  description: string | null
  category: TripTaskCategory
  slots_needed: number
  sort_order: number
  signups?: TripTaskSignup[]
}

export interface TripTaskSignup {
  id: number
  task_id: number
  player_id: number
  signed_up_at: string
  completed_at: string | null
  player?: Player
}

export interface TripStaffMember {
  id: number
  trip_id: number
  staff_id: number | null
  name: string
  role_on_trip: string | null
  start_date: string | null
  end_date: string | null
  notes: string | null
}

export interface TripRoster {
  trip_id: number
  player_id: number
  status: TripStatus
  player?: Player
}

export interface Announcement {
  id: number
  title: string
  content: string
  priority: Priority
  for_mens: boolean
  for_womens: boolean
  publish_at: string
  expires_at: string | null
  created_by: string | null
  created_at: string
}

export interface Form {
  id: number
  title: string
  description: string | null
  due_date: string | null
  is_active: boolean
  for_mens: boolean
  for_womens: boolean
  target_tags: number[] | null
  created_by: string | null
  created_at: string
  form_questions?: FormQuestion[]
}

export interface FormQuestion {
  id: number
  form_id: number
  question_text: string
  question_type: QuestionType
  options: string[] | null
  is_required: boolean
  sort_order: number
}

export interface FormResponse {
  id: number
  form_id: number
  player_id: number
  responses: Record<string, string | string[] | boolean>
  submitted_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      players: {
        Row: Omit<Player, 'player_tags'>
        Insert: Omit<Player, 'id' | 'created_at' | 'player_tags'>
        Update: Partial<Omit<Player, 'id' | 'created_at' | 'player_tags'>>
        Relationships: []
      }
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'id' | 'created_at'>
        Update: Partial<Omit<Staff, 'id' | 'created_at'>>
        Relationships: []
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id'>
        Update: Partial<Omit<Tag, 'id'>>
        Relationships: []
      }
      player_tags: {
        Row: Omit<PlayerTag, 'player' | 'tags'>
        Insert: Omit<PlayerTag, 'player' | 'tags'>
        Update: Partial<Omit<PlayerTag, 'player' | 'tags'>>
        Relationships: []
      }
      events: {
        Row: Omit<Event, 'match_details'>
        Insert: Omit<Event, 'id' | 'created_at' | 'match_details'>
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'match_details'>>
        Relationships: []
      }
      match_details: {
        Row: MatchDetails
        Insert: MatchDetails
        Update: Partial<MatchDetails>
        Relationships: []
      }
      trips: {
        Row: Omit<Trip, 'trip_roster'>
        Insert: Omit<Trip, 'id' | 'created_at' | 'trip_roster'>
        Update: Partial<Omit<Trip, 'id' | 'created_at' | 'trip_roster'>>
        Relationships: []
      }
      trip_schedule: {
        Row: TripScheduleEntry
        Insert: Omit<TripScheduleEntry, 'id'>
        Update: Partial<Omit<TripScheduleEntry, 'id'>>
        Relationships: []
      }
      trip_meals: {
        Row: TripMeal
        Insert: Omit<TripMeal, 'id'>
        Update: Partial<Omit<TripMeal, 'id'>>
        Relationships: []
      }
      trip_grocery_items: {
        Row: Omit<TripGroceryItem, 'purchaser'>
        Insert: Omit<TripGroceryItem, 'id' | 'purchaser'>
        Update: Partial<Omit<TripGroceryItem, 'id' | 'purchaser'>>
        Relationships: []
      }
      trip_tasks: {
        Row: Omit<TripTask, 'signups'>
        Insert: Omit<TripTask, 'id' | 'signups'>
        Update: Partial<Omit<TripTask, 'id' | 'signups'>>
        Relationships: []
      }
      trip_task_signups: {
        Row: Omit<TripTaskSignup, 'player'>
        Insert: Omit<TripTaskSignup, 'id' | 'signed_up_at' | 'player'>
        Update: Partial<Omit<TripTaskSignup, 'id' | 'signed_up_at' | 'player'>>
        Relationships: []
      }
      trip_staff_roster: {
        Row: TripStaffMember
        Insert: Omit<TripStaffMember, 'id'>
        Update: Partial<Omit<TripStaffMember, 'id'>>
        Relationships: []
      }
      trip_roster: {
        Row: Omit<TripRoster, 'player'>
        Insert: Omit<TripRoster, 'player'>
        Update: Partial<Omit<TripRoster, 'player'>>
        Relationships: []
      }
      announcements: {
        Row: Announcement
        Insert: Omit<Announcement, 'id' | 'created_at'>
        Update: Partial<Omit<Announcement, 'id' | 'created_at'>>
        Relationships: []
      }
      forms: {
        Row: Omit<Form, 'form_questions'>
        Insert: Omit<Form, 'id' | 'created_at' | 'form_questions'>
        Update: Partial<Omit<Form, 'id' | 'created_at' | 'form_questions'>>
        Relationships: []
      }
      form_questions: {
        Row: FormQuestion
        Insert: Omit<FormQuestion, 'id'>
        Update: Partial<Omit<FormQuestion, 'id'>>
        Relationships: []
      }
      form_responses: {
        Row: FormResponse
        Insert: Omit<FormResponse, 'id' | 'submitted_at'>
        Update: Partial<Omit<FormResponse, 'id' | 'submitted_at'>>
        Relationships: []
      }
      notes: {
        Row: Note
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      note_shares: {
        Row: NoteShare
        Insert: NoteShare
        Update: Partial<NoteShare>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
