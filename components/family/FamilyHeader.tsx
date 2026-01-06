"use client"

import { useState } from "react"
import { Settings, Trash2, DoorOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditFamilyDialog } from "./dialogs/EditFamilyDialog"
import { DeleteFamilyDialog } from "./dialogs/DeleteFamilyDialog"
import { LeaveFamilyDialog } from "./dialogs/LeaveFamilyDialog"
import type { Family } from "@/services/family/family.service"
import type { FamilyActions } from "@/hooks/family/useFamilyActions"

type FamilyHeaderProps = {
    family: Family
    isAdmin: boolean
    actions: FamilyActions
}

export function FamilyHeader({ family, isAdmin, actions }: FamilyHeaderProps) {
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showLeaveDialog, setShowLeaveDialog] = useState(false)

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">{family.name}</h1>
                <p className="text-muted-foreground">
                    {family.monthly_spending_limit
                        ? `Monthly limit: $${family.monthly_spending_limit}`
                        : "No spending limit set"}
                </p>
            </div>

            {isAdmin ? (
                <div className="flex flex-row gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                        <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <EditFamilyDialog
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                        family={family}
                        onUpdate={actions.updateFamily}
                    />

                    <DeleteFamilyDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                        family={family}
                        onDelete={actions.deleteFamily}
                    />
                </div>
            ) : (
                <>
                    <Button
                        variant="outline"
                        className="text-destructive"
                        onClick={() => setShowLeaveDialog(true)}
                    >
                        <DoorOpen className="h-4 w-4 mr-2" />
                        Leave Family
                    </Button>

                    <LeaveFamilyDialog
                        open={showLeaveDialog}
                        onOpenChange={setShowLeaveDialog}
                        family={family}
                        onLeave={actions.leaveFamily}
                    />
                </>
            )}
        </div>
    )
}
