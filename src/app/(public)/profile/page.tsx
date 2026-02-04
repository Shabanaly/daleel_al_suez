'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, LogOut, ShieldCheck, Loader2, Heart } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ fullName: '', password: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser()

                if (error || !user) {
                    router.push('/login')
                    return
                }

                setUser(user)
                setFormData(prev => ({ ...prev, fullName: user.user_metadata?.full_name || '' }))

                // Fetch extra profile data (role)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setProfile(profile)
                }

            } catch (error) {
                console.error('Error fetching user:', error)
            } finally {
                setLoading(false)
            }
        }

        getUser()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { updateProfile } = await import('@/actions/profile.actions')
            await updateProfile(formData)

            // Refresh local user data
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setIsEditing(false)
            setFormData(prev => ({ ...prev, password: '' })) // Clear password
            alert('تم حفظ التغييرات بنجاح')
        } catch (error: any) {
            alert(error.message || 'حدث خطأ أثناء الحفظ')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    return (
        <div className="container mx-auto px-4 py-12 relative">
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl overflow-hidden shadow-xl relative z-10">
                {/* Header/Cover */}
                <div className="h-32 bg-gradient-to-r from-primary to-blue-600 relative">
                    <div className="absolute -bottom-10 right-8">
                        <div className="w-24 h-24 bg-card rounded-full p-1 border-4 border-card">
                            <div className="w-full h-full bg-muted rounded-full flex items-center justify-center text-muted-foreground overflow-hidden">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} />
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Edit Button */}
                    <div className="absolute bottom-4 left-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-black/20 hover:bg-black/40 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-colors border border-white/20"
                        >
                            تعديل الملف الشخصي
                        </button>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-foreground">
                            {user.user_metadata?.full_name || 'مستخدم دليل السويس'}
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Mail size={16} />
                            {user.email}
                        </p>
                    </div>

                    <div className="grid gap-4">
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

                        {/* Favorites */}
                        <Link
                            href="/favorites"
                            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors group"
                        >
                            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg group-hover:bg-red-500/20">
                                <Heart size={20} className="fill-current" />
                            </div>
                            <div>
                                <p className="font-bold text-red-900">مفضلاتي</p>
                                <p className="text-sm text-red-600">الأماكن المحفوظة</p>
                            </div>
                        </Link>

                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors group"
                            >
                                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-500/20">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-indigo-900 dark:text-indigo-100">لوحة التحكم</p>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-300">أنت تمتلك صلاحيات الأدمن، اضغط للدخول</p>
                                </div>
                            </Link>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-border">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center justify-center gap-2 w-full p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors font-medium border border-transparent hover:border-red-200 dark:hover:border-red-900"
                        >
                            <LogOut size={20} />
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal Overlay */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">تعديل الملف الشخصي</h2>
                            <button onClick={() => setIsEditing(false)} className="size-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">الاسم</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="الاسم الكامل"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="اتركها فارغة إذا لم ترد التغيير"
                                    minLength={6}
                                />
                                <p className="text-xs text-muted-foreground mt-1">اترك هذا الحقل فارغاً للاحتفاظ بكلمة المرور الحالية.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors font-medium"
                                    disabled={saving}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                                    disabled={saving}
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    حفظ التغييرات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
