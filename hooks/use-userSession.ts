"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export type UserContext = {
  user_id: string
  username: string
  avatar_url: string | null
  family_id: string | null
  role: "admin" | "member" | null
  family_name: string | null
  join_code: string | null
  monthly_spending_limit: number | null
}

export type UserSessionState = {
  user: User | null
  userContext: UserContext | null
  loading: boolean
  isAuthenticated: boolean
  refreshContext: () => Promise<void>
}

export function useUserSession(): UserSessionState {
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSession = async () => {
    try {
      setLoading(true)

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        setUser(null)
        setUserContext(null)
        return
      }

      setUser(user)

      // Call RPC to get context (profile + membership)
      // This is the SINGLE canonical source of truth for identity
      const { data: context, error: contextError } = await supabase.rpc("get_my_context")

      if (contextError) {
        // If RPC fails, we are in a bad state, but user is authenticated.
        console.error("Failed to fetch user context:", contextError)
        setUserContext(null)
      } else {
        // RPC returns a single row. If no profile, it might be empty?
        // Query: SELECT ... FROM profiles ... LEFT JOIN family_members ...
        // It returns 0 rows if no profile matches auth.uid().
        // It returns 1 row if profile exists.

        if (context && context.length > 0) {
          // RPC returns array of rows. logic implies 1 row.
          setUserContext(context[0] as UserContext)
        } else {
          // Should not happen if profile is auto-created, but handle safely
          setUserContext(null)
        }
      }
    } catch (err) {
      console.error("Session load error:", err)
      setUser(null)
      setUserContext(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    loadSession().then(() => {
      if (!isMounted) return
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSession()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    userContext,
    loading,
    isAuthenticated: Boolean(user),
    refreshContext: loadSession,
  }
}
