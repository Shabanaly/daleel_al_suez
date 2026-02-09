'use client'

import { useState } from 'react'
import { Sparkles, Check, X, MapPin, Globe, Phone, ExternalLink, Loader2, Clock } from 'lucide-react'
import { processSuggestedPlaceAction } from '@/app/admin/places/google-actions'
import { runAutoDiscoveryAction, clearImportedPlacesAction } from '@/actions/admin/google-discovery.actions'
import { toast } from 'sonner'
import Image from 'next/image'

interface SuggestedPlacesListViewProps {
    suggestions: any[]
    categories: any[]
    areas: any[]
}

export function SuggestedPlacesListView({ suggestions: initialSuggestions, categories, areas }: SuggestedPlacesListViewProps) {
    const [suggestions, setSuggestions] = useState(initialSuggestions)
    const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>(
        Object.fromEntries(initialSuggestions.map(s => [s.id, s.local_category_id || '']))
    )
    const [selectedAreas, setSelectedAreas] = useState<Record<string, string>>(
        Object.fromEntries(initialSuggestions.map(s => [s.id, s.area_id || '']))
    )
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [isDiscovering, setIsDiscovering] = useState(false)

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id)
        const toastId = toast.loading(action === 'approve' ? 'جاري الإضافة...' : 'جاري الرفض...')

        try {
            const categoryId = selectedCategories[id] || null;
            const areaId = selectedAreas[id] || null;
            const overrides = action === 'approve' ? { categoryId, areaId } : undefined;

            if (action === 'approve') {
                if (!categoryId) {
                    toast.error('يرجى اختيار تصنيف أولاً', { id: toastId });
                    setProcessingId(null);
                    return;
                }
                if (!areaId) {
                    toast.error('يرجى اختيار المنطقة أولاً', { id: toastId });
                    setProcessingId(null);
                    return;
                }
            }

            const result = await processSuggestedPlaceAction(id, action, overrides)
            if (result.success) {
                toast.success(result.message, { id: toastId })
                setSuggestions(prev => prev.filter(s => s.id !== id))
            } else {
                toast.error(result.message, { id: toastId })
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء المعالجة', { id: toastId })
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <Sparkles className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">مقترحات جوجل مابس</h1>
                            <p className="text-slate-400 text-xs sm:text-sm">مراجعة الأماكن التي تم جلبها تلقائياً</p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto md:mr-auto flex flex-col sm:flex-row gap-3 pt-4 md:pt-0 border-t border-slate-800 md:border-0">
                        <button
                            onClick={async () => {
                                if (!confirm('هل أنت متأكد من مسح كل المقترحات الحالية؟')) return;
                                const tid = toast.loading('جاري مسح البيانات...');
                                try {
                                    const res = await clearImportedPlacesAction();
                                    if (res.success) {
                                        toast.success('تم مسح البيانات بنجاح', { id: tid });
                                        setSuggestions([]);
                                    } else {
                                        toast.error(res.message || 'فشل مسح البيانات', { id: tid });
                                    }
                                } catch (e) {
                                    toast.error('حدث خطأ غير متوقع', { id: tid });
                                }
                            }}
                            className="w-full sm:w-auto bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 px-4 py-3 sm:py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-red-900/50"
                        >
                            <X size={18} />
                            مسح البيانات
                        </button>
                        <button
                            onClick={async () => {
                                setIsDiscovering(true);
                                const tid = toast.loading('جاري البحث عن أماكن جديدة في السويس...');
                                try {
                                    const res = await runAutoDiscoveryAction();
                                    if (res.success) {
                                        toast.success(`تم العثور على ${res.importedCount} مكان جديد`, { id: tid });
                                        window.location.reload();
                                    } else {
                                        toast.error('فشل جلب البيانات', { id: tid });
                                    }
                                } catch (e) {
                                    toast.error('حدث خطأ غير متوقع', { id: tid });
                                } finally {
                                    setIsDiscovering(false);
                                }
                            }}
                            disabled={isDiscovering}
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 sm:py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isDiscovering ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            تشغيل البحث التلقائي
                        </button>
                    </div>
                </div>
            </div>

            {suggestions.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                    <p className="text-slate-400">لا توجد مقترحات جديدة حالياً</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {suggestions.map((item) => (
                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                            <div className="flex flex-col lg:flex-row">
                                {/* Image Preview (Mobile scrollable, Desktop side) */}
                                <div className="w-full lg:w-48 xl:w-64 bg-slate-950 border-b lg:border-b-0 lg:border-l border-slate-800 flex overflow-x-auto lg:overflow-x-hidden snap-x hide-scrollbar">
                                    {(item.images && item.images.length > 0) ? (
                                        item.images.map((img: string, idx: number) => (
                                            <div key={idx} className="relative aspect-video lg:aspect-square w-full sm:w-1/2 md:w-1/3 lg:w-full shrink-0 snap-center border-r border-slate-800 last:border-0">
                                                <Image
                                                    src={img}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="aspect-video lg:aspect-square w-full bg-slate-800/50 flex items-center justify-center">
                                            <Sparkles className="text-slate-700" size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Info Section */}
                                <div className="p-4 sm:p-6 flex-1 space-y-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg sm:text-xl font-bold text-white">{item.name}</h3>
                                                {item.confidence_score >= 0.8 && (
                                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20">
                                                        ثقة عالية
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1">
                                                <MapPin size={14} className="shrink-0" />
                                                <span className="line-clamp-1">{item.address}</span>
                                            </p>
                                        </div>

                                        <div className="flex w-full sm:w-auto gap-2 border-t sm:border-0 pt-4 sm:pt-0">
                                            <button
                                                onClick={() => handleAction(item.id, 'reject')}
                                                disabled={processingId === item.id}
                                                className="flex-1 sm:flex-none p-3 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors border border-slate-800 flex items-center justify-center"
                                                title="رفض"
                                            >
                                                <X size={20} />
                                                <span className="sm:hidden mr-2 font-bold">رفض</span>
                                            </button>
                                            <button
                                                onClick={() => handleAction(item.id, 'approve')}
                                                disabled={processingId === item.id}
                                                className="flex-1 sm:flex-none p-3 sm:p-2 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                                title="موافقة"
                                            >
                                                {processingId === item.id ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                                <span className="sm:hidden font-bold">موافقة</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-800/50">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">التقييم</span>
                                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                                ⭐ {item.rating || 'N/A'}
                                                <span className="text-slate-500 text-xs font-normal">({item.review_count || 0})</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">التصنيف</span>
                                            <select
                                                value={selectedCategories[item.id] || ''}
                                                onChange={(e) => setSelectedCategories(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-1.5 focus:border-primary outline-none"
                                            >
                                                <option value="">اختر التصنيف...</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            {!selectedCategories[item.id] && (
                                                <p className="text-[9px] text-amber-500 font-bold mt-1">يُرجى تحديد التصنيف قبل الموافقة</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">الهاتف</span>
                                            <div className="text-slate-300 text-sm truncate flex items-center gap-1 font-mono">
                                                <Phone size={12} />
                                                {item.phone || '---'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">الموقع</span>
                                            <div className="text-slate-300 text-sm truncate">
                                                {item.website ? (
                                                    <a href={item.website} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                                        <Globe size={12} />
                                                        زيارة
                                                    </a>
                                                ) : '---'}
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">المنطقة</span>
                                                <select
                                                    value={selectedAreas[item.id] || ''}
                                                    onChange={(e) => setSelectedAreas(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-1.5 focus:border-primary outline-none"
                                                >
                                                    <option value="">اختر المنطقة...</option>
                                                    {areas.map((area: any) => (
                                                        <option key={area.id} value={area.id}>{area.name}</option>
                                                    ))}
                                                </select>
                                                {!selectedAreas[item.id] && (
                                                    <p className="text-[9px] text-amber-500 font-bold mt-1">يُرجى تحديد المنطقة</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">ساعات العمل</span>
                                            <div className="text-slate-300 text-sm truncate flex items-center gap-1 font-mono">
                                                <Clock size={12} />
                                                {item.opens_at ? `${item.opens_at} - ${item.closes_at}` : '---'}
                                            </div>
                                        </div>
                                    </div>

                                    {item.description && (
                                        <p className="text-slate-400 text-sm line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <a
                                            href={item.google_maps_url}
                                            target="_blank"
                                            className="text-xs text-slate-500 hover:text-white flex items-center gap-1"
                                        >
                                            <ExternalLink size={12} />
                                            فتح في جوجل مابس
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
