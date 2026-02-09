import { Article, CreateArticleDTO } from '../../entities/article';
import { ArticleRepository } from '../../interfaces/article-repository';

export class CreateArticleUseCase {
    constructor(private articleRepository: ArticleRepository) { }

    async execute(article: CreateArticleDTO, client?: unknown): Promise<Article> {
        return await this.articleRepository.create(article, client);
    }
}
