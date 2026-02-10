'use server'

import { createEventUseCase, updateEventUseCase, deleteEventUseCase, getAdminEventsUseCase } from "@/di/modules"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { SuezEvent, EventStatus, EventType } from "@/domain/entities/suez-event"

export type EventState = {
    message?: string
    errors?: Record<string, string[]>
    success?: boolean
    data?: SuezEvent
}


export async function createEventAction(prevState: EventState, formData: FormData): Promise<EventState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Unauthorized" }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    const role = profile?.role || null
    if (!role) return { message: "Unauthorized" }

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const location = formData.get('location') as string
    const placeId = formData.get('placeId') as string
    const status = formData.get('status') as EventStatus
    const type = formData.get('type') as EventType

    try {
        const event = await createEventUseCase.execute(role, {
            title,
            slug,
            description,
            imageUrl,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            location,
            placeId: placeId || null,
            status,
            type
        }, supabase)

        revalidatePath('/admin/events')
        revalidatePath('/events')
        return { success: true, data: event, message: "Event created successfully" }
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to create event" }
    }
}

export async function updateEventAction(id: string, prevState: EventState, formData: FormData): Promise<EventState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Unauthorized" }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    const role = profile?.role || null
    if (!role) return { message: "Unauthorized" }

    const updates: Partial<SuezEvent> = {}
    if (formData.has('title')) updates.title = formData.get('title') as string
    if (formData.has('slug')) updates.slug = formData.get('slug') as string
    if (formData.has('description')) updates.description = formData.get('description') as string
    if (formData.has('imageUrl')) updates.imageUrl = formData.get('imageUrl') as string
    if (formData.has('startDate')) updates.startDate = new Date(formData.get('startDate') as string)
    if (formData.has('endDate')) updates.endDate = new Date(formData.get('endDate') as string)
    if (formData.has('location')) updates.location = formData.get('location') as string
    if (formData.has('placeId')) updates.placeId = (formData.get('placeId') as string) || null
    if (formData.has('status')) updates.status = formData.get('status') as EventStatus
    if (formData.has('type')) updates.type = formData.get('type') as EventType

    try {
        const event = await updateEventUseCase.execute(id, role, updates, supabase)
        revalidatePath('/admin/events')
        revalidatePath('/events')
        return { success: true, data: event, message: "Event updated successfully" }
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update event" }
    }
}

export async function deleteEventAction(id: string): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized" }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    const role = profile?.role || null
    if (!role) return { success: false, message: "Unauthorized" }

    try {
        await deleteEventUseCase.execute(id, role, supabase)
        revalidatePath('/admin/events')
        revalidatePath('/events')
        return { success: true, message: "Event deleted successfully" }
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to delete event" }
    }
}

export async function toggleEventStatusAction(id: string, newStatus: EventStatus): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized" }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    const role = profile?.role || null
    if (role !== 'admin') return { success: false, message: "Unauthorized" }

    try {
        await updateEventUseCase.execute(id, role, { status: newStatus }, supabase)
        revalidatePath('/admin/events')
        revalidatePath('/events')
        return { success: true, message: `Status updated to ${newStatus}` }
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update status" }
    }
}

export async function getAdminEventsAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    const role = profile?.role || null
    if (role !== 'admin') throw new Error("Unauthorized")

    return getAdminEventsUseCase.execute(role, supabase)
}
