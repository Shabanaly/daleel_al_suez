import PlaceForm from "@/components/admin/PlaceForm";
import { getCategoriesUseCase } from "@/di/modules";
import { getAreas } from "@/services/admin/areas.service";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default async function NewPlacePage() {
    // 1. Fetch Data (Parallel)
    const [categories, areas] = await Promise.all([
        getCategoriesUseCase.execute(),
        getAreas()
    ])

    return (
        <div className="w-full">
            {/* Header */}
            {/* Header */}
            {/* Header */}
            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <MapPin className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">إضافة مكان جديد</h1>
                            <p className="text-sm text-slate-400">أدخل بيانات المكان أو النشاط الجديد</p>
                        </div>
                    </div>

                    <Link
                        href="/admin/places"
                        className="flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 hover:border-slate-700"
                    >
                        <ArrowLeft size={18} />
                        <span>رجوع للقائمة</span>
                    </Link>
                </div>
            </div>

            <PlaceForm
                categories={categories}
                areas={areas}
            />
        </div>
    )
}
