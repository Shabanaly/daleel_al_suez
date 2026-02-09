'use client'

import { useState, Fragment } from 'react'
import {
    User as UserIcon, Shield, ShieldCheck,
    Calendar, MoreVertical, Search, FileText, Loader2,
    MapPin, Star, ChevronDown, ChevronUp, Clock,
    Plus, Edit, Trash2, Eye, LucideIcon
} from 'lucide-react'

import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { ar } from 'date-fns/locale'
import { updateUserRole, getUserDetails } from '@/actions/admin/users.actions'
import type { User } from '@/domain/entities/user'
import type { UserStats } from '@/domain/interfaces/user-repository.interface'
import type { AuditLog } from '@/domain/entities/audit-log'

// Helper function to get action icon and color
function getLogActionStyle(action: string) {
    const styles: Record<string, { icon: LucideIcon, color: string, bg: string, label: string }> = {
        'user.created': { icon: Plus, color: 'text-green-400', bg: 'bg-green-500/10', label: 'إنشاء مستخدم' },
        'user.role_update': { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'تحديث صلاحيات' },
        'place.created': { icon: Plus, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'إضافة مكان' },
        'place.updated': { icon: Edit, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'تعديل مكان' },
        'place.deleted': { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10', label: 'حذف مكان' },
        'category.created': { icon: Plus, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'إضافة تصنيف' },
        'category.updated': { icon: Edit, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'تعديل تصنيف' },
        'category.deleted': { icon: Trash2, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'حذف تصنيف' },
    }
    return styles[action] || { icon: Eye, color: 'text-slate-400', bg: 'bg-slate-800', label: action }
}

// Format log details - Handle nested objects properly
function formatLogDetails(details: Record<string, unknown> | null | undefined): string {
    if (!details) return ''
    if (typeof details === 'string') return details

    try {
        const entries = Object.entries(details)
            .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
            .map(([key, value]) => {
                // Handle nested objects/arrays
                if (typeof value === 'object' && value !== null) {
                    return `${key}: ${JSON.stringify(value)}`
                }
                return `${key}: ${value}`
            })

        return entries.join(' • ')
    } catch {
        return JSON.stringify(details)
    }
}

// Format timestamp - show relative time for recent logs, date for old ones
function formatLogTimestamp(date: Date): string {
    const now = new Date()

    if (isNaN(date.getTime())) return 'غير متوفر'

    // If older than 2 days
    if (Math.abs(differenceInDays(now, date)) >= 2) {
        return format(date, 'dd MMMM yyyy - hh:mm a', { locale: ar })
    }

    // Otherwise show relative time
    return formatDistanceToNow(date, { addSuffix: true, locale: ar })
}

export default function UsersClientPage({ initialUsers, currentUserRole }: { initialUsers: User[], currentUserRole: string | null }) {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [searchQuery, setSearchQuery] = useState('')
    const [updating, setUpdating] = useState<string | null>(null)

    // Expanded User State (Stats + Logs)
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
    const [userStats, setUserStats] = useState<UserStats | null>(null)
    const [userLogs, setUserLogs] = useState<AuditLog[]>([])
    const [loadingDetails, setLoadingDetails] = useState(false)

    const fetchUserDetailsClient = async (userId: string) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null)
            return
        }

        setExpandedUserId(userId)
        setLoadingDetails(true)
        setUserStats(null)
        setUserLogs([])

        try {
            const { stats, logs } = await getUserDetails(userId)
            setUserStats(stats)
            setUserLogs(logs)
        } catch (error) {
            console.error('Error fetching details:', error)
        } finally {
            setLoadingDetails(false)
        }
    }

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        if (!confirm('هل أنت متأكد من تغيير صلاحيات هذا المستخدم؟')) return

        setUpdating(userId)
        try {
            const result = await updateUserRole(userId, newRole)

            if (!result.success) throw new Error(result.error)

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as User['role'] } : u))
            alert('تم تحديث الصلاحيات بنجاح ✅')
        } catch (error) {
            alert('حدث خطأ: ' + (error instanceof Error ? error.message : String(error)))
        } finally {
            setUpdating(null)
        }
    }

    // Sort Logic: Super Admin > Admin > User, then by date key
    const rolePriority: Record<string, number> = { super_admin: 0, admin: 1, user: 2 }

    const filteredUsers = users
        .filter(user =>
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            // 1. Sort by Role Priority
            const priorityDiff = rolePriority[a.role] - rolePriority[b.role]
            if (priorityDiff !== 0) return priorityDiff

            // 2. Sort by Created Date (Newest first)
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA
        })

    return (
        <div className="space-y-6">
            {/* Header Card - Modern Design */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Title Section */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <UserIcon className="text-primary" size={20} />
                            </div>
                            المستخدمين
                        </h1>
                        <p className="text-slate-400 text-sm mr-12">
                            إدارة المستخدمين والصلاحيات
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className="w-full lg:w-64">
                        <div className="relative">
                            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="بحث عن مستخدم..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-white placeholder-slate-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/50">
                                <th className="p-4 font-medium text-slate-400 text-sm">المستخدم</th>
                                <th className="p-4 font-medium text-slate-400 text-sm w-32 md:w-auto">الدور</th>
                                <th className="p-4 font-medium text-slate-400 text-sm hidden md:table-cell">تاريخ الانضمام</th>
                                <th className="p-4 font-medium text-slate-400 text-sm w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredUsers.map((user) => (
                                <Fragment key={user.id}>
                                    <tr
                                        onClick={() => fetchUserDetailsClient(user.id)}
                                        className={`cursor-pointer transition-colors ${expandedUserId === user.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/50'}`}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 min-w-[2.5rem] rounded-full flex items-center justify-center ${user.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400' :
                                                    user.role === 'admin' ? 'bg-blue-500/10 text-blue-400' :
                                                        'bg-slate-800 text-slate-400'
                                                    }`}>
                                                    <UserIcon size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-200 truncate max-w-[120px] md:max-w-none">
                                                        {user.fullName || 'بدون اسم'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 truncate max-w-[120px] md:max-w-none">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {/* Enhanced Role Badge with Gradient */}
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${user.role === 'super_admin'
                                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300'
                                                : user.role === 'admin'
                                                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                                                    : 'bg-slate-800 border-slate-700 text-slate-300'
                                                }`}>
                                                {user.role === 'super_admin' && <ShieldCheck className="text-purple-400" size={14} />}
                                                {user.role === 'admin' && <Shield className="text-blue-400" size={14} />}
                                                {user.role === 'user' && <UserIcon size={14} />}
                                                <span>
                                                    {user.role === 'super_admin' ? 'مدير أعلى' : user.role === 'admin' ? 'مدير محتوى' : 'مستخدم'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy', { locale: ar }) : '-'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-left">
                                            {expandedUserId === user.id ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                                        </td>
                                    </tr>

                                    {/* Expanded Details Row */}
                                    {expandedUserId === user.id && (
                                        <tr className="bg-slate-900/50">
                                            <td colSpan={4} className="p-0">
                                                <div className="p-4 md:p-6 border-b border-slate-800 animate-in slide-in-from-top-2">
                                                    {/* Details Component can be extracted further */}
                                                    {/* Mobile Only Date Display */}
                                                    <div className="md:hidden flex items-center gap-2 text-xs text-slate-500 mb-4 px-1">
                                                        <Calendar size={14} />
                                                        <span>تاريخ الانضمام: {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy', { locale: ar }) : '-'}</span>
                                                    </div>

                                                    {loadingDetails ? (
                                                        <div className="flex justify-center py-4">
                                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* 1. Statistics Section */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                                    <MoreVertical size={14} /> إحصائيات
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                                                    <div className="bg-slate-950 p-3 md:p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                                                                        <div className="p-2 md:p-3 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                                                                            <MapPin size={20} />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs text-slate-400 truncate">الأماكن</p>
                                                                            <p className="text-lg md:text-xl font-bold text-white">{userStats?.placesCount || 0}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-slate-950 p-3 md:p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                                                                        <div className="p-2 md:p-3 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                                                                            <Star size={20} />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs text-slate-400 truncate">التعليقات</p>
                                                                            <p className="text-lg md:text-xl font-bold text-white">{userStats?.reviewsCount || 0}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Role Actions (Only for Super Admin) */}
                                                                {currentUserRole === 'super_admin' && user.role !== 'super_admin' && (
                                                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                                                        <p className="text-xs text-slate-500 mb-2">تغيير الصلاحيات:</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {user.role !== 'admin' && (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleRoleUpdate(user.id, 'admin'); }}
                                                                                    disabled={updating === user.id}
                                                                                    className="flex-1 md:flex-none px-3 py-2 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20 flex justify-center"
                                                                                >
                                                                                    ترقية إلى أدمن
                                                                                </button>
                                                                            )}
                                                                            {user.role !== 'user' && (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleRoleUpdate(user.id, 'user'); }}
                                                                                    disabled={updating === user.id}
                                                                                    className="flex-1 md:flex-none px-3 py-2 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 flex justify-center"
                                                                                >
                                                                                    تخفيض إلى مستخدم
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* 2. Audit Logs Section - Only for Super Admins */}
                                                            {currentUserRole === 'super_admin' && (
                                                                <div className="space-y-4">
                                                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                                        <Clock size={14} /> سجل النشاط (آخر 50 عملية)
                                                                    </h4>
                                                                    <div className="bg-slate-950 rounded-xl border border-slate-800 h-64 overflow-y-auto custom-scrollbar p-2">
                                                                        {userLogs.length === 0 ? (
                                                                            <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                                                                <FileText size={24} className="mb-2 opacity-50" />
                                                                                <p className="text-sm">لا يوجد سجلات نشاط</p>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="space-y-3">
                                                                                {userLogs.map(log => {
                                                                                    const style = getLogActionStyle(log.action)
                                                                                    const Icon = style.icon as LucideIcon

                                                                                    return (
                                                                                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-colors">
                                                                                            {/* Icon */}
                                                                                            <div className={`p-2 rounded-lg shrink-0 ${style.bg}`}>
                                                                                                <Icon className={style.color} size={16} />
                                                                                            </div>

                                                                                            {/* Content */}
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                                                    <span className="text-xs font-semibold text-white">
                                                                                                        {style.label}
                                                                                                    </span>
                                                                                                    <span className="text-[10px] text-slate-500 shrink-0">
                                                                                                        {log.createdAt ? formatLogTimestamp(new Date(log.createdAt)) : '-'}
                                                                                                    </span>
                                                                                                </div>

                                                                                                {log.details && (
                                                                                                    <div className="max-w-full overflow-x-auto">
                                                                                                        <p className="text-xs text-slate-400 whitespace-nowrap">
                                                                                                            {formatLogDetails(log.details)}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            لا يوجد مستخدمين مطابقين للبحث
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
