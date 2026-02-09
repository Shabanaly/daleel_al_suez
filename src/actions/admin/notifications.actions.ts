'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Notification {
    id: string
    user_id: string
    type: string
    title: string
    message: string
    link?: string
    is_read: boolean
    created_at: string
}

export async function getMyNotifications() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, message: 'Unauthorized' }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        return { success: true, data: data as Notification[] }
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}

export async function markAsRead(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}

// Helper to notify all super admins
export async function notifySuperAdmins(title: string, message: string, type: string = 'system', link?: string) {
    try {
        const supabase = await createClient()

        // 1. Get all super admins
        const { data: superAdmins } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'super_admin')

        if (!superAdmins || superAdmins.length === 0) return

        // 2. Prepare notifications
        const notifications = superAdmins.map(admin => ({
            user_id: admin.id,
            title,
            message,
            type,
            link
        }))

        // 3. Insert all
        const { error } = await supabase
            .from('notifications')
            .insert(notifications)

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error("Failed to notify super admins:", error)
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}

export async function sendNotification(userId: string, title: string, message: string, type: string = 'system', link?: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                link
            })

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error("Failed to send notification:", error)
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}
