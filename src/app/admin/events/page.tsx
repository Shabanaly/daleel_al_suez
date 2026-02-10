import { createClient } from '@/lib/supabase/server'
import { getAdminEventsUseCase, getAdminPlacesUseCase } from '@/di/modules'
import { AdminEventsListView } from '@/presentation/components/admin/events-list-view'

export default async function AdminEventsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'user'
    if (role !== 'admin') return <div>Unauthorized</div>

    // Fetch Events and Places (for linking)
    const [events, places] = await Promise.all([
        getAdminEventsUseCase.execute(role, supabase),
        getAdminPlacesUseCase.execute(user.id, role, {})
    ])

    return <AdminEventsListView
        events={events}
        places={places}
    />
}
