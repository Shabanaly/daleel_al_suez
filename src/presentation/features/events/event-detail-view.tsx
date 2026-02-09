'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Share2, CalendarPlus, ChevronRight, Map as MapIcon, Info, ExternalLink, ZoomIn } from 'lucide-react'
import { SuezEvent } from '@/domain/entities/suez-event'
import { format, differenceInSeconds } from 'date-fns'
import { ar } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
} from "@/presentation/ui/dialog"

interface EventDetailViewProps {
    event: SuezEvent
}

export function EventDetailView({ event }: EventDetailViewProps) {
    const handleAddToCalendar = () => {
        const title = encodeURIComponent(event.title)
        const details = encodeURIComponent(event.description || '')
        const location = encodeURIComponent(event.location || '')
        const start = format(event.startDate, "yyyyMMdd'T'HHmmss")
        const end = format(event.endDate, "yyyyMMdd'T'HHmmss")

        const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`
        window.open(googleUrl, '_blank')
    }

    const handleShare = () => {
        if (typeof window === 'undefined') return

        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: event.description || '',
                url: window.location.href,
            }).catch(() => {
                // Ignore share cancellation
            })
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href)
                .then(() => toast.success('تم نسخ رابط الفعالية بنجاح!'))
                .catch(() => toast.error('حدث خطأ أثناء نسخ الرابط'))
        } else {
            // Fallback for very old browsers or non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success('تم نسخ الرابط!');
            } catch (err) {
                toast.error('عذراً، متصفحك لا يدعم النسخ التلقائي');
            }
            document.body.removeChild(textArea);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header / Hero Section */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="relative h-[55vh] md:h-[75vh] w-full overflow-hidden cursor-zoom-in group/hero">
                        <Image
                            src={event.imageUrl || '/images/hero-bg.png'}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover/hero:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background" />

                        {/* Zoom Indicator Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity bg-black/20">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                                <ZoomIn className="text-white w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </DialogTrigger>

                <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 overflow-hidden border-none bg-transparent shadow-none focus:outline-none">
                    <DialogTitle className="sr-only">معاينة صورة: {event.title}</DialogTitle>
                    <DialogDescription className="sr-only">عرض الصورة بحجم كامل للفعالية</DialogDescription>
                    <div className="relative w-full h-[80vh]">
                        <Image
                            src={event.imageUrl || '/images/hero-bg.png'}
                            alt={event.title}
                            fill
                            className="object-contain"
                        />
                    </div>
                </DialogContent>

                {/* Back Button (Independent of DialogTrigger) */}
                <div className="absolute top-20 right-4 md:right-8 z-20">
                    <Link
                        href="/events"
                        className="flex items-center gap-2 bg-background/60 backdrop-blur-md px-4 py-2 rounded-xl border border-border hover:bg-background/80 transition-all text-sm font-medium shadow-lg"
                    >
                        <ChevronRight size={18} />
                        العودة للفعاليات
                    </Link>
                </div>
            </Dialog>

            <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card backdrop-blur-xl border border-border p-8 md:p-10 rounded-[2.5rem] shadow-2xl"
                        >
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="bg-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-primary-foreground">
                                    {event.type === 'place_hosted' ? 'فعالية في مكان' : 'فعالية عامة'}
                                </span>
                                <span className="bg-muted px-4 py-1.5 rounded-full text-xs font-bold text-muted-foreground border border-border">
                                    بواسطة دليل السويس
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-foreground">
                                {event.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground font-bold">التاريخ</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {format(event.startDate, 'PPP', { locale: ar })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground font-bold">الموقع</p>
                                        <p className="text-sm font-medium text-foreground">{event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card backdrop-blur-xl border border-border p-8 md:p-10 rounded-[2.5rem]"
                        >
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground">
                                <Info className="text-primary" />
                                عن الفعالية
                            </h3>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-loose text-lg whitespace-pre-wrap">
                                {event.description}
                            </div>
                        </motion.div>

                        {/* Venue / Place Info (If applicable) */}
                        {event.placeId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 group hover:bg-slate-900/80 transition-all"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 group-hover:scale-110 transition-transform">
                                    <MapIcon size={32} />
                                </div>
                                <div className="flex-1 text-center md:text-right">
                                    <h4 className="text-muted-foreground text-sm font-bold mb-1 uppercase tracking-widest">تستضيفها</h4>
                                    <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {event.placeName || 'مكان مسجل لدينا'}
                                    </p>
                                </div>
                                <Link
                                    href={`/places/${event.placeId}`}
                                    className="bg-muted hover:bg-muted/80 px-6 py-3 rounded-2xl border border-border transition-all flex items-center gap-2 group/btn"
                                >
                                    <span>مشاهدة المكان</span>
                                    <ExternalLink size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar Side */}
                    <div className="space-y-6">
                        {/* Action Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-primary p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 space-y-4"
                        >
                            <h4 className="text-primary-foreground/80 font-bold text-center text-sm uppercase mb-2">هل أنت مهتم؟</h4>
                            <button
                                onClick={handleAddToCalendar}
                                className="w-full bg-white text-primary px-6 py-4 rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <CalendarPlus size={20} />
                                أضف للتقويم
                            </button>
                            <button
                                onClick={handleShare}
                                className="w-full bg-primary-foreground/10 text-white px-6 py-4 rounded-2xl font-bold border border-white/20 transition-all hover:bg-primary-foreground/20 flex items-center justify-center gap-3"
                            >
                                <Share2 size={20} />
                                مشاركة الفعالية
                            </button>
                        </motion.div>

                        {/* Countdown Widget */}
                        <div className="bg-card backdrop-blur-xl border border-border p-8 rounded-[2.5rem]">
                            <h4 className="text-muted-foreground font-bold text-center text-xs uppercase mb-6 tracking-widest">الوقت المتبقي</h4>
                            <Countdown targetDate={event.startDate.toISOString()} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function Countdown({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            const target = new Date(targetDate)
            const diff = differenceInSeconds(target, now)

            if (diff <= 0) {
                setTimeLeft(null)
                clearInterval(timer)
                return
            }

            setTimeLeft({
                d: Math.floor(diff / (24 * 3600)),
                h: Math.floor((diff % (24 * 3600)) / 3600),
                m: Math.floor((diff % 3600) / 60),
                s: diff % 60
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    if (!timeLeft) return (
        <div className="text-center py-4 bg-primary/10 rounded-2xl border border-primary/20">
            <p className="text-primary font-bold">الفعالية بدأت الآن! 🎉</p>
        </div>
    )

    return (
        <div className="flex flex-row-reverse items-center justify-center gap-3 md:gap-4">
            <div className="flex flex-row-reverse gap-2 md:gap-3 font-outfit">
                <TimeUnit value={timeLeft.d} label="يوم" />
                <TimeUnit value={timeLeft.h} label="ساعة" />
                <TimeUnit value={timeLeft.m} label="دقيقة" />
                <TimeUnit value={timeLeft.s} label="ثانية" />
            </div>
        </div>
    )
}

function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="min-w-[45px] md:min-w-[55px] aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                <span className="text-xl md:text-2xl font-bold font-mono">{value.toString().padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] md:text-xs text-muted-foreground font-bold">{label}</span>
        </div>
    )
}
