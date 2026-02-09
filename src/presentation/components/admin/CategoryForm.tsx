'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory, updateCategory, type CategoryState } from '@/actions/admin/categories.actions'
import { Loader2, Folder, Home, Star, Heart, Info, MapPin, Globe, Flag, Bell, Calendar, Utensils, Coffee, Pizza, CakeSlice, Wine, Beer, CupSoda, Sandwich, ShoppingBag, ShoppingCart, Tag, Gift, CreditCard, Store, Ticket, Percent, Car, Plane, Train, Bus, Bike, Hotel, Mountain, Palmtree, Tent, Anchor, Stethoscope, Dumbbell, GraduationCap, Briefcase, Wrench, Scissors, Hammer, Construction, Music, Camera, Wifi, Laptop, Smartphone, Gamepad, Tv, Radio, Headphones, Sun, Moon, Cloud, Zap, Droplets, Flame, Wind } from 'lucide-react'
import { translateAndSlugify } from '@/app/actions/translate'
import { useDebounce } from 'use-debounce'
import { getIconComponent } from '@/lib/icons'
import { toast } from 'sonner'

// Icon Categories Configuration
const ICON_CATEGORIES = [
    {
        id: 'general',
        label: 'عام',
        icon: Folder,
        icons: [
            { name: 'Folder', icon: Folder },
            { name: 'Home', icon: Home },
            { name: 'Star', icon: Star },
            { name: 'Heart', icon: Heart },
            { name: 'Info', icon: Info },
            { name: 'MapPin', icon: MapPin },
            { name: 'Globe', icon: Globe },
            { name: 'Flag', icon: Flag },
            { name: 'Bell', icon: Bell },
            { name: 'Calendar', icon: Calendar },
        ]
    },
    {
        id: 'food',
        label: 'طعام',
        icon: Utensils,
        icons: [
            { name: 'Utensils', icon: Utensils },
            { name: 'Coffee', icon: Coffee },
            { name: 'Pizza', icon: Pizza },
            { name: 'CakeSlice', icon: CakeSlice },
            { name: 'Wine', icon: Wine },
            { name: 'Beer', icon: Beer },
            { name: 'CupSoda', icon: CupSoda },
            { name: 'Sandwich', icon: Sandwich },
        ]
    },
    {
        id: 'shopping',
        label: 'تسوّق',
        icon: ShoppingBag,
        icons: [
            { name: 'ShoppingBag', icon: ShoppingBag },
            { name: 'ShoppingCart', icon: ShoppingCart },
            { name: 'Store', icon: Store },
            { name: 'Tag', icon: Tag },
            { name: 'Gift', icon: Gift },
            { name: 'CreditCard', icon: CreditCard },
            { name: 'Ticket', icon: Ticket },
            { name: 'Percent', icon: Percent },
        ]
    },
    {
        id: 'places',
        label: 'أماكن',
        icon: MapPin,
        icons: [
            { name: 'Car', icon: Car },
            { name: 'Plane', icon: Plane },
            { name: 'Train', icon: Train },
            { name: 'Bus', icon: Bus },
            { name: 'Bike', icon: Bike },
            { name: 'Hotel', icon: Hotel },
            { name: 'Mountain', icon: Mountain },
            { name: 'Palmtree', icon: Palmtree },
            { name: 'Tent', icon: Tent },
            { name: 'Anchor', icon: Anchor },
        ]
    },
    {
        id: 'services',
        label: 'خدمات',
        icon: Briefcase,
        icons: [
            { name: 'Stethoscope', icon: Stethoscope },
            { name: 'Dumbbell', icon: Dumbbell },
            { name: 'GraduationCap', icon: GraduationCap },
            { name: 'Briefcase', icon: Briefcase },
            { name: 'Wrench', icon: Wrench },
            { name: 'Scissors', icon: Scissors },
            { name: 'Hammer', icon: Hammer },
            { name: 'Construction', icon: Construction },
        ]
    },
    {
        id: 'tech',
        label: 'ترفيه',
        icon: Gamepad,
        icons: [
            { name: 'Music', icon: Music },
            { name: 'Camera', icon: Camera },
            { name: 'Wifi', icon: Wifi },
            { name: 'Laptop', icon: Laptop },
            { name: 'Smartphone', icon: Smartphone },
            { name: 'Gamepad', icon: Gamepad },
            { name: 'Tv', icon: Tv },
            { name: 'Radio', icon: Radio },
            { name: 'Headphones', icon: Headphones },
        ]
    },
    {
        id: 'nature',
        label: 'طبيعة',
        icon: Sun,
        icons: [
            { name: 'Sun', icon: Sun },
            { name: 'Moon', icon: Moon },
            { name: 'Cloud', icon: Cloud },
            { name: 'Zap', icon: Zap },
            { name: 'Droplets', icon: Droplets },
            { name: 'Flame', icon: Flame },
            { name: 'Wind', icon: Wind },
        ]
    }
]

type CategoryFormProps = {
    initialData?: {
        id?: string
        name: string
        slug: string
        icon: string
        is_featured?: boolean
        sort_order?: number
    }
    currentUserRole?: string | null
}

const initialState: CategoryState = {
    message: '',
    errors: {}
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter()
    const [name, setName] = useState(initialData?.name || '')
    const [slug, setSlug] = useState(initialData?.slug || '')
    const [debouncedName] = useDebounce(name, 1000)
    const [isTranslating, setIsTranslating] = useState(false)

    // Icon Picker State
    const [activeTab, setActiveTab] = useState('general')
    const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || 'Folder')

    const SelectedLucideIcon = getIconComponent(selectedIcon)

    // Select the appropriate action
    const formAction = initialData?.id
        ? updateCategory.bind(null, initialData.id)
        : createCategory

    const [state, action, isPending] = useActionState(formAction, initialState)

    useEffect(() => {
        if (state.success) {
            toast.success(state.message)
            router.push('/admin/categories')
            router.refresh()
        } else if (state.message) {
            toast.error(state.message)
        } else if (state.errors?._form) {
            toast.error(state.errors._form[0])
        }
    }, [state, router])

    useEffect(() => {
        const translate = async () => {
            if (!initialData && debouncedName && !slug) {
                setIsTranslating(true)
                try {
                    const generated = await translateAndSlugify(debouncedName)
                    setSlug(generated)
                } catch (error) {
                    console.error(error)
                } finally {
                    setIsTranslating(false)
                }
            }
        }
        translate()
    }, [debouncedName, initialData, slug])

    return (
        <form action={action} className="space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
            {/* Name & Slug Section */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">اسم التصنيف <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="مثال: مطاعم ومقاهي"
                    />
                    {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                        الاسم اللطيف (Slug) - <span className="text-xs text-slate-500">يتم الترجمة تلقائياً بواسطة Google</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 font-mono text-sm focus:border-primary/50 outline-none transition-all"
                        />
                        {isTranslating && (
                            <div className="absolute left-3 top-3">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                        )}
                        {state.errors?.slug && <p className="text-red-500 text-xs mt-1">{state.errors.slug[0]}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Featured Toggle */}
                    <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">تصنيف مميز</label>
                            <p className="text-xs text-slate-500">يظهر في الصفحة الرئيسية</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_featured"
                                value="true"
                                defaultChecked={initialData?.is_featured}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Sort Order Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">ترتيب الظهور</label>
                        <input
                            type="number"
                            name="sort_order"
                            defaultValue={initialData?.sort_order || 0}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="0"
                        />
                        <p className="text-xs text-slate-500 mt-1">الأرقام الأقل تظهر أولاً</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800 my-6"></div>

            {/* Tabbed Icon Picker Section */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-4">أيقونة التصنيف</label>
                <input type="hidden" name="icon" value={selectedIcon} />

                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-800 bg-slate-900/50">
                        {ICON_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveTab(cat.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === cat.id
                                    ? 'text-primary border-primary bg-primary/5'
                                    : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Icons Grid */}
                    <div className="p-4 h-48 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                            {ICON_CATEGORIES.find(c => c.id === activeTab)?.icons.map(({ name, icon: Icon }) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setSelectedIcon(name)}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 border aspect-square ${selectedIcon === name
                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-white hover:bg-slate-800'
                                        }`}
                                    title={name}
                                >
                                    <Icon size={20} strokeWidth={selectedIcon === name ? 2.5 : 2} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Selected Icon Preview */}
                <div className="mt-4 flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                        <SelectedLucideIcon size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">الأيقونة المختارة</span>
                        <span className="text-sm font-bold text-white font-mono">{selectedIcon}</span>
                    </div>
                </div>
            </div>

            {state.errors?._form && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
                    {state.errors._form[0]}
                </div>
            )}

            <div className="border-t border-slate-800 my-6"></div>

            <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2.5 bg-primary text-primary-foreground hover:brightness-110 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'حفظ التعديلات' : 'حفظ التصنيف')}
                </button>
            </div>
        </form>
    )
}

