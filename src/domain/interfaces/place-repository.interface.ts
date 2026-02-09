import { Place } from "../entities/place";

export interface IPlaceRepository {
    getFeaturedPlaces(): Promise<Place[]>;
    getPlacesByCategory(categorySlug: string): Promise<Place[]>;
    searchPlaces(query: string): Promise<Place[]>;

    // Admin Methods
    getAdminPlaces(filters: {
        userId?: string;
        search?: string;
        categoryId?: string;
        areaId?: string;
        status?: string;
    }): Promise<Place[]>;

    getPlacesByOwner(userId: string): Promise<Place[]>;

    // CRUD
    createPlace(data: Partial<Place>, createdBy: string, client?: unknown): Promise<Place>;
    updatePlace(id: string, data: Partial<Place>, client?: unknown): Promise<Place>;
    deletePlace(id: string, client?: unknown): Promise<void>;
    getPlaceById(id: string): Promise<Place | null>;
    getPlaceBySlug(slug: string, client?: unknown): Promise<Place | null>;
    getPlaceByGoogleId(googleId: string): Promise<Place | null>;
}
