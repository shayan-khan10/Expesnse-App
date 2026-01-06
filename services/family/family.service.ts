import { createClient } from "@/lib/supabase/client"

export type Family = {
    id: string
    name: string
    join_code: string
    monthly_spending_limit: number | null
    created_at: string
}

export type UpdateFamilyData = {
    name?: string
    monthly_spending_limit?: number | null
}

/**
 * Create a new family using RPC.
 * Returns the new family ID.
 */
export async function createFamily(name: string): Promise<string> {
    const supabase = createClient()

    const { data: familyId, error } = await supabase.rpc("create_family", {
        family_name: name.trim(),
    })

    if (error) {
        throw new Error(`Failed to create family: ${error.message}`)
    }

    return familyId
}

/**
 * Join a family using RPC.
 * Returns the joined family ID.
 */
export async function joinFamily(joinCode: string): Promise<string> {
    const supabase = createClient()

    const { data: familyId, error } = await supabase.rpc("join_family", {
        input_join_code: joinCode.trim(),
    })

    if (error) {
        throw new Error(`Failed to join family: ${error.message}`)
    }

    return familyId
}

/**
 * Leave the current family using RPC.
 */
export async function leaveFamily(): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.rpc("leave_family")

    if (error) {
        throw new Error(`Failed to leave family: ${error.message}`)
    }
}

/**
 * Update family details using RPC.
 * Allowed for Admins.
 */
export async function updateFamily(
    familyId: string, // Unused in RPC (uses auth context), but kept for signature comp
    data: UpdateFamilyData
): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.rpc("update_family", {
        new_name: data.name?.trim() || null,
        new_limit: data.monthly_spending_limit
    })

    if (error) {
        throw new Error(`Failed to update family: ${error.message}`)
    }
}

/**
 * Delete a family using RPC.
 * Allowed for Admins via RPC.
 */
export async function deleteFamily(familyId: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.rpc("delete_family")

    if (error) {
        throw new Error(`Failed to delete family: ${error.message}`)
    }
}

/**
 * Regenerate the join code for a family using the RPC.
 */
export async function regenerateJoinCode(familyId: string): Promise<string> {
    const supabase = createClient()

    const { data: newCode, error } = await supabase.rpc("regenerate_family_code")

    if (error) {
        throw new Error(`Failed to regenerate join code: ${error.message}`)
    }

    return newCode
}
