import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class GetPlaceBySlugUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(slug: string): Promise<Place | null> {
        return this.placeRepository.getPlaceBySlug(slug);
    }
}
