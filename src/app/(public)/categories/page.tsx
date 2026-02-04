import type { Metadata } from 'next'
import { CategoriesView } from '@/presentation/features/categories-view'
import { getCategoriesUseCase } from '@/di/modules'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
    title: 'التصنيفات | دليل السويس',
    description: 'تصفح جميع التصنيفات في دليل السويس للعثور على ما تبحث عنه بسهولة.',
}

export const revalidate = 3600;

export default async function CategoriesPage() {
    const supabase = await createClient()

    // Get categories
    const categories = await getCategoriesUseCase.execute()

    // Get places count for each category
    const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
            const { count } = await supabase
                .from('places')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id)
                .eq('status', 'active')

            return { ...category, placesCount: count || 0 }
        })
    )

    return <CategoriesView categories={categoriesWithCount} />
}
