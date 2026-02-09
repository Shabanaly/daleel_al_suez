'use client'

import { useState } from 'react'
import { Globe, Loader2, Sparkles } from 'lucide-react'
import { fetchGooglePlaceByUrlAction } from '@/app/admin/places/google-actions'
import { toast } from 'sonner'

interface GoogleFetchControlProps {
    onDataFetched: (data: any) => void
}

export function GoogleFetchControl({ onDataFetched }: GoogleFetchControlProps) {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleFetch = async () => {
        if (!url) {
            toast.error('يرجى إدخال رابط خرائط جوجل')
            return
        }

        setLoading(true)
        try {
            const result = await fetchGooglePlaceByUrlAction(url)
            if (result.success && result.data) {
                onDataFetched(result.data)
                toast.success('تم جلب البيانات بنجاح')
            } else {
                toast.error(result.message || 'فشل جلب البيانات')
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب البيانات')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Sparkles className="text-purple-400" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">إضافة سريعة من جوجل مابس</h3>
                    <p className="text-slate-400 text-sm">أدخل رابط المكان وسيتم ملء البيانات تلقائياً</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Globe className="absolute right-3 top-3.5 text-slate-500 w-5 h-5" />
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition-colors ltr:text-left"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleFetch}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'جلب البيانات'}
                </button>
            </div>
        </div>
    )
}
