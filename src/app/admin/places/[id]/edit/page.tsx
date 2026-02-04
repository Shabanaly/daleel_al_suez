import PlaceForm from "@/components/admin/PlaceForm";
import { getCategoriesUseCase, getPlaceByIdUseCase } from "@/di/modules";
import { getAreas } from "@/services/admin/areas.service";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

// Fix Next.js 15 type params
type Props = {
    params: Promise<{ id: string }>
}

export default async function EditPlacePage({ params }: Props) {
    const { id } = await params;

    // 1. Fetch Data
    const [categories, areas, place] = await Promise.all([
        getCategoriesUseCase.execute(),
        getAreas(),
        getPlaceByIdUseCase.execute(id)
    ])

    if (!place) {
        notFound();
    }

    return (
        <div className="w-full">
            {/* Header */}
            {/* Header */}
            {/* Header */}
            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Edit className="text-indigo-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">تعديل المكان</h1>
                            <p className="text-sm text-slate-400">{place.name}</p>
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
                initialData={place}
            />
        </div>
    )
}
