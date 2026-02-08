import { Category } from '@/domain/entities/category'
import { Place } from '@/domain/entities/place'
import { createPlaceAction, updatePlaceAction, type ActionState } from '@/app/admin/places/actions'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PlaceFormProps {
    categories: Category[]
    initialData?: Place
}

const initialState: ActionState = {}

export function PlaceForm({ categories, initialData }: PlaceFormProps) {
    const router = useRouter()
    const isEdit = !!initialData

    const actionWithId = isEdit && initialData
        ? updatePlaceAction.bind(null, initialData.id)
        : createPlaceAction

    const [state, action, isPending] = useActionState(actionWithId, initialState)

    useEffect(() => {
        if (state.success) {
            toast.success(state.message)
            router.push('/admin/places')
            router.refresh()
        } else if (state.message) {
            toast.error(state.message)
        }
    }, [state, router])

    return (
        <form action={action} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm text-slate-200">
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">اسم المكان</label>
                <input
                    type="text"
                    name="name"
                    defaultValue={initialData?.name}
                    required
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none"
                    placeholder="مثال: مطعم النورس"
                />
                {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">التصنيف</label>
                <select
                    name="category_id"
                    defaultValue={initialData?.categoryId}
                    required
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none"
                >
                    <option value="">اختر التصنيف...</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                {state.errors?.category_id && <p className="text-red-500 text-xs mt-1">{state.errors.category_id[0]}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">العنوان</label>
                <input
                    type="text"
                    name="address"
                    defaultValue={initialData?.address}
                    required
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none"
                    placeholder="العنوان بالتفصيل"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">الوصف</label>
                <textarea
                    name="description"
                    defaultValue={initialData?.description}
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none"
                    placeholder="وصف مختصر للمكان وخدماته..."
                ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">رقم الهاتف</label>
                    <input
                        type="tel"
                        name="phone"
                        defaultValue={initialData?.phone}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none"
                    />
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-2 text-slate-400 hover:bg-slate-800 rounded-xl font-medium transition-colors">
                    إلغاء
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground hover:brightness-110 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEdit ? 'حفظ التغييرات' : 'حفظ المكان'}
                </button>
            </div>
        </form>
    )
}
