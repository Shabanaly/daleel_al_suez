import { Category } from "../entities/category";
import { ICategoryRepository } from "../interfaces/category-repository.interface";

export class GetCategoriesUseCase {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute(options?: { isFeatured?: boolean; orderBy?: 'name' | 'created_at' }, client?: unknown): Promise<Category[]> {
        return this.categoryRepository.getAllCategories(options, client);
    }
}
