'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserStatistics() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') throw error

    // Return default stats if none found (e.g. no reviews yet)
    return data || {
        total_reviews: 0,
        avg_rating: 0,
        total_favorites: 0,
        helpful_votes: 0
    }
}

export async function getReviewsByMonth() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('user_reviews_by_month')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true })
        .limit(12)

    if (error) throw error
    return data
}

export async function getCategoryBreakdown() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            places!inner(
                categories!inner(name)
            )
        `)
        .eq('user_id', user.id)

    if (error) throw error

    // Process and group by category
    const breakdown = data.reduce((acc: any, review: any) => {
        // Handle array or single category if structure differs, assuming single for now or taking first found
        // Adjust based on actual data structure. 
        // If categories is an object:
        const categoryName = review.places?.categories?.name || 'غير مصنف'
        acc[categoryName] = (acc[categoryName] || 0) + 1
        return acc
    }, {})

    return Object.entries(breakdown).map(([name, count]) => ({
        name,
        count
    }))
}
