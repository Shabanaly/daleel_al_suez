import { createClient } from '@/lib/supabase/server'
import {
    getAdminPlacesUseCase,
    getCategoriesUseCase,
    getAreasUseCase,
    getCurrentUserUseCase
} from '@/di/modules'
import { AdminPlacesListView } from '@/presentation/components/admin/places-list-view'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AdminPlacesPage({
    searchParams
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams
    const supabase = await createClient()

    // 1. Get User & Role using Use Cases
    const currentUser = await getCurrentUserUseCase.execute(supabase);
    if (!currentUser) return null;

    // Role is already part of the User entity returned by getCurrentUserUseCase, 
    // but the page logic was explicitly fetching role separately.
    // Our new GetCurrentUserUseCase returns role in the User object.
    const role = currentUser.role;
    const isAdmin = role === 'admin';

    // 2. Fetch Filters Data (Parallel)
    const [categories, areas, users] = await Promise.all([
        getCategoriesUseCase.execute(),
        getAreasUseCase.execute(supabase), // Pass client if needed
        isAdmin ? supabase.from('profiles').select('id, full_name').then(res => res.data || []) : Promise.resolve([])
        // Note: We might want a GetUsersUseCase for the users list later, but for now we focus on fixing areas/current_user
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
    const places = await getAdminPlacesUseCase.execute(currentUser.id, role, filters)

    // 5. Render
    return <AdminPlacesListView
        places={places}
        categories={categories}
        areas={areas}
        users={users}
        currentUserRole={role}
    />
}
