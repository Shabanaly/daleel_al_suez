'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    updateUserRoleUseCase,
    getUserStatsUseCase,
    getUserLogsUseCase,
    getCurrentUserUseCase
} from '@/di/modules'

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient()

    try {
        // 1. Check permissions (Super Admin only)
        const currentUser = await getCurrentUserUseCase.execute(supabase)
        if (!currentUser || currentUser.role !== 'super_admin') {
            return { success: false, error: 'Access denied. Only Super Admin can manage users.' }
        }

        // 2. Update role via Use Case
        await updateUserRoleUseCase.execute(userId, newRole, supabase)

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Update role error:', error)
        return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}

export async function getUserDetails(userId: string) {
    const supabase = await createClient()

    try {
        // 1. Check permissions (Super Admin only)
        const currentUser = await getCurrentUserUseCase.execute(supabase)
        if (!currentUser || currentUser.role !== 'super_admin') {
            throw new Error('Access denied. Only Super Admin can view user details.')
        }

        // 2. Fetch Stats & Logs using Use Cases
        const [stats, logs] = await Promise.all([
            getUserStatsUseCase.execute(userId, supabase),
            getUserLogsUseCase.execute(userId, supabase)
        ])

        return {
            stats,
            logs
        }
    } catch (error) {
        console.error('Error in getUserDetails:', error)
        return {
            stats: { placesCount: 0, reviewsCount: 0 },
            logs: []
        }
    }
}
