"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import type { Family } from "@/services/family/family.service"

type DeleteFamilyDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    family: Family
    onDelete: () => Promise<void>
}

export function DeleteFamilyDialog({
    open,
    onOpenChange,
    family,
    onDelete,
}: DeleteFamilyDialogProps) {
    const [confirmation, setConfirmation] = useState("")
    const [loading, setLoading] = useState(false)

    const isConfirmed = confirmation === family.name

    const handleDelete = async () => {
        if (!isConfirmed) return

        setLoading(true)
        try {
            await onDelete()
            setConfirmation("")
            onOpenChange(false)
        } catch {
            // Error handled by action
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setConfirmation("")
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete family &ldquo;{family.name}&rdquo;?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action is <strong>irreversible</strong>. It will permanently delete the family and
                        all related data.
                        <br />
                        <br />
                        Type <strong>{family.name}</strong> to confirm:
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Input
                    placeholder="Type the name to confirm"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                />

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel} disabled={loading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={!isConfirmed || loading}
                        onClick={handleDelete}
                        className="bg-destructive text-primary hover:bg-destructive/90"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
