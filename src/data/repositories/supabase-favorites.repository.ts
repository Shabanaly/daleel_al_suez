import { createClient } from "@/lib/supabase/client";
import { IFavoritesRepository } from "@/domain/repositories/favorites.repository";

export class SupabaseFavoritesRepository implements IFavoritesRepository {
    private supabase: any;

    constructor(supabaseClient?: any) {
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
            .match({ user_id: userId, place_id: placeId });

        if (error) throw new Error(error.message);
    }

    async isFavorite(userId: string, placeId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('favorites')
            .select('place_id')
            .match({ user_id: userId, place_id: placeId })
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return !!data;
    }

    async getUserFavorites(userId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('favorites')
            .select('place_id, places(*)') // Join with places table
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data.map((item: any) => item.places);
    }
}
