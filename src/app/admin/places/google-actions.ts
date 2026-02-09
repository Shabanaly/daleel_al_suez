'use server'

import { createClient } from '@/lib/supabase/server'
import {
    importGooglePlaceUseCase,
    processSuggestedPlaceUseCase,
    googlePlacesService
} from '@/di/modules'
import { revalidatePath } from 'next/cache'

export async function fetchGooglePlaceByUrlAction(url: string) {
    try {
        const details = await googlePlacesService.fetchPlaceByUrl(url);
        if (!details) return { success: false, message: 'لم يتم العثور على المكان أو الرابط غير صحيح' };

        return { success: true, data: details };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function importGooglePlaceAction(googlePlaceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        const result = await importGooglePlaceUseCase.execute(googlePlaceId);
        revalidatePath('/admin/places/suggestions');
        return result;
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function processSuggestedPlaceAction(id: string, action: 'approve' | 'reject', overrides?: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        const result = await processSuggestedPlaceUseCase.execute(id, action, user.id, overrides);
        revalidatePath('/admin/places/suggestions');
        revalidatePath('/admin/places');
        return result;
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
