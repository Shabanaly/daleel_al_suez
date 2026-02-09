import { createClient } from "@/lib/supabase/client";
import { SuezEvent, EventStatus, EventType } from "@/domain/entities/suez-event";
import { IEventRepository } from "@/domain/interfaces/event-repository.interface";

interface SupabaseEventRow {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    start_date: string;
    end_date: string;
    location: string | null;
    place_id: string | null;
    type: string;
    status: EventStatus;
    created_at: string;
    updated_at: string;
    places?: { name: string } | null;
}

export class SupabaseEventRepository implements IEventRepository {
    private supabase = createClient();

    async getEvents(options?: { status?: EventStatus; limit?: number; placeId?: string }, client?: unknown): Promise<SuezEvent[]> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        let query = supabaseClient.from('events').select(`
            *,
            places (name)
        `);

        if (options?.status) {
            query = query.eq('status', options.status);
        }

        if (options?.placeId) {
            query = query.eq('place_id', options.placeId);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query.order('start_date', { ascending: true });

        if (error) throw error;

        return (data as SupabaseEventRow[]).map(row => this.mapToEntity(row));
    }

    async getEventById(id: string): Promise<SuezEvent | null> {
        const { data, error } = await this.supabase
            .from('events')
            .select('*, places(name)')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapToEntity(data as SupabaseEventRow);
    }

    async getEventBySlug(slug: string): Promise<SuezEvent | null> {
        const { data, error } = await this.supabase
            .from('events')
            .select('*, places(name)')
            .eq('slug', slug)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapToEntity(data as SupabaseEventRow);
    }

    async createEvent(event: Omit<SuezEvent, 'id' | 'createdAt' | 'updatedAt' | 'placeName'>, client?: unknown): Promise<SuezEvent> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabaseClient
            .from('events')
            .insert(this.mapToDb(event))
            .select()
            .single();

        if (error) throw error;
        return this.mapToEntity(data as SupabaseEventRow);
    }

    async updateEvent(id: string, event: Partial<SuezEvent>, client?: unknown): Promise<SuezEvent> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabaseClient
            .from('events')
            .update(this.mapToDb(event))
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapToEntity(data as SupabaseEventRow);
    }

    async deleteEvent(id: string, client?: unknown): Promise<void> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { error } = await supabaseClient.from('events').delete().eq('id', id);
        if (error) throw error;
    }

    private mapToEntity(data: SupabaseEventRow): SuezEvent {
        return {
            id: data.id,
            title: data.title,
            slug: data.slug,
            description: data.description || '',
            imageUrl: data.image_url || '',
            startDate: new Date(data.start_date),
            endDate: new Date(data.end_date),
            location: data.location || '',
            placeId: data.place_id || '',
            placeName: data.places?.name,
            type: data.type as EventType,
            status: data.status,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private mapToDb(event: Partial<SuezEvent>): Record<string, unknown> {
        const db: Record<string, unknown> = {};
        if (event.title !== undefined) db.title = event.title;
        if (event.slug !== undefined) db.slug = event.slug;
        if (event.description !== undefined) db.description = event.description;
        if (event.imageUrl !== undefined) db.image_url = event.imageUrl;
        if (event.startDate !== undefined) db.start_date = event.startDate.toISOString();
        if (event.endDate !== undefined) db.end_date = event.endDate.toISOString();
        if (event.location !== undefined) db.location = event.location;
        if (event.placeId !== undefined) db.place_id = event.placeId;
        if (event.type !== undefined) db.type = event.type;
        if (event.status !== undefined) db.status = event.status;
        return db;
    }
}
