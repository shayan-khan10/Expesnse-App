import { createClient } from "../../lib/supabase/client";

const supabase = createClient();

export interface RecentExpense {
    id: string;
    expense_title: string;
    amount: number;
    username: string;
}

export interface PersonalExpense {
    id: string;
    user_id: string;
    family_id: string;
    category_id: string;
    amount: number;
    payment_method: string | null;
    note: string | null;
    created_at: string;
    expense_title: string;
    type: string | null;
}

export type ExpensesDashboardDTO = {
    family: { id: string; name: string; join_code: string; monthly_spending_limit: number | null; created_at: string; } | null;
    personal_total: number;
    family_total: number;
    recent_family_expenses: RecentExpense[] | null;
    personal_expenses: PersonalExpense[] | null;
}

export async function getExpensesDashboard() {
    return supabase
        .rpc("get_expenses_dashboard_context")
        .then(({ data, error }) => {
            if (error) throw error;
            // The RPC returns JSON, so we cast it to our DTO
            return data as unknown as ExpensesDashboardDTO;
        });
}

export async function deleteExpense(expenseId: string) {
    return supabase.rpc("delete_my_expense", { expense_id: expenseId });
}
