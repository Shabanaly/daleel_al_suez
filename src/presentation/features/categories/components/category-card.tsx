import Link from 'next/link'
import { Category } from '@/domain/entities/category'
import { CategoryIcon } from './category-icon'
import { ArrowLeft } from 'lucide-react'

interface CategoryCardProps {
    category: Category
    placesCount?: number
}

export function CategoryCard({ category, placesCount = 0 }: CategoryCardProps) {
    return (
        <Link
            href={`/categories/${category.slug}`}
            className="group relative bg-card hover:bg-card/80 border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 group-hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <CategoryIcon
                        name={category.icon || category.name}
                        size={32}
                        className="text-primary"
                    />
                </div>

                {/* Name */}
                <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                    </h3>
                    {category.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Places Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{placesCount}</span>
                    <span>مكان</span>
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                </div>
            </div>

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </Link>
    )
}
