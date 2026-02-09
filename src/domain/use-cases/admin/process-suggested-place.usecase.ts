import { ImportedPlaceRepo } from "@/domain/interfaces/imported-place-repository.interface";
import { IPlaceRepository } from "@/domain/interfaces/place-repository.interface";
import { createClient } from "@/lib/supabase/server";
import { translateAndSlugify } from "@/app/actions/translate";

export class ProcessSuggestedPlaceUseCase {
    constructor(
        private importedRepo: ImportedPlaceRepo,
        private placeRepo: IPlaceRepository
    ) { }

    async execute(id: string, action: 'approve' | 'reject', adminId: string, overrides?: any) {
        if (action === 'reject') {
            await this.importedRepo.updateStatus(id, 'rejected');
            return { success: true, message: 'تم رفض الاقتراح' };
        }

        // 1. Fetch the staged data
        const supabase = await createClient();
        const { data: staged, error } = await supabase
            .from('imported_places')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !staged) throw new Error('Proposal not found');

        // 2. Prepare data for the live table
        // Use Google Translate for slugs as requested
        const translatedSlug = await translateAndSlugify(staged.name);
        const slug = (translatedSlug || staged.name.toLowerCase().replace(/ /g, '-')) + '-' + Math.floor(Math.random() * 1000);

        // Sanitize UUID fields: convert empty strings to null to avoid Postgres UUID errors
        const sanitizedCategoryId = (overrides?.categoryId || staged.local_category_id || '').trim() || null;
        const sanitizedAreaId = (overrides?.areaId || staged.area_id || '').trim() || null;

        // Safety Check: Never allow adding a place without a category to the live table
        if (!sanitizedCategoryId) {
            throw new Error('يجب تحديد تصنيف صالح للمكان قبل الموافقة عليه.');
        }

        const placeData = {
            name: staged.name,
            slug: slug,
            description: staged.description,
            address: staged.address,
            phone: staged.phone,
            website: staged.website,
            googleMapsUrl: staged.google_maps_url,
            images: staged.images,
            categoryId: sanitizedCategoryId,
            areaId: sanitizedAreaId,
            rating: staged.rating,
            reviewCount: staged.review_count,
            google_place_id: staged.google_place_id,
            opensAt: staged.opens_at,
            closesAt: staged.closes_at,
            status: 'active',
            ...overrides
        };

        // Ensure no empty strings in UUID fields if present in overrides
        if (placeData.categoryId === "") placeData.categoryId = null;
        if (placeData.areaId === "") placeData.areaId = null;

        // 3. Create live place
        const newPlace = await this.placeRepo.createPlace(placeData, adminId, supabase);

        // 4. Update status in staging
        await this.importedRepo.updateStatus(id, 'approved');

        return { success: true, message: 'تمت الموافقة وإضافة المكان بنجاح', place: newPlace };
    }
}
