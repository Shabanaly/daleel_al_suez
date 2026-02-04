import { notFound } from "next/navigation";
import { PlaceDetailsView } from "@/presentation/features/place-details-view";
import { getPlaceBySlugUseCase, getPlaceReviewsUseCase, getPlaceRatingStatsUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function PlaceDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }> | { slug: string };
}) {
    const { slug } = params instanceof Promise ? await params : params;

    // 1. Get place details
    const place = await getPlaceBySlugUseCase.execute(slug);

    if (!place) {
        notFound();
    }

    const supabase = await createClient()

    // 2. Get current user (if logged in)
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Fetch reviews and stats
    const [reviews, ratingStats] = await Promise.all([
        getPlaceReviewsUseCase.execute(place.id, user?.id),
        getPlaceRatingStatsUseCase.execute(place.id)
    ])

    // 4. Get user's review if logged in
    let userReview = null
    if (user) {
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('*')
            .eq('place_id', place.id)
            .eq('user_id', user.id)
            .single()

        if (existingReview) {
            userReview = {
                id: existingReview.id,
                placeId: existingReview.place_id,
                userId: existingReview.user_id,
                rating: existingReview.rating,
                title: existingReview.title,
                comment: existingReview.comment,
                helpfulCount: existingReview.helpful_count || 0,
                status: existingReview.status,
                createdAt: existingReview.created_at,
                updatedAt: existingReview.updated_at,
            }
        }
    }

    // 5. Fetch related places from same category
    const { data: relatedPlaces } = await supabase
        .from('places')
        .select('*, categories(name), areas(name)')
        .eq('category_id', place.categoryId)
        .eq('status', 'active')
        .neq('id', place.id)
        .limit(4)

    // Map to Place entities
    const related = (relatedPlaces || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        address: p.address,
        phone: p.phone,
        whatsapp: p.whatsapp,
        website: p.website,
        facebook: p.facebook,
        instagram: p.instagram,
        mapLink: p.map_link,
        images: p.images || [],
        categoryId: p.category_id,
        categoryName: p.categories?.name,
        areaId: p.area_id,
        areaName: p.areas?.name,
        rating: p.rating || 0,
        reviewCount: p.review_count || 0,
        isFeatured: p.is_featured || false,
        status: p.status,
        type: p.type,
        createdAt: p.created_at,
    }))

    return (
        <PlaceDetailsView
            place={place}
            relatedPlaces={related}
            reviews={reviews}
            ratingStats={ratingStats}
            currentUserId={user?.id}
            userReview={userReview}
        />
    );
}
