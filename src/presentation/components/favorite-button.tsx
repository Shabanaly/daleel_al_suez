'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleFavoriteAction, checkIsFavoriteAction } from '@/actions/favorites.actions'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
    placeId: string
    initialIsFavorite?: boolean
    className?: string
    size?: number
}

export function FavoriteButton({ placeId, initialIsFavorite = false, className, size = 20 }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // If initial state is not provided (or false default), ensure we check it
        // Only checking if we suspect we might be logged in, but better to rely on parent passing initial state
        // For now, let's assume parent might not pass it and we fetch if needed, 
        // OR better: parent passes it. If not passed, we can check.
        const check = async () => {
            const status = await checkIsFavoriteAction(placeId)
            setIsFavorite(status)
        }
        if (initialIsFavorite === undefined) {
            check()
        }
    }, [placeId, initialIsFavorite])

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation() // Prevent triggering card click

        if (loading) return

        // Optimistic update
        const newState = !isFavorite
        setIsFavorite(newState)
        setLoading(true)

        try {
            await toggleFavoriteAction(placeId, newState)
        } catch (error: any) {
            // Revert
            setIsFavorite(!newState)
            if (error.message.includes('تسجيل الدخول')) {
                router.push('/login')
            } else {
                console.error('Error toggling favorite:', error)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "transition-all duration-200 backdrop-blur-sm flex items-center justify-center",
                !className && "p-2 rounded-full",
                !className && (isFavorite
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-500"),
                className,
                isFavorite && className && "text-red-500 bg-red-50 border-red-200"
            )}
            disabled={loading}
        >
            <Heart size={size} className={cn("transition-all", isFavorite && "fill-current")} />
        </button>
    )
}
