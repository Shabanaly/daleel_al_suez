import { getSuggestedPlacesUseCase, getCategoriesUseCase, getAreasUseCase } from '@/di/modules'
import { SuggestedPlacesListView } from '@/presentation/components/admin/SuggestedPlacesListView'

export default async function SuggestedPlacesPage() {
    const [suggestions, categories, areas] = await Promise.all([
        getSuggestedPlacesUseCase.execute(),
        getCategoriesUseCase.execute(),
        getAreasUseCase.execute()
    ]);

    return (
        <div className="w-full">
            <SuggestedPlacesListView
                suggestions={suggestions}
                categories={categories}
                areas={areas}
            />
        </div>
    );
}
