import type { Database } from '@/types/supabase'

export type Resource = Database['public']['Tables']['resource']['Row']
export type ResourceInsert = Database['public']['Tables']['resource']['Insert']
export type ResourceUpdate = Database['public']['Tables']['resource']['Update']

export type ResourceType = Database['public']['Tables']['resource_types']['Row']
export type ResourceTypeInsert = Database['public']['Tables']['resource_types']['Insert']
export type ResourceTypeUpdate = Database['public']['Tables']['resource_types']['Update']

export type Municipality = Database['public']['Tables']['municipality']['Row']
export type MunicipalityInsert = Database['public']['Tables']['municipality']['Insert']
export type MunicipalityUpdate = Database['public']['Tables']['municipality']['Update']

export type UserProfile = Database['public']['Tables']['users']['Row']
export type UserProfileInsert = Database['public']['Tables']['users']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['users']['Update']

export type StatusLog = Database['public']['Tables']['status_logs']['Row']
export type StatusLogInsert = Database['public']['Tables']['status_logs']['Insert']
export type StatusLogUpdate = Database['public']['Tables']['status_logs']['Update']