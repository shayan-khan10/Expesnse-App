import { useState } from "react"
import { createCategory, deleteCategory } from "@/services/categories/category.service"
import { toast } from "sonner"

export function useCategoryActions(onSuccess?: () => void) {
    const [isCreating, setIsCreating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const create = async (name: string) => {
        try {
            setIsCreating(true)
            await createCategory(name)
            toast.success("Category created")
            onSuccess?.()
            return true
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to create category")
            return false
        } finally {
            setIsCreating(false)
        }
    }

    const remove = async (id: string) => {
        try {
            setIsDeleting(true)
            await deleteCategory(id)
            toast.success("Category deleted")
            onSuccess?.()
            return true
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to delete category")
            return false
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        create,
        remove,
        isCreating,
        isDeleting
    }
}
