import { Place } from "../../entities/place";
import { IPlaceRepository } from "../../interfaces/place-repository.interface";

export class GetPlaceByIdUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(id: string): Promise<Place | null> {
        // We can reuse getAdminPlaces and filter, or add getById to Repo.
        // Ideally, Repo should have getById. 
        // Wait, PlaceRepo already has getPlaceBySlug, but here we need ID.
        // Checking IPlaceRepository... it has getPlaceBySlug.
        // Let's assume we need to add getPlaceById to Repo interface too or just use a direct query in repository for now?
        // No, Clean Architecture says we should add it to Interface.

        // BUT! To save time/edit-steps, I will assume getPlaceBySlug is not enough. 
        // Although the Repo has `getPlacesByOwner`, we might not want to fetch all.

        // A quick hack for now: Use `getAdminPlaces` and find the one. 
        // NOTE: This is inefficient but avoids changing Interface/Repo files again. 
        // UseCase shouldn't care about efficiency of implementation, but Architecturally, getById is better.
        // Let's try to see if we can use getPlaceBySlug? No, Edit page has ID in URL.

        // Let's implement it cleanly: I already have a `deletePlace` that takes ID. 
        // I should have a `getPlaceById`.
        // I will add `getPlaceById` to the interface later if I have budget. 

        // For this specific iteration, I'll cheat slightly: Use `supabase-place.repository` directly? NO.
        // I will add `getPlaceById` to Repository Interface and Implementation. 
        // It's the right way.

        return this.placeRepository.getPlaceById(id);
    }
}
