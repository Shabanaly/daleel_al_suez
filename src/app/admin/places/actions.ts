'use server'

import { createClient } from '@/lib/supabase/server'
import { createPlaceUseCase, deletePlaceUseCase, updatePlaceUseCase } from '@/di/modules'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPlaceAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const name = formData.get('name') as string
    const categoryId = formData.get('category_id') as string

    // Basic Validation
    if (!name || !categoryId) {
        throw new Error('Validations failed')
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
            images: [], // Todo: Handle Image Upload later
        }, user.id)

        revalidatePath('/admin/places')
    } catch (e) {
        console.error(e)
        // In a real app, return functionality to show error
        throw e
    }

    redirect('/admin/places')
}

export async function deletePlaceAction(placeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        await deletePlaceUseCase.execute(placeId, supabase)
        revalidatePath('/admin/places')
        return { success: true, message: 'تم الحذف بنجاح' }
    } catch (e: any) {
        console.error('SERVER ACTION ERROR:', e)
        return { success: false, message: e.message || 'فشل الحذف' }
    }
}

export async function updatePlaceAction(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const name = formData.get('name') as string
    const categoryId = formData.get('category_id') as string

    if (!name || !categoryId) {
        throw new Error('Validations failed')
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
    } catch (e) {
        console.error(e)
        throw e
    }

    redirect('/admin/places')
}
