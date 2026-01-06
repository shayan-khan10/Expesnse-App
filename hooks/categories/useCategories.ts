import { useState, useEffect, useCallback } from "react"
import { getCategories, Category } from "@/services/categories/category.service"
import { toast } from "sonner"

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getCategories()
            setCategories(data)
            setError(null)
        } catch (err: any) {
            console.error(err)
            setError(err)
            toast.error("Failed to load categories")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories
    }
}
