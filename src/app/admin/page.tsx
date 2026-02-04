import { Store, Users, Star, Activity, LayoutDashboard, AlertCircle } from 'lucide-react'
import { getDashboardStats } from '@/actions/admin/analytics.actions'

export default async function AdminDashboard() {
    const result = await getDashboardStats()

    if (!result.success || !result.data) {
        return (
            <div className="p-8 text-center text-red-400 flex flex-col items-center gap-2">
                <AlertCircle size={32} />
                <p>فشل تحميل البيانات: {result.message}</p>
            </div>
        )
    }

    const { placesCount, reviewsCount, usersCount, visitsCount, isSuperAdmin } = result.data

    // Info Cards Config
    const stats = [
        {
            name: 'إجمالي الأماكن',
            value: placesCount.toLocaleString('en-US'),
            icon: Store,
            color: 'text-primary-400',
            bg: 'bg-primary/10 border-primary/20'
        },
        // Only show Users stat for Super Admin
        ...(isSuperAdmin && usersCount !== null ? [
            {
                name: 'المستخدمين',
                value: usersCount.toLocaleString('en-US'),
                icon: Users,
                color: 'text-purple-400',
                bg: 'bg-purple-900/20 border-purple-500/20'
            }
        ] : []),
        {
            name: 'التقييمات',
            value: reviewsCount.toLocaleString('en-US'),
            icon: Star,
            color: 'text-yellow-400',
            bg: 'bg-yellow-900/20 border-yellow-500/20'
        },
        {
            name: 'الزيارات اليوم',
            value: visitsCount.toLocaleString('en-US'),
            icon: Activity,
            color: 'text-green-400',
            bg: 'bg-green-900/20 border-green-500/20'
        },
    ]

    return (
        <div>
            {/* Header Card - Modern Design */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                        <LayoutDashboard className="text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">نظرة عامة</h1>
                        <p className="text-slate-400 text-sm mt-1">إحصائيات ونشاط لوحة التحكم لهذا اليوم</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className={`relative overflow-hidden p-6 rounded-2xl border ${stat.bg} shadow-sm transition-all hover:shadow-md hover:border-opacity-50`}>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400 mb-1">{stat.name}</p>
                                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-slate-950/50 backdrop-blur-sm ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        {/* Decorative Background Glow */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${stat.color.replace('text-', 'bg-')}`}></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm min-h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">آخر الأماكن المضافة</h2>
                    </div>

                    <div className="flex flex-col items-center justify-center h-[200px] text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                        <Store size={32} className="mb-2 opacity-50" />
                        <p>لا توجد بيانات حالياً</p>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm min-h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">أحدث التقييمات</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center h-[200px] text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                        <Star size={32} className="mb-2 opacity-50" />
                        <p>لا توجد بيانات حالياً</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
