'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, X, Search, User, Heart, Compass, PlusCircle } from 'lucide-react'
import { ThemeToggle } from '../theme-toggle'
import { NotificationBell } from '../notification-bell'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'

export function Header({ settings }: { settings?: Record<string, unknown> }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const supabase = createClient()

    useEffect(() => {
        // Use a tick to avoid "setState in effect" warning
        setTimeout(() => setMounted(true), 0)
    }, [])

    useEffect(() => {
        // Check initial session
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        checkUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    // Prevent hydration mismatch for portal rendering if needed,
    // but allow main header to render immediately.

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-4">
                    {settings?.site_logo ? (
                        <Image
                            src={settings.site_logo as string}
                            alt={(settings?.site_name as string) || "Logo"}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg object-cover"
                            unoptimized
                        />
                    ) : (
                        <Compass className="w-5 h-5 text-primary" />
                    )}
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        {(settings?.site_name as string) || "دليل السويس"}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        الرئيسية
                    </Link>
                    <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                        التصنيفات
                    </Link>
                    <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
                        الفعاليات
                    </Link>
                    <Link href="/places" className="text-sm font-medium hover:text-primary transition-colors">
                        الأماكن
                    </Link>
                    <Link href="/news" className="text-sm font-medium hover:text-primary transition-colors">
                        الأخبار والمقالات
                    </Link>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/places/new"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors text-sm font-medium border border-green-500/20"
                    >
                        <PlusCircle size={16} />
                        <span>أضف مكانك</span>
                    </Link>
                    <ThemeToggle />
                    {user && <NotificationBell />}
                    {user ? (
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                        >
                            <User size={16} />
                            <span>حسابي</span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors text-sm font-medium"
                        >
                            <User size={16} />
                            <span>تسجيل الدخول</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Actions */}
                <div className="flex md:hidden items-center gap-2">
                    {user && <NotificationBell />}
                    <button
                        className="p-2 -ml-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && mounted && createPortal(
                <div className="md:hidden fixed inset-0 z-[100]">
                    {/* Backdrop - covers entire screen including header */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Menu Content Wrapper - Full Screen */}
                    <div
                        className="absolute inset-0 pointer-events-none flex flex-col"
                    >
                        <div
                            className="bg-popover w-full shadow-xl animate-in slide-in-from-top-2 duration-300 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Mobile Menu Header (Logo + Close) */}
                            <div className="container mx-auto px-4 h-16 flex items-center justify-between border-b">
                                <Link href="/" className="flex items-center gap-4" onClick={() => setIsMenuOpen(false)}>
                                    {settings?.site_logo ? (
                                        <Image
                                            src={settings.site_logo as string}
                                            alt={(settings?.site_name as string) || "Logo"}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-lg object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <Compass className="w-5 h-5 text-primary" />
                                    )}
                                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                        {(settings?.site_name as string) || "دليل السويس"}
                                    </span>
                                </Link>
                                <button
                                    className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Menu Links */}
                            <div className="container mx-auto px-4 py-6 space-y-2">
                                <Link
                                    href="/"
                                    className="block px-4 py-3 text-base font-medium rounded-xl hover:bg-muted transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    الرئيسية
                                </Link>
                                <Link
                                    href="/categories"
                                    className="block px-4 py-3 text-base font-medium rounded-xl hover:bg-muted transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    التصنيفات
                                </Link>
                                <Link
                                    href="/places"
                                    className="block px-4 py-3 text-base font-medium rounded-xl hover:bg-muted transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    الأماكن
                                </Link>
                                <Link
                                    href="/news"
                                    className="block px-4 py-3 text-base font-medium rounded-xl hover:bg-muted transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    الأخبار والمقالات
                                </Link>
                                <Link
                                    href="/events"
                                    className="block px-4 py-3 text-base font-medium rounded-xl hover:bg-muted transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    الفعاليات
                                </Link>

                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between px-4">
                                    <div className="flex items-center gap-2">
                                        <ThemeToggle />
                                    </div>
                                    {user ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            <Link
                                                href="/profile"
                                                className="flex items-center justify-center gap-2 bg-primary/10 text-primary px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors shadow-sm"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <User size={18} />
                                                <span>حسابي</span>
                                            </Link>
                                            <Link
                                                href="/favorites"
                                                className="flex items-center justify-center gap-2 bg-red-50 text-red-500 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors shadow-sm"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <Heart size={18} className="fill-current" />
                                                <span>مفضلاتي</span>
                                            </Link>
                                        </div>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:brightness-110 transition-colors shadow-sm"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User size={18} />
                                            <span>تسجيل الدخول</span>
                                        </Link>
                                    )}
                                    <Link
                                        href="/places/new"
                                        className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors shadow-sm mt-2 w-full"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <PlusCircle size={18} />
                                        <span>أضف مكانك</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </header>
    )
}
