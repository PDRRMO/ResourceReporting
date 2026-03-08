import { createClient } from '@/utils/supabase/client'

// ============================================
// MUNICIPALITIES
// ============================================

const supabase = createClient()

export async function getAllMunicipalities() {
  
  const { data, error } = await supabase
    .from('municipality')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getMunicipalityByName(name: string) {
  
  const { data, error } = await supabase
    .from('municipality')
    .select('*')
    .eq('name', name)
    .single()

  if (error) throw error
  return data
}

export async function getMunicipalityById(id: string) {
  
  const { data, error } = await supabase
    .from('municipality')
    .select('*')
    .eq('municipality_id', id)
    .single()

  if (error) throw error
  return data
}
