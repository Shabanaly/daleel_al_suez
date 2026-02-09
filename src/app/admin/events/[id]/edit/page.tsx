import { createClient } from '@/lib/supabase/server'
import { getAdminPlacesUseCase } from '@/di/modules'
import { CreateEventForm } from '@/presentation/components/admin/create-event-form' // We can reuse the form if we add initialData
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') return <div>Unauthorized</div>

    // Fetch Event, Places
    const [event, places] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single().then(res => res.data),
        getAdminPlacesUseCase.execute(user.id, profile.role, {})
    ])

    if (!event) return notFound()

    return (
        <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
            <div className="flex items-center gap-4">
                <Link href="/admin/events" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-primary transition-colors">
                    <ChevronRight size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">تعديل الفعالية</h1>
                    <p className="text-slate-500">قم بتحديث بيانات الفعالية أدناه</p>
                </div>
            </div>

            <CreateEventForm places={places} initialData={event} />
        </div>
    )
}
