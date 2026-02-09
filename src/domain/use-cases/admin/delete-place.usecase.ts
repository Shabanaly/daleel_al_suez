import { IPlaceRepository } from "../../interfaces/place-repository.interface";

export class DeletePlaceUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(id: string, client?: unknown): Promise<void> {
        return this.placeRepository.deletePlace(id, client);
    }
}
