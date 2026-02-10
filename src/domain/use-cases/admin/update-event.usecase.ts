import { SuezEvent } from "../../entities/suez-event";
import { IEventRepository } from "../../interfaces/event-repository.interface";

export class UpdateEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(
        id: string,
        role: string,
        eventData: Partial<SuezEvent>,
        client?: unknown
    ): Promise<SuezEvent> {
        if (role !== 'admin') {
            throw new Error("Unauthorized: Only admin can update events.");
        }
        return this.eventRepository.updateEvent(id, eventData, client);
    }
}
