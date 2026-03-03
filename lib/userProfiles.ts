import { createClient } from '@/utils/supabase/client'
import type { UserProfile, UserProfileUpdate } from './database.types'

const supabase = createClient()

// ============================================
// USER PROFILES
// ============================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(
  userId: string,
  data: UserProfileUpdate
): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('users')
    .update(data)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return profile
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUsersByRole(role: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
