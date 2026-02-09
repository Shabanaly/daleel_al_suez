"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleArticleStatus } from "@/actions/articles.actions";

interface ArticleStatusToggleProps {
    id: string;
    isPublished: boolean;
}

export function ArticleStatusToggle({ id, isPublished: initialStatus }: ArticleStatusToggleProps) {
    const [isPublished, setIsPublished] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        const newStatus = !isPublished;
        setIsPublished(newStatus); // Optimistic update

        startTransition(async () => {
            try {
                // Ensure we pass a plain object/value to the server action
                await toggleArticleStatus(id, newStatus);
                toast.success(newStatus ? "تم نشر المقال" : "تم إلغاء نشر المقال");
            } catch (error) {
                console.error(error);
                setIsPublished(!newStatus); // Revert on error
                toast.error("حدث خطأ أثناء تحديث الحالة");
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${isPublished
                    ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                    : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                }`}
            title={isPublished ? "انقر لإلغاء النشر" : "انقر للنشر"}
        >
            {isPending ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></span>
            ) : null}
            {isPublished ? "منشور" : "مسودة"}
        </button>
    );
}
