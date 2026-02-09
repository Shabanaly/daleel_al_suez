import { IGooglePlacesService } from "@/domain/interfaces/google-places-service.interface";

export class SearchGooglePlacesUseCase {
    constructor(private googleService: IGooglePlacesService) { }

    async execute(query: string) {
        return this.googleService.searchPlaces(query);
    }
}
