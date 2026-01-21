'use client'

import { useEffect, useState, useRef } from 'react'
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
  const mountedRef = useRef(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent double-initialization in React Strict Mode
    if (initializedRef.current) return
    initializedRef.current = true
    mountedRef.current = true

    const supabase = createClient()

    const fetchUserData = async (authUser: User | null) => {
      if (!mountedRef.current) return

      if (!authUser) {
        setUser(null)
        setProfile(null)
        setPlayer(null)
        setLoading(false)
        return
      }

      setUser(authUser)

      try {
        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
        }

        if (!mountedRef.current) return

        const typedProfile = profileData as Profile | null
        setProfile(typedProfile)

        // If profile has player_id, get player data
        if (typedProfile?.player_id) {
          const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('id', typedProfile.player_id)
            .maybeSingle()

          if (playerError) {
            console.error('Player fetch error:', playerError)
          }

          if (!mountedRef.current) return
          setPlayer(playerData as Player | null)
        } else {
          setPlayer(null)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    // Initial fetch using getSession() - reads from storage, doesn't hang
    // getUser() can hang indefinitely: https://github.com/supabase/supabase/issues/35754
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Session error:', error)
        }
        await fetchUserData(session?.user ?? null)
      } catch (error) {
        console.error('Init auth error:', error)
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes - this handles login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mountedRef.current) return
        await fetchUserData(session?.user ?? null)
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
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
