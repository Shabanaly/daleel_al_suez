import { SuezEvent, EventStatus } from "../entities/suez-event";

export interface IEventRepository {
    getEvents(options?: { status?: EventStatus; limit?: number; placeId?: string }, client?: any): Promise<SuezEvent[]>;
    getEventById(id: string): Promise<SuezEvent | null>;
    getEventBySlug(slug: string): Promise<SuezEvent | null>;
    createEvent(event: Omit<SuezEvent, 'id' | 'createdAt' | 'updatedAt' | 'placeName'>, client?: any): Promise<SuezEvent>;
    updateEvent(id: string, event: Partial<SuezEvent>, client?: any): Promise<SuezEvent>;
    deleteEvent(id: string, client?: any): Promise<void>;
}
