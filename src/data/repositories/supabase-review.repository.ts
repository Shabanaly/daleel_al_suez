import { SupabaseClient } from '@supabase/supabase-js'
import { IReviewRepository } from '@/domain/repositories/review.repository'
import { Review, RatingStats } from '@/domain/entities/review'

export class SupabaseReviewRepository implements IReviewRepository {
    constructor(private supabase: SupabaseClient) { }

    async getReviewsByPlace(placeId: string, userId?: string): Promise<Review[]> {
        const { data, error } = await this.supabase
            .from('reviews')
            .select('*')
            .eq('place_id', placeId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        const reviews = (data || []).map(this.mapToEntity)

        if (userId && reviews.length > 0) {
            const reviewIds = reviews.map(r => r.id)
            const { data: votes } = await this.supabase
                .from('review_votes')
                .select('review_id, is_helpful')
                .eq('user_id', userId)
                .in('review_id', reviewIds)

            if (votes && votes.length > 0) {
                const voteMap = new Map(votes.map((v: any) => [v.review_id, v.is_helpful]))
                reviews.forEach(r => {
                    r.currentUserVote = voteMap.get(r.id) ?? null
                })
            }
        }

        return reviews
    }

    async getReviewById(id: string): Promise<Review | null> {
        const { data, error } = await this.supabase
            .from('reviews')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw new Error(error.message)
        }

        return this.mapToEntity(data)
    }

    async getUserReviewForPlace(userId: string, placeId: string): Promise<Review | null> {
        const { data, error } = await this.supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId)
            .eq('place_id', placeId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw new Error(error.message)
        }

        return this.mapToEntity(data)
    }

    async createReview(review: {
        placeId: string
        userId: string
        rating: number
        title?: string
        comment: string
        isAnonymous?: boolean
        userName?: string
        userAvatar?: string
    }): Promise<Review> {
        // Use RPC function to bypass RLS and handle stats update atomically
        const { data: reviewId, error: rpcError } = await this.supabase
            .rpc('submit_review', {
                p_place_id: review.placeId,
                p_rating: review.rating,
                p_comment: review.comment,
                p_title: review.title,
                p_is_anonymous: review.isAnonymous || false,
                p_user_name: review.userName,
                p_user_avatar: review.userAvatar
            })

        if (rpcError) throw new Error(rpcError.message)

        // Fetch the created review to return it
        const { data, error } = await this.supabase
            .from('reviews')
            .select('*')
            .eq('id', reviewId.id) // RPC returns an object with ID
            .single()

        if (error) throw new Error(error.message)
        return this.mapToEntity(data)
    }

    // ... (unchanged methods)



    async updateReview(id: string, updateData: {
        rating?: number
        title?: string
        comment?: string
        isAnonymous?: boolean
    }): Promise<Review> {
        const { data, error } = await this.supabase
            .from('reviews')
            .update({
                ...(updateData.rating !== undefined && { rating: updateData.rating }),
                ...(updateData.title !== undefined && { title: updateData.title }),
                ...(updateData.comment !== undefined && { comment: updateData.comment }),
                ...(updateData.isAnonymous !== undefined && { is_anonymous: updateData.isAnonymous }),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select('*')
            .single()

        if (error) throw new Error(error.message)
        return this.mapToEntity(data)
    }

    async deleteReview(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('reviews')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
    }

    async getPlaceRatingStats(placeId: string): Promise<RatingStats> {
        const { data, error } = await this.supabase
            .from('reviews')
            .select('rating')
            .eq('place_id', placeId)
            .eq('status', 'approved')

        if (error) throw new Error(error.message)

        const reviews = data || []
        const totalReviews = reviews.length

        if (totalReviews === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            }
        }

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
        const averageRating = sum / totalReviews

        const distribution = reviews.reduce((acc, r) => {
            acc[r.rating as keyof typeof acc] = (acc[r.rating as keyof typeof acc] || 0) + 1
            return acc
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            ratingDistribution: distribution
        }
    }

    async voteReview(reviewId: string, userId: string, isHelpful: boolean): Promise<void> {
        const { data: existingVote } = await this.supabase
            .from('review_votes')
            .select('id, is_helpful')
            .eq('review_id', reviewId)
            .eq('user_id', userId)
            .single()

        if (existingVote) {
            const { error } = await this.supabase
                .from('review_votes')
                .update({ is_helpful: isHelpful })
                .eq('id', existingVote.id)

            if (error) throw new Error(error.message)
        } else {
            const { error } = await this.supabase
                .from('review_votes')
                .insert({
                    review_id: reviewId,
                    user_id: userId,
                    is_helpful: isHelpful
                })

            if (error) throw new Error(error.message)
        }

        await this.updateHelpfulCount(reviewId)
    }

    async removeVote(reviewId: string, userId: string): Promise<void> {
        const { error } = await this.supabase
            .from('review_votes')
            .delete()
            .eq('review_id', reviewId)
            .eq('user_id', userId)

        if (error) throw new Error(error.message)

        await this.updateHelpfulCount(reviewId)
    }

    async getUserVote(reviewId: string, userId: string): Promise<boolean | null> {
        const { data, error } = await this.supabase
            .from('review_votes')
            .select('is_helpful')
            .eq('review_id', reviewId)
            .eq('user_id', userId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw new Error(error.message)
        }

        return data.is_helpful
    }

    private async updateHelpfulCount(reviewId: string): Promise<void> {
        const { data, error } = await this.supabase
            .from('review_votes')
            .select('is_helpful')
            .eq('review_id', reviewId)

        if (error) throw new Error(error.message)

        const helpfulCount = (data || []).filter(v => v.is_helpful).length

        await this.supabase
            .from('reviews')
            .update({ helpful_count: helpfulCount })
            .eq('id', reviewId)
    }

    private mapToEntity(data: any): Review {
        const isAnonymous = data.is_anonymous || false;

        return {
            id: data.id,
            placeId: data.place_id,
            userId: data.user_id,
            // Prioritize stored denormalized data (user_name), then relation, then fallback
            userName: isAnonymous
                ? 'مستخدم'
                : (data.user_name || data.users?.raw_user_meta_data?.full_name || data.users?.email?.split('@')[0] || 'مستخدم'),
            userAvatar: isAnonymous
                ? undefined
                : (data.user_avatar || data.users?.raw_user_meta_data?.avatar_url),
            rating: data.rating,
            title: data.title,
            comment: data.comment,
            helpfulCount: data.helpful_count || 0,
            status: data.status,
            isAnonymous: isAnonymous,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        }
    }
}
