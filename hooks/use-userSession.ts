"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

type Profile = {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

type UserSessionState = {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
}

export function useUserSession(): UserSessionState {
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      setLoading(true)

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (error || !user) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, created_at")
        .eq("id", user.id)
        .maybeSingle()

      if (!isMounted) return

      if (profileError) {
        // IMPORTANT:
        // We do NOT auto-create a profile here.
        // Profile creation is an explicit onboarding flow.
        setProfile(null)
      } else {
        setProfile(profileData)
      }

      setLoading(false)
    }

    loadSession()

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
    profile,
    loading,
    isAuthenticated: Boolean(user),
  }
}
