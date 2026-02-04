'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient()

    try {
        // 1. Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // 2. Check Super Admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            return { success: false, error: 'Access denied. Only Super Admin can manage users.' }
        }

        // 3. Update user role via RPC
        const { error } = await supabase.rpc('update_user_role', {
            target_user_id: userId,
            new_role: newRole
        })

        if (error) throw error

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Update role error:', error)
        return { success: false, error: error.message }
    }
}

export async function getUserDetails(userId: string) {
    const supabase = await createClient()

    try {
        // 1. Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            throw new Error('Not authenticated')
        }

        // 2. Check Super Admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            throw new Error('Access denied. Only Super Admin can view user details.')
        }

        // 3. Fetch Stats
        const { count: placesCount } = await supabase
            .from('places')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', userId)

        const { count: reviewsCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        // 4. Fetch Logs
        const { data: logs, error: logsError } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('actor_id', userId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (logsError) {
            console.error('Error fetching logs:', logsError)
        }

        return {
            stats: {
                placesCount: placesCount || 0,
                reviewsCount: reviewsCount || 0
            },
            logs: logs || []
        }
    } catch (error) {
        console.error('Error in getUserDetails:', error)
        return {
            stats: { placesCount: 0, reviewsCount: 0 },
            logs: []
        }
    }
}
