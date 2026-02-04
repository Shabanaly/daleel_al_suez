import { Category } from "../entities/category";

export interface ICategoryRepository {
    getAllCategories(): Promise<Category[]>;
    getCategoryBySlug(slug: string): Promise<Category | null>;
}
