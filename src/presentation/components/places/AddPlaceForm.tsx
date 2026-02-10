'use client'

import { toast } from 'sonner'
import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createPlaceAction, PlaceState } from '@/actions/admin/places.actions'
import { translateAndSlugify } from '@/app/actions/translate'
import { useDebounce } from 'use-debounce'
import { Loader2, Store, User, MapPin, Globe, Phone, Facebook, Instagram, Youtube } from 'lucide-react'
import ImageUpload from '@/presentation/ui/image-upload'
import { Place } from '@/domain/entities/place'
import { Area } from '@/domain/entities/area'
import { GoogleFetchControl } from '@/presentation/components/admin/GoogleFetchControl'

// Types
type AddPlaceFormProps = {
    categories: { id: string; name: string }[]
    areas: Area[]
}

const initialState: PlaceState = {
    message: '',
    errors: {}
}

export default function AddPlaceForm({ categories, areas }: AddPlaceFormProps) {
    const router = useRouter()

    // --- State ---
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [type, setType] = useState<'business' | 'professional'>('business')
    const [images, setImages] = useState<string[]>([])
    const [address, setAddress] = useState('')
    const [opensAt, setOpensAt] = useState('')
    const [closesAt, setClosesAt] = useState('')
    const [phone, setPhone] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [website, setWebsite] = useState('')
    const [googleMapsUrl, setGoogleMapsUrl] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [areaId, setAreaId] = useState('')

    // Social Links State
    const [socialLinks, setSocialLinks] = useState({
        facebook: '',
        instagram: '',
        videoUrl: ''
    })

    const [debouncedName] = useDebounce(name, 1000)
    const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)

    // --- Actions ---
    const handleSubmit = async (prevState: PlaceState, formData: FormData): Promise<PlaceState> => {
        const rawData = Object.fromEntries(formData.entries()) as Record<string, unknown>

        const payload: Partial<Place> = {
            ...rawData,
            images,
            socialLinks,
            type,
            opensAt,
            closesAt,
            status: 'pending' // Force pending for user submissions
        }

        return await createPlaceAction(payload)
    }

    const [state, action, isPending] = useActionState(handleSubmit, initialState)

    // --- Effects ---
    useEffect(() => {
        if (state.success) {
            toast.success('تم إرسال طلبك بنجاح! سيتم مراجعته قريباً.')
            router.push('/places/thank-you')
        } else if (state.message) {
            toast.error(state.message)
        }
    }, [state, router])

    // Auto-generate slug
    useEffect(() => {
        const generateSlug = async () => {
            if (debouncedName && !slug) {
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
    }, [debouncedName, slug])

    // --- Helper Functions ---
    const handleSearchOnMap = () => {
        const query = `${name} ${address}`.trim()
        if (!query) {
            toast.error('يرجى إدخال الاسم والعنوان أولاً للبحث')
            return
        }
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank')
    }

    interface GoogleFetchedData {
        name?: string;
        address?: string;
        phone?: string;
        website?: string;
        googleMapsUrl?: string;
        description?: string;
        [key: string]: any;
    }

    const handleGoogleDataFetched = (data: GoogleFetchedData) => {
        if (data.name) setName(data.name)
        if (data.address) {
            setAddress(data.address)
            // Try to auto-select area based on address
            const foundArea = areas.find(area => data.address?.includes(area.name))
            if (foundArea) setAreaId(foundArea.id)
        }
        if (data.phone) setPhone(data.phone)
        if (data.website) setWebsite(data.website)
        if (data.googleMapsUrl) setGoogleMapsUrl(data.googleMapsUrl)
        if (data.description) setDescription(data.description)
    }

    return (
        <div className="w-full space-y-8">
            <GoogleFetchControl onDataFetched={handleGoogleDataFetched} />

            <form action={action} className="space-y-8 bg-card p-8 rounded-2xl border border-border shadow-xl w-full">

                {/* Type Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-muted-foreground">نوع الإضافة</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('business')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${type === 'business'
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-background border-border text-muted-foreground hover:bg-accent'
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
                                : 'bg-background border-border text-muted-foreground hover:bg-accent'
                                }`}
                        >
                            <User size={32} />
                            <span className="font-bold">فني / مهني مستقل</span>
                        </button>
                    </div>
                </div>

                <div className="border-t border-border"></div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Right Column: Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">الاسم (بالعربي) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground/50"
                                placeholder={type === 'business' ? "مثال: مطعم اسماك السويس" : "مثال: ورشة الأسطى محمد"}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">الرابط (Slug) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-muted-foreground font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                                {isGeneratingSlug && <div className="absolute left-3 top-3"><Loader2 className="animate-spin text-primary w-5 h-5" /></div>}
                            </div>
                            {state.errors?.slug && <p className="text-red-500 text-xs mt-1">{state.errors.slug[0]}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">التصنيف <span className="text-red-500">*</span></label>
                                <select
                                    name="categoryId"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>اختر التصنيف...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">المنطقة</label>
                                <select
                                    name="areaId"
                                    value={areaId}
                                    onChange={(e) => setAreaId(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">بدون منطقة</option>
                                    {areas?.map(area => (
                                        <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                {type === 'business' ? 'العنوان وتفاصيل الموقع' : 'العنوان (اختياري)'}
                            </label>
                            <textarea
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required={type === 'business'}
                                rows={3}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground/50"
                                placeholder="مثال: شارع الجيش، بجوار البنك الأهلي"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">مواعيد العمل</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">يفتح في</label>
                                    <input
                                        type="time"
                                        name="opens_at"
                                        value={opensAt}
                                        onChange={(e) => setOpensAt(e.target.value)}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center dir-ltr"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">يغلق في</label>
                                    <input
                                        type="time"
                                        name="closes_at"
                                        value={closesAt}
                                        onChange={(e) => setClosesAt(e.target.value)}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center dir-ltr"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">رابط خرائط جوجل</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin className="absolute right-3 top-3.5 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="url"
                                        name="googleMapsUrl"
                                        value={googleMapsUrl}
                                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSearchOnMap}
                                    className="px-4 py-3 bg-accent hover:bg-accent/80 text-foreground border border-border rounded-xl transition-colors whitespace-nowrap"
                                    title="بحث في خرائط جوجل للحصول على الرابط"
                                >
                                    بحث في الخرائط
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Contact & Media */}
                    <div className="space-y-6">

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">الصور <span className="text-xs text-muted-foreground/70">(صورة واحدة على الأقل)</span></label>
                            <ImageUpload
                                value={images}
                                onChange={(urls) => setImages(urls)}
                            />
                        </div>

                        <div className="border-t border-border my-4"></div>

                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            بيانات التواصل
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">رابط الهاتف</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors dir-ltr placeholder:text-muted-foreground/50"
                                    placeholder="01xxxxxxxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">رقم الواتساب</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors dir-ltr placeholder:text-muted-foreground/50"
                                    placeholder="201xxxxxxxxx"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">فيسبوك</label>
                                <div className="relative">
                                    <Facebook className="absolute right-3 top-3.5 text-blue-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={socialLinks.facebook || ''}
                                        onChange={e => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">انستجرام</label>
                                <div className="relative">
                                    <Instagram className="absolute right-3 top-3.5 text-pink-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={socialLinks.instagram || ''}
                                        onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">الموقع الإلكتروني</label>
                                <div className="relative">
                                    <Globe className="absolute right-3 top-3.5 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="url"
                                        name="website"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">رابط فيديو (يوتيوب / فيسبوك / انستجرام)</label>
                                <div className="relative">
                                    <Youtube className="absolute right-3 top-3.5 text-red-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={socialLinks.videoUrl || ''}
                                        onChange={e => setSocialLinks({ ...socialLinks, videoUrl: e.target.value })}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">الوصف / عن المكان</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground/50"
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

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl font-medium transition-colors">
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-8 py-3 bg-primary text-primary-foreground hover:brightness-110 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال المكان للمراجعة'}
                    </button>
                </div>
            </form>
        </div>
    )
}
