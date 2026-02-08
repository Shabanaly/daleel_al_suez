export type EventStatus = 'active' | 'inactive' | 'draft';
export type EventType = 'general' | 'place_hosted';

export interface SuezEvent {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    startDate: Date;
    endDate: Date;
    location: string | null;
    placeId: string | null;
    placeName?: string; // Optional for UI display
    type: EventType;
    status: EventStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
