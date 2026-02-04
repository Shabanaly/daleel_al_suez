import { Place } from "@/domain/entities/place";
import { Category } from "@/domain/entities/category";
import { PlaceCard } from "../components/place-card";
import { PlacesSearchBar } from "../components/places-search-bar";
import { PlacesFilters } from "../components/places-filters";
import { MapPin, Grid3x3 } from "lucide-react";

interface PlacesListViewProps {
    places: Place[];
    title?: string;
    categories: Category[];
    areas: { id: string; name: string }[];
    resultsCount: number;
}

export function PlacesListView({
    places,
    title = "كل الأماكن",
    categories,
    areas,
    resultsCount
}: PlacesListViewProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-primary to-blue-600 text-white py-12 md:py-16 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/40"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="text-yellow-300" size={32} />
                            <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">{title}</h1>
                        </div>
                        <p className="text-slate-100 text-lg drop-shadow-md">
                            اكتشف أفضل الأماكن في السويس
                        </p>

                        {/* Search Bar */}
                        <div className="pt-4">
                            <PlacesSearchBar />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Filters */}
                <div className="mb-6">
                    <PlacesFilters categories={categories} areas={areas} />
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Grid3x3 size={18} />
                        <span className="text-sm">
                            {resultsCount} {resultsCount === 1 ? 'مكان' : 'أماكن'}
                        </span>
                    </div>
                </div>

                {/* Places Grid */}
                {places.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {places.map((place) => (
                            <PlaceCard key={place.id} place={place} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 max-w-lg mx-auto">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                لا توجد نتائج
                            </h3>
                            <p className="text-muted-foreground">
                                لم نعثر على أماكن مطابقة لبحثك. جرب تعديل الفلاتر أو البحث بكلمات مختلفة.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
