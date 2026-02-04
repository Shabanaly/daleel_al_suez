import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Calendar, MapPin, Shield } from 'lucide-react'

export default async function AdminProfilePage() {
    const supabase = await createClient()

    // 1. Get Auth User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Get Profile Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // 3. Get Stats (Places Count)
    const { count: placesCount } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // Format Date
    const joinDate = new Date(user.created_at).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const roleLabels: Record<string, string> = {
        'super_admin': 'مدير أعلى (Super Admin)',
        'admin': 'مدير محتوى (Admin)',
        'user': 'مستخدم'
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl">
                    <User className="w-10 h-10 text-slate-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{profile?.full_name || 'مستخدم مجهول'}</h1>
                    <p className="text-slate-400 flex items-center gap-2 text-sm mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        نشط الآن
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">إحصائياتك</h3>
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/50 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <MapPin size={20} />
                                </div>
                                <span className="text-slate-300 font-medium">الأماكن المضافة</span>
                            </div>
                            <span className="text-xl font-bold text-white">{placesCount || 0}</span>
                        </div>
                        {/* More stats can be added here */}
                    </div>
                </div>

                {/* Details Card */}
                <div className="md:col-span-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">البيانات الشخصية</h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                        <Mail size={12} /> البريد الإلكتروني
                                    </label>
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 text-sm ltr font-mono">
                                        {user.email}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                        <Shield size={12} /> الصلاحية
                                    </label>
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 text-sm">
                                        {roleLabels[profile?.role] || profile?.role}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                        <Calendar size={12} /> تاريخ الانضمام
                                    </label>
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 text-sm">
                                        {joinDate}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <p className="text-xs text-slate-500 text-center">
                                لتغيير كلمة المرور أو البيانات الشخصية، يرجى التواصل مع الإدارة العليا حالياً.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
