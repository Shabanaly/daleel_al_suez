'use client'

import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { notifyAdmins } from '@/actions/admin/notifications.actions'

export function RequestCategoryButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleRequest = async () => {
        const name = prompt("ما هو اسم التصنيف الذي تود إضافته؟")
        if (!name) return

        setIsLoading(true)
        try {
            // Check if notifySuperAdmins is exposed as server action. 
            // If not, we need a wrapper action. `notifySuperAdmins` IS exported from `notifications.actions.ts` 
            // but usually we can't call it directly if it's not marked 'use server' at function level or file level.
            // `src/actions/admin/notifications.actions.ts` has 'use server' at top. So it's fine.

            await notifyAdmins(
                "طلب إضافة تصنيف جديد",
                `يرغب أحد الأدمن بإضافة تصنيف: "${name}"`,
                "system"
            )
            alert("تم إرسال طلبك للسوبر أدمن بنجاح.")
        } catch (error) {
            console.error(error)
            alert("حدث خطأ أثناء إرسال الطلب.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleRequest}
            disabled={isLoading}
            className="text-primary hover:text-primary-400 text-sm flex items-center gap-1 transition-colors disabled:opacity-50"
        >
            <PlusCircle size={16} />
            <span>طلب تصنيف جديد</span>
        </button>
    )
}
