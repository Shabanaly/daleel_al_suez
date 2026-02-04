import { createClient } from '@/lib/supabase/server'
import { getAdminPlacesUseCase, getCategoriesUseCase } from '@/di/modules'
import { AdminPlacesListView } from '@/presentation/admin/places-list-view'
import { getAreas } from '@/services/admin/areas.service'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AdminPlacesPage({
    searchParams
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Get User Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'user'
    const isSuperAdmin = role === 'super_admin'

    // 2. Fetch Filters Data (Parallel)
    const [categories, areas, users] = await Promise.all([
        getCategoriesUseCase.execute(),
        getAreas(),
        isSuperAdmin ? supabase.from('profiles').select('id, full_name').then(res => res.data || []) : Promise.resolve([])
    ])

    // 3. Prepare Filter Object
    const filters = {
        search: params.search as string,
        categoryId: params.categoryId as string,
        areaId: params.areaId as string,
        status: params.status as string,
        creatorId: params.creatorId as string,
    }

    // 4. Fetch Places with Filters
    const places = await getAdminPlacesUseCase.execute(user.id, role, filters)

    // 5. Render
    return <AdminPlacesListView
        places={places}
        categories={categories}
        areas={areas}
        users={users}
        currentUserRole={role}
    />
}
