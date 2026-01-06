"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryTable } from "@/components/categories/CategoryTable"
import { CreateCategoryAccordion } from "@/components/categories/CreateCategoryAccordion"
import { useCategories } from "@/hooks/categories/useCategories"
import { useCategoryActions } from "@/hooks/categories/useCategoryActions"
import { useUserSession } from "@/hooks/use-userSession"
import { ArrowBigRight } from "lucide-react"
import Link from "next/link"

export default function CategoryPage() {
    // 1. Auth & Context
    const { userContext, loading: sessionLoading } = useUserSession()

    // 2. Data Fetching (Read)
    const { categories, loading: dataLoading, refetch } = useCategories()

    // 3. Mutations (Write)
    const { create, remove, isCreating, isDeleting } = useCategoryActions(() => {
        // Optimistic update or simple refetch
        refetch()
    })

    const isLoading = sessionLoading || dataLoading

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 p-6">
                    <div className="flex flex-col items-right justify-start space-y-8">
                        <Skeleton className="h-[60px] w-[200px] rounded-full" />
                        <Skeleton className="h-[80px] w-full rounded-full" />
                        <Skeleton className="h-[125px] w-full rounded-lg" />
                        <Skeleton className="h-[250px] w-full rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }

    // Guard: User must have a family
    if (!userContext?.family_id) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 p-6">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-4">Category Management</h1>
                        <p className="text-muted-foreground text-lg">
                            Create a new family or join an existing one from the{" "}
                            <b>Family</b> page to start categorizing your expenses.
                        </p>
                        <Link href="/family">
                            <Button className="mt-[4rem] h-12 w-60 text-base" variant="default">
                                Go to Family Page
                                <ArrowBigRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-4">Categories</h1>
                    <p className="text-muted-foreground text-lg">
                        Categorize your expenses. Manage your categories. They will be available
                        to choose from whenever you will add an expense.
                    </p>
                </div>

                <Card className="py-1 px-6">
                    <CreateCategoryAccordion
                        onCreate={create}
                        isCreating={isCreating}
                    />
                </Card>

                <Card className="mt-0">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">
                            Your Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryTable
                            categories={categories}
                            onDelete={remove}
                            isDeleting={isDeleting}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}