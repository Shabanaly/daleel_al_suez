'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Bot } from 'lucide-react'
import { toast } from 'sonner'

export function AiSyncButton() {
    const [loading, setLoading] = useState(false)

    const handleSync = async () => {
        setLoading(true)
        const toastId = toast.loading('جاري تحديث قاعدة المعرفة...')

        try {
            const res = await fetch('/api/admin/embeddings', { method: 'POST' })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'فشل التحديث')
            }

            toast.success(`تم تحديث ${data.processed} مكان بنجاح`, { id: toastId })
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || 'حدث خطأ أثناء التحديث', { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Bot className="text-purple-400" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">المساعد الذكي (AI)</h3>
                    <p className="text-slate-400 text-sm">تحديث قاعدة المعرفة لبيانات الشات بوت</p>
                </div>
            </div>
            <Button
                onClick={handleSync}
                disabled={loading}
                variant="outline"
                className="border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-400 text-slate-300 gap-2"
            >
                <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
            </Button>
        </div>
    )
}
