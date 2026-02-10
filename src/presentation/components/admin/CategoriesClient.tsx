'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteCategory } from '@/actions/admin/categories.actions'
import { Plus, Pencil, Trash2, Search, Layers } from 'lucide-react'
import { getIconComponent } from '@/lib/icons'
import { format } from 'date-fns'
import type { Category } from '@/domain/entities/category'

export default function CategoriesClient({
    initialCategories,
    currentUserRole
}: {
    initialCategories: Category[]
    currentUserRole: string | null
}) {
    const [categories] = useState<Category[]>(initialCategories)
    const [searchQuery, setSearchQuery] = useState('')

    const isAdmin = currentUserRole === 'admin'

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div>
            {/* Header Card - Modern Design */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Title Section */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Layers className="text-primary" size={20} />
                            </div>
                            إدارة التصنيفات
                        </h1>
                        <p className="text-slate-400 text-sm mr-12">
                            {isAdmin ? 'أضف وقم بتعديل تصنيفات الأماكن' : 'عرض جميع تصنيفات الأماكن'}
                        </p>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="بحث عن تصنيف..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-white placeholder-slate-500 transition-all"
                            />
                        </div>

                        {/* Add Button - Admin Only */}
                        {isAdmin && (
                            <Link
                                href="/admin/categories/new"
                                className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-primary/20 hover:shadow-primary/30"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">إضافة تصنيف</span>
                                <span className="sm:hidden">إضافة</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-400 text-sm">التصنيف</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 text-sm hidden md:table-cell">الاسم اللطيف (Slug)</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 text-sm hidden sm:table-cell">تاريخ الإضافة</th>
                                {isAdmin && (
                                    <th className="px-6 py-4 font-semibold text-slate-400 text-sm w-20">الإجراءات</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredCategories.length > 0 ? filteredCategories.map((cat) => {
                                const IconComponent = getIconComponent(cat.icon || '')
                                return (
                                    <tr key={cat.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 min-w-[2.5rem] rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                                                    <IconComponent size={20} />
                                                </div>
                                                <div className="font-bold text-slate-200">
                                                    {cat.name}
                                                    {/* Mobile Only Metadata */}
                                                    <div className="flex flex-col gap-0.5 mt-0.5 md:hidden">
                                                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{cat.slug}</span>
                                                        <span className="text-[10px] text-slate-600 block sm:hidden">
                                                            {cat.createdAt ? format(new Date(cat.createdAt), 'dd MMM yyyy') : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs hidden md:table-cell">
                                            {cat.slug}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm hidden sm:table-cell">
                                            {cat.createdAt ? format(new Date(cat.createdAt), 'dd MMM yyyy') : '-'}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/categories/${cat.id}`}>
                                                        <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                            <Pencil size={18} />
                                                        </button>
                                                    </Link>
                                                    <form action={async (formData) => {
                                                        if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
                                                            await deleteCategory(formData)
                                                        }
                                                    }}>
                                                        <input type="hidden" name="id" value={cat.id} />
                                                        <button type="submit" className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-12 text-center text-slate-500">
                                        {searchQuery ? 'لا يوجد تصنيفات مطابقة للبحث' : 'لم يتم إضافة تصنيفات بعد'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
