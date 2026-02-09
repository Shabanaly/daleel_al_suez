import Link from "next/link";
import Image from "next/image";
import { Article } from "@/domain/entities/article";
import { Calendar, User } from "lucide-react";

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <Link
            href={`/news/${article.id}`}
            className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md h-full flex flex-col"
        >
            <div className="relative h-48 w-full overflow-hidden shrink-0">
                {article.cover_image_url ? (
                    <Image
                        src={article.cover_image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-sm">لا توجد صورة</span>
                    </div>
                )}
                <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-sm ${article.category === 'News' ? 'bg-red-500/90 text-white' :
                        article.category === 'Story' ? 'bg-blue-500/90 text-white' :
                            article.category === 'Announcement' ? 'bg-orange-500/90 text-white' :
                                'bg-purple-500/90 text-white'
                    }`}>
                    {article.category === 'News' ? 'أخبار' :
                        article.category === 'Story' ? 'حكاية' :
                            article.category === 'Announcement' ? 'إعلان' :
                                article.category}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span dir="ltr">{new Date(article.created_at).toLocaleDateString("en-GB")}</span>
                    </div>
                    {/* Add Author if needed, usually just date is enough for cards */}
                </div>

                <h3 className="text-xl font-bold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {article.excerpt}
                </p>
            </div>
        </Link>
    );
}
