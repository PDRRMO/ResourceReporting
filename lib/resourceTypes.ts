import { createClient } from '@/utils/supabase/client'

// ============================================
// RESOURCE TYPES
// ============================================

const supabase = createClient()

export async function getAllResourceTypes() {
  const { data, error } = await supabase
    .from('resource_types')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getResourceTypeByCode(code: string) {
  const { data, error } = await supabase
    .from('resource_types')
    .select('*')
    .eq('code', code)
    .single()

  if (error) throw error
  return data
}

export async function getResourceTypeById(id: string) {
  const { data, error } = await supabase
    .from('resource_types')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}