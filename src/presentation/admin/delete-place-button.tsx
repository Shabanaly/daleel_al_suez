'use client'

import { deletePlaceAction } from '@/app/admin/places/actions'
import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function DeletePlaceButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا المكان؟')) return
        setLoading(true)
        try {
            await deletePlaceAction(id)
        } catch (error) {
            alert('فشل الحذف')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
    )
}
