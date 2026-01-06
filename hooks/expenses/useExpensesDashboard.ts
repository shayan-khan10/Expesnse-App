
import { useState, useEffect, useCallback } from "react";
import { getExpensesDashboard, ExpensesDashboardDTO } from "@/services/expenses/expenses.service";

export function useExpensesDashboard() {
    const [data, setData] = useState<ExpensesDashboardDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const dashboardData = await getExpensesDashboard();
            setData(dashboardData);
            setError(null);
        } catch (err) {
            console.error("Error fetching expenses dashboard:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return { data, loading, error, refetch: fetchDashboard };
}
