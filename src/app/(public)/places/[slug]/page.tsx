import { notFound } from "next/navigation";
import { PlaceDetailsView } from "@/presentation/features/place-details-view";
import { getPlaceBySlugUseCase, getPlaceReviewsUseCase, getPlaceRatingStatsUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const place = await getPlaceBySlugUseCase.execute(slug);

    if (!place) {
        return {
            title: 'Place Not Found',
        }
    }

    const title = `${place.name} | دليل السويس`;
    const description = place.description?.substring(0, 160) || `تفاصيل ومعلومات عن ${place.name} في السويس. العنوان، رقم الهاتف، وتقييمات العملاء.`;
    const images = place.images && place.images.length > 0 ? [place.images[0]] : [];

    // Convert string-based time to ISO date string for valid OpenGraph if needed, 
    // but for article:published_time we usually need a date. 
    // Here we'll just stick to basic OpenGraph tags.

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: 'website',
            locale: 'ar_EG',
            siteName: 'دليل السويس',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
        alternates: {
            canonical: `/places/${place.slug}`,
        }
    }
}

export default async function PlaceDetailsPage({
    params,
}: Props) {
    const { slug } = await params;

    // 1. Get place details
    const place = await getPlaceBySlugUseCase.execute(slug);

    if (!place) {
        notFound();
    }

    // JSON-LD Structured Data
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dalil-al-suways.vercel.app';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: place.name,
        image: place.images,
        description: place.description,
        address: {
            '@type': 'PostalAddress',
            streetAddress: place.address,
            addressLocality: 'Suez',
            addressRegion: 'Suez',
            addressCountry: 'EG'
        },
        telephone: place.phone,
        url: `${baseUrl}/places/${place.slug}`,
        aggregateRating: place.rating ? {
            '@type': 'AggregateRating',
            ratingValue: place.rating,
            reviewCount: place.reviewCount || 0
        } : undefined,
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
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PlaceDetailsView
                place={place}
                relatedPlaces={related}
                reviews={reviews}
                ratingStats={ratingStats}
                currentUserId={user?.id}
                userReview={userReview}
            />
        </>
    );
}
