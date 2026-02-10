import { SuezEvent } from "../../entities/suez-event";
import { IEventRepository } from "../../interfaces/event-repository.interface";

export class CreateEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(
        role: string,
        eventData: Omit<SuezEvent, 'id' | 'createdAt' | 'updatedAt' | 'placeName'>,
        client?: unknown
    ): Promise<SuezEvent> {
        if (role !== 'admin') {
            throw new Error("Unauthorized: Only admin can create events.");
        }
        return this.eventRepository.createEvent(eventData, client);
    }
}
