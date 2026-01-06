"use client"

import { useState } from "react"
import { Users, RefreshCcw, RefreshCcwDot, Copy, Check } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import type { Family } from "@/services/family/family.service"
import type { FamilyActions } from "@/hooks/family/useFamilyActions"

type InviteSectionProps = {
    family: Family
    actions: FamilyActions
}

export function InviteSection({ family, actions }: InviteSectionProps) {
    const [genSuccess, setGenSuccess] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    const handleRegenerate = async () => {
        try {
            await actions.regenerateJoinCode()
            setGenSuccess(true)
            setTimeout(() => setGenSuccess(false), 2000)
        } catch {
            // Error already handled by action toast
        }
    }

    const handleCopy = async () => {
        if (!family.join_code) return

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(family.join_code)
            } else {
                // Fallback for older browsers
                const textArea = document.createElement("textarea")
                textArea.value = family.join_code
                textArea.style.position = "fixed"
                textArea.style.opacity = "0"
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand("copy")
                document.body.removeChild(textArea)
            }
            setCopySuccess(true)
            toast.success("Join code copied to clipboard!")
            setTimeout(() => setCopySuccess(false), 2000)
        } catch {
            toast.error("Failed to copy join code")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Invite Members
                </CardTitle>
                <CardDescription>
                    Share this join code with family members to invite them to your family.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <Input value={family.join_code} readOnly className="font-mono" />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleRegenerate}>
                                    {genSuccess ? (
                                        <RefreshCcwDot className="h-4 w-4" />
                                    ) : (
                                        <RefreshCcw className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {genSuccess ? "Generated!" : "Generate new join code"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleCopy}>
                                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{copySuccess ? "Copied!" : "Copy join code"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    )
}
