import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Layers, ArrowLeft } from 'lucide-react'
import CategoryForm from '@/presentation/components/admin/CategoryForm'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Get user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Redirect if not Super Admin
    if (profile?.role !== 'super_admin') {
        redirect('/admin/categories')
    }

    // Fetch category
    const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !category) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Layers className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">تعديل التصنيف</h1>
                            <p className="text-sm text-slate-400">تعديل بيانات تصنيف {category.name}</p>
                        </div>
                    </div>

                    <Link
                        href="/admin/categories"
                        className="flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 hover:border-slate-700"
                    >
                        <ArrowLeft size={18} />
                        <span>رجوع للقائمة</span>
                    </Link>
                </div>
            </div>

            <CategoryForm initialData={category} currentUserRole={profile.role} />
        </div>
    )
}
