import { createClient } from '@/utils/supabase/client'
import type { Resource, ResourceInsert, ResourceUpdate } from './database.types'

const supabase = createClient()

// READ - Public
export async function getAllResources() {
  const { data } = await supabase.from('resource').select('*')
  return data || []
}

export async function getResourceById(id: string) {
  const { data } = await supabase.from('resource').select('*').eq('resource_id', id).single()
  return data
}

export async function getResourcesByMunicipality(municipalityId: string) {
  const { data } = await supabase.from('resource').select('*').eq('municipality_id', municipalityId)
  return data || []
}

export async function getResourcesByType(typeId: string) {
  const { data } = await supabase.from('resource').select('*').eq('type_id', typeId)
  return data || []
}

// WRITE - Requires responder/admin
export async function createResource(data: ResourceInsert, userId: string) {
  const { data: resource, error } = await supabase
    .from('resource')
    .insert({ ...data, added_by: userId })
    .select()
    .single()
  if (error) throw error
  return resource
}

export async function updateResource(id: string, data: ResourceUpdate) {
  const { data: resource, error } = await supabase
    .from('resource')
    .update(data)
    .eq('resource_id', id)
    .select()
    .single()
  if (error) throw error
  return resource
}

export async function updateResourceStatus(id: string, status: string) {
  const { data: resource, error } = await supabase
    .from('resource')
    .update({ status })
    .eq('resource_id', id)
    .select()
    .single()
  if (error) throw error
  return resource
}

export async function deleteResource(id: string) {
  const { error } = await supabase.from('resource').delete().eq('resource_id', id)
  if (error) throw error
}

// WITH DETAILS (Joins)
export async function getAllResourcesWithDetails() {
  const { data, error } = await supabase
    .from('resource')
    .select('*, resource_types(code, full_name), municipality(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
