import { Category } from "../entities/category";
import { ICategoryRepository } from "../interfaces/category-repository.interface";

export class GetCategoriesUseCase {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute(options?: { isFeatured?: boolean }): Promise<Category[]> {
        return this.categoryRepository.getAllCategories(options);
    }
}
