import Link from "next/link";
import { ArrowRight, MapPin, Star, Clock, Tag, Youtube } from "lucide-react";
import { Place } from "@/domain/entities/place";
import { Review, RatingStats } from "@/domain/entities/review";
import { PlaceImageSlider } from "@/presentation/features/places/components/place-image-slider";
import { PlaceActionButtons } from "@/presentation/features/places/components/place-action-buttons";
import { GoogleMapEmbed } from "@/presentation/features/places/components/google-map-embed";
import { PlaceCard } from "@/presentation/features/places/components/place-card";
import { ReviewsSectionWrapper } from "@/presentation/features/reviews/components/reviews-section-wrapper";
import { VideoEmbed } from "@/presentation/components/shared/video-embed";

interface PlaceDetailsViewProps {
    place: Place;
    relatedPlaces?: Place[];
    reviews: Review[];
    ratingStats: RatingStats;
    currentUserId?: string;
    userReview?: Review | null;
}

export function PlaceDetailsView({
    place,
    relatedPlaces = [],
    reviews,
    ratingStats,
    currentUserId,
    userReview
}: PlaceDetailsViewProps) {
    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Hero Image Slider */}
            <div className="relative">
                <PlaceImageSlider images={place.images || []} placeName={place.name} />

                {/* Back Button Overlay - improved visibility */}
                <div className="absolute top-4 right-4 z-10">
                    <Link
                        href="/places"
                        className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-4 py-2.5 rounded-full hover:bg-black/70 transition-colors shadow-lg border border-white/20"
                    >
                        <ArrowRight size={20} />
                        <span className="font-medium">عودة للأماكن</span>
                    </Link>
                </div>

                {/* Place Info Overlay - على الصورة بدون خلفية */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 container mx-auto text-white">
                    <div className="flex flex-col gap-3">
                        {place.categoryName && (
                            <span className="inline-block bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold mb-2 w-fit">
                                {place.categoryName}
                            </span>
                        )}
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{place.name}</h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                <MapPin size={18} className="text-yellow-300" />
                                <span className="text-sm md:text-base">{place.address}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-white">{place.rating}</span>
                                <span className="text-xs">({place.reviewCount} تقييم)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Tag className="text-primary" size={24} />
                                عن المكان
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {place.description || "لا يوجد وصف متاح لهذا المكان حالياً."}
                            </p>
                        </div>

                        {/* Video Section */}
                        {place.videoUrl && (
                            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Youtube className="text-red-600" size={24} />
                                    عرض فيديو
                                </h2>
                                <VideoEmbed url={place.videoUrl} />
                            </div>
                        )}

                        {/* Reviews Section Placeholder */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                                    التقييمات والمراجعات
                                </h2>
                                <span className="text-primary font-bold">{place.rating} / 5</span>
                            </div>
                            <div className="text-center py-8 text-muted-foreground">
                                <p>قريباً: سيمكنك قراءة وإضافة مراجعات لهذا المكان</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Info Cards */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <PlaceActionButtons
                                phone={place.phone}
                                whatsapp={place.whatsapp}
                                website={place.website}
                                facebook={place.facebook}
                                instagram={place.instagram}
                                placeName={place.name}
                                placeId={place.id}
                            />
                        </div>

                        {/* Map Card */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                <MapPin className="text-primary" size={20} />
                                الموقع
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4">{place.address}</p>
                            <GoogleMapEmbed
                                mapLink={place.mapLink}
                                placeName={place.name}
                                address={place.address}
                            />
                        </div>

                        {/* Working Hours Card */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                <Clock className="text-primary" size={20} />
                                مواعيد العمل
                            </h3>
                            {place.opensAt && place.closesAt ? (
                                <div className="space-y-2 text-sm">
                                    <p className="text-muted-foreground">
                                        يومياً من {place.opensAt?.slice(0, 5)} إلى {place.closesAt?.slice(0, 5)}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    يُرجى الاتصال للاستفسار عن مواعيد العمل
                                </div>
                            )}
                        </div>

                        {/* Additional Info */}
                        {place.areaName && (
                            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                                <h3 className="font-bold text-foreground mb-3 text-sm">معلومات إضافية</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">المنطقة:</span>
                                        <span className="font-medium text-foreground">{place.areaName}</span>
                                    </div>
                                    {place.categoryName && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">التصنيف:</span>
                                            <span className="font-medium text-foreground">{place.categoryName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12">
                    <ReviewsSectionWrapper
                        placeId={place.id}
                        placeName={place.name}
                        placeSlug={place.slug}
                        reviews={reviews}
                        ratingStats={ratingStats}
                        currentUserId={currentUserId}
                        userReview={userReview}
                    />
                </div>

                {/* Related Places Section */}
                {relatedPlaces.length > 0 && (
                    <div className="mt-12">
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">أماكن مشابهة</h2>
                            <p className="text-muted-foreground">استكشف المزيد من الأماكن في {place.categoryName}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedPlaces.map((relatedPlace) => (
                                <PlaceCard key={relatedPlace.id} place={relatedPlace} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
