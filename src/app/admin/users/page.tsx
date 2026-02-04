import { getUsers, getCurrentUserRole } from '@/services/admin/users.service'
import UsersClientPage from '@/components/admin/UsersClientPage'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Get user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // 3. Redirect if not Super Admin
    if (profile?.role !== 'super_admin') {
        redirect('/admin')
    }

    // 4. Fetch users only if Super Admin
    const [users, currentUserRole] = await Promise.all([
        getUsers(),
        getCurrentUserRole()
    ])

    return (
        <UsersClientPage
            initialUsers={users}
            currentUserRole={currentUserRole}
        />
    )
}
