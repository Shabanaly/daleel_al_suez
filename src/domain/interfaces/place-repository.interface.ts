import { Place } from "../entities/place";

export interface IPlaceRepository {
    getFeaturedPlaces(): Promise<Place[]>;
    getPlacesByCategory(categorySlug: string): Promise<Place[]>;
    getPlaceBySlug(slug: string): Promise<Place | null>;
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
    getAllPlaces(): Promise<Place[]>; // For Super Admin
    createPlace(place: Partial<Place>, userId: string, client?: any): Promise<Place>;
    updatePlace(id: string, place: Partial<Place>, client?: any): Promise<Place>;
    deletePlace(id: string, client?: any): Promise<void>;
    getPlaceById(id: string): Promise<Place | null>;
}
