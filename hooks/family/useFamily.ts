"use client"

import { useState, useEffect, useCallback } from "react"
import { useUserSession } from "@/hooks/use-userSession"
import { type Family } from "@/services/family/family.service"
import {
    getFamilyMembers,
    type FamilyMember,
} from "@/services/family/familyMembers.service"

export type FamilyState = {
    family: Family | null
    members: FamilyMember[]
    isAdmin: boolean
    loading: boolean
    error: Error | null
    refetch: () => Promise<void>
}

/**
 * Read-only hook for family state.
 * Strictly sources Identity & Family Metadata from useUserSession (get_my_context).
 * Sources Members from getFamilyMembers (RPC).
 * REST CALLS BANNED.
 */
export function useFamily(): FamilyState {
    const { userContext, loading: sessionLoading, refreshContext } = useUserSession()

    const [members, setMembers] = useState<FamilyMember[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Construct Family object from Context
    const family: Family | null =
        userContext?.family_id && userContext.family_name
            ? {
                id: userContext.family_id,
                name: userContext.family_name,
                join_code: userContext.join_code ?? "",
                monthly_spending_limit: userContext.monthly_spending_limit,
                created_at: "", // Not available in context, and likely not needed for UI?
            }
            : null

    const fetchMembers = useCallback(async () => {
        if (!userContext?.family_id) {
            setMembers([])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const membersData = await getFamilyMembers()
            setMembers(membersData)
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Unknown error"))
        } finally {
            setLoading(false)
        }
    }, [userContext?.family_id])

    useEffect(() => {
        if (!sessionLoading) {
            fetchMembers()
        }
    }, [sessionLoading, fetchMembers])

    const refetch = async () => {
        // Refreshing session (context) updates Family Metadata
        await refreshContext()
        // Refreshing members updates list
        await fetchMembers()
    }

    return {
        family,
        members,
        isAdmin: userContext?.role === "admin",
        loading: sessionLoading || loading,
        error,
        refetch,
    }
}
