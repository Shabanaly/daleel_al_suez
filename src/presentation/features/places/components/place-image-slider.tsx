'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface PlaceImageSliderProps {
    images: string[]
    placeName: string
}

export function PlaceImageSlider({ images, placeName }: PlaceImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)

    if (!images || images.length === 0) {
        return (
            <div className="relative h-[400px] md:h-[500px] bg-slate-900 flex items-center justify-center">
                <span className="text-6xl">📷</span>
            </div>
        )
    }

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <>
            {/* Main Slider */}
            <div className="relative h-[400px] md:h-[500px] group">
                <Image
                    src={images[currentIndex]}
                    alt={`${placeName} - صورة ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            aria-label="الصورة السابقة"
                        >
                            <ChevronRight size={24} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            aria-label="الصورة التالية"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {/* Thumbnail Preview */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {images.slice(0, 4).map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-primary scale-110' : 'border-white/50 hover:border-white'
                                    }`}
                            >
                                <Image src={img} alt={`صورة مصغرة ${idx + 1}`} fill className="object-cover" />
                            </button>
                        ))}
                        {images.length > 4 && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-16 h-16 rounded-lg bg-black/60 backdrop-blur-sm text-white flex items-center justify-center text-xs font-bold hover:bg-black/80 transition-colors border-2 border-white/50"
                            >
                                +{images.length - 4}
                            </button>
                        )}
                    </div>
                )}

                {/* View All Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-4 left-4 bg-black/60 hover:bg-black/70 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-colors border border-white/20 shadow-lg"
                >
                    عرض جميع الصور ({images.length})
                </button>
            </div>

            {/* Fullscreen Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative w-full max-w-4xl h-[80vh]">
                        <Image
                            src={images[currentIndex]}
                            alt={`${placeName} - صورة ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                        />
                    </div>

                    {/* Modal Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                            >
                                <ChevronRight size={32} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                            >
                                <ChevronLeft size={32} />
                            </button>
                        </>
                    )}

                    {/* Modal Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-lg font-medium">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    )
}
