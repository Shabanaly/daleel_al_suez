import { createClient } from "@/lib/supabase/client";
import { Category } from "@/domain/entities/category";
import { ICategoryRepository } from "@/domain/interfaces/category-repository.interface";

export class SupabaseCategoryRepository implements ICategoryRepository {
    private supabase = createClient();

    async getAllCategories(): Promise<Category[]> {
        const { data, error } = await this.supabase
            .from("categories")
            .select("*")
            .order("name");

        if (error) throw new Error(error.message);
        return data.map(this.mapToEntity);
    }

    async getCategoryBySlug(slug: string): Promise<Category | null> {
        const { data, error } = await this.supabase
            .from("categories")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    private mapToEntity(row: any): Category {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            icon: row.icon
        };
    }
}
