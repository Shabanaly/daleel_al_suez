import { MapPin, Phone, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Place } from '@/domain/entities/place'
import { FavoriteButton } from './favorite-button'

interface PlaceCardProps {
    place: Place
}

export function PlaceCard({ place }: PlaceCardProps) {
    return (
        <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col relative">
            <Link href={`/places/${place.slug}`} className="absolute inset-0 z-0" />

            <div className="relative h-48 w-full z-10 pointer-events-none">
                {place.images && place.images.length > 0 ? (
                    <Image
                        src={place.images[0]}
                        alt={place.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-4xl">📷</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Categories Tag */}
                {place.categoryName && (
                    <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm z-20">
                        {place.categoryName}
                    </span>
                )}

                {/* Favorite Button */}
                <div className="absolute top-3 left-3 z-20 pointer-events-auto">
                    <FavoriteButton placeId={place.id} />
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col z-10 pointer-events-none">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {place.name}
                    </h3>
                    <div className="flex items-center bg-muted px-1.5 py-0.5 rounded-md border border-border">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 ml-1" />
                        <span className="text-xs font-bold text-foreground">{place.rating}</span>
                        <span className="text-[10px] text-muted-foreground mr-1">({place.reviewCount})</span>
                    </div>
                </div>

                <div className="space-y-2 mt-auto">
                    <div className="flex items-start text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 ml-1.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                        <span className="line-clamp-2">{place.address}</span>
                    </div>

                    {place.phone && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 ml-1.5 flex-shrink-0 text-muted-foreground" />
                            <span dir="ltr">{place.phone}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
