import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Clock, ExternalLink } from 'lucide-react'
import {
    getUnreadNotificationsCountAction,
    getRecentNotificationsAction,
    markNotificationAsReadAction,
    markAllNotificationsAsReadAction
} from '@/actions/notifications.actions'
import { Notification } from '@/data/repositories/notifications.repository'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)

    // Helper function to generate role-based notification links
    const getNotificationLink = (notification: Notification): string => {
        // If notification has place_slug, route based on user role
        if (notification.place_slug) {
            if (userRole === 'admin') {
                return '/admin/places'
            }
            return `/places/${notification.place_slug}`
        }
        // Fallback to static link or default
        return notification.link || '/profile'
    }

    const fetchNotifications = async () => {
        try {
            const count = await getUnreadNotificationsCountAction()
            setUnreadCount(count)

            // Always fetch recent notifications, not just when dropdown is open
            // This ensures data is ready when user clicks the bell
            const recent = await getRecentNotificationsAction()
            setNotifications(recent as Notification[])
        } catch (error: unknown) {
            console.error('Error fetching notifications:', error)
        }
    }

    useEffect(() => {
        // Fetch user role
        const fetchUserRole = async () => {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single()
                    setUserRole(profile?.role || 'user')
                }
            } catch (error: unknown) {
                console.error('Error fetching user role:', error)
            }
        }

        // Use a tick to avoid "setState in effect" warning if called synchronously
        setTimeout(() => {
            fetchUserRole()
            fetchNotifications()
        }, 0)

        // Set up Supabase Realtime subscription for instant updates
        const supabase = createClient()

        // Subscribe to notifications table changes
        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'notifications'
                },
                () => {
                    // Fetch new notifications when any change occurs
                    fetchNotifications()
                }
            )
            .subscribe()

        // Also use polling as fallback (every 10 seconds instead of 60)
        const interval = setInterval(fetchNotifications, 10000)

        return () => {
            // Cleanup: unsubscribe from realtime and clear interval
            supabase.removeChannel(channel)
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            // Use a tick to avoid synchronous setState warning
            const timer = setTimeout(() => {
                fetchNotifications()
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        await markNotificationAsReadAction(id)
        await fetchNotifications()
    }

    const handleMarkAllRead = async () => {
        setLoading(true)
        await markAllNotificationsAsReadAction()
        await fetchNotifications()
        setLoading(false)
    }

    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-background"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-x-4 top-16 mt-2 md:absolute md:inset-x-auto md:left-0 md:mt-3 md:w-80 bg-card border border-border rounded-2xl shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-200 origin-top md:origin-top-left overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <h3 className="font-bold text-sm">الإشعارات</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={loading}
                                className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                            >
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center text-muted-foreground">
                                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm">لا توجد إشعارات حالياً</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors relative flex gap-3",
                                        !notif.is_read && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={cn("text-sm font-bold truncate", !notif.is_read && "text-primary")}>
                                                {notif.title}
                                            </h4>
                                            {!notif.is_read && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(e, notif.id)}
                                                    className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors"
                                                    title="تحديد كمقروء"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ar })}
                                            </span>
                                            {(notif.link || notif.place_slug) && (
                                                <Link
                                                    href={getNotificationLink(notif)}
                                                    onClick={() => setIsOpen(false)}
                                                    className="text-primary flex items-center gap-1 font-bold hover:underline"
                                                >
                                                    عرض
                                                    <ExternalLink size={10} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {!notif.is_read && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="block p-3 text-center text-xs font-bold text-muted-foreground hover:bg-muted bg-muted/10 transition-colors border-t border-border"
                        >
                            عرض كل النشاطات
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
