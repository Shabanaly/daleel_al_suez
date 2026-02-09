'use client'

import { ReviewsSection as ReviewsSectionClient } from './reviews-section-client'
import { Review, RatingStats, ReviewFormData } from '@/domain/entities/review'
import { createReviewAction, updateReviewAction, deleteReviewAction, voteReviewAction } from '@/actions/reviews.actions'

interface ReviewsSectionWrapperProps {
    placeId: string
    placeName: string
    placeSlug: string
    reviews: Review[]
    ratingStats: RatingStats
    currentUserId?: string
    userReview?: Review | null
}

export function ReviewsSectionWrapper(props: ReviewsSectionWrapperProps) {
    const handleCreateReview = async (data: ReviewFormData) => {
        await createReviewAction(props.placeId, props.placeSlug, data)
    }

    const handleUpdateReview = async (reviewId: string, data: ReviewFormData) => {
        await updateReviewAction(reviewId, props.placeSlug, data)
    }

    const handleDeleteReview = async (reviewId: string) => {
        await deleteReviewAction(reviewId, props.placeSlug)
    }

    const handleVoteReview = async (reviewId: string, isHelpful: boolean) => {
        await voteReviewAction(reviewId, props.placeSlug, isHelpful)
    }

    return (
        <ReviewsSectionClient
            placeId={props.placeId}
            placeName={props.placeName}
            reviews={props.reviews}
            ratingStats={props.ratingStats}
            currentUserId={props.currentUserId}
            userReview={props.userReview}
            onCreateReview={handleCreateReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
            onVoteReview={handleVoteReview}
        />
    )
}
