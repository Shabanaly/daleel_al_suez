'use client'

import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { SuezEvent } from '@/domain/entities/suez-event'
import { format, differenceInSeconds } from 'date-fns'
import { ar } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EventHeroSliderProps {
    events: SuezEvent[]
}

export function EventHeroSlider({ events }: EventHeroSliderProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: 'rtl' }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ])
    const [selectedIndex, setSelectedIndex] = useState(0)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on('select', onSelect)
    }, [emblaApi, onSelect])

    if (!events || events.length === 0) return null

    return (
        <section className="relative w-full overflow-hidden bg-background min-h-[600px] md:h-[650px]">
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative flex-[0_0_100%] min-w-0 h-full">
                            {/* Animated Background Image with Blur */}
                            <AnimatePresence mode="wait">
                                {selectedIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.5 }}
                                        className="absolute inset-0 z-0"
                                    >
                                        <Image
                                            src={event.imageUrl || '/images/hero-bg.png'}
                                            alt={event.title}
                                            fill
                                            className="object-cover blur-md scale-110 opacity-40"
                                            priority={index === 0}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Content Wrapper */}
                            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 pt-10 pb-16 md:py-0">
                                {/* Event Image Card - Now on Top on Mobile */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={selectedIndex === index ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="relative w-full max-w-[260px] md:max-w-sm aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group order-1 md:order-1"
                                >
                                    <Image
                                        src={event.imageUrl || '/images/hero-bg.png'}
                                        alt={event.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-primary/95 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm">
                                        {event.type === 'place_hosted' ? 'فعالية في مكان' : 'فعالية عامة'}
                                    </div>
                                </motion.div>

                                {/* Event Details Content - Now below image on Mobile */}
                                <div className="flex-1 text-center md:text-right space-y-4 md:space-y-6 order-2 md:order-2 md:px-12">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={selectedIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <h2 className="text-2xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                                            {event.title}
                                        </h2>
                                        <p className="text-sm md:text-xl text-muted-foreground max-w-2xl md:ml-auto line-clamp-2 mt-2">
                                            {event.description}
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={selectedIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 text-muted-foreground"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm md:text-base font-medium">{format(new Date(event.startDate), 'PPP', { locale: ar })}</span>
                                            <Calendar className="text-primary w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm md:text-base font-medium font-outfit">{event.location}</span>
                                            <MapPin className="text-primary w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    </motion.div>

                                    {/* Countdown Timer */}
                                    <div className="pt-2 md:pt-4 flex justify-center md:justify-end">
                                        <Countdown targetDate={event.startDate.toISOString()} />
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={selectedIndex === index ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.6, delay: 0.4 }}
                                        className="flex items-center justify-center md:justify-end gap-4"
                                    >
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 md:px-8 md:py-4 rounded-2xl text-base md:text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 flex items-center gap-2"
                                        >
                                            <ArrowRight size={20} className="hidden md:block" />
                                            تفاصيل الفعالية
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slider Navigation Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {events.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => emblaApi?.scrollTo(index)}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            selectedIndex === index ? "w-10 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
                        )}
                    />
                ))}
            </div>

            {/* Side Navigation Buttons (Desktop) */}
            <div className="hidden md:flex absolute inset-y-0 left-4 right-4 items-center justify-between z-20 pointer-events-none">
                <button
                    onClick={() => emblaApi?.scrollPrev()}
                    className="p-4 rounded-full bg-slate-900/40 hover:bg-slate-900/60 text-white backdrop-blur-md transition-all border border-white/20 pointer-events-auto hover:scale-110 active:scale-95"
                >
                    <ArrowRight size={28} />
                </button>
                <button
                    onClick={() => emblaApi?.scrollNext()}
                    className="p-4 rounded-full bg-slate-900/40 hover:bg-slate-900/60 text-white backdrop-blur-md transition-all border border-white/20 pointer-events-auto hover:scale-110 active:scale-95"
                >
                    <ArrowLeft size={28} />
                </button>
            </div>
        </section>
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

    if (!timeLeft) return null

    return (
        <div className="flex flex-row-reverse items-center justify-center md:justify-end gap-2 md:gap-4 text-foreground">
            <div className="flex items-center gap-1.5 bg-muted/50 backdrop-blur-md border border-border px-2 py-1 md:px-3 md:py-1.5 rounded-xl">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                <span className="text-[10px] md:text-sm font-medium">يبدأ خلال:</span>
            </div>
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
        <div className="flex flex-col items-center">
            <div className="text-lg md:text-2xl font-bold font-mono bg-card px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-border min-w-[35px] md:min-w-[45px] text-center">
                {value.toString().padStart(2, '0')}
            </div>
            <span className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5 md:mt-1">{label}</span>
        </div>
    )
}
