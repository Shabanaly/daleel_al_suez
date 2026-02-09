import { getActiveEventsUseCase } from '@/di/modules'
import { EventCard } from '@/presentation/features/events/event-card'
import { Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
    const events = await getActiveEventsUseCase.execute()

    return (
        <main className="min-h-screen bg-background pb-20 pt-24 px-4">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                        <Calendar size={16} />
                        <span>فعاليات السويس</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">استكشف أحداث المدينة</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        كن على اطلاع دائم بأحدث المهرجانات، العروض الفنية، والأنشطة الترفيهية في قلب السويس.
                    </p>
                </div>

                {/* Grid Section */}
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                        <div className="text-slate-500 text-lg">لا توجد فعاليات قادمة حالياً. ترقبوا المزيد قريباً!</div>
                    </div>
                )}
            </div>
        </main>
    )
}
