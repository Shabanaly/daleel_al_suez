'use server'

import { createClient } from '@/lib/supabase/server'
import { createPlaceUseCase, deletePlaceUseCase, updatePlaceUseCase } from '@/di/modules'
import { revalidatePath } from 'next/cache'

export type ActionState = {
    message?: string
    errors?: Record<string, string[]>
    success?: boolean
}

export async function createPlaceAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const categoryId = formData.get('category_id') as string

    // Basic Validation
    const errors: Record<string, string[]> = {}
    if (!name) errors.name = ['Name is required']
    if (!categoryId) errors.category_id = ['Category is required']

    if (Object.keys(errors).length > 0) {
        return { success: false, message: 'برجاء التأكد من البيانات المدخلة', errors }
    }

    const slug = name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000)

    try {
        await createPlaceUseCase.execute({
            name,
            slug,
            categoryId,
            address: formData.get('address') as string,
            description: formData.get('description') as string,
            phone: formData.get('phone') as string,
            whatsapp: formData.get('whatsapp') as string,
            googleMapsUrl: formData.get('google_maps_url') as string,
            opensAt: formData.get('opens_at') as string,
            closesAt: formData.get('closes_at') as string,
            images: [],
        }, user.id)

        revalidatePath('/admin/places')
        return { success: true, message: 'تم حفظ المكان بنجاح' }
    } catch (e: unknown) {
        console.error(e)
        const message = e instanceof Error ? e.message : 'فشل في حفظ المكان'
        return { success: false, message }
    }
}

export async function updatePlaceAction(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const categoryId = formData.get('category_id') as string

    const errors: Record<string, string[]> = {}
    if (!name) errors.name = ['Name is required']
    if (!categoryId) errors.category_id = ['Category is required']

    if (Object.keys(errors).length > 0) {
        return { success: false, message: 'برجاء التأكد من البيانات المدخلة', errors }
    }

    try {
        await updatePlaceUseCase.execute(id, {
            name,
            categoryId,
            address: formData.get('address') as string,
            description: formData.get('description') as string,
            phone: formData.get('phone') as string,
        })

        revalidatePath('/admin/places')
        return { success: true, message: 'تم تحديث البيانات بنجاح' }
    } catch (e: unknown) {
        console.error(e)
        const message = e instanceof Error ? e.message : 'فشل في تحديث البيانات'
        return { success: false, message }
    }
}

export async function deletePlaceAction(placeId: string): Promise<ActionState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        await deletePlaceUseCase.execute(placeId, supabase)
        revalidatePath('/admin/places')
        return { success: true, message: 'تم الحذف بنجاح' }
    } catch (e: unknown) {
        console.error('SERVER ACTION ERROR:', e)
        const message = e instanceof Error ? e.message : 'فشل الحذف'
        return { success: false, message }
    }
}
