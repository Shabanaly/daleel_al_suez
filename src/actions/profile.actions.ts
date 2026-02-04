'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { fullName?: string, password?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const updates: any = {}
    if (data.password && data.password.trim() !== '') {
        updates.password = data.password
    }
    if (data.fullName) {
        updates.data = { full_name: data.fullName }
    }

    if (Object.keys(updates).length === 0) {
        return { success: true }
    }

    const { error } = await supabase.auth.updateUser(updates)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/profile')
    return { success: true }
}
