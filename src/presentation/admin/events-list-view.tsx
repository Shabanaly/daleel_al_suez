import { SuezEvent } from "@/domain/entities/suez-event";
import { Place } from "@/domain/entities/place";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminEventsListClient } from "./events-list-client";

interface AdminEventsListViewProps {
    events: SuezEvent[];
    places: Place[];
}

export function AdminEventsListView({ events, places }: AdminEventsListViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">إدارة الفعاليات</h1>
                    <p className="text-slate-500 text-sm mt-1">عرض وإدارة الفعاليات والأنشطة في السويس</p>
                </div>
                <Link href="/admin/events/new">
                    <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-all font-medium shadow-lg shadow-primary/20">
                        <Plus size={20} />
                        <span>فعالية جديدة</span>
                    </button>
                </Link>
            </div>

            <AdminEventsListClient
                initialEvents={events}
                places={places}
            />
        </div>
    );
}
