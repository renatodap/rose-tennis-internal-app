'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Player } from '@/types/database'

interface UseUserReturn {
  user: User | null
  profile: Profile | null
  player: Player | null
  loading: boolean
  isAuthenticated: boolean
  isCoach: boolean
  isAdmin: boolean
  isPlayer: boolean
  isCaptain: boolean
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Get profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          const typedProfile = profileData as Profile | null
          setProfile(typedProfile)

          // If profile has player_id, get player data to check is_captain
          if (typedProfile?.player_id) {
            const { data: playerData } = await supabase
              .from('players')
              .select('*')
              .eq('id', typedProfile.player_id)
              .maybeSingle()
            setPlayer(playerData as Player | null)
          } else {
            setPlayer(null)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle()
            const typedProfile = profileData as Profile | null
            setProfile(typedProfile)

            if (typedProfile?.player_id) {
              const { data: playerData } = await supabase
                .from('players')
                .select('*')
                .eq('id', typedProfile.player_id)
                .maybeSingle()
              setPlayer(playerData as Player | null)
            } else {
              setPlayer(null)
            }
          } catch (error) {
            console.error('Error fetching profile:', error)
          }
        } else {
          setProfile(null)
          setPlayer(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAdmin = profile?.role === 'admin'
  const isCaptain = player?.is_captain === true
  const isCoach = profile?.role === 'coach' || profile?.role === 'admin' || isCaptain

  return {
    user,
    profile,
    player,
    loading,
    isAuthenticated: !!user,
    isCoach,
    isAdmin,
    isPlayer: profile?.role === 'player',
    isCaptain,
  }
}
