import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SupabaseFavoritesRepository } from '@/data/repositories/supabase-favorites.repository'
import { PlaceCard } from '@/presentation/features/places/components/place-card'
import { Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const favoritesRepo = new SupabaseFavoritesRepository(supabase)
    const favorites = await favoritesRepo.getUserFavorites(user.id)

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                    <Heart size={32} className="fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">مفضلاتي</h1>
                    <p className="text-muted-foreground mt-1">
                        الأماكن التي قمت بحفظها للعودة إليها لاحقاً
                    </p>
                </div>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((place) => (
                        <div key={place.id} className="h-96">
                            <PlaceCard place={place} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                        <Heart size={40} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">قائمة المفضلات فارغة</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        لم تقم بإضافة أي أماكن للمفضلة بعد. تصفح الأماكن واضغط على أيقونة القلب لحفظها هنا.
                    </p>
                    <Link
                        href="/places"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                        تصفح الأماكن
                    </Link>
                </div>
            )}
        </div>
    )
}
