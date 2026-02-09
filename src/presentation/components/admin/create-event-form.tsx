'use client'

import { useActionState, useState, useEffect } from 'react'
import { createEventAction, updateEventAction } from '@/actions/admin/events.actions'
import { Place } from '@/domain/entities/place'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar, MapPin, Type, FileText, Image as ImageIcon, Link2, Save, X, Loader2 } from 'lucide-react'
import ImageUpload from '@/presentation/ui/image-upload'
import { useDebounce } from 'use-debounce'
import { translateAndSlugify } from '@/app/actions/translate'

import { SuezEvent } from '@/domain/entities/suez-event'
import { EventState } from '@/actions/admin/events.actions'

interface CreateEventFormProps {
    places: Place[]
    initialData?: Partial<SuezEvent>
}

export function CreateEventForm({ places, initialData }: CreateEventFormProps) {
    const router = useRouter()
    const isEdit = !!initialData
    const [images, setImages] = useState<string[]>(initialData?.imageUrl ? [initialData.imageUrl] : [])
    const [title, setTitle] = useState(initialData?.title || '')
    const [slug, setSlug] = useState(initialData?.slug || '')
    const [debouncedTitle] = useDebounce(title, 1000)
    const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)

    // Auto-generate slug
    useEffect(() => {
        const generateSlug = async () => {
            if (debouncedTitle && !initialData?.slug && !slug) {
                setIsGeneratingSlug(true)
                try {
                    const generated = await translateAndSlugify(debouncedTitle)
                    setSlug(generated)
                } catch (error) {
                    console.error("Slug generation failed", error)
                } finally {
                    setIsGeneratingSlug(false)
                }
            }
        }
        generateSlug()
    }, [debouncedTitle, initialData?.slug, slug])

    const boundAction = (isEdit && initialData?.id) ? updateEventAction.bind(null, initialData.id as string) : createEventAction

    const [state, action, isPending] = useActionState(boundAction, {
        message: '',
        success: false
    } as EventState)

    useEffect(() => {
        if (state.success) {
            toast.success(state.message)
            router.push('/admin/events')
        } else if (state.message && !state.success) {
            toast.error(state.message)
        }
    }, [state, router])

    return (
        <form action={action} className="space-y-8 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl" dir="rtl">
            {/* Hidden Input for Image URL */}
            <input type="hidden" name="imageUrl" value={images[0] || ''} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Type size={16} className="text-primary" /> عنوان الفعالية
                    </label>
                    <input
                        name="title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                        placeholder="مثلاً: مهرجان السويس الصيفي"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Link2 size={16} className="text-primary" /> الرابط المختصر (Slug)
                    </label>
                    <div className="relative">
                        <input
                            name="slug"
                            required
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                            placeholder="suez-summer-festival"
                        />
                        {isGeneratingSlug && <div className="absolute left-3 top-3"><Loader2 className="animate-spin text-primary w-5 h-5" /></div>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Calendar size={16} className="text-primary" /> تاريخ البدء
                    </label>
                    <input
                        name="startDate"
                        type="datetime-local"
                        required
                        defaultValue={(initialData?.startDate) ? new Date(new Date(initialData.startDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Calendar size={16} className="text-primary" /> تاريخ الانتهاء
                    </label>
                    <input
                        name="endDate"
                        type="datetime-local"
                        required
                        defaultValue={(initialData?.endDate) ? new Date(new Date(initialData.endDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <MapPin size={16} className="text-primary" /> نوع المكان
                    </label>
                    <select
                        name="type"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none"
                        defaultValue={initialData?.type || 'general'}
                    >
                        <option value="general">فعالية عامة (مكان نصي)</option>
                        <option value="place_hosted">مُقام في مكان مسجل</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <MapPin size={16} className="text-primary" /> اختيار المكان (اختياري)
                    </label>
                    <select
                        name="placeId"
                        defaultValue={(initialData?.placeId) || ''}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none"
                    >
                        <option value="">-- اختر مكاناً --</option>
                        {places.map(place => (
                            <option key={place.id} value={place.id}>{place.name}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-300">وصف المكان (نصي)</label>
                    <input
                        name="location"
                        defaultValue={initialData?.location || ''}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none"
                        placeholder="مثلاً: الكورنيش القديم، بجوار..."
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <FileText size={16} className="text-primary" /> وصف الفعالية
                    </label>
                    <textarea
                        name="description"
                        rows={4}
                        defaultValue={initialData?.description || ''}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none resize-none"
                        placeholder="اكتب تفاصيل الفعالية هنا..."
                    />
                </div>

                <div className="md:col-span-2 space-y-4">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <ImageIcon size={16} className="text-primary" /> صورة الفعالية
                    </label>
                    <ImageUpload
                        value={images}
                        onChange={(urls) => setImages(urls)}
                        maxFiles={1}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">الحالة</label>
                    <select
                        name="status"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none"
                        defaultValue={initialData?.status || 'draft'}
                    >
                        <option value="draft">مسودة</option>
                        <option value="active">نشط</option>
                        <option value="inactive">معطل</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20"
                >
                    <Save size={20} />
                    {isPending ? 'جاري الحفظ...' : 'حفظ الفعالية'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl flex items-center gap-2 transition-all border border-slate-700"
                >
                    <X size={20} /> إلغاء
                </button>
            </div>
        </form>
    )
}
