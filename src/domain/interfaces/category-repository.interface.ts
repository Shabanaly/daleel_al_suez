import { Category } from "../entities/category";

export interface ICategoryRepository {
    getAllCategories(options?: { isFeatured?: boolean; orderBy?: 'name' | 'created_at' }, client?: unknown): Promise<Category[]>;
    getCategoryBySlug(slug: string, client?: unknown): Promise<Category | null>;
    getCategoryById(id: string, client?: unknown): Promise<Category | null>;
}
