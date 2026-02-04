import { Search, Globe, User } from 'lucide-react'
import Link from 'next/link'
import { NotificationBell } from './NotificationBell'
import { createClient } from '@/lib/supabase/server'

export async function AdminHeader() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const avatarUrl = user?.user_metadata?.avatar_url
    const userName = user?.user_metadata?.full_name || user?.email || 'Admin'
    const fallbackLetter = userName[0].toUpperCase()

    return (
        <header className="flex items-center justify-between h-16 px-8 pr-16 md:pr-8 border-b border-slate-800 bg-slate-900 text-white">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">لوحة التحكم</h2>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/" target="_blank" className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors" title="عرض الموقع">
                    <Globe size={20} />
                </Link>
                <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                    <Search size={20} />
                </button>

                <NotificationBell />

                <Link href="/admin/profile" className="flex items-center gap-3 pl-2">
                    <div className="w-8 h-8 rounded-full bg-primary overflow-hidden flex items-center justify-center text-sm font-bold border border-slate-700">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            fallbackLetter
                        )}
                    </div>
                </Link>
            </div>
        </header>
    )
}
