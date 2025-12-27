"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function useLogout() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return { logout }
}
