"use client"

import { toast } from "sonner"
import type { FamilyState } from "./useFamily"
import {
    createFamily as createFamilyService,
    updateFamily as updateFamilyService,
    deleteFamily as deleteFamilyService,
    joinFamily as joinFamilyService,
    leaveFamily as leaveFamilyService,
    regenerateJoinCode as regenerateJoinCodeService,
    type UpdateFamilyData,
} from "@/services/family/family.service"
import {
    removeMember,
    updateMemberRole as updateMemberRoleService,
} from "@/services/family/familyMembers.service"

export type FamilyActions = {
    createFamily: (data: { name: string; monthly_spending_limit?: number | null }) => Promise<void>
    joinFamily: (joinCode: string) => Promise<void>
    updateFamily: (data: UpdateFamilyData) => Promise<void>
    deleteFamily: () => Promise<void>
    leaveFamily: () => Promise<void>
    kickMember: (userId: string) => Promise<void>
    changeMemberRole: (userId: string, role: "admin" | "member") => Promise<void>
    regenerateJoinCode: () => Promise<void>
}

/**
 * Actions hook for family mutations.
 * Uses RPC services.
 * Triggers full state refetch (including session context) after mutations.
 */
export function useFamilyActions(familyState: FamilyState): FamilyActions {
    const { family, refetch } = familyState

    const createFamily = async (data: {
        name: string
        monthly_spending_limit?: number | null
    }): Promise<void> => {
        try {
            const familyId = await createFamilyService(data.name)
            // If spending limit provided, update it now (create RPC only takes name)
            if (data.monthly_spending_limit !== undefined && data.monthly_spending_limit !== null) {
                await updateFamilyService(familyId, { monthly_spending_limit: data.monthly_spending_limit })
            }
            toast.success("Family created successfully!")
            await refetch()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create family"
            toast.error(message)
            throw err
        }
    }

    const joinFamily = async (joinCode: string): Promise<void> => {
        try {
            await joinFamilyService(joinCode)
            toast.success("Successfully joined the family!")
            await refetch()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to join family"
            toast.error(message)
            throw err
        }
    }

    const updateFamily = async (data: UpdateFamilyData): Promise<void> => {
        if (!family) {
            throw new Error("No family to update")
        }
        try {
            await updateFamilyService(family.id, data)
            toast.success("Family updated successfully!")
            await refetch()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update family"
            toast.error(message)
            throw err
        }
    }

    const deleteFamily = async (): Promise<void> => {
        if (!family) {
            throw new Error("No family to delete")
        }
        try {
            await deleteFamilyService(family.id)
            toast.success("Family deleted successfully!")
            await refetch()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete family"
            toast.error(message)
            throw err
        }
    }

    const leaveFamily = async (): Promise<void> => {
        try {
            await leaveFamilyService()
            toast.success("You have left the family")
            await refetch()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to leave family"
            toast.error(message)
            throw err
        }
    }

    const kickMember = async (userId: string): Promise<void> => {
        try {
            // Logic for kicking OTHER members
            await removeMember(userId)
            toast.success("Member removed successfully")
            await refetch()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to remove member"
            toast.error(message)
            throw err
        }
    }

    const changeMemberRole = async (
        userId: string,
        role: "admin" | "member"
    ): Promise<void> => {
        try {
            await updateMemberRoleService(userId, role)
            toast.success(`Member role updated to ${role}`)
            await refetch()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update role"
            toast.error(message)
            throw err
        }
    }

    const regenerateJoinCode = async (): Promise<void> => {
        if (!family) {
            throw new Error("No family")
        }
        try {
            await regenerateJoinCodeService(family.id)
            toast.success("Join code regenerated!")
            await refetch()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to regenerate code"
            toast.error(message)
            throw err
        }
    }

    return {
        createFamily,
        joinFamily,
        updateFamily,
        deleteFamily,
        leaveFamily,
        kickMember,
        changeMemberRole,
        regenerateJoinCode,
    }
}
