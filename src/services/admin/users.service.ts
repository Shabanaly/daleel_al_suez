import { createClient } from '@/lib/supabase/server'

export type Profile = {
    id: string
    email: string
    full_name: string | null
    role: 'user' | 'admin' | 'super_admin'
    created_at: string
}

export type UserStats = {
    placesCount: number
    reviewsCount: number
}

export type AuditLog = {
    id: string
    action: string
    details: any
    created_at: string
}

export async function getUsers() {
    const supabase = await createClient()

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')

    // Sort logic moved to service or keep in client? 
    // Usually DB sort is better if scalable, but for complex business logic sorting (Role Priority), 
    // it's okay to do it in JS if dataset is small (<1000 users). 
    // For now, let's just return raw data to match current behavior, potentially sorting by created_at desc.

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    // Default sort by created_at desc
    return (profiles as Profile[]).sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
}

export async function getUserStats(userId: string): Promise<UserStats> {
    const supabase = await createClient()

    const { count: placesCount } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)

    const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    return {
        placesCount: placesCount || 0,
        reviewsCount: reviewsCount || 0
    }
}

export async function getUserLogs(userId: string) {
    const supabase = await createClient()

    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('target_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching user logs:', error)
        return []
    }

    return logs as AuditLog[]
}

export async function getCurrentUserRole() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return currentProfile?.role as string | null
}
