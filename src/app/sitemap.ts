import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dalil-al-suways.vercel.app'
    const supabase = await createClient()

    // 1. Static Routes
    const routes = [
        '',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/events',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
    }))

    // 2. Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, created_at')

    const categoryRoutes = (categories || []).map((category) => ({
        url: `${baseUrl}/categories/${encodeURIComponent(category.slug)}`,
        lastModified: new Date(category.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 3. Places
    const { data: places } = await supabase
        .from('places')
        .select('slug, updated_at')
        .eq('status', 'active')

    const placeRoutes = (places || []).map((place) => ({
        url: `${baseUrl}/places/${encodeURIComponent(place.slug)}`,
        lastModified: new Date(place.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    return [...routes, ...categoryRoutes, ...placeRoutes]
}
