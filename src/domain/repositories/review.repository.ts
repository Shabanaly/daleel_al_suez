import { Review, RatingStats } from '../entities/review'

export interface IReviewRepository {
    // Get reviews
    getReviewsByPlace(placeId: string, userId?: string): Promise<Review[]>
    getReviewById(id: string): Promise<Review | null>
    getUserReviewForPlace(userId: string, placeId: string): Promise<Review | null>

    // Create/Update/Delete
    createReview(review: {
        placeId: string
        userId: string
        rating: number
        title?: string
        comment: string
        isAnonymous?: boolean
        userName?: string
        userAvatar?: string
    }): Promise<Review>
    updateReview(id: string, data: {
        rating?: number
        title?: string
        comment?: string
        isAnonymous?: boolean
    }): Promise<Review>
    deleteReview(id: string): Promise<void>

    // Stats
    getPlaceRatingStats(placeId: string): Promise<RatingStats>

    // Helpful votes
    voteReview(reviewId: string, userId: string, isHelpful: boolean): Promise<void>
    removeVote(reviewId: string, userId: string): Promise<void>
    getUserVote(reviewId: string, userId: string): Promise<boolean | null>
}
