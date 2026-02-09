import Link from "next/link";
import { Place } from "@/domain/entities/place";
import { Category } from "@/domain/entities/category";
import { SuezEvent } from "@/domain/entities/suez-event";
import { PlaceCard } from "@/presentation/features/places/components/place-card";
import { CategoryCard } from "@/presentation/features/categories/components/category-card";
import { EventCard } from "@/presentation/features/events/event-card";
import { EventHeroSlider } from "./events/event-hero-slider";
import { HomeNewsSection } from "./news/home-news-section";
import { Article } from "@/domain/entities/article";
import { HeroSearchBar } from "@/presentation/features/places/components/hero-search-bar";
import { ArrowLeft, Sparkles, Grid3x3, Calendar } from "lucide-react";

interface HomeViewProps {
    featuredPlaces: Place[];
    categories: (Category & { placesCount?: number })[];
    events: SuezEvent[];
    latestArticles: Article[];
}

export function HomeView({ featuredPlaces, categories, events, latestArticles }: HomeViewProps) {
    return (
        <div className="space-y-16 pb-12">
            {/* Hero Section - Search & Welcome */}
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
                    <div className="max-w-2xl mx-auto">
                        <HeroSearchBar />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-center gap-8 mt-12 text-sm text-white/80">
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

            {/* Premium Events Slider */}
            <div className="pt-8">
                <div className="container mx-auto px-4 mb-8">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-primary" size={24} />
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">فاعليات السويس</h2>
                    </div>
                </div>
                <EventHeroSlider events={events} />
            </div>

            {/* Categories Grid - Quick Exploration */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Grid3x3 className="text-primary" size={24} />
                            <h2 className="text-2xl md:text-4xl font-bold text-foreground">استكشف التصنيفات</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">تصفح أفضل أماكن السويس حسب الفئة</p>
                    </div>
                    <Link href="/categories" className="inline-flex items-center gap-2 text-primary font-bold hover:underline transition-all group">
                        كل التصنيفات
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            placesCount={category.placesCount}
                        />
                    ))}
                </div>
            </section>

            {/* Featured Places */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-primary" size={24} />
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">أماكن مميزة</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">مختارات خاصة لك من أفضل أماكن السويس</p>
                    </div>
                    <Link href="/places" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl font-semibold shadow-md transition-all group">
                        عرض الكل
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredPlaces.slice(0, 8).map((place) => (
                        <PlaceCard key={place.id} place={place} />
                    ))}
                </div>
            </section>

            <div className="pt-8">
                <HomeNewsSection articles={latestArticles} />
            </div>

            {/* Other Content can go here (e.g. SEO text, Download App, etc) */}
        </div>
    );
}
