import { createClient } from "@/lib/supabase/client";
import { IFavoritesRepository } from "@/domain/repositories/favorites.repository";

import { SupabaseClient } from "@supabase/supabase-js";
import { Place } from "@/domain/entities/place";

export class SupabaseFavoritesRepository implements IFavoritesRepository {
    private supabase: SupabaseClient;

    constructor(supabaseClient?: SupabaseClient) {
        this.supabase = supabaseClient || createClient();
    }

    async addFavorite(userId: string, placeId: string): Promise<void> {
        const { error } = await this.supabase
            .from('favorites')
            .insert({ user_id: userId, place_id: placeId });

        if (error) throw new Error(error.message);
    }

    async removeFavorite(userId: string, placeId: string): Promise<void> {
        const { error } = await this.supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('place_id', placeId);

        if (error) throw new Error(error.message);
    }

    async isFavorite(userId: string, placeId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('favorites')
            .select('place_id')
            .match({ user_id: userId, place_id: placeId })
            .maybeSingle();

        if (error) throw new Error(error.message);
        return !!data;
    }

    async getUserFavorites(userId: string): Promise<Place[]> {
        const { data, error } = await this.supabase
            .from('favorites')
            .select('place_id, places(*)') // Join with places table
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        // We use a local type for the joined structure
        interface FavoriteWithPlace {
            place_id: string;
            places: unknown; // Cast in mapper
        }

        const favorites = data as unknown as FavoriteWithPlace[];
        return favorites.map((item) => this.mapPlaceToEntity(item.places as Parameters<typeof this.mapPlaceToEntity>[0]));
    }

    private mapPlaceToEntity(row: {
        id: string;
        slug: string;
        name: string;
        description: string | null;
        address: string | null;
        images: string[] | null;
        rating: number | null;
        review_count: number | null;
        is_featured: boolean | null;
        category_id: string | null;
        area_id: string | null;
        phone: string | null;
        whatsapp: string | null;
        google_maps_url: string | null;
        website: string | null;
        social_links: Record<string, string> | null;
        opens_at: string | null;
        closes_at: string | null;
        type: string | null;
        status: string | null;
    }): Place {
        return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            description: row.description || '',
            address: row.address || '',
            images: row.images || [],
            rating: row.rating || 0,
            reviewCount: row.review_count || 0,
            isFeatured: row.is_featured || false,
            categoryId: row.category_id || '',
            areaId: row.area_id || '',
            phone: row.phone || '',
            whatsapp: row.whatsapp || '',
            googleMapsUrl: row.google_maps_url || '',
            website: row.website || '',
            socialLinks: row.social_links || {},
            opensAt: row.opens_at || '',
            closesAt: row.closes_at || '',
            type: (row.type as 'business' | 'professional') || 'business',
            status: (row.status as 'active' | 'pending' | 'inactive') || 'pending'
        };
    }
}
