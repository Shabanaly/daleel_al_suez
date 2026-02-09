import { Category } from "../../entities/category";
import { ICategoryRepository } from "../../interfaces/category-repository.interface";

export class GetCategoryByIdUseCase {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute(id: string, client?: unknown): Promise<Category | null> {
        return this.categoryRepository.getCategoryById(id, client);
    }
}
