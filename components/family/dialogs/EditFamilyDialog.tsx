"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Family, UpdateFamilyData } from "@/services/family/family.service"

type EditFamilyDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    family: Family
    onUpdate: (data: UpdateFamilyData) => Promise<void>
}

export function EditFamilyDialog({ open, onOpenChange, family, onUpdate }: EditFamilyDialogProps) {
    const [name, setName] = useState(family.name)
    const [spendingLimit, setSpendingLimit] = useState(
        family.monthly_spending_limit?.toString() ?? ""
    )
    const [loading, setLoading] = useState(false)

    // Sync form with family data when dialog opens
    useEffect(() => {
        if (open) {
            setName(family.name)
            setSpendingLimit(family.monthly_spending_limit?.toString() ?? "")
        }
    }, [open, family])

    const handleSubmit = async () => {
        if (!name.trim()) return

        setLoading(true)
        try {
            await onUpdate({
                name: name.trim(),
                monthly_spending_limit: spendingLimit ? parseFloat(spendingLimit) : null,
            })
            onOpenChange(false)
        } catch {
            // Error handled by action
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle>Edit Family Details</DialogTitle>
                    <DialogDescription>Update your family name and spending limit.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="edit-family-name" className="mb-2 block">
                            Family Name
                        </Label>
                        <Input
                            id="edit-family-name"
                            placeholder="Enter family name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-spending-limit" className="mb-2 block">
                            Spending Limit (Optional)
                        </Label>
                        <Input
                            id="edit-spending-limit"
                            type="number"
                            placeholder="Enter monthly spending limit"
                            value={spendingLimit}
                            onChange={(e) => setSpendingLimit(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
                        {loading ? "Updating..." : "Update Family"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
