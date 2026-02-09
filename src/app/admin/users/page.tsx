import { getUsersUseCase, getCurrentUserUseCase } from '@/di/modules'
import UsersClientPage from '@/presentation/components/admin/UsersClientPage'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const supabase = await createClient()

    // 1. Get Current User and Role using Use Case
    const currentUser = await getCurrentUserUseCase.execute(supabase)

    if (!currentUser) {
        redirect('/login')
    }

    // 2. Check permissions (Super Admin only)
    if (currentUser.role !== 'super_admin') {
        redirect('/admin')
    }

    // 3. Fetch users using Use Case
    const users = await getUsersUseCase.execute(supabase)

    return (
        <UsersClientPage
            initialUsers={users}
            currentUserRole={currentUser.role}
        />
    )
}
