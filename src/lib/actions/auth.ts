'use server'

import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase environment variables')
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Check if email exists in players or staff tables
// Uses service role to bypass RLS
export async function checkEmailWhitelist(email: string): Promise<boolean> {
  const supabaseAdmin = getAdminClient()
  if (!supabaseAdmin) return true // Allow signup if we can't check

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
    return true
  }
}

// Clean up any orphaned auth user for an email (helps with retry after failed signup)
export async function cleanupOrphanedUser(email: string): Promise<{ success: boolean; message: string }> {
  const supabaseAdmin = getAdminClient()
  if (!supabaseAdmin) {
    return { success: false, message: 'Admin client not available' }
  }

  try {
    // First, try to find user by email in auth.users
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return { success: false, message: 'Failed to list users' }
    }

    const existingUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!existingUser) {
      return { success: true, message: 'No existing user found' }
    }

    // Check if user has a profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', existingUser.id)
      .single()

    if (profile) {
      // User has a profile - they should sign in instead
      return { success: false, message: 'Account exists. Please sign in instead.' }
    }

    // User exists but has no profile - orphaned state
    // Delete the orphaned user so they can sign up again
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id)

    if (deleteError) {
      console.error('Error deleting orphaned user:', deleteError)
      return { success: false, message: 'Failed to cleanup orphaned user' }
    }

    return { success: true, message: 'Cleaned up orphaned user, please try again' }
  } catch (err) {
    console.error('Error in cleanupOrphanedUser:', err)
    return { success: false, message: 'An error occurred' }
  }
}
