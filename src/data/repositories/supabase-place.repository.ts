import { createClient } from "@/lib/supabase/client";
import { Place } from "@/domain/entities/place";
import { IPlaceRepository } from "@/domain/interfaces/place-repository.interface";

export class SupabasePlaceRepository implements IPlaceRepository {
    private supabase = createClient();

    async getFeaturedPlaces(): Promise<Place[]> {
        const { data, error } = await this.supabase
            .from("places")
            .select("*, categories(name), areas(name)")
            .eq("status", "active")
            .eq("is_featured", true)
            .limit(6);

        if (error) throw new Error(error.message);

        return data.map(this.mapToEntity);
    }

    async getPlacesByCategory(categorySlug: string): Promise<Place[]> {
        // First get category ID (Optimize later with join if needed or simple ID lookup)
        const { data: category } = await this.supabase
            .from("categories")
            .select("id")
            .eq("slug", categorySlug)
            .single();

        if (!category) return [];

        const { data, error } = await this.supabase
            .from("places")
            .select("*, categories(name), areas(name)")
            .eq("status", "active")
            .eq("category_id", category.id);

        if (error) throw new Error(error.message);
        return data.map(this.mapToEntity);
    }

    async getPlaceBySlug(slug: string): Promise<Place | null> {
        const { data, error } = await this.supabase
            .from("places")
            .select("*, categories(name), areas(name)")
            .eq("slug", slug)
            .single();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    async searchPlaces(query: string): Promise<Place[]> {
        const { data, error } = await this.supabase
            .from("places")
            .select("*, categories(name), areas(name)")
            .eq("status", "active")
            .ilike("name", `%${query}%`);

        if (error) return [];
        return data.map(this.mapToEntity);
    }

    async getAdminPlaces(filters: {
        userId?: string;
        search?: string;
        categoryId?: string;
        areaId?: string;
        status?: string;
    }): Promise<Place[]> {
        let query = this.supabase
            .from("places")
            .select("*, categories(name), areas(name), profiles:created_by(full_name)")
            .order("created_at", { ascending: false });

        if (filters.userId) {
            query = query.eq("created_by", filters.userId);
        }

        if (filters.search) {
            query = query.ilike("name", `%${filters.search}%`);
        }

        if (filters.categoryId && filters.categoryId !== 'all') {
            query = query.eq("category_id", filters.categoryId);
        }

        if (filters.areaId && filters.areaId !== 'all') {
            query = query.eq("area_id", filters.areaId);
        }

        if (filters.status && filters.status !== 'all') {
            query = query.eq("status", filters.status);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        return data.map(this.mapToEntity);
    }

    async getPlacesByOwner(userId: string): Promise<Place[]> {
        const { data, error } = await this.supabase
            .from("places")
            .select("*, categories(name), areas(name)")
            .eq("created_by", userId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return data.map(this.mapToEntity);
    }

    async getAllPlaces(): Promise<Place[]> {
        const { data, error } = await this.supabase
            .from("places")
            .select("*, categories(name), areas(name), profiles:created_by(full_name)")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return data.map(this.mapToEntity);
    }

    async createPlace(place: Partial<Place>, userId: string, client?: any): Promise<Place> {
        const supabaseClient = client || this.supabase;
        const { data, error } = await supabaseClient
            .from("places")
            .insert({
                name: place.name,
                slug: place.slug,
                category_id: place.categoryId,
                area_id: place.areaId,
                type: place.type,
                address: place.address,
                description: place.description,
                phone: place.phone,
                whatsapp: place.whatsapp,
                google_maps_url: place.googleMapsUrl,
                website: place.website,
                social_links: place.socialLinks,
                images: place.images,
                created_by: userId,
                opens_at: place.opensAt,
                closes_at: place.closesAt,
                status: place.status || 'pending'
            })
            .select("*, categories(name), areas(name)")
            .single();

        if (error) throw new Error(error.message);
        return this.mapToEntity(data);
    }

    async updatePlace(id: string, place: Partial<Place>, client?: any): Promise<Place> {
        const supabaseClient = client || this.supabase;
        const updates: any = { ...place };

        // Map DTO keys to DB (manual mapping because we don't have a mapper yet)
        if (place.categoryId) updates.category_id = place.categoryId;
        if (place.areaId) updates.area_id = place.areaId;
        if (place.socialLinks) updates.social_links = place.socialLinks;
        if (place.googleMapsUrl) updates.google_maps_url = place.googleMapsUrl;
        if (place.opensAt !== undefined) updates.opens_at = place.opensAt;
        if (place.closesAt !== undefined) updates.closes_at = place.closesAt;

        // Clean up entity keys
        delete updates.categoryId;
        delete updates.categoryName;
        delete updates.areaId;
        delete updates.areaName;
        delete updates.socialLinks;
        delete updates.googleMapsUrl;
        delete updates.opensAt;
        delete updates.closesAt;
        delete updates.createdBy;
        delete updates.createdByName;
        delete updates.id;

        const { data, error } = await supabaseClient
            .from("places")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Fetch related data separately if needed
        if (data.category_id || data.area_id) {
            const { data: fullData } = await supabaseClient
                .from("places")
                .select("*, categories(name), areas(name)")
                .eq("id", id)
                .single();

            return this.mapToEntity(fullData || data);
        }

        return this.mapToEntity(data);
    }

    async deletePlace(id: string, client?: any): Promise<void> {
        const supabaseClient = client || this.supabase;
        const { error } = await supabaseClient
            .rpc('delete_place_securely', { p_place_id: id });

        if (error) throw new Error(error.message);
    }

    async getPlaceById(id: string): Promise<Place | null> {
        const { data, error } = await this.supabase
            .from("places")
            .select("*, categories(name), areas(name)")
            .eq("id", id)
            .single();

        if (error) return null;
        return this.mapToEntity(data);
    }

    private mapToEntity(row: any): Place {
        return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            description: row.description,
            address: row.address,
            images: row.images || [],
            rating: row.rating,
            reviewCount: row.review_count,
            isFeatured: row.is_featured,

            // Relations
            categoryName: row.categories?.name,
            categoryId: row.category_id,
            areaName: row.areas?.name,
            areaId: row.area_id,
            createdByName: row.profiles?.full_name,
            createdBy: row.created_by,

            // Contact & Details
            phone: row.phone,
            whatsapp: row.whatsapp,
            googleMapsUrl: row.google_maps_url,
            website: row.website,
            socialLinks: row.social_links || {},
            opensAt: row.opens_at,
            closesAt: row.closes_at,
            type: row.type || 'business',
            status: row.status
        };
    }
}
