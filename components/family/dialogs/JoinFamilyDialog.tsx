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

type JoinFamilyDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onJoin: (joinCode: string) => Promise<void>
}

export function JoinFamilyDialog({ open, onOpenChange, onJoin }: JoinFamilyDialogProps) {
    const [joinCode, setJoinCode] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!joinCode.trim()) return

        setLoading(true)
        try {
            await onJoin(joinCode.trim())
            setJoinCode("")
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
                    <DialogTitle>Join Family</DialogTitle>
                    <DialogDescription>Enter the join code provided by the family admin.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="join-code" className="mb-2 block">
                            Join Code
                        </Label>
                        <Input
                            id="join-code"
                            placeholder="Enter join code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!joinCode.trim() || loading}>
                        {loading ? "Joining..." : "Join Family"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
