import { IReviewRepository } from '../../repositories/review.repository'
import { RatingStats } from '../../entities/review'

export class GetPlaceRatingStatsUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(placeId: string): Promise<RatingStats> {
        return await this.reviewRepository.getPlaceRatingStats(placeId)
    }
}
