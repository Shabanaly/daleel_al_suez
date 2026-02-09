import { SuezEvent } from "@/domain/entities/suez-event";
import { IEventRepository } from "@/domain/interfaces/event-repository.interface";

export class GetEventByIdUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(id: string): Promise<SuezEvent | null> {
        return this.eventRepository.getEventById(id);
    }
}
