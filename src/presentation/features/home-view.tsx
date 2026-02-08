import Link from "next/link";
import { Place } from "@/domain/entities/place";
import { Category } from "@/domain/entities/category";
import { SuezEvent } from "@/domain/entities/suez-event";
import { PlaceCard } from "../components/place-card";
import { CategoryCard } from "../components/category-card";
import { EventCard } from "../components/events/event-card";
import { HeroSearchBar } from "../components/hero-search-bar";
import { ArrowLeft, Sparkles, Grid3x3, Calendar } from "lucide-react";

interface HomeViewProps {
    featuredPlaces: Place[];
    categories: (Category & { placesCount?: number })[];
    events: SuezEvent[];
}

export function HomeView({ featuredPlaces, categories, events }: HomeViewProps) {
    return (
        <div className="space-y-16 pb-12">
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 dark:from-slate-950 dark:to-slate-900 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/40"></div>

                {/* Animated Circles */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                {/* Content */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
                        <Sparkles size={16} className="text-yellow-300" />
                        <span className="text-sm font-medium">دليلك الشامل لمدينة السويس</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        اكتشف <span className="text-yellow-300">السويس</span><br />
                        في مكان واحد
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-100 mb-8 max-w-2xl mx-auto">
                        أفضل المطاعم، الكافيهات، الخدمات، والفعاليات في مدينتك بسهولة
                    </p>

                    {/* Search Bar */}
                    <HeroSearchBar />

                    {/* Quick Stats */}
                    <div className="flex items-center justify-center gap-8 mt-12 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>{featuredPlaces.length}+ مكان مميز</span>
                        </div>
                        <div className="w-px h-4 bg-white/30"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span>{categories.length} تصنيف</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Places */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-primary" size={24} />
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground">أماكن مميزة</h2>
                        </div>
                        <p className="text-muted-foreground">مختارات خاصة لك من أفضل أماكن السويس</p>
                    </div>
                    <Link href="/places" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all group">
                        عرض الكل
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredPlaces.map((place) => (
                        <PlaceCard key={place.id} place={place} />
                    ))}
                </div>
            </section>

            {/* Upcoming Events */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="text-primary" size={24} />
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground">فعاليات قادمة</h2>
                        </div>
                        <p className="text-muted-foreground">اكتشف أحدث الأحداث والأنشطة في مدينة السويس</p>
                    </div>
                    <Link href="/events" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all group">
                        عرض كل الفعاليات
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.slice(0, 3).map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-900/5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                        <p className="text-muted-foreground">لا توجد فعاليات قادمة حالياً. ترقبوا المزيد قريباً!</p>
                    </div>
                )}
            </section>

            {/* Categories Grid */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Grid3x3 className="text-primary" size={24} />
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground">استكشف التصنيفات</h2>
                        </div>
                        <p className="text-muted-foreground">تصفح الأماكن حسب الفئة المناسبة لك</p>
                    </div>
                    <Link href="/categories" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all group">
                        كل التصنيفات
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            placesCount={category.placesCount}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
