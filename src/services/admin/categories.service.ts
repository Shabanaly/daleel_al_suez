import { createClient } from '@/lib/supabase/server'

export type Category = {
    id: string
    name: string
    slug: string
    icon: string
    created_at: string
    updated_at: string
}

/**
 * Get all categories.
 * - Public users: see all categories
 * - Admins: see all categories (read-only)
 * - Super Admins: see all categories (full access)
 */
export async function getCategories() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching categories:', error)
        throw new Error('Failed to fetch categories')
    }

    return data as Category[]
}

export async function getCategoryById(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error(`Error fetching category ${id}:`, error)
        return null
    }

    return data as Category
}
