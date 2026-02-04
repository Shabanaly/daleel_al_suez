import { Place } from "../../entities/place";
import { IPlaceRepository } from "../../interfaces/place-repository.interface";

export class GetAdminPlacesUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(
        userId: string,
        role: string,
        filters: {
            search?: string;
            categoryId?: string;
            areaId?: string;
            status?: string;
            creatorId?: string; // Super admin can filter by creator
        } = {}
    ): Promise<Place[]> {
        const queryFilters: any = { ...filters };

        // RBAC Logic:
        // If NOT Super Admin, enforce 'userId' filter to be their own ID.
        if (role !== 'super_admin') {
            queryFilters.userId = userId;
            delete queryFilters.creatorId; // Ignore creatorId if regular admin tries to send it
        } else {
            // If Super Admin, use 'creatorId' as 'userId' filter if provided
            if (filters.creatorId) {
                queryFilters.userId = filters.creatorId;
            }
        }

        return this.placeRepository.getAdminPlaces(queryFilters);
    }
}
