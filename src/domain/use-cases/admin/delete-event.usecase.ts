import { IEventRepository } from "../../interfaces/event-repository.interface";

export class DeleteEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(id: string, role: string, client?: unknown): Promise<void> {
        if (role !== 'super_admin') {
            throw new Error("Unauthorized: Only super_admin can delete events.");
        }
        return this.eventRepository.deleteEvent(id, client);
    }
}
