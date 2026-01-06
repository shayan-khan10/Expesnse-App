
import { useState } from "react";
import { deleteExpense } from "@/services/expenses/expenses.service";

export function useExpenseActions(onSuccess?: () => void) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const handleDelete = async (expenseId: string) => {
        try {
            setLoading(true);
            const { error: rpcError } = await deleteExpense(expenseId);
            if (rpcError) throw rpcError;
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error deleting expense:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return {
        deleteExpense: handleDelete,
        isDeleting: loading,
        error
    };
}
