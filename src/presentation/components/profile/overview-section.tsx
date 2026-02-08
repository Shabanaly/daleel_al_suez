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
                        className="flex items-center gap-3 p-4 bg-card hover:bg-accent border border-border rounded-xl transition-all group"
                    >
                        <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                            <Heart size={20} className="fill-current" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">مفضلاتي</p>
                            <p className="text-sm text-muted-foreground">الأماكن المحفوظة</p>
                        </div>
                    </Link>

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 p-4 bg-card hover:bg-accent border border-border rounded-xl transition-all group"
                        >
                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                                <Star size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-foreground">لوحة التحكم</p>
                                <p className="text-sm text-muted-foreground">أنت تمتلك صلاحيات الأدمن</p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
