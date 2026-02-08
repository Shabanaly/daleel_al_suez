'use server'

import { createPlaceUseCase, updatePlaceUseCase, deletePlaceUseCase } from "@/di/modules"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Place } from "@/domain/entities/place"
import { sendNotification, notifySuperAdmins } from "./notifications.actions"

// Define the state type expected by useActionState
export type PlaceState = {
    message?: string
    errors?: Record<string, string[]>
    success?: boolean
    data?: Place
}

export async function createPlaceAction(data: Partial<Place>): Promise<PlaceState> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { message: "Unauthorized", success: false }
        }

        // Validate required fields (Basic manual validation)
        const errors: Record<string, string[]> = {}
        if (!data.name) errors.name = ["Name is required"]
        if (!data.slug) errors.slug = ["Slug is required"]
        if (!data.categoryId) errors.categoryId = ["Category is required"]

        if (Object.keys(errors).length > 0) {
            return { message: "Validation failed", errors, success: false }
        }

        // Ensure new places default to 'pending' status
        const place = await createPlaceUseCase.execute({
            ...data,
            status: 'pending'
        }, user.id, supabase)

        // 1. Notify the User (Creator)
        await sendNotification(
            user.id,
            "تم استلام طلبك",
            `تم إضافة "${place.name}" بنجاح وهو قيد المراجعة حالياً.`,
            "system"
        )

        // 2. Notify Super Admins
        await notifySuperAdmins(
            "مكان جديد بحاجة للمراجعة",
            `قام المستخدم بإضافة مكان جديد: "${place.name}".`,
            "place_approval",
            `/admin/places` // Link to places list
        )

        revalidatePath('/admin/places')
        // Return null/success state, or redirect
        return { success: true, message: "Place created successfully", data: place }
    } catch (error: any) {
        console.error("Create Place Error:", error)
        // Check for specific DB errors (like unique slug)
        if (error.message?.includes('violates unique constraint "places_slug_key"')) {
            return { message: "Error creating place", errors: { slug: ["This slug is already taken"] }, success: false }
        }
        return { message: error.message || "Failed to create place", success: false }
    }
}

export async function updatePlaceAction(id: string, data: Partial<Place>): Promise<PlaceState> {
    try {
        const supabase = await createClient() // Need client for notifications

        // 1. Get old status to check for changes
        const { data: oldPlace } = await supabase
            .from('places')
            .select('status, created_by, name')
            .eq('id', id)
            .maybeSingle()

        const place = await updatePlaceUseCase.execute(id, data, supabase)

        // NOTIFICATION: Check for Status Change (Pending -> Active/Closed)
        if (oldPlace && data.status && data.status !== oldPlace.status) {
            if (data.status === 'active') {
                await sendNotification(
                    oldPlace.created_by,
                    "مبروك! تمت الموافقة على مكانك",
                    `تم تفعيل مكانك "${oldPlace.name}" وهو الآن ظاهر للجميع.`,
                    "place_approval",
                    `/admin/places` // Link to places list
                )
            } else if (data.status === 'inactive') {
                await sendNotification(
                    oldPlace.created_by,
                    "تنبيه: تم تعطيل مكانك",
                    `تم تغيير حالة مكانك "${oldPlace.name}" إلى مغلق/معطل.`,
                    "alert"
                )
            }
        }

        revalidatePath('/admin/places')
        // Also revalidate the specific edit page
        revalidatePath(`/admin/places/${id}/edit`)
        return { success: true, message: "Place updated successfully", data: place }
    } catch (error: any) {
        console.error("Update Place Error:", error)
        return { message: error.message || "Failed to update place", success: false }
    }
}

// Dedicated action for toggling place status (simpler, avoids repository complexity)
export async function togglePlaceStatus(id: string, newStatus: 'active' | 'inactive') {
    try {
        const supabase = await createClient()

        // 1. Get place info before update
        const { data: oldPlace } = await supabase
            .from('places')
            .select('status, created_by, name, slug')
            .eq('id', id)
            .maybeSingle()

        if (!oldPlace) {
            return { success: false, message: 'Place not found' }
        }

        // 2. Update status directly
        const { error } = await supabase
            .from('places')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) throw error

        // 3. Send notifications
        if (newStatus === 'active' && oldPlace.status !== 'active') {
            await sendNotification(
                oldPlace.created_by,
                "مبروك! تمت الموافقة على مكانك",
                `تم تفعيل مكانك "${oldPlace.name}" وهو الآن ظاهر للجميع.`,
                "place_approval",
                `/admin/places` // Link to places list
            )
        } else if (newStatus === 'inactive' && oldPlace.status !== 'inactive') {
            await sendNotification(
                oldPlace.created_by,
                "تنبيه: تم تعطيل مكانك",
                `تم تغيير حالة مكانك "${oldPlace.name}" إلى معطل.`,
                "alert"
            )
        }

        revalidatePath('/admin/places')
        return { success: true }
    } catch (error: any) {
        console.error("Toggle Status Error:", error)
        return { success: false, message: error.message }
    }
}

export async function deletePlaceAction(id: string) {
    try {
        const supabase = await createClient()
        await deletePlaceUseCase.execute(id, supabase)
        revalidatePath('/admin/places')
        return { success: true }
    } catch (error: any) {
        console.error("Delete Place Error:", error)
        return { success: false, error: error.message }
    }
}
