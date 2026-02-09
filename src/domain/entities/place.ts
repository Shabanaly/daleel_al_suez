export interface Place {
    id: string;
    slug: string;
    name: string;
    description?: string;
    address?: string;
    categoryName?: string;
    categoryId?: string;
    images: string[];
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
    phone?: string;
    whatsapp?: string;
    googleMapsUrl?: string;
    mapLink?: string; // Google Maps link
    website?: string;
    facebook?: string;
    instagram?: string;
    opensAt?: string | null;
    closesAt?: string | null;
    videoUrl?: string;

    // New Fields
    type: 'business' | 'professional';
    areaId?: string;
    areaName?: string;
    socialLinks?: Record<string, string>;
    createdBy?: string;
    createdByName?: string; // For Super Admin Grouping

    // Status & Timestamps
    status?: 'active' | 'pending' | 'inactive';
    createdAt?: string;
    google_place_id?: string;
}
