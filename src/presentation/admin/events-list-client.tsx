'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { Pencil, Calendar, Clock, MapPin, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Place } from '@/domain/entities/place'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { deleteEventAction, toggleEventStatusAction } from '@/actions/admin/events.actions'
import { toast } from 'sonner'
import { SuezEvent, EventStatus } from '@/domain/entities/suez-event'

interface AdminEventsListClientProps {
    initialEvents: SuezEvent[]
    places: Place[]
}

const StatusBadge = ({
    status,
    onStatusChange,
    isUpdating
}: {
    status: string,
    onStatusChange?: (newStatus: EventStatus) => void,
    isUpdating?: boolean
}) => {
    const styles = {
        active: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
        draft: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
        inactive: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
    }
    const labels = {
        active: 'نشط',
        draft: 'مسودة',
        inactive: 'معطل',
    }
    const currentStyle = styles[status as keyof typeof styles] || styles.draft
    const label = labels[status as keyof typeof labels] || status

    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
                disabled={isUpdating}
                onClick={() => setIsOpen(!isOpen)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${currentStyle} disabled:opacity-50`}
            >
                {isUpdating ? <Clock size={12} className="animate-spin" /> : label}
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 right-0 w-24 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-10 py-1 overflow-hidden">
                    {(Object.keys(labels) as EventStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                onStatusChange?.(s)
                                setIsOpen(false)
                            }}
                            className={`w-full text-right px-3 py-1.5 text-xs hover:bg-slate-800 transition-colors ${status === s ? 'text-primary font-bold' : 'text-slate-400'}`}
                        >
                            {labels[s]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function AdminEventsListClient({ initialEvents, places }: AdminEventsListClientProps) {
    const [events, setEvents] = useState(initialEvents)
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
    const [updatingEventId, setUpdatingEventId] = useState<string | null>(null)

    const toggleExpanded = (eventId: string) => {
        setExpandedEventId(expandedEventId === eventId ? null : eventId)
    }

    const handleStatusChange = async (id: string, newStatus: EventStatus) => {
        setUpdatingEventId(id)
        const res = await toggleEventStatusAction(id, newStatus)
        if (res.success) {
            setEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e))
            toast.success(res.message)
        } else {
            toast.error(res.message)
        }
        setUpdatingEventId(null)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الفعالية؟')) return

        const res = await deleteEventAction(id)
        if (res.success) {
            setEvents(events.filter(e => e.id !== id))
            toast.success(res.message)
        } else {
            toast.error(res.message)
        }
    }

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden text-right" dir="rtl">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-right">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm">الفعالية</th>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm">الحالة</th>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm">التاريخ</th>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm w-24">الإجراءات</th>
                            <th className="px-6 py-4 font-semibold text-slate-400 text-sm w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {events.length > 0 ? events.map((event) => (
                            <Fragment key={event.id}>
                                <tr
                                    className={`transition-colors cursor-pointer ${expandedEventId === event.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/50'}`}
                                >
                                    <td className="px-6 py-4" onClick={() => toggleExpanded(event.id)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 relative overflow-hidden border border-slate-700/50 shrink-0">
                                                {event.imageUrl ? (
                                                    <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="48px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                        <Calendar size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-200 mb-0.5">{event.title}</div>
                                                <div className="text-xs text-slate-500 font-mono">{event.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge
                                            status={event.status}
                                            onStatusChange={(newStatus) => handleStatusChange(event.id, newStatus)}
                                            isUpdating={updatingEventId === event.id}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm" onClick={() => toggleExpanded(event.id)}>
                                        <div className="flex flex-col">
                                            <span>{format(new Date(event.startDate), 'dd MMM yyyy', { locale: ar })}</span>
                                            <span className="text-xs text-slate-500">{event.type === 'place_hosted' ? `بواسطة: ${event.placeName || 'مكان مسجل'}` : 'فعالية عامة'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/admin/events/${event.id}/edit`}>
                                                <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                    <Pencil size={18} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-left" onClick={() => toggleExpanded(event.id)}>
                                        {expandedEventId === event.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </td>
                                </tr>
                                {expandedEventId === event.id && (
                                    <tr className="bg-slate-900/50">
                                        <td colSpan={5} className="p-0">
                                            <div className="p-6 border-b border-slate-800">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">الوصف</h4>
                                                        <p className="text-sm text-slate-400 leading-relaxed">{event.description || 'لا يوجد وصف'}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">المكان والموعد</h4>
                                                        <div className="space-y-2 text-sm text-slate-400">
                                                            <div className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> {event.location || 'غير محدد'}</div>
                                                            <div className="flex items-center gap-2"><Clock size={14} className="text-primary" /> {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">لا توجد فعاليات حالياً.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
