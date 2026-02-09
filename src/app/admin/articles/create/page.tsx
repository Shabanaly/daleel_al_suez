import { ArticleForm } from "@/presentation/components/admin/article-form";

export default function CreateArticlePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">إضافة مقال جديد</h1>
                <p className="text-slate-400 mt-1">أضف خبراً أو قصة أو مقالاً جديداً للمنصة</p>
            </div>

            <ArticleForm />
        </div>
    );
}
