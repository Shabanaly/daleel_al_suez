import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'
import { Place } from '@/domain/entities/place'
import PlacesFilterBar from '@/presentation/components/admin/PlacesFilterBar'
import { Category } from '@/domain/entities/category'
import { Area } from '@/domain/entities/area'
import { PlacesListClient } from './places-list-client'

interface AdminPlacesListViewProps {
    places: Place[]
    categories: Category[]
    areas: Area[]
    users?: { id: string, full_name: string | null }[]
    currentUserRole?: string | null
}

export function AdminPlacesListView({ places, categories, areas, users, currentUserRole }: AdminPlacesListViewProps) {
    const isAdmin = currentUserRole === 'admin'

    return (
        <div>
            {/* Header Card - Modern Design */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Title Section */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <MapPin className="text-primary" size={20} />
                            </div>
                            إدارة الأماكن
                        </h1>
                        <p className="text-slate-400 text-sm mr-12">
                            عرض وإدارة جميع الأماكن في الدليل
                        </p>
                    </div>

                    {/* Add Button */}
                    <Link
                        href="/admin/places/new"
                        className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">إضافة مكان جديد</span>
                        <span className="sm:hidden">إضافة</span>
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <PlacesFilterBar
                categories={categories}
                areas={areas}
                users={users}
            />

            {/* Places List with Expandable Details */}
            <PlacesListClient places={places} isSuperAdmin={isAdmin} />
        </div>
    )
}
