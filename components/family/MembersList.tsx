"use client"

import { Users, Crown, User, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { FamilyMember } from "@/services/family/familyMembers.service"

export type MemberAction = {
    type: "promote" | "demote" | "kick"
    userId: string
}

type MembersListProps = {
    members: FamilyMember[]
    currentUserId: string
    /** Actions available for admin to perform on other members */
    onMemberAction?: (action: MemberAction) => void
}

/**
 * Members list component.
 * Parent decides which actions to pass (no internal isAdmin check).
 */
export function MembersList({ members, currentUserId, onMemberAction }: MembersListProps) {
    const canManageMembers = !!onMemberAction

    const handlePromote = (userId: string) => {
        onMemberAction?.({ type: "promote", userId })
    }

    const handleDemote = (userId: string) => {
        onMemberAction?.({ type: "demote", userId })
    }

    const handleKick = (userId: string) => {
        onMemberAction?.({ type: "kick", userId })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Family Members ({members.length})
                </CardTitle>
                <CardDescription>Manage family members and their roles.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {members.map((member) => {
                        const isCurrentUser = member.user_id === currentUserId
                        const canManage = canManageMembers && !isCurrentUser

                        const memberCard = (
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        {member.role === "admin" ? (
                                            <Crown className="h-4 w-4 text-primary" />
                                        ) : (
                                            <User className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.profile.username}</p>
                                    </div>
                                </div>
                                <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                                    {member.role}
                                </Badge>
                            </div>
                        )

                        if (!canManage) {
                            return <div key={member.user_id}>{memberCard}</div>
                        }

                        return (
                            <DropdownMenu key={member.user_id}>
                                <DropdownMenuTrigger asChild>
                                    <div className="cursor-pointer">{memberCard}</div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {member.role === "member" && (
                                        <DropdownMenuItem onClick={() => handlePromote(member.user_id)}>
                                            <Crown className="h-4 w-4 mr-2" />
                                            Make Admin
                                        </DropdownMenuItem>
                                    )}
                                    {member.role === "admin" && (
                                        <DropdownMenuItem onClick={() => handleDemote(member.user_id)}>
                                            <User className="h-4 w-4 mr-2" />
                                            Remove Admin
                                        </DropdownMenuItem>
                                    )}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                <Trash2 className="text-destructive h-4 w-4 mr-2" />
                                                Remove Member
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to remove{" "}
                                                    <strong>{member.profile.username}</strong> from the family? This action
                                                    cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleKick(member.user_id)}
                                                    className="bg-destructive text-primary hover:bg-destructive/90"
                                                >
                                                    Remove Member
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
