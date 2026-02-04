import { Category } from "../entities/category";
import { ICategoryRepository } from "../interfaces/category-repository.interface";

export class GetCategoriesUseCase {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute(): Promise<Category[]> {
        return this.categoryRepository.getAllCategories();
    }
}
