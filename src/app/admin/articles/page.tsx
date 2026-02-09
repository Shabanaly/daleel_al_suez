import { getAdminArticles } from "@/actions/articles.actions";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { ArticleStatusToggle } from "@/presentation/components/admin/article-status-toggle";

export default async function AdminArticlesPage() {
    const articles = await getAdminArticles();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">إدارة المقالات والأخبار</h1>
                    <p className="text-slate-400 mt-1">عرض وإدارة جميع المقالات في المنصة</p>
                </div>
                <Link
                    href="/admin/articles/create"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:brightness-110 transition-all font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>مقال جديد</span>
                </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm">
                            <tr>
                                <th className="px-6 py-4 font-medium">العنوان</th>
                                <th className="px-6 py-4 font-medium">التصنيف</th>
                                <th className="px-6 py-4 font-medium">الحالة</th>
                                <th className="px-6 py-4 font-medium">تاريخ النشر</th>
                                <th className="px-6 py-4 font-medium">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {articles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        لا توجد مقالات حتى الآن
                                    </td>
                                </tr>
                            ) : (
                                articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-200">{article.title}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                                                {article.excerpt}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            <span className="bg-slate-800 px-2 py-1 rounded text-xs">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <ArticleStatusToggle id={article.id} isPublished={article.is_published} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm" dir="ltr">
                                            {new Date(article.created_at).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/news/${article.id}`}
                                                    target="_blank"
                                                    className="text-slate-400 hover:text-blue-400 transition-colors"
                                                    title="عرض"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/articles/${article.id}/edit`}
                                                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                {/* Delete button would ideally use a server action or client component dialog */}
                                                <form action={async () => {
                                                    'use server'
                                                    const { deleteArticle } = await import('@/actions/articles.actions');
                                                    await deleteArticle(article.id);
                                                }}>
                                                    <button className="text-slate-400 hover:text-red-400 transition-colors" title="حذف">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
