'use server'

import {
    importGooglePlaceUseCase,
    searchGooglePlacesUseCase
} from '@/di/modules'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const DISCOVERY_QUERIES = [
    'مطاعم في السويس، مصر',
    'كافيهات ومقاهي في السويس',
    'محلات ملابس في السويس',
    'أطباء وعيادات في السويس',
    'ورش صيانة سيارات السويس',
    'قاعات أفراح في السويس',
    'فنادق ومنتجعات السويس',
    'أماكن ترفيه في السويس'
];

export async function runAutoDiscoveryAction() {
    // 1. Fetch all categories
    const { getCategoriesUseCase } = await import('@/di/modules');
    const categories = await getCategoriesUseCase.execute();

    let importedCount = 0;
    const errors: string[] = [];

    console.log(`[Auto Discovery] Starting for ${categories.length} categories...`);

    for (const category of categories) {
        const query = `${category.name} في السويس`;
        console.log(`[Auto Discovery] Searching: "${query}" (Cat: ${category.name})...`);

        try {
            const results = await searchGooglePlacesUseCase.execute(query);
            console.log(`[Auto Discovery] Found ${results.length} places for ${category.name}.`);

            for (const place of results) {
                // Pass the specific category ID to force accurate mapping
                const result = await importGooglePlaceUseCase.execute(
                    place.googlePlaceId,
                    'auto_pending',
                    place,
                    category.id
                );

                if (result.success) {
                    importedCount++;
                }
            }
        } catch (error: any) {
            console.error(`[Auto Discovery] Error processing ${category.name}:`, error.message);
            errors.push(`Error ${category.name}: ${error.message}`);
        }
    }

    revalidatePath('/admin/places/suggestions');
    return { success: true, importedCount, errors };
}

export async function runComprehensiveDiscoveryAction() {
    // 1. Fetch all categories
    // We need to dynamically import to avoid circular deps if any, but modules are safe here.
    const { getCategoriesUseCase } = await import('@/di/modules');
    const categories = await getCategoriesUseCase.execute();

    let totalImported = 0;
    const report: string[] = [];

    console.log(`[Bulk Discovery] Starting for ${categories.length} categories...`);

    for (const category of categories) {
        const query = `${category.name} في السويس`;
        console.log(`[Bulk Discovery] Searching: "${query}" (Cat: ${category.name})...`);

        try {
            const results = await searchGooglePlacesUseCase.execute(query);
            console.log(`[Bulk Discovery] Found ${results.length} places for ${category.name}.`);

            for (const place of results) {
                // Pass the specific category ID to force accurate mapping
                const result = await importGooglePlaceUseCase.execute(
                    place.googlePlaceId,
                    'auto_pending',
                    place,
                    category.id // <--- The Fix
                );

                if (result.success) {
                    totalImported++;
                    // report.push(`✅ ${place.name} -> ${category.name}`);
                }
            }
        } catch (error: any) {
            console.error(`[Bulk Discovery] Error processing ${category.name}:`, error.message);
            report.push(`❌ Error ${category.name}: ${error.message}`);
        }
    }

    revalidatePath('/admin/places/suggestions');
    return { success: true, totalImported, report };
}

export async function clearImportedPlacesAction() {
    try {
        const supabase = await createClient();
        // Delete all records from imported_places
        const { error } = await supabase.from('imported_places').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;

        revalidatePath('/admin/places/suggestions');
        return { success: true };
    } catch (error) {
        console.error('Cleanup Error:', error);
        return { success: false, message: 'فشل في تنظيف البيانات' };
    }
}
