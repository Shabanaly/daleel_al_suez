import { SuezEvent } from "../../entities/suez-event";
import { IEventRepository } from "../../interfaces/event-repository.interface";

export class GetAdminEventsUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(role: string, client?: unknown): Promise<SuezEvent[]> {
        // Enforce admin for now, but we can expand filters later
        if (role !== 'admin') {
            throw new Error("Unauthorized: Only admin can view all events.");
        }
        return this.eventRepository.getEvents(undefined, client);
    }
}
