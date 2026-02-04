'use server'

import { createClient } from '@/lib/supabase/server'
import { NotificationsRepository } from '@/data/repositories/notifications.repository'
import { revalidatePath } from 'next/cache'

export async function getUnreadNotificationsCountAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return 0

    const repo = new NotificationsRepository(supabase)
    return await repo.getUnreadCount(user.id)
}

export async function getRecentNotificationsAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const repo = new NotificationsRepository(supabase)
    return await repo.getRecentNotifications(user.id)
}

export async function markNotificationAsReadAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const repo = new NotificationsRepository(supabase)
    await repo.markAsRead(id)
    revalidatePath('/')
    return { success: true }
}

export async function markAllNotificationsAsReadAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const repo = new NotificationsRepository(supabase)
    await repo.markAllAsRead(user.id)
    revalidatePath('/')
    return { success: true }
}
