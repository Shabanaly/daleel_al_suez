import { ArticleRepository } from '../../interfaces/article-repository';

export class DeleteArticleUseCase {
    constructor(private articleRepository: ArticleRepository) { }

    async execute(id: string, client?: unknown): Promise<void> {
        return await this.articleRepository.delete(id, client);
    }
}
