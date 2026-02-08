'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { createSupportTicket } from '@/actions/support.actions'
import { toast } from 'sonner' // Assuming sonner is used, or alert fallback

export function CreateTicketDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        subject: '',
        category: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createSupportTicket({
                subject: formData.subject,
                category: formData.category,
                message: formData.message
            })

            setOpen(false)
            setFormData({ subject: '', category: '', message: '' })
            toast.success('تم إنشاء التذكرة بنجاح')
            // alert('تم إنشاء التذكرة بنجاح')
            window.location.reload() // Simple refresh to show new ticket
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ')
            // alert(error.message || 'حدث خطأ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus size={16} />
                    تذكرة جديدة
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-right">تذكرة دعم فني جديدة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">الموضوع</label>
                        <Input
                            required
                            placeholder="وصف مختصر للمشكلة"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">القسم</label>
                        <Select
                            required
                            onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر القسم" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">مشكلة تقنية</SelectItem>
                                <SelectItem value="feature">اقتراح ميزة</SelectItem>
                                <SelectItem value="account">الحساب</SelectItem>
                                <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">تفاصيل المشكلة</label>
                        <Textarea
                            required
                            placeholder="اشرح المشكلة بالتفصيل..."
                            className="min-h-[120px]"
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            إرسال التذكرة
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
