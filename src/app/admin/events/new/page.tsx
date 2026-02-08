import { createClient } from '@/lib/supabase/server'
import { getAdminPlacesUseCase } from '@/di/modules'
import { CreateEventForm } from '@/presentation/admin/create-event-form'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function NewEventPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') return <div>Unauthorized</div>

    const places = await getAdminPlacesUseCase.execute(user.id, profile.role, {})

    return (
        <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
            <div className="flex items-center gap-4">
                <Link href="/admin/events" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-primary transition-colors">
                    <ChevronRight size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">إضافة فعالية جديدة</h1>
                    <p className="text-slate-500">املأ البيانات أدناه لإنشاء فعالية جديدة على المنصة</p>
                </div>
            </div>

            <CreateEventForm places={places} />
        </div>
    )
}
