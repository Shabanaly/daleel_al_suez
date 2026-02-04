import { Bell, Check, Clock, Info, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { getMyNotifications, markAsRead } from '@/actions/admin/notifications.actions'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function NotificationsPage() {
    const result = await getMyNotifications()
    const notifications = result.success ? result.data || [] : []

    // Server Action Wrapper for Button
    async function handleMarkRead(id: string) {
        'use server'
        await markAsRead(id)
        revalidatePath('/admin/notifications')
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'place_approval': return <CheckCircle className="text-green-400" size={24} />
            case 'review': return <Info className="text-blue-400" size={24} />
            case 'alert': return <AlertTriangle className="text-red-400" size={24} />
            default: return <Bell className="text-slate-400" size={24} />
        }
    }

    return (
        <div className="max-w-3xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-8">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                    <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">مركز الإشعارات</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        تابع آخر التحديثات والنشاطات المتعلقة بحسابك
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
                        <Bell className="mx-auto h-12 w-12 text-slate-600 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-slate-300">لا توجد إشعارات جديدة</h3>
                        <p className="text-slate-500 mt-1">أنت مطلع على كل شيء!</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`
                                relative p-5 rounded-2xl border transition-all duration-200
                                ${notif.is_read
                                    ? 'bg-slate-900 border-slate-800 opacity-75 hover:opacity-100'
                                    : 'bg-slate-800/80 border-primary/30 shadow-lg shadow-black/20'
                                }
                            `}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full bg-slate-950 border border-slate-800 shrink-0`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`text-base font-bold ${notif.is_read ? 'text-slate-300' : 'text-white'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                                            <Clock size={12} />
                                            {new Date(notif.created_at).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {notif.message}
                                    </p>

                                    <div className="mt-4 flex justify-between items-center">
                                        {notif.link && (
                                            <Link
                                                href={notif.link}
                                                className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                                عرض التفاصيل
                                            </Link>
                                        )}
                                        {!notif.is_read && (
                                            <form action={handleMarkRead.bind(null, notif.id)}>
                                                <button
                                                    type="submit"
                                                    className="text-xs flex items-center gap-1 text-primary hover:text-primary-400 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
                                                >
                                                    <Check size={14} />
                                                    تحديد كمقروء
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Unread Indicator Dot */}
                            {!notif.is_read && (
                                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow transform translate-x-1/2 -translate-y-1/2"></span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
