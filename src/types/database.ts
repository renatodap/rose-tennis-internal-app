export type UserRole = 'player' | 'coach' | 'admin' | 'pending'
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
  created_at: string
  trip_roster?: TripRoster[]
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
      }
      players: {
        Row: Player
        Insert: Omit<Player, 'id' | 'created_at'>
        Update: Partial<Omit<Player, 'id' | 'created_at'>>
      }
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'id' | 'created_at'>
        Update: Partial<Omit<Staff, 'id' | 'created_at'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id'>
        Update: Partial<Omit<Tag, 'id'>>
      }
      player_tags: {
        Row: PlayerTag
        Insert: PlayerTag
        Update: Partial<PlayerTag>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at'>
        Update: Partial<Omit<Event, 'id' | 'created_at'>>
      }
      match_details: {
        Row: MatchDetails
        Insert: MatchDetails
        Update: Partial<MatchDetails>
      }
      trips: {
        Row: Trip
        Insert: Omit<Trip, 'id' | 'created_at'>
        Update: Partial<Omit<Trip, 'id' | 'created_at'>>
      }
      trip_roster: {
        Row: TripRoster
        Insert: TripRoster
        Update: Partial<TripRoster>
      }
      announcements: {
        Row: Announcement
        Insert: Omit<Announcement, 'id' | 'created_at'>
        Update: Partial<Omit<Announcement, 'id' | 'created_at'>>
      }
      forms: {
        Row: Form
        Insert: Omit<Form, 'id' | 'created_at'>
        Update: Partial<Omit<Form, 'id' | 'created_at'>>
      }
      form_questions: {
        Row: FormQuestion
        Insert: Omit<FormQuestion, 'id'>
        Update: Partial<Omit<FormQuestion, 'id'>>
      }
      form_responses: {
        Row: FormResponse
        Insert: Omit<FormResponse, 'id' | 'submitted_at'>
        Update: Partial<Omit<FormResponse, 'id' | 'submitted_at'>>
      }
    }
  }
}
