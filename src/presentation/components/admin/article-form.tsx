'use client'

import { createNewArticle, updateArticle } from '@/actions/articles.actions'
import { Article } from '@/domain/entities/article'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import ImageUpload from '@/presentation/ui/image-upload'

interface ArticleFormProps {
    initialData?: Article
}

export function ArticleForm({ initialData }: ArticleFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [images, setImages] = useState<string[]>(initialData?.cover_image_url ? [initialData.cover_image_url] : [])
    const isEdit = !!initialData

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            try {
                if (isEdit && initialData) {
                    await updateArticle(initialData.id, formData)
                    toast.success('تم تحديث المقال بنجاح')
                } else {
                    await createNewArticle(formData)
                    toast.success('تم إنشاء المقال بنجاح')
                }
                router.push('/admin/articles')
            } catch (error) {
                console.error(error)
                toast.error('حدث خطأ أثناء حفظ المقال')
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm text-slate-200">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">عنوان المقال</label>
                    <input
                        type="text"
                        name="title"
                        defaultValue={initialData?.title}
                        required
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none"
                        placeholder="عنوان جذاب للمقال..."
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">مقتطف قصير (Excerpt)</label>
                    <textarea
                        name="excerpt"
                        defaultValue={initialData?.excerpt}
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none"
                        placeholder="وصف مختصر يظهر في القائمة..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">التصنيف</label>
                    <select
                        name="category"
                        defaultValue={initialData?.category || 'News'}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none"
                    >
                        <option value="News">أخبار (News)</option>
                        <option value="Story">حكاية (Story)</option>
                        <option value="Article">مقال (Article)</option>
                        <option value="Announcement">إعلان (Announcement)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">صورة الغلاف</label>
                    <input type="hidden" name="cover_image_url" value={images[0] || ''} />

                    <ImageUpload
                        value={images}
                        onChange={(urls) => setImages(urls)}
                        maxFiles={1}
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">المحتوى</label>
                    <textarea
                        name="content"
                        defaultValue={initialData?.content}
                        required
                        rows={15}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary outline-none font-mono text-sm"
                        placeholder="اكتب محتوى المقال هنا (يدعم Markdown)..."
                    />
                </div>

                <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_published"
                            value="true"
                            defaultChecked={initialData?.is_published}
                            className="w-5 h-5 rounded border-slate-800 bg-slate-950 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-slate-200">نشر المقال فوراً</span>
                    </label>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-2 text-slate-400 hover:bg-slate-800 rounded-xl font-medium transition-colors">
                    إلغاء
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-primary-foreground hover:brightness-110 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEdit ? 'حفظ التغييرات' : 'إنشاء المقال'}
                </button>
            </div>
        </form>
    )
}
