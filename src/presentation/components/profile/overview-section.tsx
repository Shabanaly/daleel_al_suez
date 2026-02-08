'use client'

import { User, Mail, Calendar, Heart, Star } from 'lucide-react'
import Link from 'next/link'

interface OverviewSectionProps {
    user: any
    profile: any
    isAdmin: boolean
}

export function OverviewSection({ user, profile, isAdmin }: OverviewSectionProps) {
    return (
        <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">معلومات الحساب</h3>

                <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">الاسم</p>
                            <p className="font-medium text-foreground">
                                {user.user_metadata?.full_name || 'مستخدم دليل السويس'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                            <p className="font-medium text-foreground">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                            <p className="font-medium text-foreground">
                                {new Date(user.created_at).toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">روابط سريعة</h3>

                <div className="grid gap-3">
                    <Link
                        href="/favorites"
                        className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors group"
                    >
                        <div className="p-2 bg-red-500/10 text-red-500 rounded-lg group-hover:bg-red-500/20">
                            <Heart size={20} className="fill-current" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-red-900 dark:text-red-100">مفضلاتي</p>
                            <p className="text-sm text-red-600 dark:text-red-300">الأماكن المحفوظة</p>
                        </div>
                    </Link>

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors group"
                        >
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-500/20">
                                <Star size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-indigo-900 dark:text-indigo-100">لوحة التحكم</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-300">أنت تمتلك صلاحيات الأدمن</p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
