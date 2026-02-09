import { getCategoriesUseCase } from '@/di/modules'
import CategoriesClient from '@/presentation/components/admin/CategoriesClient'
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

    // Use Case automatically orders by created_at if we ask for it, or we can just get default
    // Service was ordering by created_at descending.
    const categories = await getCategoriesUseCase.execute({ orderBy: 'created_at' })

    return <CategoriesClient
        initialCategories={categories}
        currentUserRole={profile?.role || null}
    />
}
