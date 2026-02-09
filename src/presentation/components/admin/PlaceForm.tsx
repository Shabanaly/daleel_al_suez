'use client'

import { toast } from 'sonner'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createPlaceAction, updatePlaceAction, PlaceState } from '@/actions/admin/places.actions'
import { translateAndSlugify } from '@/app/actions/translate'
import { useDebounce } from 'use-debounce'
import { Loader2, Store, User, MapPin, Globe, Phone, Facebook, Instagram, Sparkles, Youtube } from 'lucide-react'
import ImageUpload from '@/presentation/ui/image-upload'
import { Place } from '@/domain/entities/place'
import { Area } from '@/domain/entities/area'
import { GoogleFetchControl } from './GoogleFetchControl'

// Types
type PlaceFormProps = {
    initialData?: Partial<Place>
    categories: { id: string; name: string }[]
    areas: Area[] // We need to export this type
}
const initialState: PlaceState = {
    message: '',
    errors: {}
}

export default function PlaceForm({ initialData, categories, areas }: PlaceFormProps) {
    const router = useRouter()

    // --- State ---
    const [name, setName] = useState(initialData?.name || '')
    // English Name Removed as per request
    const [slug, setSlug] = useState(initialData?.slug || '')
    const [type, setType] = useState<'business' | 'professional'>(initialData?.type || 'business')
    const [images, setImages] = useState<string[]>(initialData?.images || [])
    const [address, setAddress] = useState(initialData?.address || '')
    const [opensAt, setOpensAt] = useState(initialData?.opensAt || '')
    const [closesAt, setClosesAt] = useState(initialData?.closesAt || '')
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false)
    const [phone, setPhone] = useState(initialData?.phone || '')
    const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '')
    const [website, setWebsite] = useState(initialData?.website || '')
    const [googleMapsUrl, setGoogleMapsUrl] = useState(initialData?.googleMapsUrl || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
    const [areaId, setAreaId] = useState(initialData?.areaId || '')

    // Social Links State
    const [socialLinks, setSocialLinks] = useState(() => {
        const links = initialData?.socialLinks || { facebook: '', instagram: '', videoUrl: '' }
        return {
            facebook: links.facebook || initialData?.facebook || '',
            instagram: links.instagram || initialData?.instagram || '',
            videoUrl: links.videoUrl || initialData?.videoUrl || ''
        }
    })

    const [debouncedName] = useDebounce(name, 1000)
    const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)

    // --- Actions ---
    // Wrap server action to inject extra state (images, socialLinks) NOT in the form itself
    const handleSubmit = async (prevState: PlaceState, formData: FormData): Promise<PlaceState> => {
        // Appending manual state to data object for the server action
        const rawData = Object.fromEntries(formData.entries()) as Record<string, unknown>

        const payload: Partial<Place> = {
            ...rawData,
            images,
            socialLinks,
            type,
            opensAt,
            closesAt,
            isFeatured
        }

        if (initialData?.id) {
            return await updatePlaceAction(initialData.id, payload)
        } else {
            return await createPlaceAction(payload)
        }
    }


    const [state, action, isPending] = useActionState(handleSubmit, initialState)

    // --- Effects ---
    useEffect(() => {
        if (state.success) {
            toast.success(state.message || (initialData?.id ? 'تم تحديث المكان بنجاح' : 'تم إضافة المكان بنجاح'))
            router.push('/admin/places')
        } else if (state.message) {
            toast.error(state.message)
        }
    }, [state, router, initialData?.id])

    // Auto-generate slug from Arabic Name (Translated)
    useEffect(() => {
        const generateSlug = async () => {
            if (debouncedName && !initialData?.slug && !slug) {
                setIsGeneratingSlug(true)
                try {
                    const generated = await translateAndSlugify(debouncedName)
                    setSlug(generated)
                } catch (error) {
                    console.error("Slug generation failed", error)
                } finally {
                    setIsGeneratingSlug(false)
                }
            }
        }
        generateSlug()
    }, [debouncedName, initialData?.slug, slug])

    const handleGoogleDataFetched = (data: any) => {
        if (data.name) setName(data.name)
        if (data.address) setAddress(data.address)
        if (data.phone) setPhone(data.phone)
        if (data.website) setWebsite(data.website)
        if (data.googleMapsUrl) setGoogleMapsUrl(data.googleMapsUrl)
        if (data.description) setDescription(data.description)
        // Note: Images are references, in a real case we'd need to fetch actual URLs
        // or store references and handle display
    }

    return (
        <div className="w-full space-y-8">
            {!initialData?.id && (
                <GoogleFetchControl onDataFetched={handleGoogleDataFetched} />
            )}
            <form action={action} className="space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl w-full">

                {/* ... Type Selection ... */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-300">نوع الإضافة</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('business')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${type === 'business'
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            <Store size={32} />
                            <span className="font-bold">مكان تجاري / شركة</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setType('professional')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${type === 'professional'
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            <User size={32} />
                            <span className="font-bold">فني / مهني مستقل</span>
                        </button>
                    </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-2 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <input
                        type="checkbox"
                        id="isFeatured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-5 h-5 text-primary bg-slate-900 border-slate-700 rounded focus:ring-primary focus:ring-offset-slate-900"
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium text-slate-300 select-none cursor-pointer">
                        تمييز هذا المكان (يعرض في الصفحة الرئيسية كـ &quot;مكان مميز&quot;)
                    </label>
                </div>

                <div className="border-t border-slate-800"></div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Right Column: Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">الاسم (بالعربي) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors"
                                placeholder={type === 'business' ? "مثال: مطعم اسماك السويس" : "مثال: ورشة الأسطى محمد"}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">الرابط (Slug) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono text-sm outline-none focus:border-primary transition-colors"
                                />
                                {isGeneratingSlug && <div className="absolute left-3 top-3"><Loader2 className="animate-spin text-primary w-5 h-5" /></div>}
                            </div>
                            {state.errors?.slug && <p className="text-red-500 text-xs mt-1">{state.errors.slug[0]}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">التصنيف <span className="text-red-500">*</span></label>
                                <select
                                    name="categoryId"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>اختر التصنيف...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">المنطقة</label>
                                <select
                                    name="areaId"
                                    value={areaId}
                                    onChange={(e) => setAreaId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">بدون منطقة</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {type === 'business' ? 'العنوان وتفاصيل الموقع' : 'العنوان (اختياري)'}
                            </label>
                            <textarea
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                // Required only for business
                                required={type === 'business'}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors"
                                placeholder="مثال:شارع الجيش، بجوار البنك الأهلي"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">مواعيد العمل</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">يفتح في</label>
                                    <input
                                        type="time"
                                        name="opens_at"
                                        value={opensAt}
                                        onChange={(e) => setOpensAt(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors text-center dir-ltr"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">يغلق في</label>
                                    <input
                                        type="time"
                                        name="closes_at"
                                        value={closesAt}
                                        onChange={(e) => setClosesAt(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors text-center dir-ltr"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">رابط خرائط جوجل</label>
                            <div className="relative">
                                <MapPin className="absolute right-3 top-3.5 text-slate-500 w-5 h-5" />
                                <input
                                    type="url"
                                    name="googleMapsUrl"
                                    value={googleMapsUrl}
                                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors ltr:text-left"
                                    placeholder="https://maps.app.goo.gl/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Contact & Media */}
                    <div className="space-y-6">

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">الصور</label>
                            <ImageUpload
                                value={images}
                                onChange={(urls) => setImages(urls)}
                            />
                        </div>

                        <div className="border-t border-slate-800 my-4"></div>

                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            بيانات التواصل
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors dir-ltr"
                                    placeholder="01xxxxxxxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">رقم الواتساب</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors dir-ltr"
                                    placeholder="201xxxxxxxxx"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">فيسبوك</label>
                                <div className="relative">
                                    <Facebook className="absolute right-3 top-3.5 text-blue-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={socialLinks.facebook || ''}
                                        onChange={e => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                                        className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors ltr:text-left"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">انستجرام</label>
                                <div className="relative">
                                    <Instagram className="absolute right-3 top-3.5 text-pink-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={socialLinks.instagram || ''}
                                        onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                        className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors ltr:text-left"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">الموقع الإلكتروني</label>
                                <div className="relative">
                                    <Globe className="absolute right-3 top-3.5 text-slate-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        name="website"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors ltr:text-left"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">رابط فيديو (يوتيوب / فيسبوك / انستجرام)</label>
                                <div className="relative">
                                    <Youtube className="absolute right-3 top-3.5 text-red-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={socialLinks.videoUrl || ''}
                                        onChange={e => setSocialLinks({ ...socialLinks, videoUrl: e.target.value })}
                                        className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors ltr:text-left"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-8 pt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">الوصف / عن المكان</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors"
                        placeholder="اكتب وصفاً جذاباً للمكان أو الخدمات المقدمة..."
                    />
                </div>

                {
                    state.message && !state.success && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
                            {state.message}
                        </div>
                    )
                }

                {
                    state.message && state.success && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl text-sm">
                            {state.message}
                        </div>
                    )
                }

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-8 py-3 bg-primary text-primary-foreground hover:brightness-110 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData?.id ? 'حفظ التعديلات' : 'إضافة المكان')}
                    </button>
                </div>
            </form>
        </div >
    )
}
