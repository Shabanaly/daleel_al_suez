import { Article, UpdateArticleDTO } from '../../entities/article';
import { ArticleRepository } from '../../interfaces/article-repository';

export class UpdateArticleUseCase {
    constructor(private articleRepository: ArticleRepository) { }

    async execute(article: UpdateArticleDTO, client?: unknown): Promise<Article> {
        return await this.articleRepository.update(article, client);
    }
}
