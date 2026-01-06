"use client"

import { useFamily } from "@/hooks/family/useFamily"
import { useFamilyActions } from "@/hooks/family/useFamilyActions"
import { useUserSession } from "@/hooks/use-userSession"
import { EmptyFamilyState } from "@/components/family/EmptyFamilyState"
import { FamilyHeader } from "@/components/family/FamilyHeader"
import { InviteSection } from "@/components/family/InviteSection"
import { MembersList, type MemberAction } from "@/components/family/MembersList"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingState() {
    return (
        <div className="p-6">
            <div className="flex flex-col items-center justify-center mx-8">
                <Skeleton className="h-10 w-48 rounded-full mb-8" />
                <Skeleton className="h-10 w-72 rounded-full mb-24" />
                <Skeleton className="h-36 w-80 rounded-lg mb-8" />
                <Skeleton className="h-36 w-80 rounded-lg" />
            </div>
        </div>
    )
}

export default function FamilyPage() {
    const { user } = useUserSession()
    const familyState = useFamily()
    const actions = useFamilyActions(familyState)

    const { family, members, isAdmin, loading } = familyState

    if (loading) {
        return <LoadingState />
    }

    if (!family) {
        return <EmptyFamilyState actions={actions} />
    }

    // Handler for member actions - only provided if user is admin
    const handleMemberAction = isAdmin
        ? async (action: MemberAction) => {
            switch (action.type) {
                case "promote":
                    await actions.changeMemberRole(action.userId, "admin")
                    break
                case "demote":
                    await actions.changeMemberRole(action.userId, "member")
                    break
                case "kick":
                    await actions.kickMember(action.userId)
                    break
            }
        }
        : undefined

    return (
        <div className="p-6 space-y-6">
            <FamilyHeader family={family} isAdmin={isAdmin} actions={actions} />
            <InviteSection family={family} actions={actions} />
            <MembersList
                members={members}
                currentUserId={user?.id ?? ""}
                onMemberAction={handleMemberAction}
            />
        </div>
    )
}