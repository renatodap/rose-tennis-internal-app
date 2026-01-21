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

// Create user manually using Admin API (bypasses the failing trigger)
export async function createUserManually(email: string, password: string): Promise<{ success: boolean; message: string; userId?: string }> {
  const supabaseAdmin = getAdminClient()
  if (!supabaseAdmin) {
    return { success: false, message: 'Admin client not available' }
  }

  try {
    // Check if user already exists
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users?.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      // Check if they have a profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', existingUser.id)
        .single()

      if (profile) {
        return { success: false, message: 'Account already exists. Please sign in.' }
      }

      // User exists but no profile - delete and recreate
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
    }

    // Find the player/staff record
    const { data: player } = await supabaseAdmin
      .from('players')
      .select('id, is_captain')
      .eq('email', email.toLowerCase())
      .single()

    const { data: staff } = await supabaseAdmin
      .from('staff')
      .select('id, role')
      .eq('email', email.toLowerCase())
      .single()

    // Determine role
    let role = 'pending'
    if (staff) {
      role = staff.role === 'head_coach' ? 'admin' : 'coach'
    } else if (player) {
      role = player.is_captain ? 'captain' : 'player'
    }

    // Create user with Admin API
    // Note: The database trigger will automatically create the profile
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(), // Ensure lowercase for consistency
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (createError || !newUser.user) {
      console.error('Error creating user:', createError)
      return { success: false, message: createError?.message || 'Failed to create user' }
    }

    // Check if trigger created the profile, if not create it manually
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', newUser.user.id)
      .single()

    if (!existingProfile) {
      // Trigger didn't create profile, create manually
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          email: email.toLowerCase(),
          role,
          player_id: player?.id || null,
          staff_id: staff?.id || null,
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Try to cleanup the user we just created
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
        return { success: false, message: `Profile creation failed: ${profileError.message}` }
      }
    }

    return { success: true, message: 'Account created successfully!', userId: newUser.user.id }
  } catch (err) {
    console.error('Error in createUserManually:', err)
    return { success: false, message: 'An unexpected error occurred' }
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
