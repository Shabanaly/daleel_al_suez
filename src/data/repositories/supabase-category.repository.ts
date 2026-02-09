import { createClient } from "@/lib/supabase/client";
import { Category } from "@/domain/entities/category";
import { ICategoryRepository } from "@/domain/interfaces/category-repository.interface";

interface SupabaseCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
}

export class SupabaseCategoryRepository implements ICategoryRepository {
    private supabase = createClient();

    async getAllCategories(options?: { isFeatured?: boolean; orderBy?: 'name' | 'created_at' }, client?: unknown): Promise<Category[]> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        let query = supabase
            .from("categories")
            .select("*");

        if (options?.isFeatured) {
            query = query.eq('is_featured', true);
            query = query.order('sort_order', { ascending: true });
        } else if (options?.orderBy === 'created_at') {
            query = query.order('created_at', { ascending: false });
        } else {
            query = query.order("name");
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        return (data as SupabaseCategory[]).map(row => this.mapToEntity(row));
    }

    async getCategoryBySlug(slug: string, client?: unknown): Promise<Category | null> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapToEntity(data as SupabaseCategory);
    }

    async getCategoryById(id: string, client?: unknown): Promise<Category | null> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapToEntity(data as SupabaseCategory);
    }

    private mapToEntity(row: SupabaseCategory): Category {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            icon: row.icon,
            is_featured: row.is_featured,
            sort_order: row.sort_order,
            createdAt: row.created_at
        };
    }
}
