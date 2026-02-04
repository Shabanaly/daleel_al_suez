import { IReviewRepository } from '../../repositories/review.repository'
import { Review } from '../../entities/review'

export class GetPlaceReviewsUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(placeId: string, userId?: string): Promise<Review[]> {
        return await this.reviewRepository.getReviewsByPlace(placeId, userId)
    }
}
