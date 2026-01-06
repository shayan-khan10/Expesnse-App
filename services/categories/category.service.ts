import { createClient } from "@/lib/supabase/client"

export type Category = {
    id: string
    family_id: string
    name: string
    created_at: string
}

/**
 * Fetch categories for the current user's family.
 * STRICT: RPC only, no direct queries.
 */
export async function getCategories(): Promise<Category[]> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc("get_categories_for_my_family")

    if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return data || []
}

/**
 * Create a new category for the current user's family.
 * STRICT: RPC only.
 */
export async function createCategory(name: string): Promise<Category> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc("create_category_for_my_family", {
        category_name: name.trim()
    })

    if (error) {
        throw new Error(`Failed to create category: ${error.message}`)
    }

    return data
}

/**
 * Delete a category for the current user's family.
 * STRICT: RPC only.
 */
export async function deleteCategory(id: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.rpc("delete_category_for_my_family", {
        category_id: id
    })

    if (error) {
        throw new Error(`Failed to delete category: ${error.message}`)
    }
}
