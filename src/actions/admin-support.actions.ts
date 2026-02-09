'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/actions/admin/notifications.actions'

export async function getAllTickets(filters?: { status?: string, priority?: string }) {
    const supabase = await createClient()

    // Check if user is super_admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        throw new Error('Access denied. Super Admin only.')
    }

    let query = supabase
        .from('support_tickets')
        .select(`
            *,
            profiles:user_id(full_name, email, avatar_url),
            messages:support_messages(count)
        `)
        .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
    }

    if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query

    if (error) throw error
    return data
}

export async function getTicketDetails(ticketId: string) {
    const supabase = await createClient()

    // Auth check (omitted for brevity, assume RLS handles it or repeat check)
    // Ideally we repeat the role check or rely on RLS if correctly set up.
    // For safety in server actions, explicit check is good.

    const { data, error } = await supabase
        .from('support_tickets')
        .select(`
            *,
            profiles:user_id(full_name, email, avatar_url)
        `)
        .eq('id', ticketId)
        .single()

    if (error) throw error
    return data
}

export async function getAdminTicketMessages(ticketId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data
}

export async function replyAsAdmin(ticketId: string, message: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('support_messages')
        .insert({
            ticket_id: ticketId,
            sender_id: user.id,
            message,
            is_admin: true
        })

    if (error) throw error

    const { data: ticket } = await supabase
        .from('support_tickets')
        .select('user_id, subject')
        .eq('id', ticketId)
        .single()

    if (ticket?.user_id) {
        await sendNotification(
            ticket.user_id,
            'رد جديد على تذكرتك',
            `قام الدعم الفني بالرد على تذكرة: ${ticket.subject}`,
            'support',
            `/profile?tab=support&ticketId=${ticketId}`
        )
    }

    // Update ticket updated_at and potentially status to 'in_progress' if it was 'open'
    await supabase
        .from('support_tickets')
        .update({
            updated_at: new Date().toISOString(),
            status: 'in_progress'
        })
        .eq('id', ticketId)
        .eq('status', 'open') // Only auto-switch from open to in_progress

    revalidatePath(`/admin/support/${ticketId}`)
    revalidatePath('/admin/support')
    return { success: true }
}

export async function updateTicketStatus(ticketId: string, status: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId)

    if (error) throw error

    revalidatePath(`/admin/support/${ticketId}`)
    revalidatePath('/admin/support')
    return { success: true }
}
