import { getAllTickets } from '@/actions/admin-support.actions'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function AdminSupportPage() {
    const tickets = await getAllTickets()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'closed': return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
            default: return 'bg-slate-500/10 text-slate-500'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'مفتوح'
            case 'in_progress': return 'قيد المعالجة'
            case 'resolved': return 'تم الحل'
            case 'closed': return 'مغلق'
            default: return status
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-500 bg-red-500/10'
            case 'high': return 'text-orange-500 bg-orange-500/10'
            case 'normal': return 'text-blue-500 bg-blue-500/10'
            case 'low': return 'text-slate-500 bg-slate-500/10'
            default: return 'text-slate-500'
        }
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-2 text-slate-100">تذاكر الدعم الفني</h1>
                    <p className="text-slate-400">إدارة ومتابعة تذاكر الدعم الفني للمستخدمين</p>
                </div>
                <div className="flex gap-2">
                    {/* Add filters here if needed */}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {tickets?.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-900 rounded-xl border border-dashed border-slate-800">
                        لا توجد تذاكر دعم فني حالياً
                    </div>
                ) : (
                    tickets?.map((ticket: any) => (
                        <Link key={ticket.id} href={`/admin/support/${ticket.id}`} className="block group">
                            <Card className="p-4 bg-slate-900 border-slate-800 hover:border-primary/50 transition-colors relative overflow-hidden group-hover:shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary font-bold shrink-0 border border-slate-700">
                                            {ticket.profiles?.full_name?.[0] || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-bold text-lg text-slate-200 group-hover:text-primary transition-colors truncate">
                                                    {ticket.subject}
                                                </h3>
                                                <Badge variant="outline" className={cn("border-0 shrink-0", getStatusColor(ticket.status))}>
                                                    {getStatusLabel(ticket.status)}
                                                </Badge>
                                                <Badge variant="secondary" className={cn("shrink-0", getPriorityColor(ticket.priority))}>
                                                    {ticket.priority}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <MessageSquare size={14} />
                                                    {ticket.category}
                                                </span>
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <Clock size={14} />
                                                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: ar })}
                                                </span>
                                                <span className="truncate">
                                                    بواسطة: {ticket.profiles?.full_name || 'مستخدم غير معروف'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {ticket.messages?.[0]?.count > 0 && (
                                        <div className="flex items-center gap-1 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded-full shrink-0">
                                            <span>{ticket.messages[0].count}</span>
                                            <span>رسالة</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
