'use server'

import { createClient } from '@supabase/supabase-js'

// Check if email exists in players or staff tables
// Uses service role to bypass RLS
export async function checkEmailWhitelist(email: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase environment variables for whitelist check')
    // If we can't check, allow signup and let Supabase handle it
    return true
  }

  // Create admin client that bypasses RLS
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Check players table
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (playerError && playerError.code !== 'PGRST116') {
      console.error('Error checking player whitelist:', playerError)
    }

    if (player) return true

    // Check staff table
    const { data: staffMember, error: staffError } = await supabaseAdmin
      .from('staff')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (staffError && staffError.code !== 'PGRST116') {
      console.error('Error checking staff whitelist:', staffError)
    }

    return !!staffMember
  } catch (err) {
    console.error('Error in checkEmailWhitelist:', err)
    // On error, allow signup and let other validation handle it
    return true
  }
}
