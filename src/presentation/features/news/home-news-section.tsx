import Link from "next/link";
import { Article } from "@/domain/entities/article";
import { ArticleCard } from "./article-card";
import { ArrowLeft, Newspaper } from "lucide-react";

interface HomeNewsSectionProps {
    articles: Article[];
}

export function HomeNewsSection({ articles }: HomeNewsSectionProps) {
    if (!articles || articles.length === 0) return null;

    return (
        <section className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Newspaper className="text-primary" size={24} />
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">أحدث ما كُتب عن السويس</h2>
                    </div>
                    <p className="text-muted-foreground text-sm">أخبار، حكايات، ومقالات تهمك</p>
                </div>
                <Link href="/news" className="inline-flex items-center gap-2 text-primary font-bold hover:underline transition-all group">
                    عرض كل الأخبار
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </section>
    );
}
