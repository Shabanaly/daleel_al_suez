import { SuezEvent } from "../../entities/suez-event";
import { IEventRepository } from "../../interfaces/event-repository.interface";

export class UpdateEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(
        id: string,
        role: string,
        eventData: Partial<SuezEvent>,
        client?: any
    ): Promise<SuezEvent> {
        if (role !== 'super_admin') {
            throw new Error("Unauthorized: Only super_admin can update events.");
        }
        return this.eventRepository.updateEvent(id, eventData, client);
    }
}
