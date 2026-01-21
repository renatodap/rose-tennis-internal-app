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

  useEffect(() => {
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

    // Timeout wrapper to prevent getUser() from hanging indefinitely
    // Known Supabase bug: https://github.com/supabase/supabase/issues/35754
    const getAuthWithTimeout = async (timeoutMs: number = 5000) => {
      const timeoutPromise = new Promise<{ data: { user: null }, error: Error }>((resolve) => {
        setTimeout(() => {
          console.warn('Auth getUser() timed out after', timeoutMs, 'ms')
          resolve({ data: { user: null }, error: new Error('Auth timeout') })
        }, timeoutMs)
      })

      return Promise.race([
        supabase.auth.getUser(),
        timeoutPromise
      ])
    }

    // Initial fetch
    const initAuth = async () => {
      try {
        const { data: { user: authUser }, error } = await getAuthWithTimeout(5000)
        if (error) {
          console.error('Auth error:', error)
        }
        await fetchUserData(authUser)
      } catch (error) {
        console.error('Init auth error:', error)
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
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
