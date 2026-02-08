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

export async function updatePassword(data: { currentPassword: string, newPassword: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
        throw new Error('غير مصرح')
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword
    })

    if (signInError) {
        throw new Error('كلمة المرور الحالية غير صحيحة')
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
    })

    if (updateError) {
        throw new Error(updateError.message)
    }

    revalidatePath('/profile')
    return { success: true }
}
