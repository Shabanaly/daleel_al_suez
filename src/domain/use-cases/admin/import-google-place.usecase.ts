import { GooglePlaceDetails, IGooglePlacesService } from "@/domain/interfaces/google-places-service.interface";
import { IPlaceRepository } from "@/domain/interfaces/place-repository.interface";
import { ImportedPlaceRepo } from "@/domain/interfaces/imported-place-repository.interface";

export class ImportGooglePlaceUseCase {
    constructor(
        private googleService: IGooglePlacesService,
        private placeRepo: IPlaceRepository,
        private importedRepo: ImportedPlaceRepo
    ) { }

    async execute(googlePlaceId: string, status: 'pending' | 'auto_pending' = 'pending', preFetchedDetails?: GooglePlaceDetails, targetCategoryId?: string) {
        // 1. Check if already in live places
        const existingLive = await this.placeRepo.getPlaceByGoogleId(googlePlaceId);
        if (existingLive) return { success: false, message: 'المكان موجود بالفعل في النظام', id: existingLive.id };

        // 2. Check if already in staging
        const existingStaged = await this.importedRepo.getByGooglePlaceId(googlePlaceId);
        if (existingStaged) return { success: true, message: 'المكان موجود بالفعل في قائمة الانتظار', id: existingStaged.id };

        // 3. Get full details (use pre-fetched if available)
        const details = preFetchedDetails || await this.googleService.getPlaceDetails(googlePlaceId);
        if (!details) return { success: false, message: 'فشل في جلب بيانات المكان من جوجل' };

        // 4. Calculate Confidence Score
        const confidenceScore = this.calculateConfidence(details);

        // 5. Try to find local category
        const localCategoryId = targetCategoryId || await this.matchCategory(details.googleTypes, details.name);

        // 6. Extract opening hours (simplified: take first available range)
        let opensAt = '';
        let closesAt = '';
        if (details.openingHours) {
            // Try to find any day's hours to use as a representative range
            const firstDayHours = Object.values(details.openingHours)[0];
            if (firstDayHours && firstDayHours.includes('–')) {
                const parts = firstDayHours.split('–');
                opensAt = parts[0].trim();
                closesAt = parts[1].trim();
            }
        }

        // 7. Save to staging
        await this.importedRepo.create({
            google_place_id: details.googlePlaceId,
            name: details.name,
            description: details.description,
            address: details.address,
            phone: details.phone,
            website: details.website,
            google_maps_url: details.googleMapsUrl,
            rating: details.rating,
            review_count: details.reviewCount,
            images: details.images,
            google_types: details.googleTypes,
            local_category_id: localCategoryId,
            status,
            confidence_score: confidenceScore,
            source: 'google',
            opens_at: opensAt,
            closes_at: closesAt
        });

        return { success: true, message: 'تم إضافة المكان لقائمة الانتظار بنجاح' };
    }

    private calculateConfidence(details: GooglePlaceDetails): number {
        let score = 0;
        if (details.phone) score += 0.2;
        if (details.website) score += 0.2;
        if (details.rating && details.rating >= 4) score += 0.2;
        if (details.reviewCount && details.reviewCount > 10) score += 0.2;
        if (details.images && details.images.length > 0) score += 0.2;
        return score;
    }

    private async matchCategory(googleTypes: string[], name: string): Promise<string | null> {
        const fromTypes = await this.importedRepo.matchCategory(googleTypes);
        if (fromTypes) return fromTypes;

        // Fallback: simple keyword matching in name if types map fails
        const nameLower = name.toLowerCase();
        if (nameLower.includes('مطعم') || nameLower.includes('restaurant')) return '7369235755060963982';

        return null;
    }
}
