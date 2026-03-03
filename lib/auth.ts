import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";

export type UserRole = 'admin' | 'responder' | 'viewer'

export interface AuthUser {
    id: string
    email: string
    role: UserRole
}

const supabase = createClient()

export async function signIn(email: string, password: string) {
    const { data, error}= await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error
    return data
}

export async function signUp(email: string, password: string, role: UserRole = 'viewer') {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role,
                full_name: '',
            }
        }
    })

    if (error) throw error
    return data
}

export async function signOut() {
    const {error} = await supabase.auth.signOut()
    if (error) throw error
}

export async function getCurrentUser(): Promise<AuthUser | null>{
    const {data: {user}, error:authError} = await supabase.auth.getUser()

    if (authError || !user) return null

    const { data: profile, error: profileError} = await supabase
        .from('users')
        .select('user_id, email, role')
        .eq('user_id', user.id)
        .single()

    if (profileError || !profile) return null

    return {
        id: profile.user_id,
        email: profile.email,
        role: profile.role as UserRole,
    }
}

export async function updateUserRole(userId: string, role:UserRole) {
    const {error} = await supabase
        .from('users')
        .update({role})
        .eq('user_id', userId)
    
    if (error) throw error
}

export function onAuthStateChange(callback: (event: string, session:any) => void) {
    return supabase.auth.onAuthStateChange(callback)
}