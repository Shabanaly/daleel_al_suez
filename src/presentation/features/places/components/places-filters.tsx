'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Category } from '@/domain/entities/category'

interface PlacesFiltersProps {
    categories: Category[]
    areas: { id: string; name: string }[]
}

export function PlacesFilters({ categories, areas }: PlacesFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)

    const selectedCategory = searchParams.get('category') || ''
    const selectedArea = searchParams.get('area') || ''
    const selectedSort = searchParams.get('sort') || 'recent'

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        router.push(`/places?${params.toString()}`)
        router.refresh() // Force server component to re-fetch data
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('category')
        params.delete('area')
        params.delete('sort')
        router.push(`/places?${params.toString()}`)
        router.refresh() // Force server component to re-fetch data
    }

    const hasActiveFilters = selectedCategory || selectedArea || (selectedSort && selectedSort !== 'recent')

    return (
        <div className="space-y-4">
            {/* Toggle Button (Mobile) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-full flex items-center justify-between bg-card border border-border px-4 py-3 rounded-xl"
            >
                <span className="flex items-center gap-2 font-medium">
                    <Filter size={18} />
                    الفلاتر
                    {hasActiveFilters && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            نشط
                        </span>
                    )}
                </span>
                <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filters Container */}
            <div className={`${isOpen ? 'block' : 'hidden'} md:block space-y-4`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">التصنيف</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => updateFilter('category', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary focus:outline-none text-sm"
                        >
                            <option value="">كل التصنيفات</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Area Filter */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">المنطقة</label>
                        <select
                            value={selectedArea}
                            onChange={(e) => updateFilter('area', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary focus:outline-none text-sm"
                        >
                            <option value="">كل المناطق</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">الترتيب</label>
                        <select
                            value={selectedSort}
                            onChange={(e) => updateFilter('sort', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary focus:outline-none text-sm"
                        >
                            <option value="recent">الأحدث</option>
                            <option value="rating">الأعلى تقييماً</option>
                            <option value="name">الاسم (أ-ي)</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={16} />
                                مسح الفلاتر
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                                {categories.find(c => c.slug === selectedCategory)?.name}
                                <button onClick={() => updateFilter('category', '')} className="hover:bg-primary/20 rounded-full p-0.5">
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {selectedArea && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                                {areas.find(a => a.id === selectedArea)?.name}
                                <button onClick={() => updateFilter('area', '')} className="hover:bg-primary/20 rounded-full p-0.5">
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
