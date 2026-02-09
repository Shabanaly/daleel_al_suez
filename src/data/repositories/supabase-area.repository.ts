import { IAreaRepository } from "@/domain/interfaces/area-repository.interface";
import { Area } from "@/domain/entities/area";
import { createClient } from "@/lib/supabase/client";

interface SupabaseArea {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export class SupabaseAreaRepository implements IAreaRepository {
    async getAreas(client?: unknown): Promise<Area[]> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || createClient();

        const { data, error } = await supabase
            .from('areas')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching areas:', error);
            return [];
        }

        return (data as SupabaseArea[]).map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            createdAt: item.created_at
        }));
    }
}
