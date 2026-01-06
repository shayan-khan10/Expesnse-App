"use client"

import { useState } from "react"
import { Plus, Users } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateFamilyDialog } from "./dialogs/CreateFamilyDialog"
import { JoinFamilyDialog } from "./dialogs/JoinFamilyDialog"
import type { FamilyActions } from "@/hooks/family/useFamilyActions"

type EmptyFamilyStateProps = {
    actions: FamilyActions
}

export function EmptyFamilyState({ actions }: EmptyFamilyStateProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showJoinDialog, setShowJoinDialog] = useState(false)

    return (
        <div className="p-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Family Management</h1>
                <p className="text-muted-foreground text-lg">
                    Create a new family or join an existing one to start tracking expenses together.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Create Family Card */}
                <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                            <Plus className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>Create a Family</CardTitle>
                        <CardDescription>
                            Start a new family group and invite members using a join code.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" size="lg" onClick={() => setShowCreateDialog(true)}>
                            Create Family
                        </Button>
                    </CardContent>
                </Card>

                {/* Join Family Card */}
                <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
                            <Users className="h-8 w-8 text-secondary-foreground" />
                        </div>
                        <CardTitle>Join a Family</CardTitle>
                        <CardDescription>
                            Join an existing family using a join code shared by the admin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" size="lg" onClick={() => setShowJoinDialog(true)}>
                            Join Family
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <CreateFamilyDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onCreate={actions.createFamily}
            />

            <JoinFamilyDialog
                open={showJoinDialog}
                onOpenChange={setShowJoinDialog}
                onJoin={actions.joinFamily}
            />
        </div>
    )
}
