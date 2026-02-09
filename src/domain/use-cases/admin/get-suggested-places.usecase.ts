import { ImportedPlaceRepo } from "@/domain/interfaces/imported-place-repository.interface";

export class GetSuggestedPlacesUseCase {
    constructor(private importedRepo: ImportedPlaceRepo) { }

    async execute() {
        return this.importedRepo.listPending();
    }
}
