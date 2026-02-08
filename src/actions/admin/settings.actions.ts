'use server'

import { getSettingsUseCase, updateSettingUseCase } from "@/di/modules"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getSettingsAction(group?: string) {
    try {
        // Settings are usually public read, but let's assume we use the server client for consistency
        const settings = await getSettingsUseCase.execute(group)
        return { success: true, data: settings }
    } catch (error: any) {
        console.error("Get Settings Error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateSettingsAction(updates: Record<string, string>) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, message: "Unauthorized" }
        }

        // Loop through updates and save them
        // Note: In a real scenario, we might want a bulk update method in the repo
        const promises = Object.entries(updates).map(([key, value]) =>
            updateSettingUseCase.execute(key, value, supabase)
        )

        await Promise.all(promises)

        revalidatePath('/admin/settings')
        revalidatePath('/', 'layout') // Revalidate entire site as settings affect footer/header

        return { success: true, message: "تم حفظ الإعدادات بنجاح" }
    } catch (error: any) {
        console.error("Update Settings Error:", error)
        return { success: false, message: error.message || "فشل حفظ الإعدادات" }
    }
}
