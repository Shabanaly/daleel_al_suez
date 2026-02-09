import { Article } from '../../entities/article';
import { ArticleRepository } from '../../interfaces/article-repository';

export class GetAdminArticlesUseCase {
    constructor(private articleRepository: ArticleRepository) { }

    async execute(limit: number = 20, offset: number = 0, client?: unknown): Promise<Article[]> {
        return await this.articleRepository.getAll(limit, offset, client);
    }
}
