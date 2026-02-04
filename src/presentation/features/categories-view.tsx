import { Category } from '@/domain/entities/category'
import { CategoryCard } from '../components/category-card'
import { Grid3x3, Sparkles } from 'lucide-react'

interface CategoriesViewProps {
    categories: (Category & { placesCount?: number })[]
}

export function CategoriesView({ categories }: CategoriesViewProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary to-blue-600 text-white py-16 md:py-20 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/40"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
                        <Sparkles size={16} className="text-yellow-300" />
                        <span className="text-sm font-medium">استكشف التصنيفات</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                        جميع التصنيفات
                    </h1>
                    <p className="text-xl text-slate-100 max-w-2xl mx-auto drop-shadow-md">
                        تصفح الأقسام المختلفة للعثور على أفضل الخدمات والأماكن في مدينة السويس
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-2 mt-8 text-sm">
                        <Grid3x3 size={18} className="text-yellow-300" />
                        <span>{categories.length} تصنيف متاح</span>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="container mx-auto px-4 py-12">
                {categories && categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                placesCount={category.placesCount}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 max-w-lg mx-auto">
                            <div className="text-6xl mb-4">📂</div>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                لا توجد تصنيفات
                            </h3>
                            <p className="text-muted-foreground">
                                لا توجد تصنيفات متاحة حالياً.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
