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
import type { Family } from "@/services/family/family.service"

type LeaveFamilyDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    family: Family
    onLeave: () => Promise<void>
}

export function LeaveFamilyDialog({ open, onOpenChange, family, onLeave }: LeaveFamilyDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleLeave = async () => {
        setLoading(true)
        try {
            await onLeave()
            onOpenChange(false)
        } catch {
            // Error handled by action
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Leave Family</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to leave <strong>{family.name}</strong>? This action cannot be
                        undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleLeave}
                        disabled={loading}
                        className="bg-destructive text-secondary hover:bg-destructive/90"
                    >
                        {loading ? "Leaving..." : "Leave Family"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
