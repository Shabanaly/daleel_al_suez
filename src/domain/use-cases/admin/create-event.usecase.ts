import { SuezEvent } from "../../entities/suez-event";
import { IEventRepository } from "../../interfaces/event-repository.interface";

export class CreateEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(
        role: string,
        eventData: Omit<SuezEvent, 'id' | 'createdAt' | 'updatedAt' | 'placeName'>,
        client?: any
    ): Promise<SuezEvent> {
        if (role !== 'super_admin') {
            throw new Error("Unauthorized: Only super_admin can create events.");
        }
        return this.eventRepository.createEvent(eventData, client);
    }
}
