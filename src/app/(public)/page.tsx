import { HomeView } from "@/presentation/features/home-view";
import { getFeaturedPlacesUseCase, getCategoriesUseCase, getActiveEventsUseCase, getLatestArticlesUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const supabase = await createClient()

  // Fetch featured places, categories and events
  const [featuredPlaces, categories, events, latestArticles] = await Promise.all([
    getFeaturedPlacesUseCase.execute(),
    getCategoriesUseCase.execute({ isFeatured: true }),
    getActiveEventsUseCase.execute(),
    getLatestArticlesUseCase.execute(3, supabase)
  ])

  // Get places count per category
  const categoriesWithCount = await Promise.all(
    categories.slice(0, 8).map(async (category: any) => {
      const { count } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'active')

      return { ...category, placesCount: count || 0 }
    })
  )

  return <HomeView featuredPlaces={featuredPlaces} categories={categoriesWithCount} events={events} latestArticles={latestArticles} />;
}
