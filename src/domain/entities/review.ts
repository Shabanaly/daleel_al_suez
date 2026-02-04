export interface Review {
    id: string
    placeId: string
    placeName?: string
    userId: string
    userName?: string
    userAvatar?: string
    rating: number
    title?: string
    comment: string
    helpfulCount: number
    currentUserVote?: boolean | null
    status: 'pending' | 'approved' | 'rejected'
    isAnonymous?: boolean
    createdAt: string
    updatedAt: string
}

export interface ReviewFormData {
    rating: number
    title?: string
    comment: string
    isAnonymous?: boolean
}

export interface RatingStats {
    averageRating: number
    totalReviews: number
    ratingDistribution: {
        1: number
        2: number
        3: number
        4: number
        5: number
    }
}
