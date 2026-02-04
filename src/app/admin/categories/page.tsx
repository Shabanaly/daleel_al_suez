import { getCategories } from '@/services/admin/categories.service'
import CategoriesClient from '@/components/admin/CategoriesClient'
import { createClient } from '@/lib/supabase/server'

export default async function CategoriesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    const categories = await getCategories()

    return <CategoriesClient
        initialCategories={categories}
        currentUserRole={profile?.role || null}
    />
}
