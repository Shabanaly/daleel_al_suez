'use server'

import { createClient } from "@/lib/supabase/server"

export interface DashboardStats {
    placesCount: number
    reviewsCount: number
    usersCount: number | null
    visitsCount: number // Placeholder
    isAdmin: boolean
}

export async function getDashboardStats(): Promise<{ success: boolean, data?: DashboardStats, message?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, message: "Unauthorized" }
        }

        // Get Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const isAdmin = profile?.role === 'admin'

        // 1. Places Count
        let placesQuery = supabase.from('places').select('*', { count: 'exact', head: true })

        if (!isAdmin) {
            placesQuery = placesQuery.eq('created_by', user.id)
        }

        const { count: placesCount, error: placesError } = await placesQuery
        if (placesError) throw placesError

        // 2. Reviews Count
        let reviewsCount = 0
        if (isAdmin) {
            const { count, error } = await supabase.from('reviews').select('*', { count: 'exact', head: true })
            if (error) throw error
            reviewsCount = count || 0
        } else {
            // For regular admin (or user), we need reviews on THEIR places
            // Approach: Get IDs of their places first, then count reviews
            // Or use a join if Supabase client supports deep filtering easily. 
            // For simplicity and correctness with RLS, let's try the join approach:
            // "Count reviews where place.created_by = user.id"

            const { count, error } = await supabase
                .from('reviews')
                .select('place_id, places!inner(created_by)', { count: 'exact', head: true })
                .eq('places.created_by', user.id)

            if (error) throw error
            reviewsCount = count || 0
        }

        // 3. Users Count (Admin Only)
        let usersCount = null
        if (isAdmin) {
            const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            if (error) throw error
            usersCount = count
        }

        // 4. Visits Count (Today)
        let visitsCount = 0
        const dateStr = new Date().toISOString().split('T')[0]
        const { data: visitsData } = await supabase
            .from('site_analytics')
            .select('count')
            .eq('date', dateStr)
            .single()

        if (visitsData) {
            visitsCount = visitsData.count
        }

        return {
            success: true,
            data: {
                placesCount: placesCount || 0,
                reviewsCount: reviewsCount || 0,
                usersCount: usersCount,
                visitsCount: visitsCount,
                isAdmin
            }
        }

    } catch (error) {
        console.error("Dashboard Stats Error:", error)
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}

export async function incrementVisit() {
    try {
        const supabase = await createClient()
        // We use RPC to safely increment without race conditions
        const { error } = await supabase.rpc('increment_visits')

        if (error) {
            console.error('Error incrementing visits:', error)
        }
    } catch (error) {
        console.error('Failed to increment visit:', error)
    }
}
