import { SupabaseClient } from "@supabase/supabase-js"

export async function updateUsername(
  supabase: SupabaseClient,
  username: string
): Promise<void> {
  if (!username.trim()) {
    throw new Error("Username cannot be empty")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id)

  if (error) {
    throw error
  }
}