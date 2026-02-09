'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Category } from '@/domain/entities/category'
import { Area } from '@/domain/entities/area'

interface Props {
    categories: Category[]
    areas: Area[]
    users?: { id: string, full_name: string | null }[] // For Super Admin
}

import { RequestCategoryButton } from '@/presentation/components/admin/request-category-button'

export default function PlacesFilterBar({ categories, areas, users }: Props) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        router.replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    const hasActiveFilters = searchParams.toString().length > 0

    const clearFilters = () => {
        router.replace(pathname)
    }



    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-400">تصفية النتائج</h3>
                <RequestCategoryButton />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="بحث عن مكان..."
                        defaultValue={searchParams.get('search')?.toString()}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white placeholder-slate-500 transition-colors"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={searchParams.get('categoryId') || 'all'}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                >
                    <option value="all">كل التصنيفات</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                {/* Area Filter */}
                <select
                    value={searchParams.get('areaId') || 'all'}
                    onChange={(e) => handleFilterChange('areaId', e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                >
                    <option value="all">كل المناطق</option>
                    {areas.map((area) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                </select>

                {/* Status Filter */}
                <select
                    value={searchParams.get('status') || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                >
                    <option value="all">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="pending">قيد المراجعة</option>
                    <option value="inactive">غير نشط</option>
                </select>

                {/* User Filter (Super Admin Only) */}
                {users && users.length > 0 && (
                    <select
                        value={searchParams.get('creatorId') || 'all'}
                        onChange={(e) => handleFilterChange('creatorId', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                    >
                        <option value="all">كل المستخدمين</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.full_name || 'مستخدم بدون اسم'}</option>
                        ))}
                    </select>
                )}
            </div>

            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                    <button
                        onClick={clearFilters}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                        <X size={14} />
                        إلغاء الفلاتر
                    </button>
                </div>
            )}
        </div>
    )
}
