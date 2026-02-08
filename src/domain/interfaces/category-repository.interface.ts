import { Category } from "../entities/category";

export interface ICategoryRepository {
    getAllCategories(options?: { isFeatured?: boolean }): Promise<Category[]>;
    getCategoryBySlug(slug: string): Promise<Category | null>;
}
