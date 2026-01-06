"use client"

import { useState } from "react"
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
type CreateFamilyData = {
    name: string
    monthly_spending_limit?: number | null
}

type CreateFamilyDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (data: CreateFamilyData) => Promise<void>
}

export function CreateFamilyDialog({ open, onOpenChange, onCreate }: CreateFamilyDialogProps) {
    const [name, setName] = useState("")
    const [spendingLimit, setSpendingLimit] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!name.trim()) return

        setLoading(true)
        try {
            await onCreate({
                name: name.trim(),
                monthly_spending_limit: spendingLimit ? parseFloat(spendingLimit) : null,
            })
            // Reset form and close
            setName("")
            setSpendingLimit("")
            onOpenChange(false)
        } catch {
            // Error handled by action
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle>Create New Family</DialogTitle>
                    <DialogDescription>
                        Set up your family group with a name and optional spending limit.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="family-name" className="mb-2 block">
                            Family Name
                        </Label>
                        <Input
                            id="family-name"
                            placeholder="e.g. 'The Smiths' or 'Smith's Family'"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="spending-limit" className="mb-2 block">
                            Spending Limit (Optional)
                        </Label>
                        <Input
                            id="spending-limit"
                            type="number"
                            placeholder="e.g. 150000"
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
                        {loading ? "Creating..." : "Create Family"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
