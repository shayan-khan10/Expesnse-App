import { createClient } from "@/lib/supabase/client"

export type FamilyMember = {
    user_id: string
    family_id: string
    role: "admin" | "member"
    joined_at: string
    profile: {
        id: string
        username: string
        avatar_url: string | null
    }
}

/**
 * Fetch all members of the current user's family.
 * Uses `get_family_members` RPC.
 */
export async function getFamilyMembers(): Promise<FamilyMember[]> {
    const supabase = createClient()

    // RPC takes no arguments, uses auth context
    const { data: members, error } = await supabase.rpc("get_family_members")

    if (error) {
        throw new Error(`Failed to fetch members: ${error.message}`)
    }

    // Map RPC result to FamilyMember type with nested profile logic
    return (members as any[]).map((m) => ({
        user_id: m.user_id,
        family_id: "", // Placeholder
        role: m.role,
        joined_at: m.joined_at,
        profile: {
            id: m.user_id,
            username: m.username,
            avatar_url: m.avatar_url,
        },
    }))
}

/**
 * Remove a member from the family by their user_id.
 * Uses `kick_member` RPC.
 */
export async function removeMember(userId: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.rpc("kick_member", {
        target_user_id: userId
    })

    if (error) {
        throw new Error(`Failed to remove member: ${error.message}`)
    }
}

/**
 * Update a member's role.
 * Uses `update_member_role` RPC.
 */
export async function updateMemberRole(
    userId: string,
    role: "admin" | "member"
): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.rpc("update_member_role", {
        target_user_id: userId,
        new_role: role
    })

    if (error) {
        throw new Error(`Failed to update role: ${error.message}`)
    }
}
