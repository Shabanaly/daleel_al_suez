'use client'

import { cn } from "@/lib/utils"

interface VideoEmbedProps {
    url: string
    className?: string
}

export function VideoEmbed({ url, className }: VideoEmbedProps) {
    if (!url) return null

    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (ytMatch && ytMatch[1]) {
        return (
            <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg", className)}>
                <iframe
                    src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        )
    }

    // Facebook
    // Expected formats: https://www.facebook.com/watch/?v=XXX or https://www.facebook.com/username/videos/XXX
    if (url.includes('facebook.com')) {
        return (
            <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg bg-black/5 flex items-center justify-center", className)}>
                <iframe
                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        )
    }

    // Instagram
    // Expected format: https://www.instagram.com/reels/XXX/ or https://www.instagram.com/p/XXX/
    if (url.includes('instagram.com')) {
        // Embed reels and posts
        const cleanUrl = url.split('?')[0].replace(/\/$/, '')
        return (
            <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg bg-black/5 flex items-center justify-center", className)}>
                <iframe
                    src={`${cleanUrl}/embed`}
                    className="absolute inset-0 h-full w-full border-0"
                    allowTransparency
                />
            </div>
        )
    }

    // Generic Fallback (Link Only or Error)
    return (
        <div className={cn("p-6 rounded-2xl bg-muted border border-dashed border-border text-center", className)}>
            <p className="text-sm text-muted-foreground mb-2">رابط الفيديو غير مدعوم للمعالجة التلقائية:</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline break-all">
                {url}
            </a>
        </div>
    )
}
