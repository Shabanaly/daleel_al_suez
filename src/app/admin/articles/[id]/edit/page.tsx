import { getArticleForEdit } from "@/actions/articles.actions";
import { ArticleForm } from "@/presentation/components/admin/article-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function EditArticlePage({ params }: PageProps) {
    // Await the params object before accessing its properties
    const { id } = await params;
    const article = await getArticleForEdit(id);

    if (!article) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">تعديل المقال</h1>
                <p className="text-slate-400 mt-1">تعديل محتوى وتفاصيل المقال</p>
            </div>

            <ArticleForm initialData={article} />
        </div>
    );
}
