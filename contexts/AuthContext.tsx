"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { signIn, signUp, signOut, getCurrentUser, onAuthStateChange, type AuthUser, type UserRole} from "@/lib/auth"

interface AuthContextType {
    user: User | null
    authUser: AuthUser | null
    role: UserRole | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, role?: UserRole) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null)
    const [authUser, setAuthUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getCurrentUser().then((profile) => {
            setAuthUser(profile)
            setLoading(false)
        })

    const { data: { subscription}} = onAuthStateChange(async (event, session) => {
        if (session?.user) {
            setUser(session.user)
            const profile = await getCurrentUser()
            setAuthUser(profile)
        } else {
            setUser(null)
            setAuthUser(null)
        }
    })
        return () => subscription.unsubscribe()
    }, []) 

    const handleSignIn = async (email: string, password: string) => {
        const {user} = await signIn(email, password)
        const profile = await getCurrentUser()
        setUser(user)
        setAuthUser(profile)
    }

    const handleSignUp = async (email: string, password: string, role: UserRole = "viewer") => {
        await signUp(email, password, role)
    }

    const handleSignOut = async () => {
        await signOut()
        setUser(null)
        setAuthUser(null)
    }

    return (
        <AuthContext.Provider
            value = {{
                user,
                authUser,
                role: authUser?.role ?? null,
                loading,
                signIn: handleSignIn,
                signUp: handleSignUp,
                signOut: handleSignOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}