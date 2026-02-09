import { SuezEvent } from '@/domain/entities/suez-event'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface EventCardProps {
    event: SuezEvent
}

export function EventCard({ event }: EventCardProps) {
    const isPlaceHosted = event.type === 'place_hosted' && event.placeId

    return (
        <div className="group bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 shadow-xl flex flex-col h-full" dir="rtl">
            {/* Image Section */}
            <div className="relative aspect-[16/10] overflow-hidden">
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                        <Calendar size={48} />
                    </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                    {event.type === 'place_hosted' ? 'عرض خاص' : 'فعالية عامة'}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4 flex-1 flex flex-col text-right">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {event.description}
                    </p>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar size={16} className="text-primary shrink-0" />
                        <span>{format(new Date(event.startDate), 'dd MMMM yyyy', { locale: ar })}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock size={16} className="text-primary shrink-0" />
                        <span>{format(new Date(event.startDate), 'hh:mm a')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin size={16} className="text-primary shrink-0" />
                        <span className="truncate">{event.location || 'السويس'}</span>
                    </div>
                </div>

                <div className="pt-4 mt-auto flex gap-3">
                    <Link
                        href={`/events/${event.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all shadow-lg shadow-primary/20 font-bold"
                    >
                        <span>تفاصيل الفعالية</span>
                        <ArrowLeft size={18} />
                    </Link>

                    {isPlaceHosted && (
                        <Link
                            href={`/places/${event.placeId}`}
                            className="aspect-square flex items-center justify-center w-12 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-slate-700/50"
                            title={`عرض المكان: ${event.placeName}`}
                        >
                            <MapPin size={20} className="text-primary" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

function Plus({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    )
}
