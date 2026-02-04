'use client'

import { Power, PowerOff } from 'lucide-react'
import { togglePlaceStatus } from '@/actions/admin/places.actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
            const result = await togglePlaceStatus(id, newStatus as any)
            if (result.success) {
                router.refresh()
            } else {
                alert('حدث خطأ: ' + result.message)
            }
        } catch (error) {
            console.error(error)
            alert('حدث خطأ غير متوقع')
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
