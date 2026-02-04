import { PlacesListView } from "@/presentation/features/places-list-view";
import { getCategoriesUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function CategoryDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }> | { slug: string };
}) {
    const { slug } = params instanceof Promise ? await params : params;
    const supabase = await createClient()

    // Get all categories for filters
    const categories = await getCategoriesUseCase.execute()

    // Find the current category
    const currentCategory = categories.find(c => c.slug === slug)
    if (!currentCategory) {
        notFound()
    }

    // Get places in this category
    const { data: placesData } = await supabase
        .from('places')
        .select('*, categories(name), areas(name)')
        .eq('category_id', currentCategory.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    // Get areas for filters
    const { data: areasData } = await supabase
        .from('areas')
        .select('id, name')
        .order('name')

    const areas = areasData || []

    // Map to Place entities
    const places = (placesData || []).map((p: any) => ({
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
        <PlacesListView
            places={places}
            title={currentCategory.name}
            categories={categories}
            areas={areas}
            resultsCount={places.length}
        />
    )
}
