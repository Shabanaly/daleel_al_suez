'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function HeroSearchBar() {
    const [query, setQuery] = useState('')
    const router = useRouter()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/places?search=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن مطعم، كافيه، خدمة..."
                    className="w-full px-6 py-4 pr-14 rounded-full bg-background text-foreground border-2 border-border focus:border-primary outline-none shadow-xl text-lg transition-all placeholder:text-muted-foreground"
                />
                <button
                    type="submit"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary hover:brightness-110 text-primary-foreground p-3 rounded-full transition-all shadow-lg hover:shadow-primary/50"
                >
                    <Search size={20} />
                </button>
            </div>
        </form>
    )
}
