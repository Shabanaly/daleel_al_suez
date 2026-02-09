'use client'

import { Power, PowerOff } from 'lucide-react'
import { togglePlaceStatus } from '@/actions/admin/places.actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ToggleStatusButton({ id, currentStatus }: { id: string, currentStatus: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const Icon = currentStatus === 'active' ? PowerOff : Power
    const title = currentStatus === 'active' ? 'تعطيل المكان' : 'تفعيل المكان'
    const colorClass = currentStatus === 'active'
        ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
        : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10'

    const handleToggle = async () => {
        if (!confirm(`هل أنت متأكد من ${currentStatus === 'active' ? 'تعطيل' : 'تفعيل'} هذا المكان؟`)) return

        setIsLoading(true)
        try {
            const result = await togglePlaceStatus(id, newStatus as "active" | "inactive")
            if (result.success) {
                router.refresh()
            } else {
                toast.error(result.message || 'فشل تحديث الحالة')
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'فشل تحديث الحالة')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${colorClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={title}
        >
            <Icon size={18} />
        </button>
    )
}
