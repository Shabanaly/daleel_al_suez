'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavoriteAction(placeId: string, isFavorite: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً')
    }

    if (isFavorite) {
        // Add
        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: user.id, place_id: placeId })

        if (error && error.code !== '23505') { // Ignore duplicate key error
            throw new Error(error.message)
        }
    } else {
        // Remove
        const { error } = await supabase
            .from('favorites')
            .delete()
            .match({ user_id: user.id, place_id: placeId })

        if (error) throw new Error(error.message)
    }

    revalidatePath('/favorites')
    revalidatePath(`/places/${placeId}`) // Optionally revalidate place page
    return { success: true }
}

export async function checkIsFavoriteAction(placeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
        .from('favorites')
        .select('place_id')
        .match({ user_id: user.id, place_id: placeId })
        .single()

    return !!data
}
