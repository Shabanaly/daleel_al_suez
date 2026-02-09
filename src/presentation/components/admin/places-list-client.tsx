'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { Pencil, MapPin, ChevronDown, ChevronUp, Phone, Globe, MapPinned, Calendar } from 'lucide-react'
import Image from 'next/image'
import { Place } from '@/domain/entities/place'
import { DeletePlaceButton } from './delete-place-button'
import { ToggleStatusButton } from './toggle-status-button'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface PlacesListClientProps {
    places: Place[]
    isSuperAdmin: boolean
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        active: 'bg-green-500/10 text-green-500 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        inactive: 'bg-red-500/10 text-red-500 border-red-500/20',
    }
    const labels = {
        active: 'نشط',
        pending: 'مراجعة',
        inactive: 'معطل',
    }
    const currentStyle = styles[status as keyof typeof styles] || styles.inactive
    const label = labels[status as keyof typeof labels] || status

    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${currentStyle}`}>
            {label}
        </span>
    )
}

export function PlacesListClient({ places, isSuperAdmin }: PlacesListClientProps) {
    const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null)

    const toggleExpanded = (placeId: string) => {
        setExpandedPlaceId(expandedPlaceId === placeId ? null : placeId)
    }

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-950/50 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm">المكان</th>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm hidden sm:table-cell">الحالة</th>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm hidden md:table-cell">التصنيف</th>
                            {isSuperAdmin && <th className="px-6 py-4 font-semibold text-slate-400 text-sm hidden lg:table-cell">المضيف</th>}
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm w-24">الإجراءات</th>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {(places && places.length > 0) ? places.map((place) => (
                            <Fragment key={place.id}>
                                <tr
                                    className={`transition-colors cursor-pointer ${expandedPlaceId === place.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/50'}`}
                                >
                                    <td className="px-6 py-4" onClick={() => toggleExpanded(place.id)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 relative overflow-hidden border border-slate-700/50 hover:border-primary/20 transition-colors shrink-0">
                                                {place.images && place.images.length > 0 ? (
                                                    <Image src={place.images[0]} alt={place.name} fill className="object-cover" sizes="48px" unoptimized referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                                                        <MapPin size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-200 mb-0.5">{place.name}</div>
                                                <div className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{place.slug}</div>
                                                <div className="block sm:hidden mt-1">
                                                    <StatusBadge status={place.status || 'active'} />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell" onClick={() => toggleExpanded(place.id)}>
                                        <StatusBadge status={place.status || 'active'} />
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden md:table-cell" onClick={() => toggleExpanded(place.id)}>
                                        <div className="flex flex-col">
                                            <span className="text-slate-300">{place.categoryName}</span>
                                            <span className="text-xs text-slate-500">{place.areaName || 'بدون منطقة'}</span>
                                        </div>
                                    </td>
                                    {isSuperAdmin && (
                                        <td className="px-6 py-4 text-slate-400 text-sm hidden lg:table-cell" onClick={() => toggleExpanded(place.id)}>
                                            {place.createdByName || 'N/A'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/admin/places/${place.id}/edit`}>
                                                <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="تعديل">
                                                    <Pencil size={18} />
                                                </button>
                                            </Link>
                                            <DeletePlaceButton id={place.id} />
                                            {isSuperAdmin && (
                                                <ToggleStatusButton id={place.id} currentStatus={place.status || 'inactive'} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-left" onClick={() => toggleExpanded(place.id)}>
                                        {expandedPlaceId === place.id ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                                    </td>
                                </tr>

                                {/* Expanded Details Row */}
                                {expandedPlaceId === place.id && (
                                    <tr className="bg-slate-900/50">
                                        <td colSpan={isSuperAdmin ? 6 : 5} className="p-0">
                                            <div className="p-6 border-b border-slate-800 animate-in slide-in-from-top-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Description */}
                                                    <div className="md:col-span-2">
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">الوصف</h4>
                                                        <p className="text-sm text-slate-400 leading-relaxed">
                                                            {place.description || 'لا يوجد وصف'}
                                                        </p>
                                                    </div>

                                                    {/* Contact Info */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">معلومات الاتصال</h4>
                                                        <div className="space-y-2">
                                                            {place.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                    <Phone size={14} className="text-primary" />
                                                                    <span dir="ltr">{place.phone}</span>
                                                                </div>
                                                            )}
                                                            {place.website && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                    <Globe size={14} className="text-primary" />
                                                                    <a href={place.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                                                        {place.website}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Location */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">الموقع</h4>
                                                        <div className="space-y-2">
                                                            {place.address && (
                                                                <div className="flex items-start gap-2 text-sm text-slate-400">
                                                                    <MapPinned size={14} className="text-primary mt-0.5 shrink-0" />
                                                                    <span>{place.address}</span>
                                                                </div>
                                                            )}
                                                            {place.createdAt && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                    <Calendar size={14} className="text-primary" />
                                                                    <span>تم الإنشاء: {format(new Date(place.createdAt), 'dd MMM yyyy', { locale: ar })}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        )) : (
                            <tr>
                                <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                                    لا توجد أماكن مطابقة للفلاتر الحالية.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
