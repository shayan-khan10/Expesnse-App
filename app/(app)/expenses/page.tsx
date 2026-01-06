
'use client';


import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowBigRight } from "lucide-react";
import { useExpensesDashboard } from "@/hooks/expenses/useExpensesDashboard";
import { useExpenseActions } from "@/hooks/expenses/useExpenseActions";
import { ExpensesOverview } from "@/components/expenses/ExpensesOverview";
import { RecentExpensesTable } from "@/components/expenses/RecentExpensesTable";
import { PersonalExpensesTable } from "@/components/expenses/PersonalExpensesTable";

export default function ExpensesPage() {
    const { data: dashboardData, loading: dashboardLoading, refetch } = useExpensesDashboard();
    const { deleteExpense, isDeleting } = useExpenseActions(refetch);

    if (dashboardLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 p-6">
                    <div className="flex flex-col items-right justify-start">
                        <Skeleton className="h-[40px] w-[200px] rounded-full mb-[2rem]" />
                        <Skeleton className="h-[150px] w-[350px] rounded-lg mb-[2rem]" />
                        <Skeleton className="h-[40px] w-[300px] rounded-full mb-[2rem]" />
                        <Skeleton className="h-[150px] w-[350px] rounded-lg mb-[2rem]" />
                        <Skeleton className="h-[150px] w-[350px] rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboardData?.family) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 p-6">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-4">Expense Management</h1>
                        <p className="text-muted-foreground text-lg">
                            Create a new family or join an existing one from the <b>Family</b> page to start tracking expenses together.
                        </p>
                        <Link href='/family'>
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

                <ExpensesOverview
                    familyTotal={dashboardData.family_total}
                    personalTotal={dashboardData.personal_total}
                />

                <RecentExpensesTable
                    expenses={dashboardData.recent_family_expenses || []}
                />

                <PersonalExpensesTable
                    expenses={dashboardData.personal_expenses || []}
                    onDelete={deleteExpense}
                    isDeleting={isDeleting}
                />
            </div>
        </div>
    );
}
