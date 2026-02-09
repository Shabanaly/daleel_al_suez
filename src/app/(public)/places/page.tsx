import { PlacesListView } from "@/presentation/features/places-list-view";
import { getCategoriesUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic'; // Force dynamic rendering
export const revalidate = 0; // No caching

interface SearchParams {
    search?: string;
    category?: string;
    area?: string;
    sort?: string;
}

export default async function PlacesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams> | SearchParams;
}) {
    // Await searchParams for Next.js 15 compatibility
    const params = searchParams instanceof Promise ? await searchParams : searchParams;

    const supabase = await createClient()

    // Get all categories and areas for filters
    const [categories, { data: areasData }] = await Promise.all([
        getCategoriesUseCase.execute(),
        supabase.from('areas').select('id, name').order('name')
    ])

    const areas = areasData || []

    // Build query
    let query = supabase
        .from('places')
        .select('*, categories(name), areas(name)')
        .eq('status', 'active')

    // Apply search filter
    if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,address.ilike.%${params.search}%`)
    }

    // Apply category filter
    if (params.category) {
        const category = categories.find(c => c.slug === params.category)
        if (category) {
            query = query.eq('category_id', category.id)
        }
    }

    // Apply area filter
    if (params.area) {
        query = query.eq('area_id', params.area)
    }

    // Apply sorting
    switch (params.sort) {
        case 'rating':
            query = query.order('rating', { ascending: false })
            break
        case 'name':
            query = query.order('name', { ascending: true })
            break
        default: // 'recent'
            query = query.order('created_at', { ascending: false })
    }

    const { data: placesData } = await query

    interface PlaceQueryResult {
        id: string
        name: string
        slug: string
        description: string
        address: string
        phone: string
        whatsapp: string
        website: string
        facebook: string
        instagram: string
        map_link: string
        images: string[]
        category_id: string
        categories: { name: string } | null
        area_id: string
        areas: { name: string } | null
        rating: number
        review_count: number
        is_featured: boolean
        status: string
        type: string
        created_at: string
        [key: string]: unknown
    }

    const places = (placesData || []).map((record: Record<string, unknown>) => {
        const p = record as unknown as PlaceQueryResult
        return {
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
            status: p.status as "active" | "pending" | "inactive" | undefined,
            type: p.type as "business" | "professional",
            createdAt: p.created_at,
        }
    })

    // Generate title
    let title = "كل الأماكن"
    if (params.search) {
        title = `نتائج البحث: ${params.search}`
    } else if (params.category) {
        const cat = categories.find(c => c.slug === params.category)
        if (cat) title = cat.name
    }

    return (
        <PlacesListView
            places={places}
            title={title}
            categories={categories}
            areas={areas}
            resultsCount={places.length}
        />
    )
}

