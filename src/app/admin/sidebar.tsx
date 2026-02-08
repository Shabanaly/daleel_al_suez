'use client'

import { LayoutDashboard, Store, Users, Variable, Settings, LogOut, Menu, X, User, LifeBuoy, Calendar } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface AdminSidebarProps {
    currentUserRole: string | null
}

export function AdminSidebar({ currentUserRole }: AdminSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)

    const isSuperAdmin = currentUserRole === 'super_admin'

    // Dynamic navigation based on role
    const navigation = [
        { name: 'الرئيسية', href: '/admin', icon: LayoutDashboard },
        { name: 'الأماكن', href: '/admin/places', icon: Store },
        { name: 'الفعاليات', href: '/admin/events', icon: Calendar },
        { name: 'التصنيفات', href: '/admin/categories', icon: Variable },
        // Only show Users and Settings for Super Admin
        ...(isSuperAdmin ? [
            { name: 'المستخدمين', href: '/admin/users', icon: Users },
            { name: 'الدعم الفني', href: '/admin/support', icon: LifeBuoy },
            { name: 'الإعدادات', href: '/admin/settings', icon: Settings }
        ] : []),
        { name: 'حسابي', href: '/admin/profile', icon: User },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const SidebarContent = () => (
        <>
            <div className="flex h-16 shrink-0 items-center px-6">
                <Link href="/" title="زيارة الموقع" className="hover:opacity-80 transition-opacity">
                    <h1 className="text-lg font-bold text-white">إدارة دليل السويس</h1>
                </Link>
            </div>
            <nav className="flex flex-1 flex-col px-4 py-4 gap-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-colors",
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                            {item.name}
                        </Link>
                    )
                })}

                <div className="mt-auto border-t border-slate-800 pt-4">
                    <button
                        onClick={handleLogout}
                        className="group flex w-full gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    >
                        <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                        تسجيل خروج
                    </button>
                </div>
            </nav>
        </>
    )

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-slate-900 text-white rounded-lg shadow-lg"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "flex shrink-0 flex-col w-64 border-l bg-slate-900 border-slate-800 transition-transform duration-300 ease-in-out z-40 h-full",
                // Desktop styles (always visible)
                "md:translate-x-0 md:static md:h-screen",
                // Mobile styles (fixed, transform based on state)
                "fixed top-0 right-0 h-full",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <SidebarContent />
            </div>
        </>
    )
}
